import ChatMessage from '../models/ChatMessage.js'
import Match from '../models/Match.js'
import jwt from 'jsonwebtoken'

export const initChatSocket = (io) => {

  // Auth middleware for socket
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('No token'))
      const decoded  = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId  = decoded.id
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.userId}`)

    // Join a chat room
    socket.on('join_room', async ({ matchId }) => {
      try {
        const match = await Match.findById(matchId)
        if (!match) return

        socket.join(matchId)
        console.log(`User ${socket.userId} joined room ${matchId}`)

        // Notify others in room
        socket.to(matchId).emit('user_online')
      } catch (err) {
        console.error('join_room error:', err.message)
      }
    })

    // Send a message
    socket.on('send_message', async ({ matchId, content, tempId }) => {
      try {
        if (!content?.trim()) return

        // Save to database
        const message = await ChatMessage.create({
          matchId,
          senderId: socket.userId,
          content:  content.trim(),
        })

        const populated = await message.populate('senderId', 'name')

        // Broadcast to everyone in room including sender
        io.to(matchId).emit('receive_message', {
          ...populated.toObject(),
          tempId,
        })

        console.log(`Message saved — room: ${matchId}`)
      } catch (err) {
        console.error('send_message error:', err.message)
        socket.emit('message_error', { tempId, error: err.message })
      }
    })

    // Leave room
    socket.on('leave_room', ({ matchId }) => {
      socket.leave(matchId)
      socket.to(matchId).emit('user_offline')
      console.log(`User ${socket.userId} left room ${matchId}`)
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`)
    })
  })
}