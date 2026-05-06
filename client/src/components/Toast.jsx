import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`animate-fade-up pointer-events-auto flex items-center gap-3
            px-4 py-3 rounded-xl border text-sm font-body shadow-2xl min-w-[260px] max-w-sm
            ${t.type === 'success' ? 'bg-teal/10 border-teal/30 text-teal' :
              t.type === 'error'   ? 'bg-rose/10 border-rose/30 text-rose'  :
                                     'bg-accent/10 border-accent/30 text-accent'}`}>
            <span className="text-base">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
