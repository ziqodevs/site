import type { EdgeInfo, OrgData } from './types'
import { readJson, writeJson } from './utils'

const CACHE_KEY = 'ziqo:org-cache'

/**
 * Data flow, best case first:
 *   1. localStorage snapshot (instant paint, max 5 min old)
 *   2. same-origin `/api/org` — the Cloudflare Worker, edge-cached for everyone
 *   3. api.github.com straight from the browser (dev servers, or if the edge
 *      path is unavailable)
 */
export async function fetchOrgData(): Promise<OrgData> {
  try {
    const res = await fetch('/api/org', { headers: { accept: 'application/json' } })
    if (res.ok) {
      const data = (await res.json()) as OrgData
      if (data.ok) {
        writeJson(CACHE_KEY, { at: Date.now(), data })
        return data
      }
    }
  } catch {
    /* no worker (dev) or offline — fall through */
  }

  try {
    const [profile, repos, members] = await Promise.all([
      gh<Record<string, unknown>>('/orgs/ziqodevs'),
      gh<Record<string, unknown>[]>('/orgs/ziqodevs/repos?per_page=100&sort=pushed'),
      gh<Record<string, unknown>[]>('/orgs/ziqodevs/public_members?per_page=100').catch(
        () => [] as Record<string, unknown>[],
      ),
    ])
    const data = shapeDirect(profile, repos, members)
    writeJson(CACHE_KEY, { at: Date.now(), data })
    return data
  } catch {
    const cached = readJson<{ at: number; data: OrgData }>(CACHE_KEY)
    if (cached?.data) return { ...cached.data, source: 'cache' }
    throw new Error('github unreachable')
  }
}

export function cachedOrgData(): OrgData | null {
  const cached = readJson<{ at: number; data: OrgData }>(CACHE_KEY)
  if (!cached?.data) return null
  return { ...cached.data, source: 'cache' }
}

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' },
  })
  if (!res.ok) throw new Error(`github ${res.status}`)
  return (await res.json()) as T
}

function shapeDirect(
  profile: Record<string, unknown>,
  repos: Record<string, unknown>[],
  members: Record<string, unknown>[],
): OrgData {
  const shaped = repos.map((r) => ({
    name: String(r.name ?? ''),
    full_name: String(r.full_name ?? ''),
    description: (r.description as string | null) ?? null,
    url: String(r.html_url ?? ''),
    homepage: (r.homepage as string | null) ?? null,
    language: (r.language as string | null) ?? null,
    stars: Number(r.stargazers_count ?? 0),
    forks: Number(r.forks_count ?? 0),
    watchers: Number(r.subscribers_count ?? r.watchers_count ?? 0),
    issues: Number(r.open_issues_count ?? 0),
    fork: Boolean(r.fork),
    archived: Boolean(r.archived),
    topics: (r.topics as string[]) ?? [],
    license: ((r.license as Record<string, unknown> | null)?.spdx_id as string) ?? null,
    created_at: String(r.created_at ?? ''),
    pushed_at: String(r.pushed_at ?? ''),
    updated_at: String(r.updated_at ?? ''),
    size: Number(r.size ?? 0),
  }))
  const languages = [...new Set(shaped.map((r) => r.language).filter((l): l is string => !!l))]
  return {
    ok: true,
    source: 'direct',
    fetchedAt: new Date().toISOString(),
    org: {
      login: String(profile.login ?? 'ziqodevs'),
      name: String(profile.name ?? 'ziqodevs'),
      url: String(profile.html_url ?? 'https://github.com/ziqodevs'),
      avatar: (profile.avatar_url as string | null) ?? null,
      description: (profile.description as string | null) ?? null,
      blog: (profile.blog as string | null) ?? null,
      location: (profile.location as string | null) ?? null,
      publicRepos: Number(profile.public_repos ?? shaped.length),
      followers: Number(profile.followers ?? 0),
      createdAt: (profile.created_at as string | null) ?? null,
    },
    repos: shaped,
    members: members.map((m) => ({
      login: String(m.login ?? ''),
      url: String(m.html_url ?? ''),
      avatar: String(m.avatar_url ?? ''),
    })),
    totals: {
      repos: shaped.length,
      stars: shaped.reduce((sum, r) => sum + r.stars, 0),
      languages: languages.length,
      languageList: languages.slice(0, 12),
    },
  }
}

/** Where in the world is this page being served from? */
export async function fetchEdge(): Promise<EdgeInfo> {
  try {
    const res = await fetch('/api/edge')
    if (res.ok) {
      const data = (await res.json()) as EdgeInfo
      if (data.ok) return data
    }
  } catch {
    /* dev server without the worker */
  }
  // Dev fallback: cdn-cgi/trace works from any browser and is CORS-friendly.
  try {
    const res = await fetch('https://cloudflare.com/cdn-cgi/trace')
    const text = await res.text()
    const kv = Object.fromEntries(
      text
        .split('\n')
        .map((line) => line.split('='))
        .filter((p): p is [string, string] => p.length === 2),
    )
    return {
      ok: true,
      version: 'dev',
      time: new Date().toISOString(),
      colo: kv.loc ?? 'EDGE',
      country: kv.loc ?? '—',
      city: null,
      tls: null,
      protocol: kv.http ?? null,
      rttMs: null,
      ray: kv.ray ?? null,
      worker: false,
    }
  } catch {
    return {
      ok: false,
      version: 'dev',
      time: new Date().toISOString(),
      colo: 'local',
      country: 'localhost',
      city: null,
      tls: null,
      protocol: 'http',
      rttMs: null,
      ray: null,
      worker: false,
    }
  }
}
