import { useContext } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../provider/AuthContext";

const MENU = [
    {
        heading: "Manage My Account",
        items: [
            { label: "My Profile", to: "/profile", end: true },
            { label: "Address Book", to: "/profile/address-book" },
            { label: "My Payment Options", to: "/profile/payment-options" },
        ],
    },
    {
        heading: "My Orders",
        to: "/profile/orders",
        items: [
            { label: "My Returns", to: "/profile/returns" },
            { label: "My Cancellations", to: "/profile/cancellations" },
        ],
    },
    { heading: "My WishList", to: "/profile/wishlist", items: [] },
];

const linkClass = ({ isActive }) =>
    isActive ? "text-blue-700" : "text-gray-500 hover:text-black";

const AccountLayout = () => {
    const { user } = useContext(AuthContext);

    return (
        <>
            <Toaster position="top-center" />
            <div className="mt-24 px-6 max-w-6xl mx-auto pb-20">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-12">
                    <nav className="text-gray-500">
                        <Link to="/" className="hover:underline">
                            Home
                        </Link>
                        <span className="mx-3">/</span>
                        <span className="text-black">My Account</span>
                    </nav>
                    <p>
                        Welcome!{" "}
                        <span className="text-blue-500 font-medium">
                            {user?.displayName || user?.email}
                        </span>
                    </p>
                </div>

                <div className="grid gap-10 md:grid-cols-[240px_1fr]">
                    <aside className="space-y-6 ">
                        {MENU.map((group) => (
                            <div key={group.heading}>
                                {group.to ? (
                                    <NavLink
                                        to={group.to}
                                        className={({ isActive }) =>
                                            `text-base font-medium ${isActive ? "text-blue-500" : "text-black"
                                            }`
                                        }
                                    >
                                        {group.heading}
                                    </NavLink>
                                ) : (
                                    <h3 className="text-base font-medium text-black">
                                        {group.heading}
                                    </h3>
                                )}
                                {group.items.length > 0 && (
                                    <ul className="mt-4 ml-8 space-y-3">
                                        {group.items.map((item) => (
                                            <li key={item.to}>
                                                <NavLink
                                                    to={item.to}
                                                    end={item.end}
                                                    className={linkClass}
                                                >
                                                    {item.label}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </aside>

                    <main className="min-w-0">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
};

export default AccountLayout;