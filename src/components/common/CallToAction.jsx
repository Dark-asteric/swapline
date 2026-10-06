import { Link } from "react-router-dom"

const CallToAction = () => {
    return (
        <section className="px-20 pb-16">
            <div className="mx-auto rounded-box bg-primary px-6 py-14 text-center text-primary-content">
                <h2 className="text-3xl font-bold md:text-4xl">Got something to sell?</h2>
                <p className="mx-auto mt-3 text-lg opacity-90">
                    List your product in minutes and start chatting with buyers today.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link to="/sell" className="btn btn-lg border-none bg-base-100 text-base-content hover:bg-base-200">
                        Start selling
                    </Link>
                    <Link to="/shop" className="btn btn-lg btn-outline border-primary-content text-primary-content hover:bg-primary-content hover:text-primary">
                        Browse products
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default CallToAction