const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resumeStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: "resumes",
            allowed_formats: ["pdf"],
            resource_type: "raw",
        };
    },
});

const certificationStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: "certifications",
            allowed_formats: ["pdf", "png", "jpeg", "webp"],
            resource_type: "auto",
        };
    },
});

const removeResume = async (publicId) => {
    return await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
    });
};

const uploadResume = multer({ storage: resumeStorage });
const uploadCertification = multer({ storage: certificationStorage });

module.exports = {
    uploadResume,
    cloudinary,
    removeResume,
    uploadCertification,
};
