import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import {
    BookOpen,
    Car,
    Dumbbell,
    Flower2,
    Package,
    Shirt,
    Smartphone,
    Sofa,
} from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { CATEGORIES } from "../../utils/categories";

const ICONS = {
    Electronics: Smartphone,
    Fashion: Shirt,
    Furniture: Sofa,
    Books: BookOpen,
    Vehicles: Car,
    Sports: Dumbbell,
    "Home & Garden": Flower2,
    Other: Package,
};
const Categories = () => {
    const [counts, setCounts] = useState({});

    useEffect(() => {
        return onSnapshot(
            collection(db, "products"),
            (snap) => {
                const next = {};
                snap.docs.forEach((d) => {
                    const { category, status } = d.data();
                    if (status === "sold") return; // count available items only
                    next[category] = (next[category] || 0) + 1;
                });
                setCounts(next);
            },
            (error) => console.error("Category counts failed:", error)
        );
    }, []);

    return (
        <section className="px-20 my-20">
            <div className="mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-semibold">Shop by category</h2>
                    <Link to="/shop" className="link link-primary">
                        View all
                    </Link>
                </div>

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                    {CATEGORIES.map((name) => {
                        const Icon = ICONS[name] || Package;
                        const count = counts[name] || 0;
                        return (
                            <Link
                                key={name}
                                to={`/shop?category=${encodeURIComponent(name)}`}
                                className="card bg-base-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition p-5 items-center text-center gap-2"
                            >
                                <Icon size={32} strokeWidth={1.5} className="text-primary" />
                                <h3 className="font-semibold">{name}</h3>
                                <p className="text-sm text-gray-500">
                                    {count} {count === 1 ? "item" : "items"}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Categories;