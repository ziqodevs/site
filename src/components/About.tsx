import { STATEMENT } from '@/data/site'
import { useFillProgress } from '@/hooks/useScroll'
import { Reveal } from '@/hooks/useReveal'
import type { TerminalProps } from './Terminal'
import { Terminal } from './Terminal'

const TAGS = [
  'from scratch',
  'no templates',
  'ship small',
  'break often',
  'read the source',
  'weird on purpose',
  'documented (sometimes)',
]

export function About(props: TerminalProps) {
  const fillRef = useFillProgress<HTMLParagraphElement>()

  return (
    <section className="section" id="about">
      <div className="container">
        <Reveal className="section-head">
          <span className="section-index">01</span>
          <div>
            <h2 className="section-title">About the group</h2>
            <p className="section-copy" style={{ marginTop: 14 }}>
              Two developers, one organisation account, and a long list of things that needed to
              exist.
            </p>
          </div>
        </Reveal>

        <div className="about-grid">
          <Reveal>
            <p className="statement" ref={fillRef}>
              {STATEMENT}
            </p>
            <div className="about-tags" style={{ marginTop: 34 }}>
              {TAGS.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="about-side">
            <p className="about-copy">
              We are an independent developer group focused on making things from scratch. The work
              ranges from tiny utilities and web projects to games, developer tools, experimental
              software and programming languages.
            </p>
            <p className="about-copy">
              There is no roadmap and no product team. There is an idea, a keyboard, and an
              unreasonable amount of curiosity. The terminal below is real — it answers to a small
              set of commands.
            </p>
            <Terminal {...props} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
