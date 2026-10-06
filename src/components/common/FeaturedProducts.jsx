import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase.config";
import ProductCard from "./ProductCard";

const millis = (ts) => (ts?.toMillis ? ts.toMillis() : Date.now());

// Homepage "Featured" section: shows products that have featured: true.
// You turn it on per product in the Firebase Console (see instructions).
const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Single where() and no orderBy, so no composite index is needed.
        const q = query(collection(db, "products"), where("featured", "==", true), limit(12));
        return onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                list.sort((a, b) => millis(b.createdAt) - millis(a.createdAt));
                setProducts(list.slice(0, 8));
                setLoading(false);
            },
            (error) => {
                console.error("Featured products failed:", error);
                setLoading(false);
            }
        );
    }, []);
    if (!loading && products.length === 0) return null;

    return (
        <section className="px-6 my-16">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-semibold">Featured products</h2>
                    <Link to="/shop" className="btn btn-outline btn-sm rounded-xl">
                        View all
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} badge="Featured" />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts;