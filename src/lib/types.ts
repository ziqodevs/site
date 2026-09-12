export type ThemeName = 'dark' | 'light'
export type AccentName = 'mono' | 'lime' | 'plasma' | 'ember' | 'ice'

export interface Repo {
  name: string
  full_name: string
  description: string | null
  url: string
  homepage: string | null
  language: string | null
  stars: number
  forks: number
  watchers: number
  issues: number
  fork: boolean
  archived: boolean
  topics: string[]
  license: string | null
  created_at: string
  pushed_at: string
  updated_at: string
  size: number
}

export interface Member {
  login: string
  url: string
  avatar: string
}

export interface OrgData {
  ok: boolean
  source: 'edge' | 'direct' | 'cache'
  fetchedAt: string
  org: {
    login: string
    name: string
    url: string
    avatar: string | null
    description: string | null
    blog: string | null
    location: string | null
    publicRepos: number
    followers: number
    createdAt: string | null
  }
  repos: Repo[]
  members: Member[]
  totals: {
    repos: number
    stars: number
    languages: number
    languageList: string[]
  }
}

export interface EdgeInfo {
  ok: boolean
  version: string
  time: string
  colo: string
  country: string
  city: string | null
  tls: string | null
  protocol: string | null
  rttMs: number | null
  ray: string | null
  worker: boolean
}

export interface Person {
  login: string
  name: string
  role: string
  location: string
  bio: string
  url: string
  chips: { label: string; value: string }[]
}
