import { useState, useEffect } from 'react'
import api from '../services/api'
import PostCard from '../components/PostCard'
import { useToast } from '../components/Toast'

const CATEGORIES = ['all', 'wallet', 'phone', 'keys', 'documents', 'bag', 'jewellery', 'electronics', 'pet', 'other']

export default function Home() {
  const toast = useToast()
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState({ type: 'all', category: 'all', search: '' })
  const [page, setPage]           = useState(1)
  const [hasMore, setHasMore]     = useState(true)

  const fetchPosts = async (reset = false) => {
    try {
      setLoading(true)
      const params = {
        page: reset ? 1 : page,
        limit: 12,
        ...(filter.type !== 'all'     && { type: filter.type }),
        ...(filter.category !== 'all' && { category: filter.category }),
        ...(filter.search             && { search: filter.search }),
      }
      const { data } = await api.get('/posts', { params })
      const newPosts = data.posts || data
      if (reset) {
        setPosts(newPosts)
        setPage(2)
      } else {
        setPosts(prev => [...prev, ...newPosts])
        setPage(p => p + 1)
      }
      setHasMore(newPosts.length === 12)
    } catch { toast('Failed to load posts', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPosts(true) }, [filter])

  const setF = (key, val) => setFilter(f => ({ ...f, [key]: val }))

  return (
    <div className="page-wrapper pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title text-3xl mb-1">Browse Items</h1>
          <p className="text-muted font-body text-sm">Find lost items or see if someone found yours</p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-8 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>
            </svg>
            <input type="text" placeholder="Search items..." value={filter.search}
              onChange={e => setF('search', e.target.value)}
              className="input pl-9 py-2.5" />
          </div>

          {/* Type filter */}
          <div className="flex gap-1 bg-panel rounded-xl p-1">
            {['all', 'lost', 'found'].map(t => (
              <button key={t} onClick={() => setF('type', t)}
                className={`px-4 py-2 rounded-lg text-xs font-display font-medium capitalize transition-all
                  ${filter.type === t ? 'bg-accent text-white shadow' : 'text-muted hover:text-soft'}`}>
                {t === 'all' ? 'All' : t === 'lost' ? '🔴 Lost' : '🟢 Found'}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setF('category', c)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono capitalize transition-all
                ${filter.category === c
                  ? 'bg-accent text-white'
                  : 'bg-card border border-border text-muted hover:border-accent/50 hover:text-soft'}`}>
              {c === 'all' ? 'All Categories' : c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading && posts.length === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-44 bg-panel" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-panel rounded w-3/4" />
                  <div className="h-3 bg-panel rounded w-full" />
                  <div className="h-3 bg-panel rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <p className="font-display font-semibold text-light text-lg mb-2">No items found</p>
            <p className="text-muted text-sm font-body">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {posts.map(p => <PostCard key={p._id} post={p} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-10">
                <button onClick={() => fetchPosts(false)} disabled={loading}
                  className="btn-ghost px-8">
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
