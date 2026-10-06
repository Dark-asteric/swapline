import { useContext, useEffect, useRef, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
    EmailAuthProvider,
    getAuth,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";
import toast from "react-hot-toast";
import app, { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";
import { uploadImage } from "../../utils/UploadImage";

const auth = getAuth(app);

const RED = "#DB4444";
const MAX_SIZE_MB = 5;

const inputClass =
    "w-full bg-base-200 rounded px-4 py-3 text-base-content placeholder:text-gray-400 outline-none " +
    "focus:ring-2 focus:ring-[#DB4444]/40 disabled:text-gray-400 disabled:cursor-not-allowed";
const labelClass = "block mb-2 text-base text-base-content";

const EMPTY_PASSWORDS = { current: "", next: "", confirm: "" };

const splitName = (full = "") => {
    const [first = "", ...rest] = full.trim().split(/\s+/);
    return { first, last: rest.join(" ") };
};

const validatePassword = (password) => {
    const problems = [];
    if (password.length < 6) problems.push("6+ characters");
    if (!/[A-Z]/.test(password)) problems.push("an uppercase letter");
    if (!/[a-z]/.test(password)) problems.push("a lowercase letter");
    return problems;
};

const friendlyError = (error) => {
    switch (error.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Your current password is incorrect.";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";
        case "auth/requires-recent-login":
            return "Please log out and log in again, then retry.";
        default:
            return error.message;
    }
};

const Profile = () => {
    const { user, setUser, updateUser } = useContext(AuthContext);

    const [form, setForm] = useState(() => ({ ...splitName(user?.displayName), address: "" }));
    const [initial, setInitial] = useState(form);
    const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Only email/password accounts have a password to change (not Google)
    const canChangePassword = !!auth.currentUser?.providerData.some(
        (p) => p.providerId === "password"
    );

    // Load the saved address
    useEffect(() => {
        if (!user?.uid) return;
        getDoc(doc(db, "users", user.uid))
            .then((snap) => {
                const address = snap.exists() ? snap.data().address || "" : "";
                setForm((f) => ({ ...f, address }));
                setInitial((i) => ({ ...i, address }));
            })
            .catch((error) => console.error("Could not load address:", error));
    }, [user?.uid]);

    const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });
    const setPassword = (name) => (e) => setPasswords({ ...passwords, [name]: e.target.value });

    const clearPicture = () => {
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview("");
    };

    const handleFile = (e) => {
        const selected = e.target.files[0];
        e.target.value = "";
        if (!selected) return;
        if (!selected.type.startsWith("image/")) return toast.error("Please choose an image file.");
        if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
            return toast.error(`Image must be smaller than ${MAX_SIZE_MB} MB.`);
        }
        clearPicture();
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    const handleCancel = () => {
        setForm(initial);
        setPasswords(EMPTY_PASSWORDS);
        clearPicture();
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (saving) return;

        const first = form.first.trim();
        const last = form.last.trim();
        const address = form.address.trim();

        if (!first) return toast.error("First name is required.");

        const wantsPassword =
            canChangePassword && (passwords.current || passwords.next || passwords.confirm);
        if (wantsPassword) {
            if (!passwords.current) return toast.error("Enter your current password.");
            const problems = validatePassword(passwords.next);
            if (problems.length) {
                return toast.error(`New password needs ${problems.join(", ")}.`);
            }
            if (passwords.next !== passwords.confirm) {
                return toast.error("New passwords don't match.");
            }
        }

        setSaving(true);
        try {
            // Password first: if it fails, nothing else is changed.
            if (wantsPassword) {
                const authUser = auth.currentUser;
                await reauthenticateWithCredential(
                    authUser,
                    EmailAuthProvider.credential(authUser.email, passwords.current)
                );
                await updatePassword(authUser, passwords.next);
            }

            let photoURL = user.photoURL || "";
            if (file) photoURL = await uploadImage(file);

            const displayName = [first, last].filter(Boolean).join(" ");
            await updateUser({ displayName, photoURL });
            await setDoc(
                doc(db, "users", user.uid),
                { address, updatedAt: serverTimestamp() },
                { merge: true }
            );

            setUser({ ...user, displayName, photoURL });
            const saved = { first, last, address };
            setForm(saved);
            setInitial(saved);
            setPasswords(EMPTY_PASSWORDS);
            clearPicture();
            toast.success("Profile updated");
        } catch (error) {
            toast.error(friendlyError(error));
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <form
                onSubmit={handleSave}
                className="rounded bg-base-100 shadow-[0_1px_13px_rgba(0,0,0,0.08)] px-6 py-10 md:px-16 md:py-12"
            >
                <h2 className="text-xl font-medium mb-6" style={{ color: RED }}>
                    Edit Your Profile
                </h2>

                {/* Profile picture */}
                <div className="flex items-center gap-4 mb-8">
                    <img
                        src={preview || user.photoURL || "/favicon.svg"}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full object-cover bg-base-200"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/favicon.svg";
                        }}
                    />
                    <div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            disabled={saving}
                            className="btn btn-outline btn-primary btn-sm"
                        >
                            {file ? "Choose a different picture" : "Change profile picture"}
                        </button>
                        {file && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-56">
                                {file.name}. Saved when you press Save Changes.
                            </p>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFile}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>First Name</label>
                        <input
                            value={form.first}
                            onChange={setField("first")}
                            className={inputClass}
                            placeholder="First name"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Last Name</label>
                        <input
                            value={form.last}
                            onChange={setField("last")}
                            className={inputClass}
                            placeholder="Last name"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            value={user.email || ""}
                            className={inputClass}
                            disabled
                            readOnly
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Address</label>
                        <input
                            value={form.address}
                            onChange={setField("address")}
                            className={inputClass}
                            placeholder="City, postcode, country"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="mt-8">
                    <label className={labelClass}>Password Changes</label>
                    {canChangePassword ? (
                        <div className="space-y-4">
                            <input
                                type="password"
                                value={passwords.current}
                                onChange={setPassword("current")}
                                className={inputClass}
                                placeholder="Current Password"
                                autoComplete="current-password"
                            />
                            <input
                                type="password"
                                value={passwords.next}
                                onChange={setPassword("next")}
                                className={inputClass}
                                placeholder="New Password"
                                autoComplete="new-password"
                            />
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={setPassword("confirm")}
                                className={inputClass}
                                placeholder="Confirm New Password"
                                autoComplete="new-password"
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 bg-base-200 rounded px-4 py-3">
                            You signed in with Google, so there is no password to change here.
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-8 mt-10">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="btn btn-outline btn-primary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary px-12"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </>
    );
};

export default Profile;