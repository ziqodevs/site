import { useEffect, useRef } from 'react'
import { lerp } from '@/lib/utils'
import { prefersReducedMotion } from '@/hooks/useFx'

/**
 * A difference-blended dot + trailing ring. The ring lerps behind the pointer
 * and inflates over anything interactive. Disabled for touch + reduced motion.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let rx = x
    let ry = y
    let frame = 0
    let visible = false

    const tick = () => {
      rx = lerp(rx, x, 0.18)
      ry = lerp(ry, y, 0.18)
      dot.style.transform = `translate3d(${x - 3.5}px, ${y - 3.5}px, 0)`
      const rw = ring.offsetWidth / 2
      ring.style.transform = `translate3d(${rx - rw}px, ${ry - rw}px, 0)`
      frame = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!visible) {
        visible = true
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
    }
    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      const interactive = target?.closest('a, button, input, [data-cursor="link"]')
      const ghost = target?.closest('[data-cursor="ghost"]')
      ring.dataset.hover = ghost ? 'ghost' : interactive ? 'link' : ''
    }
    const onOut = () => {
      visible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }

    dot.style.opacity = '0'
    ring.style.opacity = '0'
    frame = requestAnimationFrame(tick)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onOut)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onOut)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
