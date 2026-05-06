import express from 'express'

import {
  createClaim,
  verifyClaimOtp,
} from '../controllers/claim.controller.js'

import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', protect, createClaim)

router.post('/:id/verify-otp', protect, verifyClaimOtp)

export default router