import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/AppError';
import '../config/cloudinary';

export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(new AppError('Cloudinary upload failed', 500));
        resolve(result!.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};
