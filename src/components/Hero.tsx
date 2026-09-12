import { type CSSProperties } from 'react'
import { MARQUEE, ORG_URL } from '@/data/site'
import { useCountUp, useMagnetic, useScramble } from '@/hooks/useFx'
import { useInView } from '@/hooks/useReveal'
import { emit, toast } from '@/lib/bus'
import type { OrgData } from '@/lib/types'
import { ArrowDown, ArrowUpRight, TerminalIcon } from './Icons'

const TITLE = 'ziqodevs'

function Stat({ value, label, active }: { value: number | null; label: string; active: boolean }) {
  const shown = useCountUp(value ?? 0, active && value !== null)
  return (
    <div>
      <strong>{value === null ? '—' : shown}</strong>
      <span>{label}</span>
    </div>
  )
}

export function Hero({ org }: { org: OrgData | null }) {
  const { ref, inView } = useInView<HTMLHeadingElement>(0.2)
  const tagline = useScramble('build · think · create', inView, 24)
  const githubBtn = useMagnetic<HTMLAnchorElement>(0.22)
  const workBtn = useMagnetic<HTMLAnchorElement>(0.22)
  const termBtn = useMagnetic<HTMLButtonElement>(0.22)
  const statsInView = useInView<HTMLDivElement>(0.3)

  return (
    <>
      <section className="hero" id="top">
        <div className="container">
          <div className="hero-eyebrow reveal is-in">
            <span className="pulse" />
            independent developers · open source · experiments
          </div>

          <h1 className="hero-title" ref={ref}>
            <span className="row">
              {TITLE.split('').map((ch, i) => (
                <span
                  key={i}
                  className={`ch mask-line ${inView ? 'is-in' : ''}`}
                  style={{ '--d': `${i * 55}ms` } as CSSProperties}
                >
                  <span>{ch}</span>
                </span>
              ))}
            </span>
          </h1>

          <p className="hero-sub mono" aria-label="build, think, create">
            <span aria-hidden="true">{tagline || '\u00A0'}</span>
          </p>

          <p className="hero-sub">
            We build <b>software</b>, <b>games</b>, <b>tools</b>, <b>programming languages</b> and
            strange experiments. Some become projects. Some become lessons. Either way,{' '}
            <b>we keep building</b>.
          </p>

          <div className="hero-ctas">
            <a
              ref={githubBtn}
              className="btn btn-primary"
              href={ORG_URL}
              target="_blank"
              rel="noreferrer"
            >
              Explore GitHub
              <span className="btn-ico">
                <ArrowUpRight size={15} />
              </span>
            </a>
            <a ref={workBtn} className="btn" href="#work">
              See what we build
              <span className="btn-ico">
                <ArrowDown size={15} />
              </span>
            </a>
            <button
              ref={termBtn}
              className="btn"
              onClick={() => {
                emit('terminal:focus')
                toast('Shell attached — type `help`')
              }}
            >
              <TerminalIcon size={15} />
              Open a shell
            </button>
          </div>

          <div className="hero-stats" ref={statsInView.ref}>
            <Stat value={org?.totals.repos ?? null} label="public repos" active={statsInView.inView} />
            <Stat value={org?.totals.stars ?? null} label="stars earned" active={statsInView.inView} />
            <Stat value={org?.totals.languages ?? null} label="languages" active={statsInView.inView} />
            <Stat value={org ? 2 : null} label="humans" active={statsInView.inView} />
          </div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <i />
          scroll to explore
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((half) => (
            <span key={half}>
              {MARQUEE.map((word) => (
                <span key={`${half}-${word}`}>
                  {word} <b>◆</b>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
