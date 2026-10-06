import { Link } from "react-router-dom";
import {
    Camera,
    HandCoins,
    Leaf,
    MessageCircle,
    PlusCircle,
    Search,
    ShieldCheck,
    Zap,
} from "lucide-react";

const STEPS = [
    {
        icon: PlusCircle,
        title: "Post what you don't need",
        text: "Add photos, a price and a short description. Posting takes about a minute.",
    },
    {
        icon: Search,
        title: "Find what you do",
        text: "Browse by category, search by name and open any listing to see every detail.",
    },
    {
        icon: MessageCircle,
        title: "Chat and agree",
        text: "Ask questions, make an offer or buy right away. Everything happens in one place.",
    },
];

const VALUES = [
    {
        icon: Leaf,
        title: "Give things a second life",
        text: "Every item that finds a new owner is one less thing thrown away.",
    },
    {
        icon: HandCoins,
        title: "Fair prices, real offers",
        text: "Buyers can pay the asking price or make an offer. Sellers choose what to accept.",
    },
    {
        icon: ShieldCheck,
        title: "Your data stays yours",
        text: "Your cart and conversations are private to you. Only logged-in users can post, offer or chat.",
    },
    {
        icon: Zap,
        title: "Live, not laggy",
        text: "New posts, messages and offers show up instantly, with no page refresh.",
    },
];

const AboutUs = () => {
    return (
        <div className="mt-20">
            <section className="px-20 py-20 bg-base-200 text-center">
                <div className="mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold">About Swapline</h1>
                    <p className="mt-5 text-lg text-gray-600">
                        Swapline is a marketplace where people buy and sell pre-loved things
                        directly with each other. We make it simple to turn what you no longer
                        use into something someone else needs.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        <Link to="/shop" className="btn btn-neutral rounded-2xl">
                            Browse products
                        </Link>
                        <Link to="/post-product" className="btn btn-primary rounded-2xl">
                            Post to sell
                        </Link>
                    </div>
                </div>
            </section>

            <section className="px-20 py-16">
                <div className="mx-auto grid gap-8 md:grid-cols-2 items-center">
                    <div>
                        <h2 className="text-3xl font-semibold">Our mission</h2>
                        <p className="mt-4 text-gray-600">
                            Good things shouldn't sit in a drawer. We built Swapline so anyone
                            can sell an item quickly, and anyone can find a good deal without
                            the hassle of long listings, hidden fees or slow replies.
                        </p>
                    </div>
                    <div className="card bg-base-100 shadow-md p-6">
                        <Camera size={32} strokeWidth={1.5} className="text-primary" />
                        <h3 className="font-semibold text-xl mt-3">Simple on purpose</h3>
                        <p className="text-gray-600 mt-2">
                            Photos, a price, a description. That's all a listing needs, and
                            that's all we ask for.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-20 py-16 bg-base-200">
                <div className="mx-auto">
                    <h2 className="text-3xl font-semibold text-center">How it works</h2>
                    <div className="grid gap-6 mt-10 md:grid-cols-3">
                        {STEPS.map(({ icon: Icon, title, text }, i) => (
                            <div key={title} className="card bg-base-100 shadow-md p-6 text-center">
                                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Icon size={28} strokeWidth={1.75} className="text-primary" />
                                </div>
                                <p className="text-sm text-gray-400 mt-4">Step {i + 1}</p>
                                <h3 className="font-semibold text-lg">{title}</h3>
                                <p className="text-gray-600 mt-2">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-20 py-16">
                <div className="mx-auto">
                    <h2 className="text-3xl font-semibold text-center">Why Swapline</h2>
                    <div className="grid gap-6 mt-10 sm:grid-cols-2">
                        {VALUES.map(({ icon: Icon, title, text }) => (
                            <div key={title} className="flex gap-4 card bg-base-100 shadow-md p-6 flex-row">
                                <Icon size={30} strokeWidth={1.5} className="text-primary shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-lg">{title}</h3>
                                    <p className="text-gray-600 mt-1">{text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to action */}
            <section className="px-20 pb-20">
                <div className="mx-auto rounded-3xl bg-neutral text-neutral-content px-8 py-12 text-center">
                    <h2 className="text-3xl font-semibold">Ready to swap?</h2>
                    <p className="mt-3 opacity-80">
                        Join Swapline today. Sell something you don't need, or find something
                        you'll love.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <Link to="/auth/register" className="btn btn-primary rounded-2xl">
                            Create an account
                        </Link>
                        <Link to="/shop" className="btn btn-outline hover:text-blue-500 text-white rounded-2xl">
                            Explore the shop
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;