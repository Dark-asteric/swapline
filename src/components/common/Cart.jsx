// import { Link } from "react-router-dom";
// import { ShoppingCart } from "lucide-react";

// const Cart = ({ count = 0 }) => {
//     return (
//         <Link to="/cart" className="btn btn-ghost btn-circle" aria-label="Cart">
//             <div className="indicator">
//                 <ShoppingCart size={24} strokeWidth={1.75} />
//                 {count > 0 && (
//                     <span className="badge badge-sm badge-primary indicator-item">
//                         {count > 99 ? "99+" : count}
//                     </span>
//                 )}
//             </div>
//         </Link>
//     );
// };

// export default Cart;

import { useContext } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { CartContext } from "../../provider/CartContext";

const Cart = () => {
    const { totalItems } = useContext(CartContext);

    return (
        <Link to="/cart" className="btn btn-ghost btn-circle" aria-label="Cart">
            <div className="indicator">
                <ShoppingCart size={24} strokeWidth={1.75} />
                {totalItems > 0 && (
                    <span className="badge badge-sm badge-primary indicator-item">
                        {totalItems > 99 ? "99+" : totalItems}
                    </span>
                )}
            </div>
        </Link>
    );
};

export default Cart;