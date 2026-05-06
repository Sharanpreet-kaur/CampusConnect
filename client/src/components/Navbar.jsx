import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2"/>
              <path d="M16.5 16.5L21 21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 11h6M11 8v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-light text-lg tracking-tight">FindIt</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <NavLink to="/home"     active={isActive('/home')}>Browse</NavLink>
              <NavLink to="/my-posts" active={isActive('/my-posts')}>My Posts</NavLink>
              <NavLink to="/new-post" active={isActive('/new-post')}>+ New Post</NavLink>
              <div className="ml-4 flex items-center gap-3">
                <span className="text-soft text-sm font-body">
                  Hey, <span className="text-accent font-medium">{user.name?.split(' ')[0]}</span>
                </span>
                <button onClick={handleLogout} className="btn-ghost text-xs px-4 py-2">Logout</button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/" active={isActive('/')}>Home</NavLink>
              <div className="ml-4 flex items-center gap-2">
                <Link to="/login"    className="btn-ghost text-xs px-4 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-xs px-4 py-2">Sign Up</Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-soft p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
              : <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-panel border-t border-border px-4 py-4 flex flex-col gap-2">
          {user ? (
            <>
              <MobileLink to="/home"     onClick={() => setMenuOpen(false)}>Browse</MobileLink>
              <MobileLink to="/my-posts" onClick={() => setMenuOpen(false)}>My Posts</MobileLink>
              <MobileLink to="/new-post" onClick={() => setMenuOpen(false)}>+ New Post</MobileLink>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="text-left text-rose text-sm py-2 font-display">Logout</button>
            </>
          ) : (
            <>
              <MobileLink to="/login"    onClick={() => setMenuOpen(false)}>Login</MobileLink>
              <MobileLink to="/register" onClick={() => setMenuOpen(false)}>Sign Up</MobileLink>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} className={`px-3 py-2 rounded-lg text-sm font-display font-medium transition-colors
      ${active ? 'bg-accent/10 text-accent' : 'text-soft hover:text-light hover:bg-white/5'}`}>
      {children}
    </Link>
  )
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick}
      className="text-soft text-sm py-2 font-display hover:text-light transition-colors">
      {children}
    </Link>
  )
}
