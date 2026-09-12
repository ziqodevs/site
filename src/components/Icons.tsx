import type { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

const base = (size: number | undefined, props: IconProps) => ({
  width: size ?? 18,
  height: size ?? 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const ArrowUpRight = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
)
export const ArrowDown = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M12 5v14m0 0 6-6m-6 6-6-6" />
  </svg>
)
export const ArrowUp = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M12 19V5m0 0-6 6m6-6 6 6" />
  </svg>
)
export const Github = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)} fill="currentColor" stroke="none">
    <path d="M12 1.8a10.2 10.2 0 0 0-3.23 19.88c.51.1.7-.22.7-.49l-.01-1.9c-2.84.62-3.44-1.2-3.44-1.2-.46-1.18-1.13-1.5-1.13-1.5-.93-.63.07-.62.07-.62 1.02.07 1.56 1.05 1.56 1.05.91 1.56 2.39 1.11 2.97.85.09-.66.36-1.11.65-1.37-2.27-.26-4.65-1.13-4.65-5.05 0-1.11.4-2.02 1.05-2.74-.1-.26-.45-1.3.1-2.7 0 0 .86-.28 2.8 1.05a9.7 9.7 0 0 1 5.1 0c1.94-1.33 2.8-1.05 2.8-1.05.55 1.4.2 2.44.1 2.7.65.72 1.05 1.63 1.05 2.74 0 3.93-2.39 4.79-4.66 5.04.37.32.69.94.69 1.9l-.01 2.81c0 .27.19.6.7.49A10.2 10.2 0 0 0 12 1.8Z" />
  </svg>
)
export const Star = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="m12 3.6 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8Z" />
  </svg>
)
export const Fork = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <circle cx="6" cy="5" r="2.2" />
    <circle cx="18" cy="5" r="2.2" />
    <circle cx="12" cy="19" r="2.2" />
    <path d="M6 7.2v1.3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7.2M12 11.5v5.3" />
  </svg>
)
export const Sun = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2m0 15v2M4.6 4.6l1.4 1.4m12 12 1.4 1.4M2.5 12h2m15 0h2M4.6 19.4 6 18m12-12 1.4-1.4" />
  </svg>
)
export const Moon = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </svg>
)
export const Palette = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M12 21a9 9 0 1 1 9-9c0 2.5-1.7 3.5-3.5 3.5H15a2 2 0 0 0-1.5 3.3c.4.5.2 2.2-1.5 2.2Z" />
    <circle cx="7.8" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="16.2" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)
export const Command = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9Zm0 0v6m0-6h6m-6 6H6.5A2.5 2.5 0 1 0 9 17.5V15Zm6-6V6.5A2.5 2.5 0 1 1 17.5 9H15Zm0 0v6m0 0h2.5A2.5 2.5 0 1 1 15 17.5V15Z" />
  </svg>
)
export const TerminalIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <path d="m7.5 10 2.5 2.2-2.5 2.3M12.5 15h4" />
  </svg>
)
export const Copy = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5.5 14.5A2.5 2.5 0 0 1 4 12.2V6.5A2.5 2.5 0 0 1 6.5 4h5.7a2.5 2.5 0 0 1 2.3 1.5" />
  </svg>
)
export const Check = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)
export const X = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const Menu = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M4 8h16M4 16h10" />
  </svg>
)
export const Refresh = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M20 11a8 8 0 1 0-2.3 6.3M20 5.5V11h-5.5" />
  </svg>
)
export const Pin = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
)
export const Clock = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)
export const Zap = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />
  </svg>
)

/* pillar glyphs ---------------------------------------------------------- */

export const GlyphCode = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3.5-12-3 14" />
  </svg>
)
export const GlyphGamepad = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M7 8h10a5 5 0 0 1 5 5v1.5a3 3 0 0 1-5.4 1.8L15.4 15H8.6l-1.2 1.3A3 3 0 0 1 2 14.5V13a5 5 0 0 1 5-5Z" />
    <path d="M8 11v3m-1.5-1.5h3M15.5 11.5h.01M17.8 13.2h.01" />
  </svg>
)
export const GlyphBraces = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M9 4c-2 0-2.5 1-2.5 2.5v2C6.5 10 6 11 4.5 11v2c1.5 0 2 1 2 2.5v2C6.5 19 7 20 9 20m6-16c2 0 2.5 1 2.5 2.5v2c0 1.5.5 2.5 2 2.5v2c-1.5 0-2 1-2 2.5v2c0 1.5-.5 2.5-2.5 2.5" />
  </svg>
)
export const GlyphGlobe = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5Z" />
  </svg>
)
export const GlyphBranch = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <circle cx="6.5" cy="6" r="2.3" />
    <circle cx="6.5" cy="18" r="2.3" />
    <circle cx="17.5" cy="8" r="2.3" />
    <path d="M6.5 8.3v7.4M17.5 10.3c0 3.2-3 3.7-5.5 4.2-2 .4-3.5 1-3.9 2.6" />
  </svg>
)
export const GlyphFlask = ({ size, ...p }: IconProps) => (
  <svg {...base(size, p)}>
    <path d="M9.5 3h5m-3.5 0v6.2L5.4 18a3 3 0 0 0 2.6 4.5h8a3 3 0 0 0 2.6-4.5L13 9.2V3" />
    <path d="M7.5 15h9" />
  </svg>
)

export const PILLAR_GLYPHS = {
  code: GlyphCode,
  gamepad: GlyphGamepad,
  braces: GlyphBraces,
  globe: GlyphGlobe,
  branch: GlyphBranch,
  flask: GlyphFlask,
} as const
