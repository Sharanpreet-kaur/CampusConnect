import express from 'express'
import { getMatchesForPost, getMatch, updateMatchStatus } from '../controllers/match.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/',        protect, getMatchesForPost)
router.get('/:id',     protect, getMatch)
router.patch('/:id/status', protect, updateMatchStatus)

export default router