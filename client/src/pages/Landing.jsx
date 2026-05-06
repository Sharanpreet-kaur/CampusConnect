import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: '🔍', title: 'AI Image Matching', desc: 'CLIP model automatically matches lost and found items by visual similarity — no manual search needed.' },
  { icon: '🔒', title: 'Anonymous Relay Chat', desc: 'Contact finders without sharing your phone number. Privacy protected until claim is verified.' },
  { icon: '✅', title: 'Claim Verification', desc: 'Two-step verification with secret question + OTP email ensures only the real owner can claim.' },
  { icon: '📍', title: 'Location Aware', desc: 'Matches are filtered by city so you see only relevant items near where you lost something.' },
  { icon: '⏱', title: 'Real-Time Chat', desc: 'Socket.io powered live chat lets you connect instantly when a match is found.' },
  { icon: '🗂', title: 'Auto Expiry', desc: 'Posts auto-archive after 30 days keeping the platform clean and relevant.' },
]

const STATS = [
  { value: '2 sec', label: 'Average match time' },
  { value: '512D', label: 'CLIP embedding size' },
  { value: '0.72', label: 'Match threshold score' },
  { value: '100%', label: 'Privacy protected' },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="page-wrapper">
      {/* Hero */}
<section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

  {/* Background glow orbs */}
  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal/5 rounded-full blur-3xl pointer-events-none" />

  {/* Grid pattern */}
  <div className="absolute inset-0 opacity-[0.03]"
    style={{ backgroundImage: 'linear-gradient(#4F8EF7 1px,transparent 1px),linear-gradient(90deg,#4F8EF7 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

  <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">

    {/* Badge */}
    <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
      <span className="w-2 h-2 bg-teal rounded-full animate-pulse-slow" />
      <span className="text-accent text-xs font-mono font-medium tracking-wider">
        AI-POWERED REUNIFICATION
      </span>
    </div>

    {/* ✅ FIXED HEADING (reduced) */}
    <h1 className="text-[30px] sm:text-[48px] md:text-[64px] font-display font-extrabold text-light leading-tight mb-8 animate-fade-up">
      Lost something?<br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-teal">
        We'll find it.
      </span>
    </h1>

    {/* ✅ KEEP ONLY ONE SUBTEXT */}
    <p
      className="text-soft text-base sm:text-lg font-body max-w-xl mx-auto mb-12 leading-relaxed animate-fade-up"
      style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
    >
      FindIt uses CLIP AI to automatically match lost items with found posts.
      Post your item, our AI does the rest — privately and securely.
    </p>

    {/* Buttons */}
   {/* Buttons */}
<div
  className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-fade-up"
  style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
>
  {user ? (
    <>
      <Link to="/home" className="btn-primary px-8 py-3 text-sm">
        Browse Items
      </Link>

      <Link to="/new-post" className="btn-ghost px-8 py-3 text-sm">
        Post an Item
      </Link>
    </>
  ) : (
    <>
      <Link to="/register" className="btn-primary px-8 py-3 text-sm">
        Get Started Free
      </Link>

      <Link to="/login" className="btn-ghost px-8 py-3 text-sm">
        Sign In
      </Link>
    </>
  )}
</div>
    {/* ✅ REFINED STAT PILLS */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
      {STATS.map((s, i) => (
        <div
          key={i}
          className="glass rounded-lg px-4 py-3 flex flex-col items-center opacity-80 hover:opacity-100 transition"
        >
          <span className="font-display font-semibold text-accent text-base">{s.value}</span>
          <span className="text-muted text-[11px] font-mono mt-0.5">{s.label}</span>
        </div>
      ))}
    </div>

  </div>
</section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-accent text-xs font-mono tracking-widest mb-3">HOW IT WORKS</p>
            <h2 className="section-title text-4xl">Three steps to reunite</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Post your item', desc: 'Upload photos and describe what you lost or found. Our AI generates a visual fingerprint instantly.', color: 'accent' },
              { step: '02', title: 'AI finds a match', desc: 'CLIP compares your item\'s embedding against all posts. Matches above 72% similarity are surfaced automatically.', color: 'teal' },
              { step: '03', title: 'Verify & reunite', desc: 'Chat anonymously, answer the secret question, verify with OTP, and get your item back.', color: 'rose' },
            ].map((step) => (
              <div key={step.step} className="card p-7 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${step.color}/5 rounded-full -translate-y-1/2 translate-x-1/2`} />
                <span className={`font-mono text-5xl font-bold text-${step.color}/20 block mb-4`}>{step.step}</span>
                <h3 className="font-display font-semibold text-light text-lg mb-2">{step.title}</h3>
                <p className="text-muted text-sm font-body leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-panel/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-accent text-xs font-mono tracking-widest mb-3">FEATURES</p>
            <h2 className="section-title text-4xl">Built different</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 hover:border-accent/40 transition-colors duration-200">
                <span className="text-3xl block mb-3">{f.icon}</span>
                <h3 className="font-display font-semibold text-light text-sm mb-2">{f.title}</h3>
                <p className="text-muted text-xs font-body leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-teal/5" />
            <div className="relative">
              <h2 className="section-title text-3xl mb-4">Ready to find it?</h2>
              <p className="text-muted font-body mb-8">Join FindIt and let AI do the heavy lifting.</p>
              {user
                ? <Link to="/new-post" className="btn-primary inline-flex items-center justify-center px-8 py-3 text-base">Post an Item</Link>
                : <Link to="/register" className="btn-primary inline-flex items-center justify-center px-8 py-3 text-base">Create Free Account</Link>
              }
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 pt-16 pb-10">

  <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">

    {/* LEFT — BRAND */}
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-white font-bold">F</span>
        </div>
        <span className="font-display font-bold text-light text-lg">FindIt</span>
      </div>

      <p className="text-muted text-sm leading-relaxed max-w-xs">
        AI-powered lost & found platform helping people reconnect with their belongings quickly and securely.
      </p>

      {/* SOCIAL */}
      <div className="flex gap-4 text-muted text-lg">
        <span className="hover:text-light cursor-pointer">📷</span>
        <span className="hover:text-light cursor-pointer">💼</span>
        <span className="hover:text-light cursor-pointer">💬</span>
        <span className="hover:text-light cursor-pointer">▶</span>
        <span className="hover:text-light cursor-pointer">✕</span>
      </div>
    </div>

    {/* PRODUCT */}
    <div>
      <p className="text-soft text-xs font-mono tracking-wide mb-4">PRODUCT</p>
      <ul className="space-y-3 text-sm">
        <li className="text-muted hover:text-light cursor-pointer transition">How it works</li>
        <li className="text-muted hover:text-light cursor-pointer transition">Features</li>
        <li className="text-muted hover:text-light cursor-pointer transition">AI Matching</li>
      </ul>
    </div>

    {/* COMPANY */}
    <div>
      <p className="text-soft text-xs font-mono tracking-wide mb-4">COMPANY</p>
      <ul className="space-y-3 text-sm">
        <li className="text-muted hover:text-light cursor-pointer transition">About</li>
        <li className="text-muted hover:text-light cursor-pointer transition">Careers</li>
        <li className="text-muted hover:text-light cursor-pointer transition">Feedback</li>
      </ul>
    </div>

    {/* CONTACT */}
    <div>
      <p className="text-soft text-xs font-mono tracking-wide mb-4">CONTACT</p>
      <ul className="space-y-3 text-sm text-muted">
        <li>📧 support@findit.com</li>
        <li>📍 Your City, India</li>
        <li>⏱ 24/7 Support</li>
      </ul>
    </div>

  </div>

  {/* BOTTOM BAR */}
  <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-3">
    <span className="text-muted text-xs font-mono">
      © 2026 FindIt
    </span>
    <span className="text-muted text-xs font-mono">
      Built with MERN + CLIP · Punjabi University
    </span>
  </div>

</footer>
    </div>
  )
}
