import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import postRoutes from './routes/post.routes.js'
import matchRoutes from './routes/match.routes.js'
import { getEmbedder } from './services/matchingService.js'
import claimRoutes from './routes/claim.routes.js'

const app        = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

connectDB()

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Lost & Found API is running ✅' })
})

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/claims', claimRoutes)


app.use(errorHandler)

const PORT = process.env.PORT || 5000
// Pre-warm CLIP model on startup
getEmbedder().catch(console.error)
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
)