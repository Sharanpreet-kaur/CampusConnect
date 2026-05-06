import cloudinary from '../config/cloudinary.js'
import { Readable } from 'stream'

export const uploadToCloudinary = (buffer, folder = 'lost-found') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error('Cloudinary delete error:', err)
  }
}