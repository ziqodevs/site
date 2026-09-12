import { useEffect, useRef, useState } from 'react'
import { clamp, lerp } from '@/lib/utils'

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Tracks the pointer over an element and writes --mx/--my (px) for CSS spotlights. */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
      el.style.setProperty('--my', `${e.clientY - rect.top}px`)
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [])

  return ref
}

/** Gentle magnet: the element leans toward the cursor and springs back. */
export function useMagnetic<T extends HTMLElement>(strength = 0.28) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return

    let frame = 0
    let tx = 0
    let ty = 0
    let x = 0
    let y = 0

    const tick = () => {
      x = lerp(x, tx, 0.16)
      y = lerp(y, ty, 0.16)
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      frame = Math.abs(x - tx) > 0.1 || Math.abs(y - ty) > 0.1 ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      tx = (e.clientX - (rect.left + rect.width / 2)) * strength
      ty = (e.clientY - (rect.top + rect.height / 2)) * strength
      kick()
    }
    const onLeave = () => {
      tx = 0
      ty = 0
      kick()
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [strength])

  return ref
}

/** Subtle 3D tilt for cards. */
export function useTilt<T extends HTMLElement>(maxDeg = 6) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `perspective(900px) rotateX(${(-py * maxDeg).toFixed(2)}deg) rotateY(${(px * maxDeg).toFixed(2)}deg) translateY(-4px)`
    }
    const onLeave = () => {
      el.style.transform = ''
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [maxDeg])

  return ref
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#________'

/** Decode-scramble animation: returns the visible string. */
export function useScramble(text: string, active: boolean, speed = 28) {
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!active) return
    if (prefersReducedMotion()) {
      setOutput(text)
      return
    }
    let frame = 0
    let revealed = 0
    const total = text.length
    const id = window.setInterval(() => {
      frame++
      if (frame % 2 === 0) revealed = Math.min(total, revealed + 1)
      let out = ''
      for (let i = 0; i < total; i++) {
        const ch = text[i]
        if (i < revealed || ch === ' ' || ch === '\n') out += ch
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      setOutput(out)
      if (revealed >= total) window.clearInterval(id)
    }, speed)
    return () => window.clearInterval(id)
  }, [text, active, speed])

  return output
}

/** Eased count-up that starts when `active` flips true. */
export function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, active, duration])

  return value
}

/** ticking clock for the footer */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
