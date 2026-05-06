import mongoose from 'mongoose'

const postImageSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
})

export default mongoose.model('PostImage', postImageSchema)