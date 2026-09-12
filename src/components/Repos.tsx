import { ORG_URL } from '@/data/site'
import { Reveal } from '@/hooks/useReveal'
import { toast } from '@/lib/bus'
import type { OrgData } from '@/lib/types'
import { langColor, timeAgo } from '@/lib/utils'
import { ArrowUpRight, Fork, Github, Refresh, Star } from './Icons'

interface ReposProps {
  org: OrgData | null
  status: 'loading' | 'ready' | 'error'
  refresh: () => void
}

export function Repos({ org, status, refresh }: ReposProps) {
  const repos = org?.repos ?? []

  return (
    <section className="section" id="repos">
      <div className="container">
        <Reveal className="section-head">
          <span className="section-index">03</span>
          <div style={{ flex: 1 }}>
            <h2 className="section-title">Live from GitHub</h2>
            <p className="section-copy" style={{ marginTop: 14 }}>
              Pulled from the org at request time{org?.source === 'edge' ? ' via our Cloudflare edge cache' : ''} — no
              stale screenshots, no hand-maintained list.
            </p>
          </div>
          <button
            className="icon-btn"
            onClick={() => {
              refresh()
              toast('Re-fetching the org…')
            }}
            aria-label="Refresh repositories"
            title="Refresh repositories"
          >
            <Refresh size={16} />
          </button>
        </Reveal>

        {status === 'loading' && !org && (
          <div className="repo-grid">
            {[0, 1, 2].map((i) => (
              <div className="skeleton" key={i} />
            ))}
          </div>
        )}

        {status === 'error' && !org && (
          <div className="empty-note">
            <Github size={18} />
            GitHub is unreachable from here right now —{' '}
            <a href={ORG_URL} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
              browse the org directly ↗
            </a>
          </div>
        )}

        {org && (
          <div className="repo-grid">
            {repos.slice(0, 6).map((repo, i) => (
              <Reveal key={repo.full_name} delay={i * 60}>
                <a className="repo-card" href={repo.url} target="_blank" rel="noreferrer" style={{ height: '100%' }}>
                  <div className="top">
                    <span className="name">
                      <Github size={15} />
                      {repo.name}
                    </span>
                    <ArrowUpRight size={15} style={{ color: 'var(--faint)' }} />
                  </div>
                  <p className="desc">{repo.description ?? 'No description yet — the code is the documentation.'}</p>
                  <div className="meta">
                    {repo.language && (
                      <i>
                        <span className="lang-dot" style={{ background: langColor(repo.language) }} />
                        {repo.language}
                      </i>
                    )}
                    <i>
                      <Star size={13} />
                      {repo.stars}
                    </i>
                    <i>
                      <Fork size={13} />
                      {repo.forks}
                    </i>
                    <i style={{ marginLeft: 'auto' }}>{timeAgo(repo.pushed_at)}</i>
                  </div>
                </a>
              </Reveal>
            ))}

            <Reveal delay={repos.length * 60}>
              <a className="repo-card" href={ORG_URL} target="_blank" rel="noreferrer" style={{ height: '100%', borderStyle: 'dashed' }}>
                <div className="top">
                  <span className="name">
                    <ArrowUpRight size={15} />
                    everything else
                  </span>
                </div>
                <p className="desc">
                  The full list of public repositories, including the ones still too embarrassing
                  to feature.
                </p>
                <div className="meta">
                  <i>github.com/ziqodevs</i>
                </div>
              </a>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  )
}
