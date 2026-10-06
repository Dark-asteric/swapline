import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layout/HomeLayout";
import Home from "../components/pages/Home";
import Shop from "../components/common/Shop";
import AuthLayout from "../Layout/AuthLayout";
import Login from "../authentification/login/Login";
import Register from "../authentification/register/Register";
import PrivateRoute from "../provider/PrivateRoute";
import Profile from "../components/pages/Profile";
import CartPage from "../components/pages/CartPage";
import NotFound from "../components/pages/NotFound";
import PostProduct from "../components/common/PostProduct";
import ProductDetails from "../components/common/ProductDetails";
import ChatPage from "../components/pages/ChatPage";
import AboutUs from "../components/pages/AboutUs";
import AccountLayout from "../Layout/AccountLayout";
import AddressBook from "../components/pages/AddressBook";
import PaymentOptions from "../components/pages/PaymentOptions";
import MyOrders from "../components/pages/MyOrders";
import WishlistButton from "../components/common/WishLists";
import ContactUs from "../components/pages/ContactUs";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout />,
        children: [
            {
                index: true,
                Component: Home,
            },
            {
                path: "/shop",
                Component: Shop,
            },
            {
                path: "profile",
                element: <PrivateRoute><AccountLayout /></PrivateRoute>,
                children: [
                    { index: true, element: <Profile /> },
                    { path: "address-book", element: <AddressBook /> },
                    { path: "payment-options", element: <PaymentOptions /> },
                    { path: "orders", element: <MyOrders view="all" /> },
                    { path: "returns", element: <MyOrders view="returns" /> },
                    { path: "cancellations", element: <MyOrders view="cancellations" /> },
                    { path: "wishlist", element: <WishlistButton /> },
                ],
            },
            { 
                path: "contact-us", 
                element: <ContactUs /> 
            },
            { 
                path: "/about", 
                element: <AboutUs /> 
            },
            {
                path: "/cart",
                element: (
                    <PrivateRoute>
                        <CartPage/>
                    </PrivateRoute>
                ),
            },
            {
                path: "/post-product",
                element: (
                    <PrivateRoute>
                        <PostProduct />
                    </PrivateRoute>
                ),
            },
            { 
                path: "/product/:id", 
                element: <ProductDetails /> 
            },
            { 
                path: "chats", 
                element: <PrivateRoute><ChatPage /></PrivateRoute> 
            },
            { 
                path: "chats/:chatId", 
                element: <PrivateRoute><ChatPage /></PrivateRoute> },
            { 
                path: "*", 
                element: <NotFound /> 
            },
        ],
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            {
                path: "/auth/login",
                Component: Login,
            },
            {
                path: "/auth/register",
                Component: Register,
            }
        ]
    },
    // {
    //     path: "/*",
    //     element : <NotFoundLayout />,
    //     element: <h2 className="mt-32 text-center text-2xl">404 - Page not found</h2>,
    //     Component : NotFound,
    // },
])

export default router;