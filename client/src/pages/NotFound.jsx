import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const { user } = useAuth()
  return (
    <div className="page-wrapper pt-16 flex items-center justify-center min-h-screen px-4">
      <div className="text-center animate-fade-up">
        <div className="text-8xl mb-6 animate-float">🔍</div>
        <h1 className="font-display font-extrabold text-6xl text-light mb-3">404</h1>
        <p className="font-display font-semibold text-xl text-soft mb-2">Page not found</p>
        <p className="text-muted font-body text-sm mb-8 max-w-sm mx-auto">
          Looks like this page is lost too. Let's help you find your way back.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={user ? '/home' : '/'} className="btn-primary px-8">
            {user ? 'Back to Browse' : 'Back to Home'}
          </Link>
          {!user && <Link to="/register" className="btn-ghost px-8">Sign Up Free</Link>}
        </div>
      </div>
    </div>
  )
}
