import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/hooks/useFx'

/**
 * Pointer-reactive dot lattice. A single canvas, DPR-clamped, rAF-driven and
 * paused while the tab is hidden. Dots inside the cursor's field get pushed
 * away, brightened and tinted with the current accent — the page feels like
 * it has a magnetic skin.
 */
export function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduced = prefersReducedMotion()
    let w = 0
    let h = 0
    let frame = 0
    let t = 0
    let running = true
    const pointer = { x: -9999, y: -9999 }

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduced) draw()
    }

    const draw = () => {
      const styles = getComputedStyle(document.documentElement)
      const isLight = styles.getPropertyValue('color-scheme').trim() === 'light'
      const accent = (styles.getPropertyValue('--accent-rgb').trim() || '200 250 75').split(/\s+/)
      const [ar, ag, ab] = accent.map(Number)
      const baseAlpha = isLight ? 0.14 : 0.16
      const dotAlpha = isLight ? '12,12,14' : '255,255,255'

      ctx.clearRect(0, 0, w, h)

      const spacing = w < 640 ? 30 : 38
      const sigma = 150
      const sigma2 = 2 * sigma * sigma

      for (let gx = spacing / 2; gx < w; gx += spacing) {
        for (let gy = spacing / 2; gy < h; gy += spacing) {
          // slow ambient drift so the grid never feels frozen
          const wx = Math.sin(gy * 0.011 + t) * 3.2
          const wy = Math.cos(gx * 0.009 - t * 0.8) * 3.2
          let x = gx + wx
          let y = gy + wy

          const dx = x - pointer.x
          const dy = y - pointer.y
          const dist2 = dx * dx + dy * dy
          const influence = dist2 < sigma2 * 4 ? Math.exp(-dist2 / sigma2) : 0

          if (influence > 0.004) {
            const dist = Math.sqrt(dist2) || 1
            const push = influence * 26
            x += (dx / dist) * push
            y += (dy / dist) * push
          }

          const size = 1.15 + influence * 2.1
          const alpha = baseAlpha + influence * 0.75
          ctx.fillStyle =
            influence > 0.12
              ? `rgba(${ar},${ag},${ab},${Math.min(0.9, alpha).toFixed(3)})`
              : `rgba(${dotAlpha},${alpha.toFixed(3)})`
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const loop = () => {
      if (!running) return
      t += 0.0035
      draw()
      frame = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      if (reduced) draw()
    }
    const onLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
      if (reduced) draw()
    }
    const onVisibility = () => {
      running = document.visibilityState === 'visible' && !reduced
      if (running) {
        cancelAnimationFrame(frame)
        loop()
      }
    }

    resize()
    if (!reduced) loop()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)

    // repaint when the theme/accent switches
    const mo = new MutationObserver(() => reduced && draw())
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-accent'] })

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      mo.disconnect()
    }
  }, [])

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-glow" />
      <canvas ref={canvasRef} />
    </div>
  )
}
