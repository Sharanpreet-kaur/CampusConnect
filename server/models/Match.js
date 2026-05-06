import mongoose from 'mongoose'

const matchSchema = new mongoose.Schema(
  {
    postA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    postB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    similarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    triggeredBy: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
  },
  { timestamps: true }
)

export default mongoose.model('Match', matchSchema)