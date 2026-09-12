/**
 * Brand mark + social image generator.
 *
 * Everything is drawn as SVG source-of-truth and rasterized with resvg so the
 * favicon, PWA icons, apple-touch-icon and OG card stay pixel-identical to the
 * in-app <Logo /> component. Run with: `npm run icons` (wired into `npm run build`).
 */
import { Resvg } from '@resvg/resvg-js'
import wawoff2 from 'wawoff2'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public')
mkdirSync(out, { recursive: true })

/* ------------------------------------------------------------------ tokens */

const ACCENT = '#c8fa4b'
const ACCENT_DEEP = '#8fbb1f'
const INK = '#060607'
const TILE_TOP = '#15151a'
const TILE_BOT = '#08080b'

/* Fonts: resvg only speaks TTF/OTF, so we decompress the static-weight
   fontsource woff2 files (each is a single-weight TTF in disguise) into a
   local cache. Deterministic, offline, no system-font dependency. */
const DISPLAY = 'Space Grotesk'
const MONO = 'JetBrains Mono'

const fontCache = join(root, 'node_modules', '.cache', 'ziqo-icons')

const fontSources = [
  [DISPLAY, 400, 'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2'],
  [DISPLAY, 700, 'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2'],
  [MONO, 400, 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2'],
  [MONO, 500, 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2'],
  [MONO, 700, 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2'],
]

const fontFiles = []
mkdirSync(fontCache, { recursive: true })
for (const [family, weight, rel] of fontSources) {
  const ttf = join(fontCache, `${family.replace(/\s+/g, '-')}-${weight}.ttf`)
  if (!existsSync(ttf)) {
    const woff2 = new Uint8Array(await import('node:fs').then((fs) => fs.readFileSync(join(root, rel))))
    writeFileSync(ttf, Buffer.from(await wawoff2.decompress(woff2)))
  }
  fontFiles.push(ttf)
}


/* --------------------------------------------------------------- the glyph */

/**
 * The mark: a two-tone "Z" — white bars, accent diagonal — inside a squircle.
 * `size` is only the raster target; the drawing is always authored on a 64 grid.
 */
function mark({ tile = true, pad = 1, stroke = 7.6 } = {}) {
  const shell = tile
    ? `<rect x="${pad}" y="${pad}" width="${64 - pad * 2}" height="${64 - pad * 2}" rx="15" fill="url(#tile)" stroke="rgba(255,255,255,.16)" stroke-width="1.2"/>`
    : ''
  return `
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${TILE_TOP}"/>
      <stop offset="1" stop-color="${TILE_BOT}"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#c9c9d2"/>
    </linearGradient>
    <linearGradient id="dia" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${ACCENT}"/>
      <stop offset="1" stop-color="${ACCENT_DEEP}"/>
    </linearGradient>
  </defs>
  ${shell}
  <g fill="none" stroke-width="${stroke}" stroke-linecap="butt" stroke-linejoin="miter">
    <path d="M16.5 17.5 H47.5 L27 46.5 H47.5" stroke="url(#bar)"/>
    <path d="M47.5 17.5 L27 46.5" stroke="url(#dia)"/>
  </g>
  <circle cx="19.4" cy="46.5" r="${stroke / 2}" fill="url(#dia)"/>`
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="ziqodevs">${mark()}</svg>`

function iconSvg(size) {
  // A touch of padding for the large raster targets so the tile breathes.
  const s = size >= 256 ? 2.5 : 1
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">${mark({ pad: s })}</svg>`
}

/* ------------------------------------------------------------------- raster */

function rasterize(svg, file, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: 'rgba(0, 0, 0, 0)',
    font: {
      fontFiles: fontFiles.length ? fontFiles : undefined,
      loadSystemFonts: fontFiles.length === 0,
      defaultFontFamily: DISPLAY,
    },
  })
  writeFileSync(join(out, file), resvg.render().asPng())
  console.log(`  ✓ public/${file}  (${width}px)`)
}

/* ----------------------------------------------------------------- og card */

function dotGrid() {
  let dots = ''
  for (let x = 40; x <= 1160; x += 40) {
    for (let y = 40; y <= 590; y += 40) {
      dots += `<circle cx="${x}" cy="${y}" r="1.5" fill="#ffffff" opacity="0.055"/>`
    }
  }
  return dots
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b0b0e"/>
      <stop offset="0.55" stop-color="${INK}"/>
      <stop offset="1" stop-color="#090a08"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0" r="0.9">
      <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.9" cy="1" r="0.7">
      <stop offset="0" stop-color="#7aa2ff" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#7aa2ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="dia" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${ACCENT}"/>
      <stop offset="1" stop-color="${ACCENT_DEEP}"/>
    </linearGradient>
    <clipPath id="frame"><rect x="0" y="0" width="1200" height="630"/></clipPath>
  </defs>

  <g clip-path="url(#frame)">
    <rect width="1200" height="630" fill="url(#bg)"/>
    ${dotGrid()}
    <rect width="1200" height="630" fill="url(#glow)"/>
    <rect width="1200" height="630" fill="url(#glow2)"/>

    <!-- brand lockup -->
    <g transform="translate(72 66) scale(1.05)">
      <g fill="none" stroke-width="8" stroke-linecap="butt">
        <path d="M16.5 17.5 H47.5 L27 46.5 H47.5" stroke="#f4f4f6"/>
        <path d="M47.5 17.5 L27 46.5" stroke="url(#dia)"/>
      </g>
      <circle cx="19.4" cy="46.5" r="4" fill="url(#dia)"/>
    </g>
    <text x="150" y="108" font-family="${DISPLAY}" font-size="34" font-weight="700" letter-spacing="-1" fill="#f4f4f6">ziqodevs</text>
    <text x="150" y="134" font-family="${MONO}" font-size="15" letter-spacing="5.5" fill="#7c7c86">BUILD · THINK · CREATE</text>

    <!-- headline -->
    <text x="68" y="330" font-family="${DISPLAY}" font-size="112" font-weight="700" letter-spacing="-5" fill="#ffffff">Ideas become</text>
    <text x="68" y="432" font-family="${DISPLAY}" font-size="112" font-weight="700" letter-spacing="-5" fill="url(#dia)">real projects.</text>

    <text x="70" y="492" font-family="${MONO}" font-size="19" fill="#9a9aa4">software · games · tools · programming languages · experiments</text>

    <!-- footer strip -->
    <rect x="70" y="540" width="34" height="3" fill="url(#dia)"/>
    <text x="118" y="548" font-family="${MONO}" font-size="16" fill="#6f6f79">github.com/ziqodevs</text>
    <text x="1130" y="548" text-anchor="end" font-family="${MONO}" font-size="16" fill="#6f6f79">served from the edge</text>
    <rect x="0" y="626" width="1200" height="4" fill="url(#dia)" opacity="0.85"/>
  </g>
</svg>`

/* ------------------------------------------------------------- webmanifest */

const manifest = {
  name: 'ziqodevs — build · think · create',
  short_name: 'ziqodevs',
  description:
    'Independent developer group building software, games, tools, programming languages and experiments.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  background_color: INK,
  theme_color: INK,
  categories: ['developer', 'productivity', 'games'],
  icons: [
    { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

/* --------------------------------------------------------------------- run */

console.log('building icons →')
writeFileSync(join(out, 'favicon.svg'), favicon.trim() + '\n')
console.log('  ✓ public/favicon.svg')

rasterize(iconSvg(192), 'icon-192.png', 192)
rasterize(iconSvg(512), 'icon-512.png', 512)
rasterize(iconSvg(180), 'apple-touch-icon.png', 180)

// Maskable: same glyph on a solid tile with a safe-zone inset (no transparency).
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">
  <rect width="64" height="64" fill="${INK}"/>
  <g transform="translate(6.4 6.4) scale(0.8)">${mark({ tile: false, stroke: 8.4 })}</g>
</svg>`
rasterize(maskable, 'maskable-512.png', 512)

writeFileSync(join(out, 'og.svg'), og)
console.log('  ✓ public/og.svg')
rasterize(og, 'og.png', 1200)

writeFileSync(join(out, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n')
console.log('  ✓ public/site.webmanifest')
console.log(`done — fonts used: ${fontFiles.length ? fontFiles.length + ' embedded' : 'system'}`)
