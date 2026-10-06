import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";
import { uploadImage } from "../../utils/UploadImage";

const MAX_PHOTOS = 6;
const MAX_SIZE_MB = 5;

const CONDITIONS = ["New", "Like new", "Good", "Fair", "For parts"];
const CATEGORIES = [
    "Electronics",
    "Fashion",
    "Furniture",
    "Books",
    "Vehicles",
    "Sports",
    "Home & Garden",
    "Other",
];

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;
const millis = (ts) => (ts?.toMillis ? ts.toMillis() : Date.now());

const Activity = ({ productId }) => {
    const [pendingOffers, setPendingOffers] = useState(0);

    useEffect(() => {
        return onSnapshot(
            collection(db, "products", productId, "offers"),
            (snap) =>
                setPendingOffers(snap.docs.filter((d) => d.data().status === "pending").length),
            () => { }
        );
    }, [productId]);

    if (!pendingOffers) {
        return <p className="text-sm text-gray-400">No pending offers</p>;
    }

    return (
        <span className="badge badge-warning">
            {pendingOffers} pending offer{pendingOffers > 1 ? "s" : ""}
        </span>
    );
};

const EditModal = ({ product, onClose }) => {
    const [saving, setSaving] = useState(false);
    const [keep, setKeep] = useState(() =>
        product.images?.length ? product.images : product.image ? [product.image] : []
    );
    const [newFiles, setNewFiles] = useState([]); // [{ file, preview }]

    const addFiles = (e) => {
        const selected = Array.from(e.target.files);
        e.target.value = "";

        const valid = [];
        for (const file of selected) {
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image.`);
                continue;
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                toast.error(`${file.name} is larger than ${MAX_SIZE_MB} MB.`);
                continue;
            }
            valid.push({ file, preview: URL.createObjectURL(file) });
        }

        const room = MAX_PHOTOS - keep.length - newFiles.length;
        if (valid.length > room) {
            toast.error(`A post can have up to ${MAX_PHOTOS} photos.`);
            valid.slice(room).forEach((img) => URL.revokeObjectURL(img.preview));
        }
        setNewFiles([...newFiles, ...valid.slice(0, room)]);
    };

    const removeNew = (index) => {
        URL.revokeObjectURL(newFiles[index].preview);
        setNewFiles(newFiles.filter((_, i) => i !== index));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);

        const name = fd.get("name").trim();
        const price = Number(fd.get("price"));
        const description = fd.get("description").trim();

        if (name.length < 3) return toast.error("Product name is too short.");
        if (!(price > 0)) return toast.error("Enter a price greater than 0.");
        if (description.length < 10) return toast.error("Add a longer description.");

        if (keep.length + newFiles.length === 0) {
            return toast.error("A post needs at least one photo.");
        }

        setSaving(true);
        try {
            const uploaded = await Promise.all(newFiles.map((f) => uploadImage(f.file)));
            const images = [...keep, ...uploaded];

            await updateDoc(doc(db, "products", product.id), {
                name,
                price,
                condition: fd.get("condition"),
                category: fd.get("category"),
                location: fd.get("location").trim(),
                description,
                images,
                image: images[0],
            });
            toast.success("Post updated");
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-xl">
                <h3 className="font-semibold text-xl mb-2">Edit post</h3>
                <form onSubmit={handleSave}>
                    <fieldset className="fieldset">
                        <label className="label">Product name</label>
                        <input
                            name="name"
                            defaultValue={product.name}
                            className="input w-full"
                        />

                        <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                                <label className="label">Price ($)</label>
                                <input
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    defaultValue={product.price}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="label">Condition</label>
                                <select
                                    name="condition"
                                    defaultValue={product.condition}
                                    className="select w-full"
                                >
                                    {CONDITIONS.map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Category</label>
                                <select
                                    name="category"
                                    defaultValue={product.category}
                                    className="select w-full"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Location</label>
                                <input
                                    name="location"
                                    defaultValue={product.location || ""}
                                    className="input w-full"
                                />
                            </div>
                        </div>

                        <label className="label">Description</label>
                        <textarea
                            name="description"
                            defaultValue={product.description}
                            className="textarea w-full h-28"
                        />

                        <label className="label">
                            Photos ({keep.length + newFiles.length}/{MAX_PHOTOS})
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {keep.map((src, i) => (
                                <div key={src} className="relative">
                                    <img
                                        src={src}
                                        alt={`Photo ${i + 1}`}
                                        className="w-20 h-20 object-cover rounded-lg bg-base-200"
                                    />
                                    {i === 0 && (
                                        <span className="badge badge-primary badge-xs absolute bottom-1 left-1">
                                            Cover
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setKeep(keep.filter((_, k) => k !== i))}
                                        className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2"
                                        aria-label="Remove photo"
                                        disabled={saving}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {newFiles.map((img, i) => (
                                <div key={img.preview} className="relative">
                                    <img
                                        src={img.preview}
                                        alt={`New photo ${i + 1}`}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <span className="badge badge-success badge-xs absolute bottom-1 left-1">
                                        New
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeNew(i)}
                                        className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2"
                                        aria-label="Remove new photo"
                                        disabled={saving}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {keep.length + newFiles.length < MAX_PHOTOS && (
                                <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:border-primary hover:text-primary">
                                    <ImagePlus size={22} />
                                    <span className="text-xs mt-1">Add</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={addFiles}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </fieldset>

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-neutral" disabled={saving}>
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};

const MyPosts = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        if (!user) return;
        // No orderBy here, so no composite index is needed; we sort in the browser.
        const q = query(collection(db, "products"), where("sellerId", "==", user.uid));
        return onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                list.sort((a, b) => millis(b.createdAt) - millis(a.createdAt));
                setProducts(list);
                setLoading(false);
            },
            (error) => {
                toast.error(error.message);
                setLoading(false);
            }
        );
    }, [user]);

    const toggleSold = (p) =>
        updateDoc(doc(db, "products", p.id), {
            status: p.status === "sold" ? "available" : "sold",
        }).catch((error) => toast.error(error.message));

    const handleDelete = async (p) => {
        if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
        try {
            await deleteDoc(doc(db, "products", p.id));
            toast.success("Post deleted");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <Toaster position="top-center" />
            <div className="mt-24 px-6 pb-16 max-w-4xl mx-auto min-h-screen">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-semibold">
                        My posts <span className="text-gray-400 text-xl">({products.length})</span>
                    </h1>
                    <Link to="/post-product" className="btn btn-primary rounded-2xl">
                        Create post
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500">You haven't posted anything yet.</p>
                        <Link to="/post-product" className="btn btn-neutral rounded-2xl mt-4">
                            Post your first product
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {products.map((p) => {
                            const isSold = p.status === "sold";
                            return (
                                <div
                                    key={p.id}
                                    className="card sm:card-side bg-base-100 shadow-md p-3 gap-4"
                                >
                                    <img
                                        src={p.image || "/favicon.svg"}
                                        alt={p.name}
                                        className="w-full sm:w-32 h-40 sm:h-32 rounded-lg object-cover bg-base-200"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/favicon.svg";
                                        }}
                                    />

                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link
                                                to={`/product/${p.id}`}
                                                className="font-semibold text-lg truncate hover:underline"
                                            >
                                                {p.name}
                                            </Link>
                                            <span
                                                className={`badge ${isSold ? "badge-error" : "badge-success"
                                                    }`}
                                            >
                                                {isSold ? "Sold" : "Available"}
                                            </span>
                                        </div>
                                        <p className="font-bold text-primary">
                                            {formatPrice(p.price)}
                                        </p>
                                        <Activity productId={p.id} />

                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <Link
                                                to={`/product/${p.id}`}
                                                className="btn btn-sm btn-outline rounded-xl"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => setEditing(p)}
                                                className="btn btn-sm btn-outline rounded-xl"
                                            >
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => toggleSold(p)}
                                                className="btn btn-sm btn-outline rounded-xl"
                                            >
                                                {isSold ? "Mark available" : "Mark sold"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p)}
                                                className="btn btn-sm btn-outline btn-error rounded-xl"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {editing && <EditModal product={editing} onClose={() => setEditing(null)} />}
        </>
    );
};

export default MyPosts;