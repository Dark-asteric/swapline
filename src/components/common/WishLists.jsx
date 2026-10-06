import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import { ShoppingCart, Trash2 } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";
import { CartContext } from "../../provider/CartContext";

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;
const ms = (ts) => (ts?.toMillis ? ts.toMillis() : Date.now());

const Wishlist = () => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return onSnapshot(
            collection(db, "users", user.uid, "wishlist"),
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                list.sort((a, b) => ms(b.createdAt) - ms(a.createdAt));
                setItems(list);
                setLoading(false);
            },
            (error) => {
                toast.error("Wishlist: " + error.message);
                setLoading(false);
            }
        );
    }, [user.uid]);

    const remove = (item) =>
        deleteDoc(doc(db, "users", user.uid, "wishlist", item.id)).catch((error) =>
            toast.error(error.message)
        );

    const moveToCart = async (item) => {
        addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
        await remove(item);
        toast.success("Moved to your cart");
    };

    return (
        <div className="rounded bg-base-100 shadow-[0_1px_13px_rgba(0,0,0,0.08)] px-6 py-10 md:px-12">
            <h2 className="text-xl font-medium text-[#DB4444] mb-6">
                My WishList <span className="text-gray-400 text-base">({items.length})</span>
            </h2>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner"></span>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>Your wishlist is empty. Tap the heart on any product to save it here.</p>
                    <Link to="/shop" className="btn btn-primary btn-sm mt-4">
                        Browse products
                    </Link>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => (
                        <div key={item.id} className="rounded border overflow-hidden">
                            <Link to={`/product/${item.id}`}>
                                <img
                                    src={item.image || "/favicon.svg"}
                                    alt={item.name}
                                    className="w-full aspect-square object-cover bg-base-200"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/favicon.svg";
                                    }}
                                />
                            </Link>
                            <div className="p-4 space-y-3">
                                <div>
                                    <Link
                                        to={`/product/${item.id}`}
                                        className="font-semibold truncate block hover:underline"
                                    >
                                        {item.name}
                                    </Link>
                                    <p className="text-[#DB4444] font-medium">{formatPrice(item.price)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => moveToCart(item)} className="btn btn-primary btn-sm flex-1">
                                        <ShoppingCart size={14} /> Move to cart
                                    </button>
                                    <button
                                        onClick={() => remove(item)}
                                        className="btn btn-outline btn-error btn-sm btn-square"
                                        aria-label="Remove from wishlist"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;