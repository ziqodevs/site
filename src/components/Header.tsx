import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NAV, ACCENTS } from '@/data/site'
import { useActiveSection, useScrollEffects } from '@/hooks/useScroll'
import { useAccent, useTheme } from '@/hooks/useTheme'
import { openPalette, toast } from '@/lib/bus'
import { cx, isMac } from '@/lib/utils'
import type { AccentName } from '@/lib/types'
import { Logo } from './Logo'
import { Check, Command, Menu, Moon, Palette, Sun, X } from './Icons'

const NAV_IDS = NAV.map((n) => n.id)

export function Header() {
  const { progressRef, headerRef } = useScrollEffects()
  const active = useActiveSection(NAV_IDS)
  const { theme, toggle } = useTheme()
  const { accent, setAccent } = useAccent()

  const [accentOpen, setAccentOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const navRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

  /* slide the accent pill under the active nav link */
  useLayoutEffect(() => {
    const nav = navRef.current
    const pill = pillRef.current
    if (!nav || !pill) return
    const link = nav.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`)
    if (!link) {
      pill.dataset.on = 'false'
      return
    }
    pill.dataset.on = 'true'
    pill.style.width = `${link.offsetWidth}px`
    pill.style.transform = `translateX(${link.offsetLeft - 4}px)`
  }, [active])

  /* click-away for the accent popover */
  useEffect(() => {
    if (!accentOpen) return
    const onDown = (e: PointerEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setAccentOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccentOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [accentOpen])

  /* lock scroll behind the mobile menu */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const pickAccent = (id: AccentName) => {
    setAccent(id)
    setAccentOpen(false)
    toast(`Signal colour · ${ACCENTS.find((a) => a.id === id)?.label ?? id}`)
  }

  return (
    <>
      <div className="progress" ref={progressRef} aria-hidden="true">
        <i />
      </div>

      <header className="header" ref={headerRef}>
        <div className="container header-inner">
          <a href="#top" className="brand" aria-label="ziqodevs — back to top">
            <Logo size={28} />
            <span>
              ziqo<em>devs</em>
            </span>
          </a>

          <nav className="nav" ref={navRef} aria-label="Sections">
            <span className="nav-pill" ref={pillRef} aria-hidden="true" />
            {NAV.map((item) => (
              <a key={item.id} href={`#${item.id}`} data-active={active === item.id}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="kbd-btn"
              onClick={() => openPalette()}
              aria-label="Open command palette"
            >
              <Command size={15} />
              <span className="kbd-label">Search</span>
              <span className="kbd">{isMac() ? '⌘K' : 'Ctrl K'}</span>
            </button>

            <div style={{ position: 'relative' }} ref={popRef}>
              <button
                className="icon-btn"
                data-on={accentOpen}
                onClick={() => setAccentOpen((v) => !v)}
                aria-label="Choose signal colour"
                aria-expanded={accentOpen}
              >
                <Palette size={16} />
              </button>
              {accentOpen && (
                <div className="accent-pop" role="menu" aria-label="Signal colour">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.id}
                      role="menuitemradio"
                      aria-checked={accent === a.id}
                      data-on={accent === a.id}
                      onClick={() => pickAccent(a.id)}
                    >
                      <span className="swatch" style={{ background: a.hex }} />
                      {a.label}
                      <Check size={14} className="tick" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="icon-btn"
              onClick={() => {
                toggle()
                toast(theme === 'dark' ? 'Lights on' : 'Lights off')
              }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              className="icon-btn menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={17} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            className="icon-btn"
            style={{ position: 'absolute', top: 18, right: 'var(--gutter)' }}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={17} />
          </button>
          {NAV.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={{ animationDelay: `${60 + i * 55}ms` }}
              onClick={() => setMenuOpen(false)}
            >
              <small>0{i + 1}</small>
              {item.label}
            </a>
          ))}
          <div className="menu-foot">
            <a href="https://github.com/ziqodevs" target="_blank" rel="noreferrer">
              github.com/ziqodevs ↗
            </a>
            <button
              className={cx('tag')}
              onClick={() => {
                setMenuOpen(false)
                openPalette()
              }}
            >
              open ⌘K palette
            </button>
          </div>
        </div>
      )}
    </>
  )
}
