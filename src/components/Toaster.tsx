import { useEffect, useState } from 'react'
import { on } from '@/lib/bus'

interface Toast {
  id: number
  message: string
  leaving?: boolean
}

let nextId = 0

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(
    () =>
      on('toast:show', ({ message }) => {
        const id = ++nextId
        setToasts((list) => [...list.slice(-2), { id, message }])
        window.setTimeout(() => {
          setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
          window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 320)
        }, 2400)
      }),
    [],
  )

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast" data-leaving={t.leaving || undefined}>
          <span className="dot" />
          {t.message}
        </div>
      ))}
    </div>
  )
}
