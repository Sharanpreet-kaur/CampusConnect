import { Link } from 'react-router-dom'

const CATEGORY_ICONS = {
  wallet: '👛', phone: '📱', keys: '🔑', documents: '📄',
  bag: '🎒', jewellery: '💍', electronics: '💻', pet: '🐾', other: '📦'
}

export default function PostCard({ post }) {
  const icon = CATEGORY_ICONS[post.category] || '📦'
  const isLost = post.type === 'lost'
  const img = post.images?.[0]?.cloudinaryUrl

  return (
    <Link to={`/posts/${post._id}`}
      className="card block hover:border-accent/50 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">

      {/* Image */}
      <div className="relative h-44 bg-panel overflow-hidden">
        {img
          ? <img src={img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-40">{icon}</span>
            </div>
        }
        <div className="absolute top-3 left-3">
          <span className={isLost ? 'badge-lost' : 'badge-found'}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {isLost ? 'Lost' : 'Found'}
          </span>
        </div>
        {post.status === 'closed' && (
          <div className="absolute inset-0 bg-ink/70 flex items-center justify-center">
            <span className="text-teal font-display font-bold text-sm tracking-wide">✓ Reunited</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-semibold text-light text-sm leading-snug line-clamp-2 flex-1">
            {post.title}
          </h3>
          <span className="text-xl flex-shrink-0">{icon}</span>
        </div>

        <p className="text-muted text-xs font-body line-clamp-2 mb-3 leading-relaxed">
          {post.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="tag">{post.category}</span>
          <div className="flex items-center gap-1 text-muted text-xs font-mono">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {post.locationName || 'Location not set'}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-muted text-xs font-mono">
            {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
          <span className="text-accent text-xs font-display font-medium">View details →</span>
        </div>
      </div>
    </Link>
  )
}
