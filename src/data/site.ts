import type { AccentName, Person } from '@/lib/types'

export const ORG = 'ziqodevs'
export const ORG_URL = 'https://github.com/ziqodevs'

export const NAV = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'What we do' },
  { id: 'repos', label: 'Repos' },
  { id: 'people', label: 'People' },
  { id: 'edge', label: 'Edge' },
] as const

export const MARQUEE = [
  'software',
  'games',
  'compilers',
  'web apps',
  'developer tools',
  'programming languages',
  'prototypes',
  'open source',
  'experiments',
  'runtimes',
  'websites',
  'things that should not work but do',
] as const

export const PILLARS = [
  {
    num: '01',
    title: 'Software',
    body: 'Apps, utilities and developer tools built from scratch — designed to solve a real problem or to answer a question nobody asked yet.',
    glyph: 'code',
  },
  {
    num: '02',
    title: 'Games',
    body: 'Interactive worlds, mechanics and prototypes. From weekend experiments to larger projects with actual scope (occasionally).',
    glyph: 'gamepad',
  },
  {
    num: '03',
    title: 'Languages',
    body: 'Programming-language experiments: lexers, parsers, compilers, runtimes. The fastest way to learn why everything is hard.',
    glyph: 'braces',
  },
  {
    num: '04',
    title: 'Web',
    body: 'Websites and web applications with clean interfaces, sharp interactions and a bias for shipping fast and iterating faster.',
    glyph: 'globe',
  },
  {
    num: '05',
    title: 'Open source',
    body: 'Everything we can, published for people to inspect, use, break, fork and build upon. Code reads better in the open.',
    glyph: 'branch',
  },
  {
    num: '06',
    title: 'Experiments',
    body: 'Odd concepts and technical dares that exist because someone had to find out if it would work. Many do not. Some do.',
    glyph: 'flask',
  },
] as const

export const PEOPLE: Person[] = [
  {
    login: 'Seigh-sword',
    name: 'Seigh sword',
    role: 'Founder · main developer',
    location: 'Kerala, India',
    bio: 'A programmer from India who has started a lot of projects — some never finished, all of them lessons. Always trying to make crazy things.',
    url: 'https://github.com/Seigh-sword',
    chips: [
      { label: 'repos', value: '97' },
      { label: 'focus', value: 'everything' },
    ],
  },
  {
    login: 'suripewepedie',
    name: 'suripewepedie',
    role: 'Main developer',
    location: 'somewhere online',
    bio: 'Second pair of hands, second set of opinions. Keeps the org honest and the experiments running.',
    url: 'https://github.com/suripewepedie',
    chips: [
      { label: 'joined', value: '2026' },
      { label: 'focus', value: 'shipping' },
    ],
  },
]

export const ACCENTS: { id: AccentName; label: string; hex: string }[] = [
  { id: 'lime', label: 'Signal lime', hex: '#c8fa4b' },
  { id: 'mono', label: 'Mono', hex: '#f4f4f6' },
  { id: 'plasma', label: 'Plasma', hex: '#9d8bff' },
  { id: 'ember', label: 'Ember', hex: '#ff7a45' },
  { id: 'ice', label: 'Ice', hex: '#6fd9ff' },
]

export const STATEMENT =
  'ziqodevs is a place for ideas that are too interesting to leave as ideas. We build them, break them, learn from them, and ship the ones that survive.'

export const TERMINAL_BANNER = `
  ╔═╗┬┌─┐┌─┐┌─┐  ┌┬┐┌─┐┬  ┬┌─┐
  ╔═╝││ ┬│ ││ │───││├┤ ┐┌┘└─┐
  ╚═╝┴─┘└─┘└─┘  ┴ ┴└─┘ └┘ └─┘`.trimStart()
