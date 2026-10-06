const tracks = [
    {
        title: "For sellers",
        steps: [
            { title: "Create an account", text: "Sign up with your email in under a minute." },
            { title: "List your product", text: "Add photos, a price, and a short description." },
            { title: "Chat and sell", text: "Answer buyers in real time and agree on a deal." },
        ],
    },
    {
        title: "For buyers",
        steps: [
            { title: "Find what you need", text: "Browse categories or search by keyword." },
            { title: "Message the seller", text: "Ask questions in live chat before you buy." },
            { title: "Complete the purchase", text: "Agree on payment and pickup or delivery." },
        ],
    },
]

const HowItWorks = () => {
    return (
        <section className="bg-base-200 py-16">
            <div className="mx-auto px-20 my-20">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold">How it <span className="text-primary">Works</span></h2>
                    <p className="mt-1 opacity-70">Three simple steps, whether you buy or sell</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {tracks.map((track) => (
                        <div key={track.title} className="card bg-base-100 shadow-sm">
                            <div className="card-body">
                                <h3 className="card-title text-xl text-primary">{track.title}</h3>
                                <ol className="mt-4 space-y-5">
                                    {track.steps.map((step, i) => (
                                        <li key={step.title} className="flex gap-4">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content font-bold">
                                                {i + 1}
                                            </span>
                                            <div>
                                                <p className="font-semibold">{step.title}</p>
                                                <p className="opacity-70">{step.text}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorks