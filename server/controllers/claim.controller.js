import Post from '../models/Post.js'
import Claim from '../models/Claim.js'
import { sendOTPEmail } from '../services/emailService.js'
import User from '../models/User.js'

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
console.log('CLAIM REQUEST RECEIVED')
// create claim
export const createClaim = async (req, res, next) => {
  try {
    const { postId, secretAnswer } = req.body

    console.log('CLAIM REQUEST RECEIVED')
    console.log('postId:', postId)
    console.log('secretAnswer:', secretAnswer)

    if (!postId || !secretAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and answer are required',
      })
    }

    const post = await Post.findById(postId).select('+secretAnswer')
    console.log('POST FOUND:', post?.title)
    console.log('SECRET ANSWER IN DB:', post?.secretAnswer)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const userAnswer   = secretAnswer.trim().toLowerCase()
    const actualAnswer = (post.secretAnswer || '').trim().toLowerCase()

    console.log('USER ANSWER:', userAnswer)
    console.log('ACTUAL ANSWER:', actualAnswer)
    console.log('MATCH:', userAnswer === actualAnswer)

    if (userAnswer !== actualAnswer) {
      return res.status(401).json({
        success: false,
        message: 'Wrong answer',
      })
    }

    const otp = generateOTP()
    console.log('OTP GENERATED:', otp)

    const claim = await Claim.create({
      postId:     post._id,
      claimerId:  req.user._id,
      ownerId:    post.userId,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    })

    console.log('CLAIM CREATED:', claim._id)

    const claimant = await User.findById(req.user._id)
    console.log('SENDING EMAIL TO:', claimant.email)

    try {
      await sendOTPEmail(claimant.email, otp, post.title)
      console.log('EMAIL SENT ✅')
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message)
    }

    res.status(201).json({
      success: true,
      message: 'Answer correct! OTP sent to your email.',
      claim: { _id: claim._id, status: claim.status },
    })
  } catch (err) {
    console.error('createClaim error:', err.message)
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
    console.error('verifyClaimOtp error:', err.message)
    next(err)
  }
}