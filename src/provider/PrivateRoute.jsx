import { use } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../provider/AuthContext";

const PrivateRoute = ({ children }) => {
    const { user, loading } = use(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <span className="loading loading-spinner loading-lg text-purple-600"></span>
            </div>
        );
    }

    if (user && user?.email) {
        return children;
    }

    return <Navigate state={location.pathname} to="/auth/login" />;
};

export default PrivateRoute;