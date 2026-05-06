import { pipeline, RawImage } from '@xenova/transformers'
import Post from '../models/Post.js'
import PostImage from '../models/PostImage.js'
import Match from '../models/Match.js'

// ─── Load CLIP model once ─────────────────────────────────────────────────────
let embedder = null

export const getEmbedder = async () => {
  if (!embedder) {
    console.log('Loading CLIP model...')
    embedder = await pipeline(
      'image-feature-extraction',
      'Xenova/clip-vit-base-patch32'
    )
    console.log('CLIP model ready ✅')
  }
  return embedder
}

getEmbedder().catch(console.error)

// ─── Generate embedding from image URL ───────────────────────────────────────
export const generateEmbedding = async (imageUrl) => {
  try {
    const model  = await getEmbedder()
    const image  = await RawImage.fromURL(imageUrl)
    const output = await model(image)
    // Flatten and convert to plain array
    return Array.from(output.data)
  } catch (err) {
    console.error('Embedding error:', err.message)
    return []
  }
}

// ─── Cosine similarity ────────────────────────────────────────────────────────
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA?.length || !vecB?.length || vecA.length !== vecB.length) return 0

  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < vecA.length; i++) {
    dot  += vecA[i] * vecB[i]
    magA += vecA[i] * vecA[i]
    magB += vecB[i] * vecB[i]
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB)
  return magnitude === 0 ? 0 : dot / magnitude
}

// ─── Run matching for a newly created post ────────────────────────────────────
export const runMatchingForPost = async (postId) => {
  try {
    const post = await Post.findById(postId)
    if (!post || !post.embedding?.length) return

    const oppositeType = post.type === 'lost' ? 'found' : 'lost'
    const candidates   = await Post.find({
      type:      oppositeType,
      status:    'active',
      _id:       { $ne: postId },
      embedding: { $exists: true, $not: { $size: 0 } },
    })

    const THRESHOLD = 0.72

    for (const candidate of candidates) {
      const existing = await Match.findOne({
        $or: [
          { postA: postId,        postB: candidate._id },
          { postA: candidate._id, postB: postId        },
        ]
      })
      if (existing) continue

      const score = cosineSimilarity(post.embedding, candidate.embedding)
      console.log(`Comparing posts — score: ${score.toFixed(3)}`)

      if (score >= THRESHOLD) {
        await Match.create({
          postA:           postId,
          postB:           candidate._id,
          similarityScore: score,
          triggeredBy:     'auto',
        })
        console.log(`✅ Match created — score: ${score.toFixed(3)}`)
      }
    }
  } catch (err) {
    console.error('Matching error:', err.message)
  }
}