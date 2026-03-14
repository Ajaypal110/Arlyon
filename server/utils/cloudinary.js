import { v2 as cloudinary } from 'cloudinary';

// Configuration is automatically picked up from process.env if available
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (base64Str) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    throw new Error('Cloudinary API keys are missing in .env');
  }

  try {
    const response = await cloudinary.uploader.upload(base64Str, {
      folder: 'arlyon_avatars',
      resource_type: 'auto',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    return response;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

export const uploadMedia = async (base64Str) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    throw new Error('Cloudinary API keys are missing in .env');
  }

  try {
    const response = await cloudinary.uploader.upload(base64Str, {
      folder: 'arlyon_chat',
      resource_type: 'auto', // Important for videos
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    return response;
  } catch (error) {
    console.error('Cloudinary Media Upload Error:', error);
    throw new Error('Failed to upload media to Cloudinary');
  }
};
