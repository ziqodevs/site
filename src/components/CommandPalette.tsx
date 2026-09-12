import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ACCENTS, NAV, ORG_URL, PEOPLE } from '@/data/site'
import { emit, on, toast } from '@/lib/bus'
import type { AccentName, OrgData } from '@/lib/types'
import { cx, fuzzyScore, timeAgo } from '@/lib/utils'
import {
  Check,
  Command,
  Copy,
  Github,
  Moon,
  Palette,
  Pin,
  Refresh,
  Sun,
  TerminalIcon,
  Zap,
} from './Icons'

interface Item {
  id: string
  group: string
  label: string
  meta?: string
  icon: ReactNode
  keywords?: string
  run: () => void
}

interface Props {
  org: OrgData | null
  theme: 'dark' | 'light'
  accent: AccentName
  toggleTheme: () => void
  setAccent: (a: AccentName) => void
  refresh: () => void
}

export function CommandPalette({ org, theme, accent, toggleTheme, setAccent, refresh }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  const close = () => {
    setOpen(false)
    setQuery('')
    restoreRef.current?.focus?.()
  }

  /* open/close from anywhere in the app */
  useEffect(() => {
    const offOpen = on('palette:open', ({ initial }) => {
      restoreRef.current = document.activeElement as HTMLElement
      setQuery(initial ?? '')
      setOpen(true)
    })
    const offClose = on('palette:close', close)
    return () => {
      offOpen()
      offClose()
    }
  }, [])

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = [
      { id: 'nav-top', group: 'Navigate', label: 'Back to top', icon: <Zap size={14} />, run: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
      ...NAV.map((n) => ({
        id: `nav-${n.id}`,
        group: 'Navigate',
        label: n.label,
        meta: `#${n.id}`,
        icon: <Command size={14} />,
        run: () => document.getElementById(n.id)?.scrollIntoView({ behavior: 'smooth' }),
      })),
    ]

    const actions: Item[] = [
      {
        id: 'act-theme',
        group: 'Actions',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
        icon: theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />,
        keywords: 'mode toggle dark light',
        run: () => {
          toggleTheme()
          toast(`Theme · ${theme === 'dark' ? 'light' : 'dark'}`)
        },
      },
      ...ACCENTS.map((a) => ({
        id: `act-accent-${a.id}`,
        group: 'Actions',
        label: `Signal colour: ${a.label}`,
        meta: accent === a.id ? 'active' : undefined,
        icon: <Palette size={14} />,
        keywords: `accent color colour ${a.id}`,
        run: () => {
          setAccent(a.id)
          toast(`Signal colour · ${a.label}`)
        },
      })),
      {
        id: 'act-term',
        group: 'Actions',
        label: 'Open the shell',
        meta: 'terminal',
        icon: <TerminalIcon size={14} />,
        keywords: 'shell console zsh command',
        run: () => emit('terminal:focus'),
      },
      {
        id: 'act-copy',
        group: 'Actions',
        label: 'Copy GitHub URL',
        icon: <Copy size={14} />,
        keywords: 'clipboard link org',
        run: () => {
          void navigator.clipboard?.writeText(ORG_URL)
          toast('Copied github.com/ziqodevs')
        },
      },
      {
        id: 'act-github',
        group: 'Actions',
        label: 'Open GitHub org',
        icon: <Github size={14} />,
        keywords: 'repository external',
        run: () => window.open(ORG_URL, '_blank', 'noopener'),
      },
      {
        id: 'act-refresh',
        group: 'Actions',
        label: 'Refresh repository data',
        icon: <Refresh size={14} />,
        keywords: 'reload fetch github',
        run: () => {
          refresh()
          toast('Re-fetching the org…')
        },
      },
    ]

    const repos: Item[] = (org?.repos ?? []).map((r) => ({
      id: `repo-${r.name}`,
      group: 'Repositories',
      label: r.name,
      meta: `★${r.stars} · ${timeAgo(r.pushed_at)}`,
      icon: <Github size={14} />,
      keywords: `${r.language ?? ''} ${r.topics.join(' ')}`,
      run: () => window.open(r.url, '_blank', 'noopener'),
    }))

    const people: Item[] = PEOPLE.map((p) => ({
      id: `person-${p.login}`,
      group: 'People',
      label: p.login,
      meta: p.role,
      icon: <Pin size={14} />,
      keywords: p.name,
      run: () => window.open(p.url, '_blank', 'noopener'),
    }))

    return [...nav, ...actions, ...repos, ...people]
  }, [org, theme, accent, toggleTheme, setAccent, refresh])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    return items
      .map((item) => ({ item, score: fuzzyScore(query, `${item.label} ${item.keywords ?? ''} ${item.meta ?? ''}`) }))
      .filter((entry): entry is { item: Item; score: number } => entry.score !== null)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
  }, [items, query])

  useEffect(() => setSelected(0), [query, open])

  /* keyboard: ⌘K / Ctrl+K toggles, arrows navigate, enter runs */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) close()
        else {
          restoreRef.current = document.activeElement as HTMLElement
          setOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${selected}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  const runItem = (item: Item) => {
    close()
    // let the veil unmount before scrolling/redirecting
    window.setTimeout(() => item.run(), 10)
  }

  if (!open) return null

  let lastGroup = ''

  return (
    <div
      className="palette-veil"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="palette">
        <div className="palette-input">
          <Command size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelected((s) => Math.min(s + 1, filtered.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelected((s) => Math.max(s - 1, 0))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                const item = filtered[selected]
                if (item) runItem(item)
              } else if (e.key === 'Escape') {
                close()
              }
            }}
            placeholder="Search sections, actions, repos, people…"
            aria-label="Command palette search"
          />
          <span className="kbd">esc</span>
        </div>

        <div className="palette-list" ref={listRef}>
          {filtered.length === 0 && (
            <div className="palette-group">nothing matches “{query}” — try `theme` or `repos`</div>
          )}
          {filtered.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null
            lastGroup = item.group
            return (
              <div key={item.id}>
                {header && <div className="palette-group">{header}</div>}
                <button
                  className={cx('palette-item')}
                  data-sel={i === selected}
                  data-idx={i}
                  onPointerEnter={() => setSelected(i)}
                  onClick={() => runItem(item)}
                >
                  <span className="pi-ico">{item.icon}</span>
                  {item.label}
                  {item.meta && <span className="pi-meta">{item.meta}</span>}
                  {i === selected && <Check size={14} style={{ color: 'var(--accent)', marginLeft: 4 }} />}
                </button>
              </div>
            )
          })}
        </div>

        <div className="palette-foot">
          <span>↑↓ navigate</span>
          <span>↵ run</span>
          <span>esc close</span>
          <span style={{ marginLeft: 'auto' }}>
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </div>
  )
}
