import { useContext } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../provider/AuthContext";

const CreatePostBanner = () => {
    const { user, loading } = useContext(AuthContext);

    const handleClick = (e) => {
        if (loading) {
            e.preventDefault();
            return;
        }
        if (!user) {
            toast("Please login to create a post.", { icon: "🔒" });
        }
    };

    return (
        <section className="px-20 my-2">
            <div className="mx-auto rounded-3xl bg-base-200 px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                    <h2 className="text-3xl font-semibold">Got something to sell?</h2>
                    <p className="text-gray-500 mt-2 max-w-xl">
                        Post your product in a minute. Add photos, set your price, and let buyers
                        make offers or message you directly.
                    </p>
                </div>

                <Link
                    to={user ? "/post-product" : "/auth/login"}
                    state={user ? undefined : "/post-product"}
                    onClick={handleClick}
                    className="btn btn-primary btn-lg rounded-2xl shrink-0"
                >
                    <PlusCircle size={22} />
                    Create post
                </Link>
            </div>
        </section>
    );
};

export default CreatePostBanner;