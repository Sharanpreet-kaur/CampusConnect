import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../components/Toast'

const CATEGORIES = ['wallet', 'phone', 'keys', 'documents', 'bag', 'jewellery', 'electronics', 'pet', 'other']
const CATEGORY_ICONS = {
  wallet: '👛', phone: '📱', keys: '🔑', documents: '📄',
  bag: '🎒', jewellery: '💍', electronics: '💻', pet: '🐾', other: '📦'
}

const STEPS = ['Type & Category', 'Item Details', 'Photos', 'Location & Secret', 'Review']

export default function NewPost() {
  const navigate = useNavigate()
  const toast    = useToast()
  const fileRef  = useRef()

  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [previews, setPreviews] = useState([])
  const [form, setForm] = useState({
    type: '', category: '', title: '', description: '',
    lostFoundAt: '', locationName: '', secretQuestion: '', secretAnswer: '',
    images: []
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 4)
    set('images', files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removeImage = (i) => {
    const imgs = form.images.filter((_, idx) => idx !== i)
    const prevs = previews.filter((_, idx) => idx !== i)
    set('images', imgs)
    setPreviews(prevs)
  }

  const canNext = () => {
    if (step === 0) return form.type && form.category
    if (step === 1) return form.title.trim().length >= 3 && form.description.trim().length >= 10
    if (step === 2) return true
    if (step === 3) return form.locationName.trim() && form.secretQuestion.trim() && form.secretAnswer.trim()
    return true
  }

  const submit = async () => {
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('type',           form.type)
      fd.append('category',       form.category)
      fd.append('title',          form.title)
      fd.append('description',    form.description)
      fd.append('lostFoundAt',    form.lostFoundAt)
      fd.append('locationName',   form.locationName)
      fd.append('secretQuestion', form.secretQuestion)
      fd.append('secretAnswer',   form.secretAnswer)
      form.images.forEach(img => fd.append('images', img))

      await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast('Post created successfully!', 'success')
      navigate('/my-posts')
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create post', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-wrapper pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title text-3xl mb-1">Report an Item</h1>
          <p className="text-muted font-body text-sm">Help reunite lost items with their owners</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all
                  ${i < step  ? 'bg-teal text-ink' :
                    i === step ? 'bg-accent text-white ring-4 ring-accent/20' :
                                 'bg-card border border-border text-muted'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-display mt-1 hidden sm:block whitespace-nowrap
                  ${i === step ? 'text-accent' : 'text-muted'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-colors ${i < step ? 'bg-teal' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card p-8 animate-fade-in">

          {/* STEP 0 — Type & Category */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="label">I want to report a...</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['lost', 'found'].map(t => (
                    <button key={t} onClick={() => set('type', t)}
                      className={`p-5 rounded-xl border-2 text-center transition-all
                        ${form.type === t
                          ? t === 'lost' ? 'border-rose bg-rose/10 text-rose' : 'border-teal bg-teal/10 text-teal'
                          : 'border-border text-muted hover:border-soft'}`}>
                      <div className="text-3xl mb-2">{t === 'lost' ? '😢' : '🎉'}</div>
                      <div className="font-display font-semibold capitalize">{t} item</div>
                      <div className="text-xs mt-1 opacity-70">
                        {t === 'lost' ? 'I lost something' : 'I found something'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Category</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => set('category', c)}
                      className={`p-3 rounded-xl border text-center transition-all
                        ${form.category === c
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted hover:border-soft'}`}>
                      <div className="text-2xl mb-1">{CATEGORY_ICONS[c]}</div>
                      <div className="text-xs font-mono capitalize">{c}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="label">Title</label>
                <input className="input" placeholder="e.g. Black leather wallet with initials"
                  value={form.title} onChange={e => set('title', e.target.value)} maxLength={80} />
                <p className="text-muted text-xs mt-1 font-mono">{form.title.length}/80</p>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={4}
                  placeholder="Describe the item in detail — colour, brand, distinctive marks, where you lost/found it..."
                  value={form.description} onChange={e => set('description', e.target.value)} maxLength={500} />
                <p className="text-muted text-xs mt-1 font-mono">{form.description.length}/500</p>
              </div>
              <div>
                <label className="label">Date {form.type === 'lost' ? 'Lost' : 'Found'}</label>
                <input type="date" className="input" value={form.lostFoundAt}
                  onChange={e => set('lostFoundAt', e.target.value)}
                  max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
          )}

          {/* STEP 2 — Photos */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="label">Upload Photos (max 4)</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer
                    hover:border-accent/50 transition-colors">
                  <div className="text-4xl mb-3">📸</div>
                  <p className="text-soft font-body text-sm mb-1">Click to upload photos</p>
                  <p className="text-muted text-xs font-mono">JPG, PNG, WEBP · Max 4 images</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={handleImages} />
                </div>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-panel">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-ink/80 text-rose rounded-full w-6 h-6
                          flex items-center justify-center text-xs hover:bg-rose hover:text-white transition-all">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-muted text-xs font-body bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
                💡 Better photos = better AI matching. Upload multiple angles if possible.
              </p>
            </div>
          )}

          {/* STEP 3 — Location & Secret */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="label">Location Name</label>
                <input className="input" placeholder="e.g. Sector 17, Chandigarh"
                  value={form.locationName} onChange={e => set('locationName', e.target.value)} />
              </div>

              <div className="border-t border-border pt-5">
                <p className="text-soft text-sm font-body mb-4">
                  <span className="text-accent font-semibold">Secret verification</span> — only the true owner will know this answer. Used to verify claims.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="label">Secret Question</label>
                    <input className="input"
                      placeholder="e.g. What colour is the zip? / What brand is it?"
                      value={form.secretQuestion} onChange={e => set('secretQuestion', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Answer (kept private)</label>
                    <input className="input" placeholder="Your answer"
                      value={form.secretAnswer} onChange={e => set('secretAnswer', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-light mb-4">Review your post</h3>
              <ReviewRow label="Type"     value={<span className={form.type === 'lost' ? 'badge-lost' : 'badge-found'}>{form.type}</span>} />
              <ReviewRow label="Category" value={`${CATEGORY_ICONS[form.category]} ${form.category}`} />
              <ReviewRow label="Title"    value={form.title} />
              <ReviewRow label="Location" value={form.locationName} />
              <ReviewRow label="Date"     value={form.lostFoundAt || 'Not set'} />
              <ReviewRow label="Photos"   value={`${form.images.length} photo(s) selected`} />
              {previews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {previews.map((src, i) => (
                    <img key={i} src={src} className="w-16 h-16 object-cover rounded-lg border border-border" />
                  ))}
                </div>
              )}
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mt-2">
                <p className="text-soft text-xs font-body">
                  <span className="text-accent font-semibold">Description:</span> {form.description}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
              className="btn-ghost px-5">
              {step === 0 ? 'Cancel' : '← Back'}
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className="btn-primary px-6 disabled:opacity-40">
                Continue →
              </button>
            ) : (
              <button onClick={submit} disabled={loading || !canNext()}
                className="btn-primary px-6 flex items-center gap-2 disabled:opacity-40">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting...</>
                  : '🚀 Submit Post'
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="text-muted text-xs font-mono uppercase tracking-wide w-24 flex-shrink-0">{label}</span>
      <span className="text-soft text-sm font-body text-right">{value}</span>
    </div>
  )
}
