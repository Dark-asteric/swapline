import { useContext, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";

const CONTACT = {
    email: "support@swapline.example",
    phone: "+00 000 000 000",
    address: "Your street, Your city, Your country",
    hours: "Mon to Fri, 9:00 to 18:00",
};

const SUBJECTS = [
    "General question",
    "Problem with a post",
    "Problem with an order",
    "Report a user",
    "Feedback or suggestion",
    "Other",
];

const FAQS = [
    {
        q: "How do I sell something?",
        a: "Log in, press Create post, add photos, a price and a short description, and publish. Your item appears in the shop straight away.",
    },
    {
        q: "How do offers and messages work?",
        a: "Open any product to make an offer or send the seller a message. You can follow every conversation under Messages in the menu.",
    },
    {
        q: "Can I cancel an order?",
        a: "Yes. Go to My Profile, then My Orders. While an order is still marked Placed you can cancel it, and it moves to My Cancellations.",
    },
    {
        q: "Is my information private?",
        a: "Your cart, addresses, payment options, wishlist and chats are visible only to you and the people in the conversation.",
    },
];

const inputClass =
    "w-full bg-base-200 rounded px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40";

const INFO = [
    { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: Phone, label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: "Address", value: CONTACT.address },
    { icon: Clock, label: "Support hours", value: CONTACT.hours },
];

const ContactUs = () => {
    const { user } = useContext(AuthContext);
    const [sending, setSending] = useState(false);
    const [formKey, setFormKey] = useState(0); // changing it clears the form

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (sending) return;

        const fd = new FormData(e.target);
        if (fd.get("website")) return; // hidden spam trap: real people leave it empty

        const name = fd.get("name").trim();
        const email = fd.get("email").trim();
        const subject = fd.get("subject");
        const message = fd.get("message").trim();

        if (name.length < 2) return toast.error("Please enter your name.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return toast.error("Please enter a valid email address.");
        }
        if (message.length < 10) return toast.error("Please write a longer message.");
        if (message.length > 2000) return toast.error("Message is too long (2000 characters max).");

        setSending(true);
        try {
            await addDoc(collection(db, "contactMessages"), {
                name,
                email,
                subject,
                message,
                userId: user?.uid ?? null,
                createdAt: serverTimestamp(),
            });
            toast.success("Message sent. We'll get back to you by email.");
            setFormKey((k) => k + 1);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Toaster position="top-center" />
            <div className="mt-20">
                {/* Hero */}
                <section className="px-6 py-16 bg-base-200 text-center">
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
                        <p className="mt-4 text-lg text-gray-500">
                            Questions, problems or ideas? Send us a message and we'll reply as
                            soon as we can.
                        </p>
                    </div>
                </section>

                {/* Info + form */}
                <section className="px-6 py-16">
                    <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-5">
                        <div className="lg:col-span-2 space-y-4">
                            {INFO.map(({ icon: Icon, label, value, href }) => (
                                <div key={label} className="flex gap-4 card bg-base-100 shadow-md p-5 flex-row">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Icon size={22} className="text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold">{label}</p>
                                        {href ? (
                                            <a href={href} className="text-gray-500 hover:text-primary break-words">
                                                {value}
                                            </a>
                                        ) : (
                                            <p className="text-gray-500">{value}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form
                            key={formKey}
                            onSubmit={handleSubmit}
                            className="lg:col-span-3 card bg-base-100 shadow-md p-6 md:p-8 space-y-4"
                        >
                            <h2 className="text-2xl font-semibold">Send us a message</h2>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block mb-1 text-sm">Your name</label>
                                    <input
                                        name="name"
                                        defaultValue={user?.displayName || ""}
                                        className={inputClass}
                                        placeholder="Name"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        defaultValue={user?.email || ""}
                                        className={inputClass}
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Subject</label>
                                <select name="subject" defaultValue={SUBJECTS[0]} className={inputClass}>
                                    {SUBJECTS.map((s) => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Message</label>
                                <textarea
                                    name="message"
                                    className={`${inputClass} h-36`}
                                    placeholder="How can we help?"
                                    maxLength={2000}
                                />
                            </div>

                            {/* Spam trap: hidden from people, bots tend to fill it */}
                            <input
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                                className="hidden"
                                aria-hidden="true"
                            />

                            <button type="submit" className="btn btn-primary" disabled={sending}>
                                <Send size={18} />
                                {sending ? "Sending..." : "Send message"}
                            </button>
                        </form>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-6 pb-20">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-semibold text-center mb-8">
                            Frequently asked questions
                        </h2>
                        <div className="space-y-3">
                            {FAQS.map(({ q, a }, i) => (
                                <div
                                    key={q}
                                    className="collapse collapse-arrow bg-base-100 border border-base-300"
                                >
                                    <input type="radio" name="faq" defaultChecked={i === 0} />
                                    <div className="collapse-title font-medium">{q}</div>
                                    <div className="collapse-content text-gray-500">
                                        <p>{a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default ContactUs;