import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { ImagePlus, X } from "lucide-react";
import { db } from "../../firebase/firebase.config";
import { AuthContext } from "../../provider/AuthContext";
import { uploadImage } from "../../utils/uploadImage";

const CONDITIONS = ["New", "Like new", "Good", "Fair", "For parts"];
const CATEGORIES = [
    "Electronics",
    "Fashion",
    "Furniture",
    "Books",
    "Vehicles",
    "Sports",
    "Home & Garden",
    "Other",
];
const MAX_IMAGES = 6;
const MAX_SIZE_MB = 5;

const withTimeout = (promise, label, ms = 15000) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error(`${label} timed out after ${ms / 1000}s`)),
                ms
            )
        ),
    ]);

const PostProduct = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [images, setImages] = useState([]); // [{ file, preview }]
    const [saving, setSaving] = useState(false);

    const handleFiles = (e) => {
        const selected = Array.from(e.target.files);
        e.target.value = "";

        const valid = [];
        for (const file of selected) {
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image.`);
                continue;
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                toast.error(`${file.name} is larger than ${MAX_SIZE_MB} MB.`);
                continue;
            }
            valid.push({ file, preview: URL.createObjectURL(file) });
        }

        const room = MAX_IMAGES - images.length;
        if (valid.length > room) {
            toast.error(`You can add up to ${MAX_IMAGES} photos.`);
            valid.slice(room).forEach((img) => URL.revokeObjectURL(img.preview));
        }
        setImages([...images, ...valid.slice(0, room)]);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(images[index].preview);
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;

        const fd = new FormData(e.target);
        const name = fd.get("name").trim();
        const price = Number(fd.get("price"));
        const condition = fd.get("condition");
        const category = fd.get("category");
        const description = fd.get("description").trim();
        const location = fd.get("location").trim();

        if (!user) return toast.error("Please login first.");
        if (name.length < 3) return toast.error("Product name is too short.");
        if (!(price > 0)) return toast.error("Enter a price greater than 0.");
        if (!condition) return toast.error("Choose the product condition.");
        if (!category) return toast.error("Choose a category.");
        if (description.length < 10) return toast.error("Add a longer description.");
        if (images.length === 0) return toast.error("Add at least one photo.");

        setSaving(true);
        try {
            console.log("1. uploading images...");
            const urls = await withTimeout(
                Promise.all(images.map((img) => uploadImage(img.file))),
                "Image upload"
            );
            console.log("2. images uploaded:", urls);

            const docRef = await withTimeout(
                addDoc(collection(db, "products"), {
                    name,
                    price,
                    condition,
                    category,
                    description,
                    location,
                    images: urls,
                    image: urls[0],
                    status: "available",
                    sellerId: user.uid,
                    sellerName: user.displayName || "Seller",
                    sellerEmail: user.email,
                    sellerPhoto: user.photoURL || "",
                    createdAt: serverTimestamp(),
                }),
                "Saving to Firestore"
            );
            console.log("3. saved with id:", docRef.id);

            toast.success("Product posted!");
            navigate("/shop");
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Toaster position="top-center" />
            <div className="mt-24 px-6 pb-16 flex justify-center">
                <div className="card bg-base-100 w-full max-w-2xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="card-body">
                        <h1 className="text-3xl font-semibold text-center mb-2">
                            Post a product to sell
                        </h1>

                        <fieldset className="fieldset">
                            <label className="label">Product name</label>
                            <input
                                name="name"
                                type="text"
                                className="input w-full"
                                placeholder="e.g. iPhone 13, 128GB"
                            />

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Price ($)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="input w-full"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="label">Condition</label>
                                    <select name="condition" defaultValue="" className="select w-full">
                                        <option value="" disabled>
                                            Select condition
                                        </option>
                                        {CONDITIONS.map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Category</label>
                                    <select name="category" defaultValue="" className="select w-full">
                                        <option value="" disabled>
                                            Select category
                                        </option>
                                        {CATEGORIES.map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Location (optional)</label>
                                    <input
                                        name="location"
                                        type="text"
                                        className="input w-full"
                                        placeholder="City or area"
                                    />
                                </div>
                            </div>

                            <label className="label">Description</label>
                            <textarea
                                name="description"
                                className="textarea w-full h-28"
                                placeholder="Describe the item, its age, any defects, why you're selling..."
                            />

                            <label className="label">Photos (up to {MAX_IMAGES})</label>
                            <div className="flex flex-wrap gap-3">
                                {images.map((img, i) => (
                                    <div key={img.preview} className="relative">
                                        <img
                                            src={img.preview}
                                            alt={`Preview ${i + 1}`}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="btn btn-circle btn-xs btn-error absolute -top-2 -right-2"
                                            aria-label="Remove photo"
                                            disabled={saving}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {images.length < MAX_IMAGES && (
                                    <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:border-primary hover:text-primary">
                                        <ImagePlus size={24} />
                                        <span className="text-xs mt-1">Add</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFiles}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            <button type="submit" className="btn btn-neutral mt-6" disabled={saving}>
                                {saving ? "Posting..." : "Post product"}
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PostProduct;