import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";

const WishListsButton = ({ product, withLabel = false, className = "" }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const uid = user?.uid;
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!uid) return;
        return onSnapshot(
            doc(db, "users", uid, "wishlist", product.id),
            (snap) => setSaved(snap.exists()),
            () => { }
        );
    }, [uid, product.id]);

    const isSaved = !!uid && saved;

    const toggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Please login to save items.");
            navigate("/auth/login", { state: location.pathname });
            return;
        }

        const ref = doc(db, "users", uid, "wishlist", product.id);
        try {
            if (isSaved) {
                await deleteDoc(ref);
            } else {
                await setDoc(ref, {
                    productId: product.id,
                    name: product.name || "Product",
                    price: Number(product.price) || 0,
                    image: product.image || "",
                    createdAt: serverTimestamp(),
                });
                toast.success("Saved to your wishlist");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const icon = (
        <Heart size={withLabel ? 18 : 16} className={isSaved ? "fill-red-500 text-red-500" : ""} />);

    if (withLabel) {
        return (
            <button onClick={toggle} className={`btn btn-outline rounded-2xl ${className}`}>
                {icon}
                {isSaved ? "Saved" : "Save"}
            </button>
        );
    }

    return (
        <button
            onClick={toggle}
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            className={`btn btn-circle btn-sm bg-base-100 shadow ${className}`}
        >
            {icon}
        </button>
    );
};

export default WishListsButton;