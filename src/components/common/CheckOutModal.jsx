import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";
import { CartContext } from "../../provider/CartContext";

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;
const pick = (list) => (list.find((x) => x.isDefault) || list[0])?.id || "";

// Opens from the cart. Lets the buyer choose a saved address and payment
// option, then saves an order (see My Orders).
const CheckoutModal = ({ onClose }) => {
    const { user } = useContext(AuthContext);
    const { items, subtotal, totalItems, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loaded, setLoaded] = useState({ addresses: false, payments: false });
    const [addressId, setAddressId] = useState("");
    const [paymentId, setPaymentId] = useState("");
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        const unsubAddresses = onSnapshot(
            collection(db, "users", user.uid, "addresses"),
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setAddresses(list);
                setAddressId((prev) => (list.some((a) => a.id === prev) ? prev : pick(list)));
                setLoaded((l) => ({ ...l, addresses: true }));
            },
            (error) => toast.error("Addresses: " + error.message)
        );
        const unsubPayments = onSnapshot(
            collection(db, "users", user.uid, "payments"),
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setPayments(list);
                setPaymentId((prev) => (list.some((p) => p.id === prev) ? prev : pick(list)));
                setLoaded((l) => ({ ...l, payments: true }));
            },
            (error) => toast.error("Payment options: " + error.message)
        );
        return () => {
            unsubAddresses();
            unsubPayments();
        };
    }, [user.uid]);

    const ready = loaded.addresses && loaded.payments;
    const missingSetup = ready && (addresses.length === 0 || payments.length === 0);

    const placeOrder = async () => {
        const address = addresses.find((a) => a.id === addressId);
        const payment = payments.find((p) => p.id === paymentId);
        if (!address) return toast.error("Choose a delivery address.");
        if (!payment) return toast.error("Choose a payment option.");
        if (items.length === 0) return toast.error("Your cart is empty.");

        setPlacing(true);
        try {
            await addDoc(collection(db, "orders"), {
                buyerId: user.uid,
                buyerName: user.displayName || user.email,
                buyerEmail: user.email,
                items: items.map((i) => ({
                    id: i.id,
                    name: i.name,
                    price: i.price,
                    image: i.image || "",
                    quantity: i.quantity,
                })),
                itemCount: totalItems,
                total: subtotal,
                address: {
                    label: address.label ?? "",
                    fullName: address.fullName ?? "",
                    phone: address.phone ?? "",
                    street: address.street ?? "",
                    city: address.city ?? "",
                    postalCode: address.postalCode ?? "",
                    country: address.country ?? "",
                },
                paymentMethod: { type: payment.type, label: payment.label ?? "" },
                status: "placed",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            clearCart();
            toast.success("Order placed!");
            onClose();
            navigate("/profile/orders");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setPlacing(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-lg">
                <h3 className="font-semibold text-xl mb-4">Checkout</h3>

                {!ready ? (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner"></span>
                    </div>
                ) : missingSetup ? (
                    <div className="space-y-3 text-sm">
                        <p>Before you can place an order you need:</p>
                        <ul className="space-y-2">
                            {addresses.length === 0 && (
                                <li>
                                    <Link to="/profile/address-book" onClick={onClose} className="link link-primary">
                                        Add a delivery address
                                    </Link>
                                </li>
                            )}
                            {payments.length === 0 && (
                                <li>
                                    <Link to="/profile/payment-options" onClick={onClose} className="link link-primary">
                                        Add a payment option
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm">Delivery address</label>
                            <select
                                value={addressId}
                                onChange={(e) => setAddressId(e.target.value)}
                                className="select select-bordered w-full"
                            >
                                {addresses.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.label}: {a.fullName}, {a.street}, {a.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Payment option</label>
                            <select
                                value={paymentId}
                                onChange={(e) => setPaymentId(e.target.value)}
                                className="select select-bordered w-full"
                            >
                                {payments.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.type}
                                        {p.label ? ` (${p.label})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-3">
                            <span>
                                Total ({totalItems} item{totalItems > 1 ? "s" : ""})
                            </span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                    </div>
                )}

                <div className="modal-action">
                    <button onClick={onClose} className="btn btn-outline btn-primary" disabled={placing}>
                        Cancel
                    </button>
                    {ready && !missingSetup && (
                        <button onClick={placeOrder} className="btn btn-primary" disabled={placing}>
                            {placing ? "Placing..." : "Place order"}
                        </button>
                    )}
                </div>
            </div>
            <div className="modal-backdrop" onClick={placing ? undefined : onClose}></div>
        </div>
    );
};

export default CheckoutModal;