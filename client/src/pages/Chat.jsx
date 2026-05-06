import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Chat() {
  const { matchId }  = useParams()
  const { user }     = useAuth()
  const socket       = useSocket()
  const navigate     = useNavigate()
  const toast        = useToast()
  const bottomRef    = useRef()
  const inputRef     = useRef()

  const [match, setMatch]       = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const [online, setOnline]     = useState(false)

  useEffect(() => {
    fetchChat()
  }, [matchId])

  useEffect(() => {
    if (!socket || !matchId) return

    socket.emit('join_room', { matchId })
    setOnline(true)

    socket.on('receive_message', (msg) => {
      setMessages(prev => {
        const exists = prev.some(m => m._id === msg._id || m.tempId === msg.tempId)
        if (exists) return prev.map(m => m.tempId === msg.tempId ? msg : m)
        return [...prev, msg]
      })
    })

    socket.on('user_online',  () => setOnline(true))
    socket.on('user_offline', () => setOnline(false))

    return () => {
      socket.emit('leave_room', { matchId })
      socket.off('receive_message')
      socket.off('user_online')
      socket.off('user_offline')
    }
  }, [socket, matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchChat = async () => {
    try {
      setLoading(true)
      const [matchRes, msgRes] = await Promise.all([
        api.get(`/matches/${matchId}`),
        api.get(`/chats/${matchId}/messages`),
      ])
      setMatch(matchRes.data.match || matchRes.data)
      setMessages(msgRes.data.messages || msgRes.data || [])
    } catch {
      toast('Chat not found', 'error')
      navigate('/home')
    } finally { setLoading(false) }
  }

  const sendMessage = async () => {
    if (!text.trim() || sending) return
    const content = text.trim()
    setText('')
    setSending(true)

    const tempId = `temp_${Date.now()}`
    const optimistic = {
      tempId, content,
      senderId: { _id: user._id, name: user.name },
      sentAt: new Date().toISOString(),
      isTemp: true,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      socket?.emit('send_message', { matchId, content, tempId })
    } catch {
      setMessages(prev => prev.filter(m => m.tempId !== tempId))
      toast('Failed to send message', 'error')
    } finally { setSending(false) }

    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const isMe = (msg) => {
    const sid = msg.senderId?._id || msg.senderId
    return sid === user?._id
  }

  // Get other post info for display
  const myPost    = match?.postA?.userId?._id === user?._id ? match?.postA : match?.postB
  const otherPost = match?.postA?.userId?._id === user?._id ? match?.postB : match?.postA

  if (loading) return (
    <div className="page-wrapper pt-16 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-border border-t-accent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading chat...</p>
      </div>
    </div>
  )

  return (
    <div className="page-wrapper pt-16 flex flex-col h-screen">

      {/* Chat header */}
      <div className="glass border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="text-muted hover:text-soft transition-colors mr-1">
          ←
        </button>

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            <span className="text-accent font-display font-bold text-sm">?</span>
          </div>
          {online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal rounded-full border-2 border-ink" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-light text-sm">Anonymous User</p>
          <p className="text-muted text-xs font-mono">
            {online ? '🟢 Online' : '⚫ Offline'} · Match #{matchId?.slice(-6)}
          </p>
        </div>

        {/* Match score badge */}
        {match?.similarityScore && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl px-3 py-1.5 text-center flex-shrink-0">
            <p className="text-accent text-xs font-mono font-bold">
              {Math.round(match.similarityScore * 100)}%
            </p>
            <p className="text-muted text-xs font-mono">AI match</p>
          </div>
        )}
      </div>

      {/* Matched posts banner */}
      {match && (
        <div className="bg-panel/50 border-b border-border px-4 py-2 flex gap-3 flex-shrink-0">
          <MatchedPostPill post={myPost}    label="Your post" color="accent" />
          <div className="flex items-center text-muted text-xs font-mono">↔</div>
          <MatchedPostPill post={otherPost} label="Their post" color="teal" />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">

        {/* System message */}
        <div className="text-center">
          <span className="text-muted text-xs font-mono bg-panel border border-border px-3 py-1.5 rounded-full">
            🔒 Anonymous relay chat · Your contact info is protected
          </span>
        </div>

        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-muted text-sm font-body">No messages yet</p>
            <p className="text-muted text-xs font-mono mt-1">Start the conversation!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const mine = isMe(msg)
          const showTime = i === 0 ||
            new Date(msg.sentAt) - new Date(messages[i-1]?.sentAt) > 5 * 60 * 1000

          return (
            <div key={msg._id || msg.tempId || i}>
              {showTime && (
                <div className="text-center my-2">
                  <span className="text-muted text-xs font-mono">
                    {new Date(msg.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
                  {!mine && (
                    <p className="text-muted text-xs font-mono mb-1 ml-1">Anonymous</p>
                  )}
                  <div className={`px-4 py-3 rounded-2xl text-sm font-body leading-relaxed
                    ${mine
                      ? 'bg-accent text-white rounded-tr-sm'
                      : 'bg-card border border-border text-light rounded-tl-sm'
                    }
                    ${msg.isTemp ? 'opacity-70' : ''}`}>
                    {msg.content}
                  </div>
                  {mine && (
                    <p className="text-muted text-xs font-mono mt-1 text-right mr-1">
                      {msg.isTemp ? '⏳' : '✓'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="glass border-t border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              className="input resize-none py-3 pr-4 max-h-32 overflow-y-auto"
              style={{ minHeight: '48px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center
              hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
            {sending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
            }
          </button>
        </div>
        <p className="text-muted text-xs font-mono text-center mt-2">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  )
}

function MatchedPostPill({ post, label, color }) {
  if (!post) return null
  const img = post.images?.[0]?.cloudinaryUrl
  return (
    <Link to={`/posts/${post._id}`}
      className={`flex items-center gap-2 bg-${color}/5 border border-${color}/20
        rounded-lg px-2 py-1 hover:bg-${color}/10 transition-all min-w-0 flex-1`}>
      {img && (
        <img src={img} className="w-7 h-7 rounded-md object-cover flex-shrink-0 border border-border" />
      )}
      <div className="min-w-0">
        <p className="text-muted text-xs font-mono">{label}</p>
        <p className={`text-${color} text-xs font-display font-medium truncate`}>
          {post.title || 'View post'}
        </p>
      </div>
    </Link>
  )
}
