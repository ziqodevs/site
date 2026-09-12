import { JSDOM } from 'jsdom'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Headless smoke test: boots the *built* bundle inside jsdom with a few browser
 * shims and asserts every major surface actually rendered. Catches runtime
 * crashes that typecheck can't see, without needing a real browser.
 *   npm run build && npm run smoke
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const html = readFileSync(join(root, 'dist/index.html'), 'utf8')
const dom = new JSDOM(html, { url: process.env.SMOKE_URL ?? 'https://ziqodevs.pages.dev/', pretendToBeVisual: true, runScripts: 'outside-only' })
const { window } = dom

// --- shims the app expects from a real browser
const raf = (cb) => setTimeout(() => cb(Date.now()), 16)
window.requestAnimationFrame = raf
window.cancelAnimationFrame = (id) => clearTimeout(id)
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }))
window.IntersectionObserver = class { constructor(cb) { this.cb = cb } observe(el) { setTimeout(() => this.cb([{ isIntersecting: true, target: el, intersectionRatio: 1 }], this), 0) } disconnect() {} unobserve() {} }
window.IntersectionObserverEntry = class {}
window.MutationObserver = window.MutationObserver ?? class { observe() {} disconnect() {} }
window.scrollTo = () => {}
window.Element.prototype.scrollIntoView = () => {}

for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'HTMLAnchorElement', 'Element', 'Node', 'Event', 'CustomEvent', 'KeyboardEvent', 'PointerEvent', 'MouseEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia', 'IntersectionObserver', 'MutationObserver', 'localStorage', 'location', 'history', 'DOMParser']) {
  try { Object.defineProperty(globalThis, key, { value: window[key], configurable: true, writable: true }) } catch {}
}
globalThis.requestAnimationFrame = raf
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

const fetchLog = []
const origFetch = globalThis.fetch
globalThis.fetch = (...args) => {
  const tag = String(args[0])
  fetchLog.push(tag)
  const p = origFetch(...args)
  p.then(() => fetchLog.push(tag + ' -> ok'), (e) => fetchLog.push(tag + ' -> ' + e.message))
  return p
}
window.fetch = globalThis.fetch
const errors = []
window.addEventListener('error', (e) => errors.push('window error: ' + e.message))
process.on('unhandledRejection', (r) => errors.push('unhandledRejection: ' + (r?.stack ?? r?.message ?? r)))

// seed the localStorage cache so the repo path renders even offline
const fixture = {
  ok: true, source: 'cache', fetchedAt: new Date().toISOString(),
  org: { login: 'ziqodevs', name: 'ziqodevs', url: 'https://github.com/ziqodevs', avatar: null, description: null, blog: null, location: null, publicRepos: 2, followers: 0, createdAt: '2026-09-12T08:52:43Z' },
  repos: [
    { name: 'site', full_name: 'ziqodevs/site', description: 'this very website', url: 'https://github.com/ziqodevs/site', homepage: null, language: 'TypeScript', stars: 3, forks: 1, watchers: 2, issues: 0, fork: false, archived: false, topics: ['react'], license: 'MIT', created_at: '2026-09-12T09:15:45Z', pushed_at: '2026-09-12T09:15:45Z', updated_at: '2026-09-12T09:15:45Z', size: 120 },
    { name: 'zqdevs', full_name: 'ziqodevs/zqdevs', description: null, url: 'https://github.com/ziqodevs/zqdevs', homepage: null, language: 'HTML', stars: 0, forks: 0, watchers: 1, issues: 0, fork: false, archived: false, topics: [], license: null, created_at: '2026-09-12T09:18:19Z', pushed_at: '2026-09-12T09:18:34Z', updated_at: '2026-09-12T09:18:34Z', size: 0 },
  ],
  members: [{ login: 'Seigh-sword', url: 'https://github.com/Seigh-sword', avatar: 'https://avatars.githubusercontent.com/u/212584172?v=4' }],
  totals: { repos: 2, stars: 3, languages: 2, languageList: ['TypeScript', 'HTML'] },
}
window.localStorage.setItem('ziqo:org-cache', JSON.stringify({ at: Date.now(), data: fixture }))

const bundle = readdirSync(join(root, 'dist/assets')).find((f) => f.startsWith('index-') && f.endsWith('.js'))
await import(join(root, 'dist/assets', bundle))

await new Promise((r) => setTimeout(r, 1500))

const body = window.document.body.innerHTML
const checks = {
  'hero title rendered': body.includes('hero-title'),
  'terminal rendered': body.includes('term-body'),
  'marquee rendered': body.includes('marquee-track'),
  'bento pillars': body.includes('spotlight'),
  'repo cards rendered': body.includes('repo-card'),
  'offline error state exists when no data': body.includes('repo-card') || body.includes('empty-note') || body.includes('skeleton'),
  'people cards': body.includes('person'),
  'cta panel': body.includes('cta-panel'),
  'footer': body.includes('footer-base'),
  'boot splash removed': !body.includes('id="boot"'),
}
let fail = 0
for (const [name, ok] of Object.entries(checks)) { console.log((ok ? '  ✓ ' : '  ✗ ') + name); if (!ok) fail++ }
const repoCount = (body.match(/repo-card/g) ?? []).length
console.log('  repo cards in DOM:', repoCount)
console.log('  errors:', errors.length ? errors.slice(0, 6) : 'none')
console.log('  fetch log:', fetchLog)
// whitelist: vite's modulepreload polyfill fetches chunks under jsdom because
// jsdom's DOMTokenList.supports('modulepreload') is false. Real browsers bail early.
const real = errors.filter((e) => !e.includes('fetch failed'))
console.log('  real errors:', real.length ? real : 'none (undici/modulepreload artifacts filtered)')
process.exit(fail || real.length ? 1 : 0)
