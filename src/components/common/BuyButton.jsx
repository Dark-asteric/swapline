import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../../provider/AuthContext";
import { CartContext } from "../../provider/CartContext";

const BuyButton = ({ product, className = "btn btn-neutral rounded-2xl" }) => {
    const { user, loading } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleBuy = () => {
        if (loading) return;

        if (!user) {
            toast.error("Please login to buy this product.");
            navigate("/auth/login", { state: { from: location } });
            return;
        }

        addToCart(product);
        toast.success("Added to cart");
        navigate("/cart");
    };

    return (
        <button onClick={handleBuy} className={className}>
            Buy now
        </button>
    );
};

export default BuyButton;