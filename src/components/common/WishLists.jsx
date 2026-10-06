import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";

const WishLists = ({product,withLabel = false,className = ""}) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const uid = user?.uid;
    const productId = product?.id;

    const [saved, setSaved] = useState(false);

    // Listen to wishlist status
    useEffect(() => {
        // No user or no product
        if (!uid || !productId) {
            setSaved(false);
            return;
        }

        const wishlistRef = doc(
            db,
            "users",
            uid,
            "wishlist",
            productId
        );

        return onSnapshot(
            wishlistRef,
            (snap) => {
                setSaved(snap.exists());
            },
            (error) => {
                console.error("Wishlist listener error:", error);
                setSaved(false);
            }
        );
    }, [uid, productId]);

    const isSaved = !!uid && saved;

    const toggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent crash if product was not provided
        if (!productId) {
            console.error(
                "WishlistButton: product or product.id is missing.",
                product
            );

            toast.error("Unable to save this product.");
            return;
        }

        // User not logged in
        if (!user) {
            toast.error("Please login to save items.");

            navigate("/auth/login", {
                state: {
                    from: location.pathname,
                },
            });

            return;
        }

        const wishlistRef = doc(
            db,
            "users",
            uid,
            "wishlist",
            productId
        );

        try {
            if (isSaved) {
                await deleteDoc(wishlistRef);

                toast.success("Removed from your wishlist");
            } else {
                await setDoc(wishlistRef, {
                    productId: productId,
                    name: product?.name || "Product",
                    price: Number(product?.price) || 0,
                    image: product?.image || "",
                    createdAt: serverTimestamp(),
                });

                toast.success("Saved to your wishlist");
            }
        } catch (error) {
            console.error("Wishlist error:", error);
            toast.error(error.message || "Something went wrong.");
        }
    };

    const icon = (
        <Heart
            size={withLabel ? 18 : 16}
            className={
                isSaved
                    ? "fill-red-500 text-red-500"
                    : ""
            }
        />
    );

    if (!productId) {
        return null;
    }

    if (withLabel) {
        return (
            <button
                type="button"
                onClick={toggle}
                className={`btn btn-outline rounded-2xl ${className}`}
            >
                {icon}
                {isSaved ? "Saved" : "Save"}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={
                isSaved
                    ? "Remove from wishlist"
                    : "Add to wishlist"
            }
            className={`btn btn-circle btn-sm bg-base-100 shadow ${className}`}
        >
            {icon}
        </button>
    );
};

export default WishLists;