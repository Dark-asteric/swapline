import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { MessageCircle } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";
import { isUnread } from "../../utils/chatUtils";

const MessageButton = () => {
    const { user } = useContext(AuthContext);
    const uid = user?.uid;
    const [unread, setUnread] = useState({ uid: null, count: 0 });

    useEffect(() => {
        if (!uid) return;
        const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
        return onSnapshot(
            q,
            (snap) =>
                setUnread({
                    uid,
                    count: snap.docs.filter((d) => isUnread(d.data(), uid)).length,
                }),
            () => { }
        );
    }, [uid]);

    if (!user) return null;

    const count = unread.uid === uid ? unread.count : 0;

    return (
        <Link to="/chats" className="btn btn-ghost btn-circle" aria-label="Messages">
            <div className="indicator">
                <MessageCircle size={24} strokeWidth={1.75} />
                {count > 0 && (
                    <span className="badge badge-sm badge-error indicator-item">
                        {count > 9 ? "9+" : count}
                    </span>
                )}
            </div>
        </Link>
    );
};

export default MessageButton;