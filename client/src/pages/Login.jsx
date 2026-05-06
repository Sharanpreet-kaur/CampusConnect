import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const toast     = useToast()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast('Please fill all fields', 'error')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast('Welcome back!', 'success')
      navigate('/home')
    } catch (err) {
      toast(err.response?.data?.message || 'Login failed', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md animate-fade-up">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2"/>
                <path d="M16.5 16.5L21 21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-light text-xl">FindIt</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-light mb-2">Welcome back</h1>
          <p className="text-muted font-body text-sm">Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input" placeholder="you@example.com" autoComplete="email" />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle}
                  className="input pr-11" placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-soft transition-colors">
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : 'Sign In'
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted text-sm font-body">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent hover:text-blue-400 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
