import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { Toaster } from "react-hot-toast";
import { db } from "../../firebase/firebase.config";
import ProductCard from "./ProductCard";

const LATEST_COUNT = 8;

const timeAgo = (ts) => {
    if (!ts?.toMillis) return "just now";
    const minutes = Math.floor((Date.now() - ts.toMillis()) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
};

const LatestPosts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "products"),
            orderBy("createdAt", "desc"),
            limit(LATEST_COUNT)
        );
        return onSnapshot(
            q,
            (snap) => {
                setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (error) => {
                console.error("Latest posts failed:", error);
                setLoading(false);
            }
        );
    }, []);

    return (
        <section className="px-20 my-20">
            <Toaster position="top-center" />
            <div className="mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-semibold">Latest posts</h2>
                    <Link to="/shop" className="btn btn-outline btn-sm rounded-xl">
                        View all
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 bg-base-200 rounded-2xl">
                        <p className="text-gray-500">No posts yet. Be the first to sell something!</p>
                        <Link to="/post-product" className="btn btn-primary rounded-2xl mt-4">
                            Create post
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} meta={timeAgo(p.createdAt)} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default LatestPosts;