import { NAV, ORG_URL, PEOPLE } from '@/data/site'
import { useNow } from '@/hooks/useFx'
import { useEdgeInfo } from '@/hooks/useOrg'
import { ArrowUp, Clock, Github } from './Icons'
import { Logo } from './Logo'

export function Footer() {
  const now = useNow(1000)
  const edge = useEdgeInfo()
  const clock = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="big">
              ziqo<span>devs</span>
            </div>
            <p style={{ color: 'var(--muted)', marginTop: 14, maxWidth: '34ch', fontSize: 14 }}>
              Built by people who keep making things — from scratch, in public, from the edge.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, color: 'var(--faint)' }}>
              <Logo size={22} />
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em' }}>
                EST. 2026 · STILL BUILDING
              </span>
            </div>
          </div>

          <nav className="footer-links" aria-label="Sections">
            {NAV.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </nav>

          <nav className="footer-links" aria-label="GitHub">
            <a href={ORG_URL} target="_blank" rel="noreferrer">
              <Github size={14} /> ziqodevs
            </a>
            {PEOPLE.map((p) => (
              <a key={p.login} href={p.url} target="_blank" rel="noreferrer">
                <Github size={14} /> {p.login}
              </a>
            ))}
            <a href="#top">
              <ArrowUp size={14} /> back to top
            </a>
          </nav>

          <div className="footer-links" style={{ justifySelf: 'end' }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--muted)', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <Clock size={13} />
              {clock} <span style={{ color: 'var(--faint)' }}>your time</span>
            </span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
              edge: {edge?.colo ?? '…'} · {edge?.country ?? '…'}
            </span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--faint)' }}>
              react · typescript · workers
            </span>
          </div>
        </div>

        <div className="footer-base">
          <span>© {now.getFullYear()} ziqodevs — everything here is a work in progress</span>
          <span>
            no trackers <span className="dotsep">·</span> no cookies <span className="dotsep">·</span>{' '}
            one html entry, many ideas
          </span>
        </div>
      </div>
    </footer>
  )
}
