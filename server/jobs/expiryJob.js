import cron from 'node-cron'
import Post from '../models/Post.js'

// Runs every day at midnight
const expiryJob = cron.schedule('0 0 * * *', async () => {
  try {
    const result = await Post.updateMany(
      {
        status: 'active',
        expiresAt: { $lt: new Date() },
      },
      { status: 'expired' }
    )
    console.log(`Expiry job ran — ${result.modifiedCount} post(s) expired`)
  } catch (err) {
    console.error('Expiry job error:', err.message)
  }
})

export default expiryJob