import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
            <img
                src="/404.jpg"
                alt="Error 404 - Page not found"
                className="w-full max-w-md"
            />
            <Link to="/" className="btn btn-outline btn-primary rounded-2xl text-lg mt-2">
                <Home size={20} />
                Back to home
            </Link>
        </div>
    );
};

export default NotFound;