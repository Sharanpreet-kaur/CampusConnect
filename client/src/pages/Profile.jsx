import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import api from '../services/api'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast    = useToast()

  const [form, setForm]       = useState({ name: user?.name || '', phone: user?.phone || '', city: user?.city || '' })
  const [loading, setLoading] = useState(false)
  const [pwForm, setPwForm]   = useState({ current: '', newPw: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast('Name cannot be empty', 'error')
    setLoading(true)
    try {
      await api.patch('/auth/update-profile', form)
      toast('Profile updated!', 'success')
      // update local storage
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, ...form }))
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error')
    } finally { setLoading(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPw.length < 6) return toast('New password must be at least 6 characters', 'error')
    if (pwForm.newPw !== pwForm.confirm) return toast('Passwords do not match', 'error')
    setPwLoading(true)
    try {
      await api.patch('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw })
      toast('Password changed successfully!', 'success')
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to change password', 'error')
    } finally { setPwLoading(false) }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast('Logged out successfully', 'info')
  }

  return (
    <div className="page-wrapper pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title text-3xl mb-1">Profile</h1>
          <p className="text-muted font-body text-sm">Manage your account settings</p>
        </div>

        {/* Avatar card */}
        <div className="card p-6 flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-display font-bold text-2xl">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-display font-bold text-light text-lg">{user?.name}</p>
            <p className="text-muted text-sm font-body">{user?.email}</p>
            <p className="text-accent text-xs font-mono mt-1">Full Stack Intern · Zion Technology</p>
          </div>
        </div>

        {/* Profile form */}
        <div className="card p-6 mb-5">
          <h2 className="font-display font-semibold text-light mb-5 flex items-center gap-2">
            <span>✏️</span> Edit Profile
          </h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your full name" />
            </div>
            <div>
              <label className="label">Email <span className="text-muted">(cannot change)</span></label>
              <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Chandigarh" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                : 'Save Changes'
              }
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card p-6 mb-5">
          <h2 className="font-display font-semibold text-light mb-5 flex items-center gap-2">
            <span>🔐</span> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                placeholder="••••••••" />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" value={pwForm.newPw}
                onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Re-enter new password" />
            </div>
            <button type="submit" disabled={pwLoading || !pwForm.current || !pwForm.newPw}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              {pwLoading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Changing...</>
                : 'Change Password'
              }
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card p-6 border-rose/20">
          <h2 className="font-display font-semibold text-rose mb-4 flex items-center gap-2">
            <span>⚠️</span> Danger Zone
          </h2>
          <p className="text-muted text-sm font-body mb-4">
            Logging out will clear your session. You'll need to sign in again.
          </p>
          <button onClick={handleLogout} className="btn-danger w-full py-3">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
