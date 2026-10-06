import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { MessageCircle, Trash2 } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";
import BuyButton from "../common/BuyButton";
import ProductGallery from "./ProductGallery";
import WishListsButton from "./WishListsButton";

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;
const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleString() : "just now");
const millis = (ts) => (ts?.toMillis ? ts.toMillis() : Date.now());
const byNewest = (a, b) => millis(b.createdAt) - millis(a.createdAt);

const STATUS_BADGE = {
    pending: "badge-warning",
    accepted: "badge-success",
    declined: "badge-error",
};

const ProductDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("comments");
    const [comments, setComments] = useState([]);
    const [offers, setOffers] = useState([]);

    const sellerId = product?.sellerId;
    const isSeller = !!user && user.uid === sellerId;
    const isSold = product?.status === "sold";

    useEffect(() => {
        getDoc(doc(db, "products", id))
            .then((snap) => {
                if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
            })
            .catch((error) => toast.error(error.message))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        const q = query(
            collection(db, "products", id, "comments"),
            orderBy("createdAt", "desc")
        );
        return onSnapshot(
            q,
            (snap) => setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (error) => console.error(error)
        );
    }, [id]);

    useEffect(() => {
        if (!user || !sellerId) return;
        const sellerView = user.uid === sellerId;

        const subscribe = (name, setter) => {
            const col = collection(db, "products", id, name);
            const q = sellerView ? col : query(col, where("buyerId", "==", user.uid));
            return onSnapshot(
                q,
                (snap) =>
                    setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byNewest)),
                (error) => console.error(error)
            );
        };

        return subscribe("offers", setOffers);
    }, [user, sellerId, id]);

    const requireLogin = (action) => {
        if (user) return true;
        toast.error(`Please login to ${action}.`);
        navigate("/auth/login", { state: location.pathname });
        return false;
    };

    const submitOffer = async (e) => {
        e.preventDefault();
        if (!requireLogin("make an offer")) return;
        const form = e.target;
        const amount = Number(form.amount.value);
        if (!(amount > 0)) return toast.error("Enter a valid offer amount.");

        try {
            await addDoc(collection(db, "products", id, "offers"), {
                amount,
                note: form.note.value.trim(),
                status: "pending",
                buyerId: user.uid,
                buyerName: user.displayName || user.email,
                createdAt: serverTimestamp(),
            });
            toast.success("Offer sent!");
            form.reset();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const postComment = async (e) => {
        e.preventDefault();
        if (!requireLogin("comment")) return;
        const form = e.target;
        const text = form.text.value.trim();
        if (!text) return;

        try {
            await addDoc(collection(db, "products", id, "comments"), {
                text,
                userId: user.uid,
                userName: user.displayName || user.email,
                userPhoto: user.photoURL || "",
                createdAt: serverTimestamp(),
            });
            form.reset();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const deleteComment = (commentId) =>
        deleteDoc(doc(db, "products", id, "comments", commentId)).catch((error) =>
            toast.error(error.message)
        );

    const updateOffer = (offerId, status) =>
        updateDoc(doc(db, "products", id, "offers", offerId), { status }).catch((error) =>
            toast.error(error.message)
        );

    const toggleSold = async () => {
        const status = isSold ? "available" : "sold";
        try {
            await updateDoc(doc(db, "products", id), { status });
            setProduct({ ...product, status });
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="mt-32 min-h-screen text-center">
                <h2 className="text-2xl font-semibold">Product not found</h2>
                <Link to="/shop" className="btn btn-neutral mt-4">
                    Back to shop
                </Link>
            </div>
        );
    }

    const myOffers = user ? offers : [];
    const images = product.images?.length ? product.images : [product.image];

    return (
        <>
            <Toaster position="top-center" />
            <div className="mt-24 px-6 pb-16 max-w-6xl mx-auto">
                <div className="grid gap-10 md:grid-cols-2">
                    <ProductGallery images={images} alt={product.name} />

                    {/* Info */}
                    <div>
                        <div className="flex items-start justify-between gap-3">
                            <h1 className="text-3xl font-semibold">{product.name}</h1>
                            {isSold && <span className="badge badge-error">Sold</span>}
                        </div>
                        <p className="text-3xl font-bold text-primary mt-2">
                            {formatPrice(product.price)}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="badge badge-outline">{product.condition}</span>
                            <span className="badge badge-outline">{product.category}</span>
                            {product.location && (
                                <span className="badge badge-outline">{product.location}</span>
                            )}
                        </div>

                        <p className="mt-5 whitespace-pre-line text-gray-600">
                            {product.description}
                        </p>

                        <div className="flex items-center gap-3 mt-6">
                            <div className="avatar">
                                <div className="w-10 rounded-full">
                                    <img
                                        src={product.sellerPhoto || "/favicon.svg"}
                                        alt={product.sellerName}
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="font-medium">{product.sellerName}</p>
                                <p className="text-sm text-gray-400">
                                    Posted {formatDate(product.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-8">
                            {isSeller ? (
                                <button onClick={toggleSold} className="btn btn-outline">
                                    {isSold ? "Mark as available" : "Mark as sold"}
                                </button>
                            ) : isSold ? (
                                <button className="btn" disabled>
                                    No longer available
                                </button>
                            ) : (
                                <>
                                    <BuyButton
                                        product={{
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: product.image,
                                        }}
                                        className="btn btn-neutral rounded-2xl flex-1"
                                    />
                                    <button
                                        onClick={() => setTab("offers")}
                                        className="btn btn-outline rounded-2xl flex-1"
                                    >
                                        Make an offer
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (requireLogin("send a message"))
                                                navigate(`/chats/${product.id}_${user.uid}`);
                                        }}
                                        className="btn btn-outline rounded-2xl flex-1"
                                    >
                                        <MessageCircle size={18} />
                                        Send message
                                    </button>
                                    <WishListsButton
                                        withLabel
                                        product={{
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: product.image,
                                        }}
                                        className="flex-1"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div role="tablist" className="tabs tabs-border mt-14">
                    <button
                        role="tab"
                        className={`tab ${tab === "comments" ? "tab-active" : ""}`}
                        onClick={() => setTab("comments")}
                    >
                        Comments ({comments.length})
                    </button>
                    <button
                        role="tab"
                        className={`tab ${tab === "offers" ? "tab-active" : ""}`}
                        onClick={() => setTab("offers")}
                    >
                        Offers {user && `(${myOffers.length})`}
                    </button>
                </div>

                <div className="mt-6 max-w-3xl">
                    {/* Comments */}
                    {tab === "comments" && (
                        <div>
                            <form onSubmit={postComment} className="flex gap-2">
                                <input
                                    name="text"
                                    className="input flex-1"
                                    placeholder="Ask a question or leave a comment..."
                                />
                                <button className="btn btn-neutral">Post</button>
                            </form>
                            <div className="mt-6 space-y-4">
                                {comments.length === 0 && (
                                    <p className="text-gray-400">No comments yet.</p>
                                )}
                                {comments.map((c) => (
                                    <div key={c.id} className="flex gap-3">
                                        <div className="avatar">
                                            <div className="w-9 h-9 rounded-full">
                                                <img
                                                    src={c.userPhoto || "/favicon.svg"}
                                                    alt={c.userName}
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-base-200 rounded-xl p-3">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">
                                                    {c.userName}
                                                    {c.userId === sellerId && (
                                                        <span className="badge badge-xs badge-primary ml-2">
                                                            Seller
                                                        </span>
                                                    )}
                                                </p>
                                                {user && (c.userId === user.uid || isSeller) && (
                                                    <button
                                                        onClick={() => deleteComment(c.id)}
                                                        className="text-red-500"
                                                        aria-label="Delete comment"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="mt-1">{c.text}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDate(c.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Offers */}
                    {tab === "offers" && (
                        <div>
                            {!isSeller && !isSold && (
                                <form onSubmit={submitOffer} className="grid gap-2 sm:grid-cols-4">
                                    <input
                                        name="amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="input sm:col-span-1"
                                        placeholder="Your offer ($)"
                                    />
                                    <input
                                        name="note"
                                        className="input sm:col-span-2"
                                        placeholder="Add a note (optional)"
                                    />
                                    <button className="btn btn-neutral">Send offer</button>
                                </form>
                            )}

                            <div className="mt-6 space-y-3">
                                {!user && (
                                    <p className="text-gray-400">Login to see your offers.</p>
                                )}
                                {user && myOffers.length === 0 && (
                                    <p className="text-gray-400">
                                        {isSeller ? "No offers yet." : "You haven't made an offer."}
                                    </p>
                                )}
                                {myOffers.map((o) => (
                                    <div key={o.id} className="bg-base-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">
                                                {formatPrice(o.amount)}
                                                {isSeller && (
                                                    <span className="font-normal text-gray-500">
                                                        {" "}
                                                        from {o.buyerName}
                                                    </span>
                                                )}
                                            </p>
                                            <span className={`badge ${STATUS_BADGE[o.status]}`}>
                                                {o.status}
                                            </span>
                                        </div>
                                        {o.note && <p className="mt-1">{o.note}</p>}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDate(o.createdAt)}
                                        </p>
                                        {isSeller && o.status === "pending" && (
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => updateOffer(o.id, "accepted")}
                                                    className="btn btn-sm btn-success"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => updateOffer(o.id, "declined")}
                                                    className="btn btn-sm btn-outline btn-error"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default ProductDetails;