/**
 * ziqodevs edge worker.
 *
 * Two jobs:
 *  1. serve the built React app (delegated to the ASSETS binding),
 *  2. own `/api/*` — a tiny GitHub aggregator + an "where am I being served
 *     from" endpoint. Both are cached with the Cloudflare cache API so the
 *     browser never burns an anonymous GitHub rate-limit token and repeat
 *     visitors in the same colo get a ~0ms answer.
 */

export interface Env {
  ASSETS: Fetcher
  SITE_VERSION: string
  GITHUB_ORG: string
  /** Optional: `wrangler secret put GITHUB_TOKEN` for 5000 req/h instead of 60. */
  GITHUB_TOKEN?: string
}

const GH = 'https://api.github.com'
const EDGE_TTL = 300 // seconds the response may live in Cloudflare's cache
const BROWSER_TTL = 60 // seconds the browser may keep it before revalidating

type Json = Record<string, unknown>

const json = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${BROWSER_TTL}, s-maxage=${EDGE_TTL}, stale-while-revalidate=${EDGE_TTL * 4}`,
      // The site is public; keep CSP-friendly and deny framing of the API.
      'x-content-type-options': 'nosniff',
      ...init.headers,
    },
  })

const pick = (repo: Json): Json => ({
  name: repo.name,
  full_name: repo.full_name,
  description: repo.description ?? null,
  url: repo.html_url,
  homepage: repo.homepage ?? null,
  language: repo.language ?? null,
  stars: repo.stargazers_count ?? 0,
  forks: repo.forks_count ?? 0,
  watchers: repo.subscribers_count ?? repo.watchers_count ?? 0,
  issues: repo.open_issues_count ?? 0,
  fork: repo.fork ?? false,
  archived: repo.archived ?? false,
  topics: repo.topics ?? [],
  license: (repo.license as Json | null)?.spdx_id ?? null,
  created_at: repo.created_at,
  pushed_at: repo.pushed_at,
  updated_at: repo.updated_at,
  size: repo.size ?? 0,
})

async function github(env: Env, path: string): Promise<unknown> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': `ziqodevs-site/${env.SITE_VERSION ?? '2'}`,
    'x-github-api-version': '2022-11-28',
  }
  if (env.GITHUB_TOKEN) headers.authorization = `Bearer ${env.GITHUB_TOKEN}`

  const res = await fetch(`${GH}${path}`, {
    headers,
    cf: { cacheTtl: EDGE_TTL, cacheEverything: true },
  })
  if (!res.ok) throw new Error(`github ${path} -> ${res.status}`)
  return res.json()
}

/** Org profile + repositories + public members, shaped for the client. */
async function orgPayload(env: Env): Promise<Json> {
  const org = env.GITHUB_ORG ?? 'ziqodevs'
  const [profile, repos, members] = await Promise.all([
    github(env, `/orgs/${org}`) as Promise<Json>,
    github(env, `/orgs/${org}/repos?per_page=100&sort=pushed&type=public`) as Promise<Json[]>,
    github(env, `/orgs/${org}/public_members?per_page=100`).catch(() => [] as Json[]) as Promise<Json[]>,
  ])

  const shaped = repos.map(pick)
  const stars = shaped.reduce((sum, r) => sum + Number(r.stars ?? 0), 0)
  const languages = [...new Set(shaped.map((r) => r.language).filter(Boolean))] as string[]

  return {
    ok: true,
    source: 'edge',
    fetchedAt: new Date().toISOString(),
    org: {
      login: profile.login ?? org,
      name: (profile.name as string) ?? org,
      url: profile.html_url ?? `https://github.com/${org}`,
      avatar: profile.avatar_url ?? null,
      description: profile.description ?? null,
      blog: profile.blog ?? null,
      location: profile.location ?? null,
      publicRepos: profile.public_repos ?? shaped.length,
      followers: profile.followers ?? 0,
      createdAt: profile.created_at ?? null,
    },
    repos: shaped,
    members: members.map((m) => ({
      login: m.login,
      url: m.html_url,
      avatar: m.avatar_url,
    })),
    totals: {
      repos: shaped.length,
      stars,
      languages: languages.length,
      languageList: languages.slice(0, 12),
    },
  }
}

/** Which Cloudflare datacenter answered this request. Pure flex, zero cost. */
function edgePayload(env: Env, request: Request): Json {
  const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf
  return {
    ok: true,
    version: env.SITE_VERSION ?? '2.0.0',
    time: new Date().toISOString(),
    colo: cf?.colo ?? 'LOCAL',
    country: cf?.country ?? '—',
    city: cf?.city ?? null,
    tls: cf?.tlsVersion ?? null,
    protocol: cf?.httpProtocol ?? null,
    rttMs: cf?.clientTcpRtt ?? null,
    ray: request.headers.get('cf-ray')?.split('-')[0] ?? null,
    worker: true,
  }
}

async function handleApi(url: URL, env: Env, request: Request): Promise<Response> {
  const cache = caches.default
  const key = new URL(url)
  key.searchParams.set('_v', env.SITE_VERSION ?? '2')

  if (url.pathname === '/api/org') {
    const cached = await cache.match(key)
    if (cached) return cached
    try {
      const res = json(await orgPayload(env))
      // Cache in the background so we never delay the response.
      void cache.put(key, res.clone())
      return res
    } catch (err) {
      const message = err instanceof Error ? `${err.message} :: ${err.stack ?? ''}` : 'upstream'
      console.error('[api/org]', message)
      return json(
        { ok: false, source: 'edge', error: message.slice(0, 400) },
        { status: 502, headers: { 'cache-control': 'public, max-age=0, s-maxage=15' } },
      )
    }
  }

  if (url.pathname === '/api/edge') return json(edgePayload(env, request))

  return json({ ok: false, error: 'unknown endpoint', hint: '/api/org | /api/edge' }, { status: 404 })
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    // Only GET/HEAD ever needs the API.
    if (url.pathname.startsWith('/api/') && (request.method === 'GET' || request.method === 'HEAD')) {
      return handleApi(url, env, request)
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
