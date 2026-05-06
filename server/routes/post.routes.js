import express from 'express'
import {
  createPost, getPosts, getPost,
  getMyPosts, closePost, deletePost,
} from '../controllers/post.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import upload from '../middleware/upload.middleware.js'

const router = express.Router()

router.get('/',          protect, getPosts)
router.get('/my-posts',  protect, getMyPosts)
router.get('/:id',       protect, getPost)
router.post('/',         protect, upload.array('images', 4), createPost)
router.patch('/:id/close', protect, closePost)
router.delete('/:id',   protect, deletePost)

export default router