// Uploads one image file to imgbb and returns a permanent direct URL.
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_imgbb_key}`,
        { method: "POST", body: formData }
    );
    const data = await res.json();

    if (!data.success) {
        throw new Error(data.error?.message || "Image upload failed");
    }
    return data.data.display_url;
};