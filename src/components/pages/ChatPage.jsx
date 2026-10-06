import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Check, CheckCheck, MessageCircle, Send } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";
import { isUnread, toMs } from "../../utils/chatUtils";


const millis = (ts) => (ts?.toMillis ? ts.toMillis() : Date.now());

const formatTime = (ts) =>
    ts?.toDate
        ? ts.toDate().toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "sending...";

const Inbox = ({ user, activeId }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
        return onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                list.sort((a, b) => millis(b.lastMessageAt) - millis(a.lastMessageAt));
                setChats(list);
                setLoading(false);
            },
            (error) => {
                console.error("Inbox query failed:", error);
                toast.error("Inbox: " + error.message);
                setLoading(false);
            }
        );
    }, [user.uid]);

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <span className="loading loading-spinner"></span>
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500">
                <MessageCircle className="mx-auto mb-2" />
                <p>No conversations yet.</p>
                <Link to="/shop" className="btn btn-sm btn-neutral rounded-xl mt-3">
                    Browse products
                </Link>
            </div>
        );
    }

    return (
        <ul>
            {chats.map((c) => {
                const other = user.uid === c.sellerId ? c.buyerName : c.sellerName;
                const unread = isUnread(c, user.uid);
                return (
                    <li key={c.id}>
                        <Link
                            to={`/chats/${c.id}`}
                            className={`flex gap-3 p-3 border-b hover:bg-base-200 ${c.id === activeId ? "bg-base-200" : ""
                                }`}
                        >
                            <img
                                src={c.productImage || "/favicon.svg"}
                                alt={c.productName}
                                className="w-12 h-12 rounded-lg object-cover bg-base-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex justify-between gap-2">
                                    <p className={`truncate ${unread ? "font-bold" : "font-medium"}`}>{other}</p>
                                    <span className="text-xs text-gray-400 shrink-0">
                                        {formatTime(c.lastMessageAt)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 truncate">{c.productName}</p>
                                <div className="flex items-center justify-between gap-2">
                                    <p
                                        className={`text-sm truncate ${unread ? "font-semibold" : "text-gray-500"
                                            }`}
                                    >
                                        {c.lastSenderId === user.uid ? "You: " : ""}
                                        {c.lastMessage}
                                    </p>
                                    {unread && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

const Conversation = ({ chatId, user }) => {
    const [chat, setChat] = useState(null);
    const [status, setStatus] = useState("loading");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        const unsub = onSnapshot(
            doc(db, "chats", chatId),
            async (snap) => {
                if (snap.exists()) {
                    setChat({ id: snap.id, ...snap.data(), isDraft: false });
                    setStatus("ready");
                    return;
                }

                const [productId, buyerId] = chatId.split("_");
                if (!productId || buyerId !== user.uid) {
                    setStatus("notfound");
                    return;
                }
                try {
                    const productSnap = await getDoc(doc(db, "products", productId));
                    if (cancelled) return;
                    if (!productSnap.exists() || productSnap.data().sellerId === user.uid) {
                        setStatus("notfound");
                        return;
                    }
                    const p = productSnap.data();
                    setChat({
                        id: chatId,
                        isDraft: true,
                        productId,
                        productName: p.name,
                        productImage: p.image || "",
                        sellerId: p.sellerId,
                        sellerName: p.sellerName,
                        buyerId: user.uid,
                        buyerName: user.displayName || user.email,
                        participants: [p.sellerId, user.uid],
                    });
                    setStatus("ready");
                } catch (error) {
                    console.error("Product lookup failed:", error);
                    toast.error("Product lookup: " + error.message);
                    setStatus("notfound");
                }
            },
            (error) => {
                console.error("Open chat failed:", error);
                toast.error("Open chat: " + error.message);
                setStatus("notfound");
            }
        );
        return () => {
            cancelled = true;
            unsub();
        };
    }, [chatId, user]);
    const chatExists = status === "ready" && chat && !chat.isDraft;
    useEffect(() => {
        if (!chatExists) return;
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "asc")
        );
        return onSnapshot(
            q,
            (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (error) => {
                console.error("Messages listener failed:", error);
                toast.error("Messages: " + error.message);
            }
        );
    }, [chatExists, chatId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const lastMs = toMs(chat?.lastMessageAt);
    const lastSender = chat?.lastSenderId;
    const myReadMs = toMs(chat?.readAt?.[user.uid]);
    const markedRef = useRef(0);
    useEffect(() => {
        if (!chatExists || !lastMs || lastSender === user.uid) return;
        if (myReadMs >= lastMs || markedRef.current >= lastMs) return;
        markedRef.current = lastMs;
        updateDoc(doc(db, "chats", chatId), {
            [`readAt.${user.uid}`]: serverTimestamp(),
        }).catch((error) => console.error("Mark as read failed:", error));
    }, [chatExists, lastMs, lastSender, myReadMs, chatId, user.uid]);

    const handleSend = async (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || sending) return;

        setSending(true);
        try {
            const batch = writeBatch(db);
            const chatRef = doc(db, "chats", chatId);
            const messageRef = doc(collection(db, "chats", chatId, "messages"));
            batch.set(
                chatRef,
                {
                    productId: chat.productId,
                    productName: chat.productName,
                    productImage: chat.productImage,
                    sellerId: chat.sellerId,
                    sellerName: chat.sellerName,
                    buyerId: chat.buyerId,
                    buyerName: chat.buyerName,
                    participants: chat.participants,
                    lastMessage: text,
                    lastMessageAt: serverTimestamp(),
                    lastSenderId: user.uid,
                    readAt: { [user.uid]: serverTimestamp() },
                },
                { merge: true }
            );
            batch.set(messageRef, {
                text,
                senderId: user.uid,
                createdAt: serverTimestamp(),
            });

            await batch.commit();
            setInput("");
        } catch (error) {
            console.error("Send failed:", error);
            toast.error("Send: " + error.message);
        } finally {
            setSending(false);
        }
    };
    if (status === "loading") {
        return (
            <div className="flex-1 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (status === "notfound" || !chat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
                <p>This conversation doesn't exist or you can't open it.</p>
                <Link to="/chats" className="btn btn-sm btn-neutral rounded-xl">
                    Back to chats
                </Link>
            </div>
        );
    }
    const other = user.uid === chat.sellerId ? chat.buyerName : chat.sellerName;
    const otherId = user.uid === chat.sellerId ? chat.buyerId : chat.sellerId;
    const otherReadMs = toMs(chat.readAt?.[otherId]);
    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-3 p-3 border-b">
                <Link to="/chats" className="btn btn-ghost btn-sm btn-circle md:hidden" aria-label="Back">
                    <ArrowLeft size={18} />
                </Link>
                <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{other}</p>
                    <Link
                        to={`/product/${chat.productId}`}
                        className="text-xs text-gray-500 hover:underline truncate block"
                    >
                        {chat.productName}
                    </Link>
                </div>
                <img
                    src={chat.productImage || "/favicon.svg"}
                    alt={chat.productName}
                    className="w-10 h-10 rounded-lg object-cover bg-base-200"
                />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                {chat.isDraft && messages.length === 0 && (
                    <p className="text-center text-gray-400 mt-10">
                        Say hello to {other}. Your message starts the conversation.
                    </p>
                )}
                {messages.map((m) => {
                    const mine = m.senderId === user.uid;
                    return (
                        <div key={m.id} className={`chat ${mine ? "chat-end" : "chat-start"}`}>
                            <div className={`chat-bubble ${mine ? "chat-bubble-primary" : ""}`}>
                                {m.text}
                            </div>
                            <div className="chat-footer opacity-60 text-xs flex items-center gap-1">
                                {formatTime(m.createdAt)}
                                {mine && toMs(m.createdAt) > 0 && (
                                    otherReadMs >= toMs(m.createdAt) ? (
                                        <span className="flex items-center gap-0.5 text-primary">
                                            <CheckCheck size={14} /> Seen
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-0.5">
                                            <Check size={14} /> Sent
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex gap-2 p-3 border-t">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="input flex-1"
                    placeholder="Type a message..."
                    maxLength={1000}
                    autoFocus
                />
                <button className="btn btn-neutral" disabled={sending || !input.trim()}>
                    <Send size={18} />
                    Send
                </button>
            </form>
        </div>
    );
};
const ChatPage = () => {
    const { chatId } = useParams();
    const { user } = useContext(AuthContext);

    if (!user) return null;

    return (
        <>
            <Toaster position="top-center" />
            <div className="mt-24 px-4 pb-10 max-w-6xl mx-auto">
                <h1 className="text-3xl font-semibold mb-4">Messages</h1>
                <div className="grid md:grid-cols-3 h-[70vh] border rounded-2xl overflow-hidden bg-base-100 shadow-md">
                    <div
                        className={`${chatId ? "hidden md:block" : "block"
                            } md:col-span-1 border-r overflow-y-auto`}
                    >
                        <Inbox user={user} activeId={chatId} />
                    </div>

                    <div
                        className={`${chatId ? "flex" : "hidden md:flex"
                            } md:col-span-2 flex-col min-h-0`}
                    >
                        {chatId ? (
                            <Conversation key={chatId} chatId={chatId} user={user} />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <MessageCircle size={48} strokeWidth={1.25} />
                                <p className="mt-2">Select a conversation</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatPage;