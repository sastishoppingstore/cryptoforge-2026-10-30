import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const ToastContext = createContext(null)
let seq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback(
    (toast) => {
      const id = ++seq
      const item = { id, variant: 'info', duration: 4200, ...toast }
      setToasts((t) => [...t, item])
      if (item.duration !== 0) setTimeout(() => dismiss(id), item.duration)
      return id
    },
    [dismiss],
  )

  const api = {
    push,
    dismiss,
    success: (title, description) => push({ title, description, variant: 'success' }),
    error: (title, description) => push({ title, description, variant: 'error', duration: 6000 }),
    info: (title, description) => push({ title, description, variant: 'info' }),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-3">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const VARIANTS = {
  success: { icon: CheckCircle2, ring: 'border-emerald-500/40', tint: 'text-emerald-400' },
  error: { icon: TriangleAlert, ring: 'border-red-500/40', tint: 'text-red-400' },
  info: { icon: Info, ring: 'border-cyan-500/40', tint: 'text-cyan-400' },
}

function Toast({ toast, onClose }) {
  const { icon: Icon, ring, tint } = VARIANTS[toast.variant] || VARIANTS.info
  return (
    <div
      className={cn(
        'animate-fade-in panel bg-slate-900/95 backdrop-blur border p-4 shadow-2xl shadow-black/40 flex gap-3',
        ring,
      )}
      role="status"
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', tint)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.description && <p className="text-xs text-slate-400 mt-1 break-words">{toast.description}</p>}
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
