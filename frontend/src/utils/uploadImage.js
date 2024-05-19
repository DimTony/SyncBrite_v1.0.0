import axios from "axios";

export const handleBase64Upload = async (base64Data) => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        file: base64Data,
        upload_preset: uploadPreset,
      }
    );

    return response.data.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};
