const dotenv = require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function handleImageUpload(file) {
  try {
    const uploadPreset = process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET;

    if (!uploadPreset) {
      throw new Error("CLOUDINARY_IMAGE_UPLOAD_PRESET is not defined.");
    }
    const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      upload_preset: uploadPreset,
    });

    return res;
  } catch (error) {
    throw new Error("Failed to upload file to Cloudinary: " + error.message);
  }
}

async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res;
}

module.exports = { handleImageUpload, handleUpload };
