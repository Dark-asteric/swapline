import { useContext, useEffect, useState } from "react";
import {
    collection,
    doc,
    onSnapshot,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";

const LABELS = ["Home", "Work", "Other"];

const inputClass =
    "w-full bg-base-200 rounded px-4 py-3 text-base-content outline-none focus:ring-2 focus:ring-[#DB4444]/40";

const AddressForm = ({ initial, onCancel, onSave, saving }) => (
    <div className="modal modal-open">
        <div className="modal-box max-w-xl">
            <h3 className="font-semibold text-xl mb-4">
                {initial.id ? "Edit address" : "Add a new address"}
            </h3>
            <form onSubmit={onSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block mb-1 text-sm">Label</label>
                        <select name="label" defaultValue={initial.label || "Home"} className={inputClass}>
                            {LABELS.map((l) => (
                                <option key={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Full name</label>
                        <input name="fullName" defaultValue={initial.fullName || ""} className={inputClass} />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Phone</label>
                        <input name="phone" defaultValue={initial.phone || ""} className={inputClass} />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Postal code</label>
                        <input name="postalCode" defaultValue={initial.postalCode || ""} className={inputClass} />
                    </div>
                </div>
                <div>
                    <label className="block mb-1 text-sm">Street address</label>
                    <input name="street" defaultValue={initial.street || ""} className={inputClass} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block mb-1 text-sm">City</label>
                        <input name="city" defaultValue={initial.city || ""} className={inputClass} />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Country</label>
                        <input name="country" defaultValue={initial.country || ""} className={inputClass} />
                    </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="isDefault"
                        defaultChecked={!!initial.isDefault}
                        className="checkbox checkbox-primary checkbox-sm"
                    />
                    <span className="text-sm">Make this my default address</span>
                </label>

                <div className="modal-action">
                    <button type="button" onClick={onCancel} className="btn btn-outline btn-primary" disabled={saving}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save address"}
                    </button>
                </div>
            </form>
        </div>
        <div className="modal-backdrop" onClick={onCancel}></div>
    </div>
);

const AddressBook = () => {
    const { user } = useContext(AuthContext);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null | {} (new) | address
    const [saving, setSaving] = useState(false);

    const col = collection(db, "users", user.uid, "addresses");

    useEffect(() => {
        return onSnapshot(
            collection(db, "users", user.uid, "addresses"),
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                // default first, then newest
                list.sort(
                    (a, b) =>
                        Number(!!b.isDefault) - Number(!!a.isDefault) ||
                        (b.createdAt?.toMillis?.() ?? Infinity) - (a.createdAt?.toMillis?.() ?? Infinity)
                );
                setAddresses(list);
                setLoading(false);
            },
            (error) => {
                toast.error("Addresses: " + error.message);
                setLoading(false);
            }
        );
    }, [user.uid]);

    const handleSave = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = {
            label: fd.get("label"),
            fullName: fd.get("fullName").trim(),
            phone: fd.get("phone").trim(),
            street: fd.get("street").trim(),
            city: fd.get("city").trim(),
            postalCode: fd.get("postalCode").trim(),
            country: fd.get("country").trim(),
        };
        if (!data.fullName || !data.phone || !data.street || !data.city || !data.country) {
            return toast.error("Name, phone, street, city and country are required.");
        }

        const isNew = !editing.id;
        const makeDefault = fd.get("isDefault") === "on" || (isNew && addresses.length === 0);

        setSaving(true);
        try {
            const batch = writeBatch(db);
            const ref = isNew ? doc(col) : doc(col, editing.id);
            batch.set(
                ref,
                {
                    ...data,
                    isDefault: makeDefault || (!isNew && !!editing.isDefault),
                    updatedAt: serverTimestamp(),
                    ...(isNew ? { createdAt: serverTimestamp() } : {}),
                },
                { merge: true }
            );
            if (makeDefault) {
                addresses
                    .filter((a) => a.id !== ref.id && a.isDefault)
                    .forEach((a) => batch.update(doc(col, a.id), { isDefault: false }));
            }
            await batch.commit();
            toast.success("Address saved");
            setEditing(null);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const makeDefault = async (address) => {
        try {
            const batch = writeBatch(db);
            addresses.forEach((a) => batch.update(doc(col, a.id), { isDefault: a.id === address.id }));
            await batch.commit();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const remove = async (address) => {
        if (!window.confirm("Delete this address?")) return;
        try {
            const batch = writeBatch(db);
            batch.delete(doc(col, address.id));
            // If the default one is deleted, promote another so there is always one
            const next = addresses.find((a) => a.id !== address.id);
            if (address.isDefault && next) batch.update(doc(col, next.id), { isDefault: true });
            await batch.commit();
            toast.success("Address deleted");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="rounded bg-base-100 shadow-[0_1px_13px_rgba(0,0,0,0.08)] px-6 py-10 md:px-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-[#DB4444]">Address Book</h2>
                <button onClick={() => setEditing({})} className="btn btn-primary btn-sm">
                    <Plus size={16} /> Add address
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner"></span>
                </div>
            ) : addresses.length === 0 ? (
                <p className="text-gray-500 py-8 text-center">
                    You haven't saved an address yet. Add one to check out faster.
                </p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((a) => (
                        <div key={a.id} className="rounded border p-4 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{a.label}</span>
                                {a.isDefault && <span className="badge badge-primary badge-sm">Default</span>}
                            </div>
                            <p>{a.fullName}</p>
                            <p className="text-gray-500 text-sm">{a.phone}</p>
                            <p className="text-gray-500 text-sm">
                                {a.street}, {a.city} {a.postalCode}, {a.country}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-3">
                                <button onClick={() => setEditing(a)} className="btn btn-outline btn-primary btn-xs">
                                    <Pencil size={12} /> Edit
                                </button>
                                {!a.isDefault && (
                                    <button onClick={() => makeDefault(a)} className="btn btn-outline btn-primary btn-xs">
                                        Set as default
                                    </button>
                                )}
                                <button onClick={() => remove(a)} className="btn btn-outline btn-error btn-xs">
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <AddressForm
                    key={editing.id || "new"}
                    initial={editing}
                    saving={saving}
                    onSave={handleSave}
                    onCancel={() => setEditing(null)}
                />
            )}
        </div>
    );
};

export default AddressBook;