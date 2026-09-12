import { useEffect, useRef, useState } from 'react'

const reduced = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** rAF-throttled scroll position + document progress, written straight to refs (no re-renders) */
export function useScrollEffects() {
  const progressRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progressRef.current?.style.setProperty('--p', p.toFixed(4))
      if (headerRef.current) headerRef.current.dataset.scrolled = String(window.scrollY > 24)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return { progressRef, headerRef }
}

/** which section id is currently owning the viewport */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!sections.length || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-38% 0px -52% 0px', threshold: [0, 0.2, 0.6] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [ids])

  return active
}

/**
 * Scroll-linked "ink fill": sets --fill (0..1) on the element so a sentence
 * paints itself in as you read it. Pure DOM writes, zero re-renders.
 */
export function useFillProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || reduced()) {
      el?.style.setProperty('--fill', '100%')
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh * 0.82
      const end = vh * 0.28
      const travelled = start - rect.top
      const span = rect.height + (start - end)
      const p = Math.min(1, Math.max(0, travelled / span))
      el.style.setProperty('--fill', `${(p * 100).toFixed(2)}%`)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return ref
}
