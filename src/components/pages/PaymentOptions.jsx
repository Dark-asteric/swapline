import { useContext, useEffect, useState } from "react";
import {
    collection,
    doc,
    onSnapshot,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";

const TYPES = ["Cash on delivery", "Bank transfer", "Mobile wallet", "Card"];

const HINTS = {
    "Cash on delivery": "Optional note, e.g. Please have change ready",
    "Bank transfer": "e.g. Bank name and the last 4 digits of the account",
    "Mobile wallet": "e.g. Wallet name and the last 4 digits of the number",
    Card: "e.g. Visa ending 4242",
};

const inputClass =
    "w-full bg-base-200 rounded px-4 py-3 text-base-content outline-none focus:ring-2 focus:ring-[#DB4444]/40";

const PaymentOptions = () => {
    const { user } = useContext(AuthContext);
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [type, setType] = useState(TYPES[0]);
    const [saving, setSaving] = useState(false);

    const col = collection(db, "users", user.uid, "payments");

    useEffect(() => {
        return onSnapshot(
            collection(db, "users", user.uid, "payments"),
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                list.sort(
                    (a, b) =>
                        Number(!!b.isDefault) - Number(!!a.isDefault) ||
                        (b.createdAt?.toMillis?.() ?? Infinity) - (a.createdAt?.toMillis?.() ?? Infinity)
                );
                setMethods(list);
                setLoading(false);
            },
            (error) => {
                toast.error("Payment options: " + error.message);
                setLoading(false);
            }
        );
    }, [user.uid]);

    const handleAdd = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const label = fd.get("label").trim();

        // Safety: this app has no payment processor, so never keep card numbers.
        if (/\d{12,}/.test(label.replace(/[\s-]/g, ""))) {
            return toast.error("Don't enter full card or account numbers. Use the last 4 digits only.");
        }
        if (type !== "Cash on delivery" && label.length < 2) {
            return toast.error("Add a short description for this payment method.");
        }

        const makeDefault = fd.get("isDefault") === "on" || methods.length === 0;

        setSaving(true);
        try {
            const batch = writeBatch(db);
            const ref = doc(col);
            batch.set(ref, {
                type,
                label,
                isDefault: makeDefault,
                createdAt: serverTimestamp(),
            });
            if (makeDefault) {
                methods
                    .filter((m) => m.isDefault)
                    .forEach((m) => batch.update(doc(col, m.id), { isDefault: false }));
            }
            await batch.commit();
            toast.success("Payment option added");
            setAdding(false);
            setType(TYPES[0]);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const makeDefault = async (method) => {
        try {
            const batch = writeBatch(db);
            methods.forEach((m) => batch.update(doc(col, m.id), { isDefault: m.id === method.id }));
            await batch.commit();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const remove = async (method) => {
        if (!window.confirm("Remove this payment option?")) return;
        try {
            const batch = writeBatch(db);
            batch.delete(doc(col, method.id));
            const next = methods.find((m) => m.id !== method.id);
            if (method.isDefault && next) batch.update(doc(col, next.id), { isDefault: true });
            await batch.commit();
            toast.success("Payment option removed");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="rounded bg-base-100 shadow-[0_1px_13px_rgba(0,0,0,0.08)] px-6 py-10 md:px-12">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-medium text-[#DB4444]">My Payment Options</h2>
                {!adding && (
                    <button onClick={() => setAdding(true)} className="btn btn-primary btn-sm">
                        <Plus size={16} /> Add option
                    </button>
                )}
            </div>
            <p className="text-sm text-gray-500 mb-6">
                These are your preferred ways to pay when you place an order. We never store full
                card numbers.
            </p>

            {adding && (
                <form onSubmit={handleAdd} className="rounded border p-4 mb-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block mb-1 text-sm">Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                                {TYPES.map((t) => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Details</label>
                            <input name="label" className={inputClass} placeholder={HINTS[type]} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isDefault" className="checkbox checkbox-primary checkbox-sm" />
                        <span className="text-sm">Make this my default</span>
                    </label>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setAdding(false)}
                            className="btn btn-outline btn-primary"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner"></span>
                </div>
            ) : methods.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">No payment options yet.</p>
            ) : (
                <div className="space-y-3">
                    {methods.map((m) => (
                        <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{m.type}</span>
                                    {m.isDefault && <span className="badge badge-primary badge-sm">Default</span>}
                                </div>
                                {m.label && <p className="text-sm text-gray-500">{m.label}</p>}
                            </div>
                            <div className="flex gap-2">
                                {!m.isDefault && (
                                    <button onClick={() => makeDefault(m)} className="btn btn-outline btn-primary btn-xs">
                                        Set as default
                                    </button>
                                )}
                                <button onClick={() => remove(m)} className="btn btn-outline btn-error btn-xs">
                                    <Trash2 size={12} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentOptions;