import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../provider/AuthContext";
const SellButton = () => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    const handleClick = (e) => {
        if (loading) {
            e.preventDefault();
            return;
        }
        if (!user) {
            toast("Please login to post a product.", { icon: "🔒" });
        }
    };
    const to = user ? "/post-product" : "/auth/login";
    const state = user ? undefined : { from: location };

    return (
        <Link
            to={to}
            state={state}
            onClick={handleClick}
            className="btn btn-primary rounded-full shadow-lg fixed bottom-6 right-6 z-50 text-base"
        >
            <Plus size={20} />
            Post to sell
        </Link>
    );
};

export default SellButton;