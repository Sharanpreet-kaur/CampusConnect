import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Register() {
  const { register } = useAuth()
  const navigate      = useNavigate()
  const toast         = useToast()
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast('Please fill all fields', 'error')
    if (form.password.length < 6) return toast('Password must be at least 6 characters', 'error')
    if (form.password !== form.confirm) return toast('Passwords do not match', 'error')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast('Account created! Welcome to FindIt 🎉', 'success')
      navigate('/home')
    } catch (err) {
      toast(err.response?.data?.message || 'Registration failed', 'error')
    } finally { setLoading(false) }
  }

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthColor = ['', 'bg-rose', 'bg-yellow-400', 'bg-teal'][strength]
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong'][strength]

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 pt-16 pb-10">
      <div className="w-full max-w-md animate-fade-up">

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
          <h1 className="text-3xl font-display font-bold text-light mb-2">Create account</h1>
          <p className="text-muted font-body text-sm">Start finding lost items today</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input name="name" type="text" value={form.name} onChange={handle}
                className="input" placeholder="Enter Your Name" autoComplete="name" />
            </div>

            <div>
              <label className="label">Email address</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input" placeholder="you@example.com" autoComplete="email" />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle}
                  className="input pr-11" placeholder="Min 6 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-soft transition-colors">
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                    <div className={`h-full ${strengthColor} transition-all duration-300`}
                      style={{ width: `${(strength / 3) * 100}%` }} />
                  </div>
                  <span className="text-xs font-mono text-muted">{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handle}
                className={`input ${form.confirm && form.confirm !== form.password ? 'border-rose/50' : ''}`}
                placeholder="Re-enter password" autoComplete="new-password" />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-rose text-xs mt-1 font-mono">Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                : 'Create Account'
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted text-sm font-body">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:text-blue-400 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
