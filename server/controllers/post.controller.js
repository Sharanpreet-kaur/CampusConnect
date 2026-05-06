import Post from '../models/Post.js'
import PostImage from '../models/PostImage.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../services/imageService.js'
import { generateEmbedding, runMatchingForPost } from '../services/matchingService.js'

// ─── CREATE POST ─────────────────────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const {
      type, category, title, description,
      locationName, lostFoundAt, secretQuestion, secretAnswer,
    } = req.body

    if (!type || !category || !title || !description) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' })
    }

    // 1️⃣ Create the post — THIS STAYS
    const post = await Post.create({
      userId: req.user._id,
      type, category, title, description,
      locationName:   locationName   || '',
      lostFoundAt:    lostFoundAt    || null,
      secretQuestion: secretQuestion || '',
      secretAnswer:   secretAnswer   || '',
    })

    // 2️⃣ Upload images to Cloudinary — THIS STAYS
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file, index) =>
        uploadToCloudinary(file.buffer, 'lost-found/posts').then(result =>
          PostImage.create({
            postId:        post._id,
            cloudinaryUrl: result.secure_url,
            publicId:      result.public_id,
            order:         index,
          })
        )
      )
      await Promise.all(uploadPromises)
    }

    // 3️⃣ Generate CLIP embedding — THIS IS NEW, ADD AFTER IMAGES
    if (req.files && req.files.length > 0) {
      const images = await PostImage.find({ postId: post._id }).sort('order')
      if (images[0]) {
        const embedding = await generateEmbedding(images[0].cloudinaryUrl)
        if (embedding.length > 0) {
          await Post.findByIdAndUpdate(post._id, { embedding })
          // Run matching in background — don't block the response
          runMatchingForPost(post._id).catch(console.error)
        }
      }
    }

    // 4️⃣ Return post with images — THIS STAYS
    const postWithImages = await Post.findById(post._id)
      .populate('userId', 'name email city')
    const images = await PostImage.find({ postId: post._id }).sort('order')

    res.status(201).json({
      success: true,
      post: { ...postWithImages.toObject(), images },
    })
  } catch (err) { next(err) }
}

// ─── GET ALL POSTS (feed) ─────────────────────────────────────────────────────
export const getPosts = async (req, res, next) => {
  try {
    const { type, category, search, page = 1, limit = 12 } = req.query

    const query = { status: 'active' }
    if (type     && type !== 'all')     query.type     = type
    if (category && category !== 'all') query.category = category
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { locationName:{ $regex: search, $options: 'i' } },
      ]
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const posts = await Post.find(query)
      .populate('userId', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    // Attach images to each post
    const postsWithImages = await Promise.all(
      posts.map(async (post) => {
        const images = await PostImage.find({ postId: post._id }).sort('order')
        return { ...post.toObject(), images }
      })
    )

    res.status(200).json({ success: true, posts: postsWithImages })
  } catch (err) { next(err) }
}

// ─── GET SINGLE POST ──────────────────────────────────────────────────────────
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name email city phone')

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }

    const images = await PostImage.find({ postId: post._id }).sort('order')

    res.status(200).json({
      success: true,
      post: { ...post.toObject(), images },
    })
  } catch (err) { next(err) }
}

// ─── GET MY POSTS ─────────────────────────────────────────────────────────────
export const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.user._id })
      .sort({ createdAt: -1 })

    const postsWithImages = await Promise.all(
      posts.map(async (post) => {
        const images = await PostImage.find({ postId: post._id }).sort('order')
        return { ...post.toObject(), images }
      })
    )

    res.status(200).json({ success: true, posts: postsWithImages })
  } catch (err) { next(err) }
}

// ─── CLOSE POST ───────────────────────────────────────────────────────────────
export const closePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    post.status = 'closed'
    await post.save()
    res.status(200).json({ success: true, message: 'Post closed', post })
  } catch (err) { next(err) }
}

// ─── DELETE POST ──────────────────────────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    // Delete images from Cloudinary
    const images = await PostImage.find({ postId: post._id })
    await Promise.all(images.map(img => deleteFromCloudinary(img.publicId)))
    await PostImage.deleteMany({ postId: post._id })
    await post.deleteOne()

    res.status(200).json({ success: true, message: 'Post deleted' })
  } catch (err) { next(err) }
}