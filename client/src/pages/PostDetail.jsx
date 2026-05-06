import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const CATEGORY_ICONS = {
  wallet: '👛', phone: '📱', keys: '🔑', documents: '📄',
  bag: '🎒', jewellery: '💍', electronics: '💻', pet: '🐾', other: '📦'
}

export default function PostDetail() {
  const { id }      = useParams()
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const toast       = useToast()

  const [post, setPost]           = useState(null)
  const [matches, setMatches]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [claiming, setClaiming]   = useState(false)
  const [claimStep, setClaimStep] = useState(0) // 0=hidden 1=secret 2=otp 3=done
  const [claimData, setClaimData] = useState({ answer: '', otp: '', claimId: '' })
  const [claimLoading, setClaimLoading] = useState(false)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const { data: postData } = await api.get(`/posts/${id}`)
      setPost(postData.post || postData)
      // fetch matches for this post
      try {
        const { data: matchData } = await api.get(`/matches?postId=${id}`)
        setMatches(matchData.matches || matchData || [])
      } catch { /* matches may not exist yet */ }
    } catch {
      toast('Post not found', 'error')
      navigate('/home')
    } finally { setLoading(false) }
  }

  const isOwner = user?._id === (post?.userId?._id || post?.userId)

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    try {
      await api.delete(`/posts/${id}`)
      toast('Post deleted', 'success')
      navigate('/my-posts')
    } catch { toast('Failed to delete post', 'error') }
    finally { setDeleting(false) }
  }

  const handleClose = async () => {
    if (!window.confirm('Mark this post as closed/reunited?')) return
    try {
      await api.patch(`/posts/${id}/close`)
      toast('Post marked as closed ✓', 'success')
      fetchPost()
    } catch { toast('Failed to close post', 'error') }
  }

  // Claim flow
  const submitClaim = async () => {
    setClaimLoading(true)
    try {
      const { data } = await api.post('/claims', {
        postId: id,
        secretAnswer: claimData.answer
      })
      setClaimData(d => ({ ...d, claimId: data.claim._id }))
      setClaimStep(2)
      toast('Answer accepted! Check your email for OTP.', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Wrong answer', 'error')
    } finally { setClaimLoading(false) }
  }

  const verifyOtp = async () => {
    setClaimLoading(true)
    try {
      await api.post(`/claims/${claimData.claimId}/verify-otp`, { otp: claimData.otp })
      setClaimStep(3)
      toast('Claim verified! 🎉 You can now chat.', 'success')
      fetchPost()
    } catch (err) {
      toast(err.response?.data?.message || 'Invalid OTP', 'error')
    } finally { setClaimLoading(false) }
  }

  if (loading) return (
    <div className="page-wrapper pt-20 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-border border-t-accent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading post...</p>
      </div>
    </div>
  )

  if (!post) return null

  const images = post.images || []
  const isLost = post.type === 'lost'

  return (
    <div className="page-wrapper pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted text-sm font-display mb-6 hover:text-soft transition-colors">
          ← Back to browse
        </button>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Left — Images */}
          <div className="space-y-3">
            <div className="card overflow-hidden aspect-video relative">
              {images.length > 0
                ? <img src={images[activeImg]?.cloudinaryUrl} alt={post.title}
                    className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-panel">
                    <span className="text-8xl opacity-30">{CATEGORY_ICONS[post.category]}</span>
                  </div>
              }
              <div className="absolute top-3 left-3">
                <span className={isLost ? 'badge-lost' : 'badge-found'}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {isLost ? 'Lost' : 'Found'}
                </span>
              </div>
              {post.status === 'closed' && (
                <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-teal font-display font-bold text-lg">Reunited!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                      ${i === activeImg ? 'border-accent' : 'border-border hover:border-soft'}`}>
                    <img src={img.cloudinaryUrl} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div className="space-y-5">
            {/* Title + category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="tag capitalize">{CATEGORY_ICONS[post.category]} {post.category}</span>
                <span className="tag font-mono">{post.status}</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-light leading-snug mb-2">
                {post.title}
              </h1>
              <p className="text-muted text-sm font-body leading-relaxed">{post.description}</p>
            </div>

            {/* Meta info */}
            <div className="card p-4 space-y-3">
              <MetaRow icon="📍" label="Location" value={post.locationName || 'Not specified'} />
              <MetaRow icon="📅" label="Date" value={post.lostFoundAt
                ? new Date(post.lostFoundAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Not specified'} />
              <MetaRow icon="👤" label="Posted by"
                value={post.userId?.name || 'Anonymous'} />
              <MetaRow icon="🕐" label="Posted"
                value={new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-2">
                {post.status === 'active' && (
                  <button onClick={handleClose}
                    className="flex-1 bg-teal/10 border border-teal/30 text-teal text-sm font-display
                      font-semibold py-2.5 rounded-xl hover:bg-teal/20 transition-all">
                    ✓ Mark Reunited
                  </button>
                )}
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 btn-danger py-2.5">
                  {deleting ? 'Deleting...' : '🗑 Delete Post'}
                </button>
              </div>
            )}

            {/* Non-owner actions */}
            {!isOwner && post.status === 'active' && (
              <div className="space-y-3">
                {claimStep === 0 && (
                  <button onClick={() => setClaimStep(1)}
                    className="btn-primary w-full py-3">
                    🙋 This is mine — Claim It
                  </button>
                )}

                {/* Claim Step 1 — secret answer */}
                {claimStep === 1 && (
                  <div className="card p-5 space-y-4 border-accent/30">
                    <div>
                      <p className="text-accent text-sm font-display font-semibold mb-1">Secret Verification</p>
                      <p className="text-soft text-xs font-body mb-3">Answer the owner's question to prove ownership.</p>
                      <p className="text-light text-sm font-display font-medium mb-2 bg-panel p-3 rounded-lg">
                        ❓ {post.secretQuestion || 'Verification question not available'}
                      </p>
                      <input className="input" placeholder="Your answer"
                        value={claimData.answer}
                        onChange={e => setClaimData(d => ({ ...d, answer: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setClaimStep(0)} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
                      <button onClick={submitClaim} disabled={!claimData.answer || claimLoading}
                        className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-40">
                        {claimLoading ? 'Verifying...' : 'Submit Answer'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Claim Step 2 — OTP */}
                {claimStep === 2 && (
                  <div className="card p-5 space-y-4 border-teal/30">
                    <div>
                      <p className="text-teal text-sm font-display font-semibold mb-1">Enter OTP</p>
                      <p className="text-soft text-xs font-body mb-3">
                        A 6-digit OTP was sent to your email. Enter it below to verify your claim.
                      </p>
                      <input className="input text-center text-2xl font-mono tracking-widest"
                        placeholder="000000" maxLength={6}
                        value={claimData.otp}
                        onChange={e => setClaimData(d => ({ ...d, otp: e.target.value.replace(/\D/g, '') }))} />
                    </div>
                    <button onClick={verifyOtp} disabled={claimData.otp.length !== 6 || claimLoading}
                      className="btn-primary w-full py-2.5 text-sm disabled:opacity-40">
                      {claimLoading ? 'Verifying...' : '✓ Verify OTP'}
                    </button>
                  </div>
                )}

                {/* Claim Step 3 — Success */}
                {claimStep === 3 && (
                  <div className="card p-5 border-teal/30 text-center">
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="text-teal font-display font-semibold mb-1">Claim Verified!</p>
                    <p className="text-muted text-xs font-body mb-4">You can now chat with the poster.</p>
                    <Link to={`/chat/${matches[0]?._id || 'new'}`}
                      className="btn-primary w-full py-2.5 text-sm block text-center">
                      💬 Open Chat
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Already closed */}
            {post.status === 'closed' && (
              <div className="card p-4 text-center border-teal/20">
                <p className="text-teal font-display font-semibold">✅ This item has been reunited!</p>
                <p className="text-muted text-xs font-body mt-1">Post is now closed.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Matches Section */}
        {matches.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <h2 className="section-title text-xl">AI Suggested Matches</h2>
              <span className="tag">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map(match => (
                <MatchCard key={match._id} match={match} currentPostId={id} user={user} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MetaRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base w-5 flex-shrink-0">{icon}</span>
      <span className="text-muted text-xs font-mono w-20 flex-shrink-0">{label}</span>
      <span className="text-soft text-sm font-body">{value}</span>
    </div>
  )
}

function MatchCard({ match, currentPostId, user }) {
  const other = match.postA?._id === currentPostId ? match.postB : match.postA
  const score = Math.round((match.similarityScore || 0) * 100)
  const img   = other?.images?.[0]?.cloudinaryUrl
  const isOwn = other?.userId?._id === user?._id || other?.userId === user?._id

  return (
    <div className="card overflow-hidden hover:border-accent/40 transition-all">
      <div className="h-32 bg-panel relative overflow-hidden">
        {img
          ? <img src={img} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📦</div>
        }
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-mono font-bold px-2 py-1 rounded-full
            ${score >= 85 ? 'bg-teal/20 text-teal border border-teal/30' :
              score >= 72 ? 'bg-accent/20 text-accent border border-accent/30' :
                            'bg-muted/20 text-muted border border-border'}`}>
            {score}% match
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-light text-sm font-display font-semibold line-clamp-1 mb-1">
          {other?.title || 'Unknown item'}
        </p>
        <p className="text-muted text-xs font-body line-clamp-2 mb-3">
          {other?.description || ''}
        </p>
        <div className="flex gap-2">
          <Link to={`/posts/${other?._id}`}
            className="flex-1 text-center text-xs font-display font-medium text-accent
              bg-accent/10 border border-accent/20 py-1.5 rounded-lg hover:bg-accent/20 transition-all">
            View Post
          </Link>
          {!isOwn && (
            <Link to={`/chat/${match._id}`}
              className="flex-1 text-center text-xs font-display font-medium text-teal
                bg-teal/10 border border-teal/20 py-1.5 rounded-lg hover:bg-teal/20 transition-all">
              💬 Chat
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
