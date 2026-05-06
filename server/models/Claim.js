import mongoose from 'mongoose'

const claimSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },

    claimerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },

    otp: {
      type: String,
      default: '',
      select: false,
    },

    otpExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Claim', claimSchema)