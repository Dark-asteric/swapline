export const toMs = (ts) => (ts?.toMillis ? ts.toMillis() : 0);
export const isUnread = (chat, uid) => {
    if (!chat.lastMessageAt || chat.lastSenderId === uid) return false;
    const lastMs = toMs(chat.lastMessageAt);
    if (!lastMs) return false;
    return toMs(chat.readAt?.[uid]) < lastMs;
};