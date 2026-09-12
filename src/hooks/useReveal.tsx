import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { cx } from '@/lib/utils'

/** true once the element has entered the viewport (stays true) */
export function useInView<T extends Element>(threshold = 0.15, rootMargin = '0px 0px -8% 0px') {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            io.disconnect()
          }
        }
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin])

  return { ref, inView }
}

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
  as?: ElementType
  id?: string
}

/** Fade+rise on first sight. `delay` staggers siblings (ms). */
export function Reveal({ children, delay = 0, className, as: Tag = 'div', id }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <Tag
      id={id}
      ref={ref}
      className={cx('reveal', inView && 'is-in', className)}
      style={{ '--d': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
