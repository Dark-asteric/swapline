import { useContext, useEffect, useRef, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase/firebase.config";
import { AuthContext } from "./AuthContext";
import { CartContext } from "./CartContext";

const OLD_SHARED_KEY = "swapline-cart";

const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const uid = user?.uid;

    // Remember which user the loaded items belong to, so one user's cart can
    // never flash on screen for the next user who logs in.
    const [cart, setCart] = useState({ uid: null, items: [] });
    const itemsRef = useRef([]);

    // Delete the old cart that was shared by everyone on this browser
    useEffect(() => {
        try {
            localStorage.removeItem(OLD_SHARED_KEY);
        } catch {
            // storage unavailable: nothing to clean up
        }
    }, []);

    // Live-sync the logged-in user's cart
    useEffect(() => {
        if (!uid) return;
        return onSnapshot(
            doc(db, "carts", uid),
            (snap) =>
                setCart({ uid, items: snap.exists() ? snap.data().items || [] : [] }),
            (error) => toast.error("Cart: " + error.message)
        );
    }, [uid]);

    const items = uid && cart.uid === uid ? cart.items : [];

    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    const save = (next) => {
        itemsRef.current = next;
        setCart({ uid, items: next });
        setDoc(doc(db, "carts", uid), { items: next, updatedAt: serverTimestamp() }).catch(
            (error) => toast.error(error.message)
        );
    };

    // product: { id, name (or title), price, image (or img) }
    const addToCart = (product, quantity = 1) => {
        if (!uid) return;
        const current = itemsRef.current;
        const existing = current.find((item) => item.id === product.id);

        if (existing) {
            save(
                current.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            );
        } else {
            save([
                ...current,
                {
                    id: product.id,
                    name: product.name || product.title || "Product",
                    price: Number(product.price) || 0,
                    image: product.image || product.img || "",
                    quantity,
                },
            ]);
        }
    };

    const updateQuantity = (id, quantity) => {
        if (!uid || quantity < 1) return;
        save(
            itemsRef.current.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const removeFromCart = (id) => {
        if (!uid) return;
        save(itemsRef.current.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        if (!uid) return;
        save([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const cartData = {
        items,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
    };

    return <CartContext.Provider value={cartData}>{children}</CartContext.Provider>;
};

export default CartProvider;