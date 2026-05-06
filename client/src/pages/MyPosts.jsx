import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const CATEGORY_ICONS = {
  wallet: '👛', phone: '📱', keys: '🔑', documents: '📄',
  bag: '🎒', jewellery: '💍', electronics: '💻', pet: '🐾', other: '📦'
}

const STATUS_STYLES = {
  active:  'bg-teal/10 text-teal border border-teal/30',
  closed:  'bg-muted/10 text-muted border border-border',
  expired: 'bg-rose/10 text-rose border border-rose/30',
}

export default function MyPosts() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const toast     = useToast()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('all')

  useEffect(() => { fetchMyPosts() }, [])

  const fetchMyPosts = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/posts/my-posts')
      setPosts(data.posts || data)
    } catch { toast('Failed to load your posts', 'error') }
    finally { setLoading(false) }
  }

  const handleDelete = async (postId, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Delete this post?')) return
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(prev => prev.filter(p => p._id !== postId))
      toast('Post deleted', 'success')
    } catch { toast('Failed to delete', 'error') }
  }

  const handleClose = async (postId, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.patch(`/posts/${postId}/close`)
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'closed' } : p))
      toast('Marked as reunited ✓', 'success')
    } catch { toast('Failed to update', 'error') }
  }

  const filtered = tab === 'all' ? posts : posts.filter(p =>
    tab === 'active'  ? p.status === 'active' :
    tab === 'closed'  ? p.status === 'closed' :
    tab === 'lost'    ? p.type === 'lost'     : p.type === 'found'
  )

  const stats = {
    total:  posts.length,
    active: posts.filter(p => p.status === 'active').length,
    closed: posts.filter(p => p.status === 'closed').length,
    lost:   posts.filter(p => p.type === 'lost').length,
    found:  posts.filter(p => p.type === 'found').length,
  }

  return (
    <div className="page-wrapper pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title text-3xl mb-1">My Posts</h1>
            <p className="text-muted font-body text-sm">Manage your lost and found listings</p>
          </div>
          <Link to="/new-post" className="btn-primary">+ New Post</Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Posts', value: stats.total,  color: 'accent' },
            { label: 'Active',      value: stats.active, color: 'teal'   },
            { label: 'Lost Posts',  value: stats.lost,   color: 'rose'   },
            { label: 'Found Posts', value: stats.found,  color: 'soft'   },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-3xl font-display font-bold text-${s.color} mb-1`}>{s.value}</p>
              <p className="text-muted text-xs font-mono">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-panel rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'all',    label: 'All' },
            { key: 'active', label: '🟢 Active' },
            { key: 'closed', label: '✅ Closed' },
            { key: 'lost',   label: '🔴 Lost' },
            { key: 'found',  label: '🟣 Found' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-xs font-display font-medium transition-all
                ${tab === t.key ? 'bg-accent text-white shadow' : 'text-muted hover:text-soft'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-panel flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-panel rounded w-1/2" />
                  <div className="h-3 bg-panel rounded w-3/4" />
                  <div className="h-3 bg-panel rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-display font-semibold text-light text-lg mb-2">No posts yet</p>
            <p className="text-muted text-sm font-body mb-6">
              {tab === 'all' ? "You haven't posted anything yet." : `No ${tab} posts found.`}
            </p>
            <Link to="/new-post" className="btn-primary">Create your first post</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => {
              const img = post.images?.[0]?.cloudinaryUrl
              return (
                <Link key={post._id} to={`/posts/${post._id}`}
                  className="card p-4 flex gap-4 hover:border-accent/40 transition-all group block">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-panel flex-shrink-0 overflow-hidden border border-border">
                    {img
                      ? <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl opacity-40">
                          {CATEGORY_ICONS[post.category]}
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-display font-semibold text-light text-sm leading-snug line-clamp-1">
                        {post.title}
                      </h3>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${post.type === 'lost' ? 'bg-rose/10 text-rose' : 'bg-teal/10 text-teal'}`}>
                          {post.type}
                        </span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${STATUS_STYLES[post.status]}`}>
                          {post.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted text-xs font-body line-clamp-1 mb-2">{post.description}</p>

                    <div className="flex items-center gap-3 text-xs text-muted font-mono">
                      <span>📍 {post.locationName || 'No location'}</span>
                      <span>📅 {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0 justify-center" onClick={e => e.preventDefault()}>
                    {post.status === 'active' && (
                      <button onClick={(e) => handleClose(post._id, e)}
                        className="text-xs bg-teal/10 text-teal border border-teal/30 px-3 py-1.5
                          rounded-lg hover:bg-teal/20 transition-all font-display whitespace-nowrap">
                        ✓ Reunited
                      </button>
                    )}
                    <button onClick={(e) => handleDelete(post._id, e)}
                      className="text-xs bg-rose/10 text-rose border border-rose/30 px-3 py-1.5
                        rounded-lg hover:bg-rose/20 transition-all font-display">
                      🗑 Delete
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
