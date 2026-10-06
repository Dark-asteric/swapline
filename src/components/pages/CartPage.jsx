import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { CartContext } from "../../provider/CartContext";
import CheckoutModal from "../common/CheckOutModal";

const formatPrice = (value) => `$${value.toFixed(2)}`;

const CartPage = () => {
    const { items, totalItems, subtotal, updateQuantity, removeFromCart, clearCart } =
        useContext(CartContext);

    const [checkoutOpen, setCheckoutOpen] = useState(false);

    if (items.length === 0) {
        return (
            <div className="mt-20 min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingCart size={64} strokeWidth={1.25} className="text-gray-400" />
                <h2 className="text-2xl font-semibold">Your cart is empty</h2>
                <p className="text-gray-500">Looks like you haven't added anything yet.</p>
                <Link to="/shop" className="btn btn-neutral rounded-2xl">
                    Browse products
                </Link>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="mt-24 px-6 max-w-6xl mx-auto min-h-screen">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-semibold">
                        Shopping Cart <span className="text-gray-400 text-xl">({totalItems})</span>
                    </h1>
                    <button onClick={clearCart} className="btn btn-ghost text-red-500">
                        Clear cart
                    </button>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="card card-side bg-base-100 shadow-md p-3 items-center gap-4"
                            >
                                <img
                                    src={item.image || "/favicon.svg"}
                                    alt={item.name}
                                    className="w-24 h-24 rounded-lg object-cover bg-base-200"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/favicon.svg";
                                    }}
                                />

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{item.name}</h3>
                                    <p className="text-gray-500">{formatPrice(item.price)}</p>

                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="btn btn-xs btn-circle btn-outline"
                                            disabled={item.quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="btn btn-xs btn-circle btn-outline"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="font-semibold">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="btn btn-ghost btn-sm btn-circle text-red-500 mt-2"
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="card bg-base-100 shadow-md h-fit">
                        <div className="card-body">
                            <h2 className="card-title">Order summary</h2>
                            <div className="flex justify-between">
                                <span>Items ({totalItems})</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div className="divider my-1"></div>
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <button onClick={() => setCheckoutOpen(true)} className="btn btn-primary w-full mt-4">
                                Checkout
                            </button>
                            <Link to="/shop" className="btn btn-outline w-full">
                                Continue shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
        </>
    );
};

export default CartPage;