import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Local path to the image file
 * @param {string} folder - Cloudinary folder name (optional)
 * @returns {Promise<object>} - Cloudinary upload result with secure_url and public_id
 */
export const uploadToCloudinary = async (filePath, folder = 'prescripto') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to cloud storage');
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from cloud storage');
    }
};

/**
 * Get optimized URL for an image
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedUrl = (publicId, options = {}) => {
    const defaultOptions = {
        quality: 'auto',
        fetch_format: 'auto'
    };

    return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

export default cloudinary;
