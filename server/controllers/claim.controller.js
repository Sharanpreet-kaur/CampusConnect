import Post from '../models/Post.js'
import Claim from '../models/Claim.js'

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// CREATE CLAIM
export const createClaim = async (req, res, next) => {
  try {
    const { postId, secretAnswer } = req.body

    if (!postId || !secretAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and answer are required',
      })
    }

    // IMPORTANT FIX
    const post = await Post.findById(postId).select('+secretAnswer')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const userAnswer = secretAnswer.trim().toLowerCase()
    const actualAnswer = (post.secretAnswer || '').trim().toLowerCase()

    console.log('USER ANSWER:', userAnswer)
    console.log('ACTUAL ANSWER:', actualAnswer)

    if (userAnswer !== actualAnswer) {
      return res.status(401).json({
        success: false,
        message: 'Wrong answer',
      })
    }

    // Generate OTP
    const otp = generateOTP()

    const claim = await Claim.create({
      postId: post._id,
      claimerId: req.user._id,
      ownerId: post.userId,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    })

    // TEMPORARY
    console.log('OTP:', otp)

    res.status(201).json({
      success: true,
      message: 'Answer verified',
      claim,
    })
  } catch (err) {
    next(err)
  }
}

// VERIFY OTP
export const verifyClaimOtp = async (req, res, next) => {
  try {
    const { otp } = req.body

    const claim = await Claim.findById(req.params.id).select(
      '+otp +otpExpires'
    )

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      })
    }

    if (claim.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP',
      })
    }

    if (claim.otpExpires < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'OTP expired',
      })
    }

    claim.status = 'verified'
    await claim.save()

    res.status(200).json({
      success: true,
      message: 'Claim verified successfully',
    })
  } catch (err) {
    next(err)
  }
}