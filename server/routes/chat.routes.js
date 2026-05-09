import express from 'express'
import { getMessages, getMyChats } from '../controllers/chat.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/my-chats',          protect, getMyChats)
router.get('/:matchId/messages', protect, getMessages)

export default router