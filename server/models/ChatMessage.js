import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Index for fast message fetching by matchId
chatMessageSchema.index({ matchId: 1, createdAt: 1 })

export default mongoose.model('ChatMessage', chatMessageSchema)