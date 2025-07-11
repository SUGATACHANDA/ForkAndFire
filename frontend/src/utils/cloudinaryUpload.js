import axios from 'axios';

const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    try {
        const { data } = await axios.post(url, formData);
        return data.secure_url; // Return the secure URL of the uploaded image
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw error;
    }
};

export default uploadToCloudinary;