import Match from '../models/Match.js'
import PostImage from '../models/PostImage.js'

// GET /api/matches?postId=xxx
export const getMatchesForPost = async (req, res, next) => {
  try {
    const { postId } = req.query
    if (!postId) {
      return res.status(400).json({ success: false, message: 'postId is required' })
    }

    const matches = await Match.find({
      $or: [{ postA: postId }, { postB: postId }],
      status: { $ne: 'rejected' },
    })
      .populate({
        path: 'postA',
        populate: { path: 'userId', select: 'name city' },
      })
      .populate({
        path: 'postB',
        populate: { path: 'userId', select: 'name city' },
      })
      .sort({ similarityScore: -1 })

    // Attach images to each post inside match
    const matchesWithImages = await Promise.all(
      matches.map(async (match) => {
        const m = match.toObject()
        if (m.postA) {
          m.postA.images = await PostImage.find({ postId: m.postA._id }).sort('order')
        }
        if (m.postB) {
          m.postB.images = await PostImage.find({ postId: m.postB._id }).sort('order')
        }
        return m
      })
    )

    res.status(200).json({ success: true, matches: matchesWithImages })
  } catch (err) { next(err) }
}

// GET /api/matches/:id — single match for chat
export const getMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate({
        path: 'postA',
        populate: { path: 'userId', select: 'name city' },
      })
      .populate({
        path: 'postB',
        populate: { path: 'userId', select: 'name city' },
      })

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' })
    }

    const m = match.toObject()
    if (m.postA) m.postA.images = await PostImage.find({ postId: m.postA._id }).sort('order')
    if (m.postB) m.postB.images = await PostImage.find({ postId: m.postB._id }).sort('order')

    res.status(200).json({ success: true, match: m })
  } catch (err) { next(err) }
}

// PATCH /api/matches/:id/status
export const updateMatchStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' })
    }
    res.status(200).json({ success: true, match })
  } catch (err) { next(err) }
}