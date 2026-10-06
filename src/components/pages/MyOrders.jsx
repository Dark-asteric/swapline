import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";

const STATUS = {
    placed: { label: "Placed", badge: "badge-warning" },
    received: { label: "Received", badge: "badge-success" },
    cancelled: { label: "Cancelled", badge: "badge-error" },
    return_requested: { label: "Return requested", badge: "badge-info" },
};

const VIEWS = {
    all: {
        title: "My Orders",
        empty: "You haven't placed any orders yet.",
        filter: () => true,
    },
    returns: {
        title: "My Returns",
        empty: "You have no return requests.",
        filter: (o) => o.status === "return_requested",
    },
    cancellations: {
        title: "My Cancellations",
        empty: "You have no cancelled orders.",
        filter: (o) => o.status === "cancelled",
    },
};

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;
const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleDateString() : "just now");
const ms = (ts) => (ts?.toMillis ? ts.toMillis() : Date.now());

const MyOrders = ({ view = "all" }) => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const config = VIEWS[view];

    useEffect(() => {
        const q = query(collection(db, "orders"), where("buyerId", "==", user.uid));
        return onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                list.sort((a, b) => ms(b.createdAt) - ms(a.createdAt));
                setOrders(list);
                setLoading(false);
            },
            (error) => {
                toast.error("Orders: " + error.message);
                setLoading(false);
            }
        );
    }, [user.uid]);

    const changeStatus = async (order, status, question) => {
        if (!window.confirm(question)) return;
        try {
            await updateDoc(doc(db, "orders", order.id), {
                status,
                updatedAt: serverTimestamp(),
            });
            toast.success("Order updated");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const visible = orders.filter(config.filter);

    return (
        <div className="rounded bg-base-100 shadow-[0_1px_13px_rgba(0,0,0,0.08)] px-6 py-10 md:px-12">
            <h2 className="text-xl font-medium text-[#DB4444] mb-6">{config.title}</h2>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner"></span>
                </div>
            ) : visible.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>{config.empty}</p>
                    {view === "all" && (
                        <Link to="/shop" className="btn btn-primary btn-sm mt-4">
                            Start shopping
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-5">
                    {visible.map((o) => {
                        const status = STATUS[o.status] || { label: o.status, badge: "" };
                        return (
                            <div key={o.id} className="rounded border p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="font-semibold">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-sm text-gray-500">
                                            Placed {formatDate(o.createdAt)} · {o.itemCount} item
                                            {o.itemCount > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <span className={`badge ${status.badge}`}>{status.label}</span>
                                </div>

                                <ul className="mt-4 space-y-3">
                                    {o.items.map((item) => (
                                        <li key={item.id} className="flex items-center gap-3">
                                            <img
                                                src={item.image || "/favicon.svg"}
                                                alt={item.name}
                                                className="w-14 h-14 rounded object-cover bg-base-200"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "/favicon.svg";
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/product/${item.id}`}
                                                    className="font-medium truncate block hover:underline"
                                                >
                                                    {item.name}
                                                </Link>
                                                <p className="text-sm text-gray-500">
                                                    {formatPrice(item.price)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 pt-4 border-t grid gap-2 sm:grid-cols-2 text-sm text-gray-500">
                                    <p>
                                        <span className="text-base-content">Deliver to:</span> {o.address?.fullName},{" "}
                                        {o.address?.street}, {o.address?.city}, {o.address?.country}
                                    </p>
                                    <p>
                                        <span className="text-base-content">Payment:</span> {o.paymentMethod?.type}
                                        {o.paymentMethod?.label ? ` (${o.paymentMethod.label})` : ""}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                                    <p className="font-semibold">Total: {formatPrice(o.total)}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {o.status === "placed" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        changeStatus(o, "received", "Mark this order as received?")
                                                    }
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    Mark as received
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        changeStatus(o, "cancelled", "Cancel this order?")
                                                    }
                                                    className="btn btn-outline btn-error btn-sm"
                                                >
                                                    Cancel order
                                                </button>
                                            </>
                                        )}
                                        {o.status === "received" && (
                                            <button
                                                onClick={() =>
                                                    changeStatus(o, "return_requested", "Request a return for this order?")
                                                }
                                                className="btn btn-outline btn-primary btn-sm"
                                            >
                                                Request return
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrders;