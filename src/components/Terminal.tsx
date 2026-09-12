import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ACCENTS, PEOPLE, TERMINAL_BANNER } from '@/data/site'
import { on, toast } from '@/lib/bus'
import type { AccentName, OrgData } from '@/lib/types'
import { timeAgo } from '@/lib/utils'

type Line = { kind: 'in' | 'out' | 'dim' | 'ok' | 'warn' | 'acc' | 'pre'; text: string }

const COMMANDS = [
  'help',
  'about',
  'whoami',
  'ls',
  'repos',
  'people',
  'open',
  'theme',
  'accent',
  'neofetch',
  'matrix',
  'date',
  'echo',
  'sudo',
  'clear',
] as const

export interface TerminalProps {
  org: OrgData | null
  theme: 'dark' | 'light'
  accent: AccentName
  setTheme: (t: 'dark' | 'light') => void
  setAccent: (a: AccentName) => void
}

export function Terminal({ org, theme, accent, setTheme, setAccent }: TerminalProps) {
  const [lines, setLines] = useState<Line[]>([
    { kind: 'pre', text: TERMINAL_BANNER },
    { kind: 'dim', text: 'ziqo shell v2.0 — connected to the edge. type `help` to see what this thing does.' },
    { kind: 'out', text: '' },
  ])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const push = useCallback((...next: Line[]) => {
    setLines((prev) => [...prev, ...next])
  }, [])

  /* keep the view pinned to the newest line */
  useEffect(() => {
    const body = bodyRef.current
    if (body) body.scrollTop = body.scrollHeight
  }, [lines])

  /* the hero button (and ⌘K) can summon this shell */
  useEffect(
    () =>
      on('terminal:focus', () => {
        document.getElementById('terminal')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 450)
      }),
    [],
  )

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim()
      push({ kind: 'in', text: input })
      if (!input) return

      const [cmd, ...args] = input.split(/\s+/)
      const arg = args.join(' ').toLowerCase()

      switch (cmd?.toLowerCase()) {
        case 'help':
          push(
            { kind: 'out', text: 'available commands:' },
            { kind: 'acc', text: '  help            this list' },
            { kind: 'out', text: '  about / whoami  what ziqodevs is' },
            { kind: 'out', text: '  ls / repos      public repositories (live from github)' },
            { kind: 'out', text: '  people          the humans behind the org' },
            { kind: 'out', text: '  open <what>     github | site | <repo name>' },
            { kind: 'out', text: '  theme <mode>    dark | light' },
            { kind: 'out', text: `  accent <name>   ${ACCENTS.map((a) => a.id).join(' | ')}` },
            { kind: 'out', text: '  neofetch        the important information' },
            { kind: 'out', text: '  matrix          follow the white rabbit' },
            { kind: 'out', text: '  date / echo     standard unix-ish behaviour' },
            { kind: 'dim', text: '  clear           wipe the scrollback · ↑/↓ history · ⇥ complete' },
          )
          break

        case 'about':
        case 'whoami':
          push(
            { kind: 'out', text: 'ziqodevs — an independent developer group.' },
            {
              kind: 'out',
              text: 'we build software, games, tools, programming languages and experiments.',
            },
            { kind: 'dim', text: 'motto: ideas that are too interesting to leave as ideas.' },
          )
          break

        case 'ls':
        case 'repos': {
          if (!org?.repos.length) {
            push({ kind: 'warn', text: 'no repositories reachable right now — github may be rate-limiting.' })
            break
          }
          push({ kind: 'dim', text: `total ${org.repos.length}` })
          for (const repo of org.repos.slice(0, 12)) {
            push({
              kind: 'out',
              text: `  ${repo.name.padEnd(20)} ${(repo.language ?? '—').padEnd(12)} ★${repo.stars}   ${timeAgo(repo.pushed_at)}`,
            })
          }
          break
        }

        case 'people':
          for (const person of PEOPLE) {
            push({ kind: 'out', text: `  ${person.login.padEnd(16)} ${person.role}` })
          }
          push({ kind: 'dim', text: '  both of them occasionally sleep.' })
          break

        case 'open': {
          const target = arg || 'github'
          const repo = org?.repos.find((r) => r.name.toLowerCase() === target)
          const url =
            target === 'github' || target === 'org'
              ? 'https://github.com/ziqodevs'
              : target === 'site'
                ? location.origin
                : repo?.url
          if (!url) {
            push({ kind: 'warn', text: `unknown target: ${target} — try: github | site | ${org?.repos.map((r) => r.name).join(' | ') ?? '…'}` })
            break
          }
          window.open(url, '_blank', 'noopener')
          push({ kind: 'ok', text: `opened ${url}` })
          break
        }

        case 'theme': {
          const next = arg === 'light' || arg === 'dark' ? arg : theme === 'dark' ? 'light' : 'dark'
          setTheme(next)
          toast(`Theme · ${next}`)
          push({ kind: 'ok', text: `theme → ${next}` })
          break
        }

        case 'accent': {
          const match = ACCENTS.find((a) => a.id === arg)
          if (!match) {
            push({ kind: 'warn', text: `usage: accent ${ACCENTS.map((a) => a.id).join(' | ')}` })
            break
          }
          setAccent(match.id)
          toast(`Signal colour · ${match.label}`)
          push({ kind: 'ok', text: `signal colour → ${match.label.toLowerCase()}` })
          break
        }

        case 'neofetch':
          push(
            { kind: 'pre', text: TERMINAL_BANNER },
            { kind: 'acc', text: '  org        ziqodevs' },
            { kind: 'out', text: `  repos      ${org?.totals.repos ?? '—'}` },
            { kind: 'out', text: `  stars      ${org?.totals.stars ?? '—'}` },
            { kind: 'out', text: `  languages  ${org?.totals.languageList.join(', ') || '—'}` },
            { kind: 'out', text: '  humans     2 (allegedly)' },
            { kind: 'out', text: `  theme      ${theme} / ${accent}` },
            { kind: 'out', text: '  stack      react · typescript · cloudflare workers' },
            { kind: 'dim', text: '  uptime     since the first idea refused to stay an idea' },
          )
          break

        case 'matrix': {
          const cols = 46
          for (let i = 0; i < 5; i++) {
            let row = '  '
            for (let c = 0; c < cols; c++) {
              row += Math.random() > 0.5 ? String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96)) : ' '
            }
            push({ kind: 'acc', text: row })
          }
          push({ kind: 'dim', text: '  …there is no spoon. there is only shipped code.' })
          break
        }

        case 'date':
          push({ kind: 'out', text: `  ${new Date().toString()}` })
          break

        case 'echo':
          push({ kind: 'out', text: `  ${args.join(' ')}` })
          break

        case 'sudo':
          push({ kind: 'warn', text: '  nice try. this shell is unprivileged, like all of us.' })
          break

        case 'rm':
          push({ kind: 'warn', text: '  permission denied: the site is read-only (and backed up).' })
          break

        case 'clear':
          setLines([])
          break

        default:
          push({
            kind: 'warn',
            text: `  command not found: ${cmd} — try \`help\``,
          })
      }
    },
    [org, theme, accent, push, setTheme, setAccent],
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    run(value)
    if (value.trim()) {
      setHistory((h) => [value, ...h].slice(0, 40))
    }
    setHistIdx(-1)
    setValue('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      if (history[idx] !== undefined) {
        setHistIdx(idx)
        setValue(history[idx]!)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = histIdx - 1
      setHistIdx(idx)
      setValue(idx >= 0 ? (history[idx] ?? '') : '')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const hits = COMMANDS.filter((c) => c.startsWith(value.toLowerCase()))
      if (hits.length === 1) setValue(hits[0]!)
      else if (hits.length > 1) push({ kind: 'dim', text: `  ${hits.join('   ')}` })
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <div className="terminal" id="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="term-bar">
        <span className="tl" style={{ background: '#ff5f57' }} />
        <span className="tl" style={{ background: '#febc2e' }} />
        <span className="tl" style={{ background: '#28c840' }} />
        <span className="title">ziqo@edge: ~ — zsh</span>
      </div>

      <div className="term-body" ref={bodyRef} role="log" aria-live="polite">
        {lines.map((line, i) => (
          <div key={i} className={`term-line ${line.kind === 'in' ? '' : line.kind}`}>
            {line.kind === 'in' ? (
              <>
                <span className="p">ziqo@edge</span>
                <span className="dim">:~$ </span>
                {line.text}
              </>
            ) : line.kind === 'pre' ? (
              <pre style={{ margin: 0, font: 'inherit', color: 'var(--accent)' }}>{line.text}</pre>
            ) : (
              line.text || '\u00A0'
            )}
          </div>
        ))}
        <form className="term-input-row" onSubmit={onSubmit}>
          <span className="p">ziqo@edge</span>
          <span className="dim">:~$</span>
          <input
            ref={inputRef}
            className="term-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            placeholder="help"
          />
        </form>
      </div>

      <div className="term-hint">
        <span>
          <kbd>↑</kbd> history
        </span>
        <span>
          <kbd>⇥</kbd> complete
        </span>
        <span>
          <kbd>ctrl</kbd>+<kbd>l</kbd> clear
        </span>
        <span>try: neofetch · matrix · open site</span>
      </div>
    </div>
  )
}
