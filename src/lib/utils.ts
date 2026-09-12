/** class name joiner — tiny on purpose */
export const cx = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(' ')

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v))

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** "3 minutes ago" without dragging in date-fns */
export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return 'unknown'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'unknown'
  const s = Math.max(1, Math.round((now - then) / 1000))
  const table: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Infinity, 'year'],
  ]
  let value = s
  for (const [step, unit] of table) {
    if (value < step || step === Infinity) {
      const rounded = Math.round(value)
      return `${rounded} ${unit}${rounded === 1 ? '' : 's'} ago`
    }
    value /= step
  }
  return 'just now'
}

/** deterministic hue for a language name (github-ish, but ours) */
export function langColor(lang: string | null): string {
  const known: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    HTML: '#e34c26',
    CSS: '#663399',
    Python: '#3572a5',
    Rust: '#dea584',
    Go: '#00add8',
    Lua: '#000080',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Zig: '#ec915c',
    GDScript: '#355570',
    Shell: '#89e051',
    Assembly: '#6e4c13',
  }
  if (lang && known[lang]) return known[lang]
  let h = 0
  const seed = lang ?? 'unknown'
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360
  return `hsl(${h} 62% 58%)`
}

/** subsequence fuzzy match, returns score (higher = better) or null */
export function fuzzyScore(query: string, target: string): number | null {
  const q = query.toLowerCase().trim()
  const t = target.toLowerCase()
  if (!q) return 1
  if (t.includes(q)) return 1000 - t.indexOf(q) * 2 - (t.length - q.length) * 0.1
  let ti = 0
  let score = 0
  let streak = 0
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi]
    const idx = t.indexOf(ch!, ti)
    if (idx === -1) return null
    streak = idx === ti ? streak + 1 : 0
    score += 10 + streak * 6 - (idx - ti)
    if (idx === 0 || /[\s\-_/.]/.test(t[idx - 1] ?? '')) score += 14
    ti = idx + 1
  }
  return score
}

export const isMac = (): boolean =>
  typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

export function readStore<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  try {
    const v = localStorage.getItem(key) as T | null
    return v && allowed.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}

export function writeStore(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage blocked — theme just won't persist */
  }
}

export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}
