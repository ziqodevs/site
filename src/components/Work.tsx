import { PILLARS } from '@/data/site'
import { useSpotlight } from '@/hooks/useFx'
import { Reveal } from '@/hooks/useReveal'
import { PILLAR_GLYPHS } from './Icons'

function Pillar({ pillar, index }: { pillar: (typeof PILLARS)[number]; index: number }) {
  const ref = useSpotlight<HTMLElement>()
  const Glyph = PILLAR_GLYPHS[pillar.glyph]

  return (
    <Reveal delay={index * 70}>
      <article ref={ref} className="spotlight">
        <span className="num">/{pillar.num}</span>
        <span className="glyph">
          <Glyph size={26} />
        </span>
        <h3>{pillar.title}</h3>
        <p>{pillar.body}</p>
      </article>
    </Reveal>
  )
}

export function Work() {
  return (
    <section className="section" id="work">
      <div className="container">
        <Reveal className="section-head">
          <span className="section-index">02</span>
          <div>
            <h2 className="section-title">
              Build things.
              <br />
              Try things.
            </h2>
            <p className="section-copy" style={{ marginTop: 14 }}>
              There is no single box for what we make. That would be terribly convenient, and
              therefore suspicious.
            </p>
          </div>
        </Reveal>

        <div className="bento">
          {PILLARS.map((pillar, i) => (
            <Pillar key={pillar.num} pillar={pillar} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
