/**
 * The mark — same geometry as public/favicon.svg (both are produced from the
 * same drawing in scripts/build-icons.mjs). Two-tone Z: white bars, accent
 * diagonal, accent spark at the foot of the stroke.
 */
export function Logo({ size = 30, tiled = false }: { size?: number; tiled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {tiled && (
        <>
          <defs>
            <linearGradient id="logo-tile" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#15151a" />
              <stop offset="1" stopColor="#08080b" />
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="62" height="62" rx="15" fill="url(#logo-tile)" stroke="rgba(255,255,255,.16)" strokeWidth="1.2" />
        </>
      )}
      <g strokeWidth="7.6" strokeLinecap="butt" strokeLinejoin="miter">
        <path d="M16.5 17.5H47.5L27 46.5H47.5" stroke="currentColor" />
        <path d="M47.5 17.5 27 46.5" stroke="var(--accent)" />
      </g>
      <circle cx="19.4" cy="46.5" r="3.8" fill="var(--accent)" />
    </svg>
  )
}
