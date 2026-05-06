import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
    },
    category: {
      type: String,
      enum: ['wallet', 'phone', 'keys', 'documents', 'bag', 'jewellery', 'electronics', 'pet', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 500,
    },
    locationName: {
      type: String,
      default: '',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [],
    },
    lostFoundAt: {
      type: Date,
      default: null,
    },
    secretQuestion: {
      type: String,
      default: '',
    },
    secretAnswer: {
      type: String,
      default: '',
      select: false, // never sent to frontend
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'expired'],
      default: 'active',
    },
    embedding: {
      type: [Number], // CLIP 512d vector — added later
      default: [],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true }
)

// Index for geospatial queries later
postSchema.index({ coordinates: '2dsphere' })
postSchema.index({ status: 1, type: 1, category: 1 })

export default mongoose.model('Post', postSchema)