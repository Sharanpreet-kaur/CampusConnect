import ChatMessage from '../models/ChatMessage.js'
import Match from '../models/Match.js'

// GET /api/chats/:matchId/messages
export const getMessages = async (req, res, next) => {
  try {
    const { matchId } = req.params

    // Verify match exists
    const match = await Match.findById(matchId)
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      })
    }

    const messages = await ChatMessage.find({ matchId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 })

    res.status(200).json({
      success: true,
      messages,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/chats/my-chats
export const getMyChats = async (req, res, next) => {
  try {
    const Post   = (await import('../models/Post.js')).default
    const PostImage = (await import('../models/PostImage.js')).default

    // Find all matches where user's posts are involved
    const userPosts = await Post.find({ userId: req.user._id }).select('_id')
    const postIds   = userPosts.map(p => p._id)

    const matches = await Match.find({
      $or: [
        { postA: { $in: postIds } },
        { postB: { $in: postIds } },
      ],
      status: { $ne: 'rejected' },
    })
      .populate({
        path: 'postA',
        populate: { path: 'userId', select: 'name' },
      })
      .populate({
        path: 'postB',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ updatedAt: -1 })

    // Get last message for each match
    const chatsWithLastMessage = await Promise.all(
      matches.map(async (match) => {
        const m = match.toObject()

        // Attach images
        if (m.postA) {
          m.postA.images = await PostImage.find({ postId: m.postA._id })
            .sort('order').limit(1)
        }
        if (m.postB) {
          m.postB.images = await PostImage.find({ postId: m.postB._id })
            .sort('order').limit(1)
        }

        // Last message
        const lastMessage = await ChatMessage.findOne({ matchId: match._id })
          .sort({ createdAt: -1 })
        m.lastMessage = lastMessage

        return m
      })
    )

    res.status(200).json({
      success: true,
      chats: chatsWithLastMessage,
    })
  } catch (err) {
    next(err)
  }
}