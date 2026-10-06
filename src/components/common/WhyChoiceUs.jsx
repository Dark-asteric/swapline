import { FaComments, FaBolt, FaSearch, FaStar } from "react-icons/fa"

const features = [
    {
        icon: FaComments,
        title: "Live chat",
        text: "Talk to buyers and sellers instantly, without leaving the site.",
    },
    {
        icon: FaBolt,
        title: "List in minutes",
        text: "Add photos, set a price, and your product is online.",
    },
    {
        icon: FaSearch,
        title: "Easy to find",
        text: "Browse by category or search to find items near you.",
    },
    {
        icon: FaStar,
        title: "Seller ratings",
        text: "Check a seller's rating before you send a message.",
    },
]

const WhyChooseUs = () => {
    return (
        <section className="py-16 px-20">
            <div className="mx-auto px-6">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold">Why choose us</h2>
                    <p className="mt-1 opacity-70">Built to make buying and selling simple</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map(({ icon: Icon, title, text }) => (
                        <div key={title} className="rounded-box border border-base-300 bg-base-100 p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold">{title}</h3>
                            <p className="mt-1 opacity-70">{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyChooseUs