import { Link } from "react-router-dom";
import BuyButton from "./BuyButton";
import WishLists from "./WishLists";

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;

const ProductCard = ({ product: p, badge, meta }) => {
    const isSold = p.status === "sold";

    return (
        <div className="card relative bg-base-100 shadow-md">
            <Link to={`/product/${p.id}`}>
                <figure className="relative">
                    <img
                        src={p.image || "/favicon.svg"}
                        alt={p.name}
                        className="w-full aspect-square rounded-2xl object-cover bg-base-200"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/favicon.svg";
                        }}
                    />
                    {isSold ? (
                        <span className="badge badge-error absolute top-3 left-3">Sold</span>
                    ) : (
                        badge && (
                            <span className="badge badge-primary absolute top-3 left-3">{badge}</span>
                        )
                    )}
                </figure>
            </Link>

            <WishLists
                product={{ id: p.id, name: p.name, price: p.price, image: p.image }}
                className="absolute top-3 right-3 z-10"
            />

            <div className="card-body p-4">
                <Link to={`/product/${p.id}`}>
                    <h3 className="card-title text-lg truncate">{p.name}</h3>
                </Link>
                <p className="text-xl font-bold text-primary">{formatPrice(p.price)}</p>
                <div className="flex flex-wrap items-center gap-1">
                    <span className="badge badge-outline badge-sm">{p.condition}</span>
                    <span className="badge badge-outline badge-sm">{p.category}</span>
                    {meta && <span className="text-xs text-gray-400">{meta}</span>}
                </div>
                <div className="card-actions mt-3 grid grid-cols-2 gap-2">
                    <Link to={`/product/${p.id}`} className="btn btn-outline btn-sm rounded-xl">
                        Details
                    </Link>
                    {isSold ? (
                        <button className="btn btn-sm rounded-xl" disabled>
                            Sold
                        </button>
                    ) : (
                        <BuyButton
                            product={{ id: p.id, name: p.name, price: p.price, image: p.image }}
                            className="btn btn-primary btn-sm rounded-xl"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;