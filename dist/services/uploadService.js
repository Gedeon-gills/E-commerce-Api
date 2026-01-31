"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const AppError_1 = require("../utils/AppError");
require("../config/cloudinary");
const uploadToCloudinary = async (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder }, (error, result) => {
            if (error)
                return reject(new AppError_1.AppError('Cloudinary upload failed', 500));
            resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
