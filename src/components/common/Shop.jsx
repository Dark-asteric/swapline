import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { Search } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import ProductCard from "./ProductCard";
import { CATEGORIES } from "../../utils/categories";

const FILTERS = ["All", ...CATEGORIES];

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get("category") || "All";
    const setCategory = (c) => setSearchParams(c === "All" ? {} : { category: c });
    const [search, setSearch] = useState("");
    useEffect(() => {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        return onSnapshot(
            q,
            (snap) => {
                setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (error) => {
                toast.error(error.message);
                setLoading(false);
            }
        );
    }, []);

    const visible = products.filter((p) => {
        const matchesCategory = category === "All" || p.category === category;
        const matchesSearch = p.name?.toLowerCase().includes(search.trim().toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <Toaster position="top-center" />
            <div className="mt-24 px-20 pb-16 mx-auto min-h-screen">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <h1 className="text-3xl font-semibold">Shop</h1>
                    <label className="input w-full md:w-72">
                        <Search size={16} />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products"
                        />
                    </label>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {FILTERS.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`btn btn-sm rounded-full ${category === c ? "btn-neutral" : "btn-outline"
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500">No products found.</p>
                        <Link to="/post-product" className="btn btn-primary rounded-2xl mt-4">
                            Create the first post
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visible.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Shop;