import { useState } from 'react'
import { PEOPLE } from '@/data/site'
import { useTilt } from '@/hooks/useFx'
import { Reveal } from '@/hooks/useReveal'
import type { Member, OrgData } from '@/lib/types'
import { ArrowUpRight, Pin } from './Icons'

function PersonCard({ person, index, member }: { person: (typeof PEOPLE)[number]; index: number; member?: Member }) {
  const ref = useTilt<HTMLAnchorElement>(5)
  const [broken, setBroken] = useState(false)
  const avatar = member?.avatar ?? null
  const initials = person.login.slice(0, 2).toUpperCase()

  return (
    <Reveal delay={index * 90}>
      <a
        ref={ref}
        className="person"
        href={person.url}
        target="_blank"
        rel="noreferrer"
        style={{ display: 'block', height: '100%' }}
      >
        {avatar && !broken ? (
          <img
            className="avatar"
            src={avatar}
            alt={`${person.login}'s avatar`}
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="avatar avatar-fallback" aria-hidden="true">
            {initials}
          </div>
        )}

        <h3>{person.name}</h3>
        <div className="role">{person.role}</div>
        <p className="bio">{person.bio}</p>

        <div className="meta">
          <span className="chip">
            <Pin size={11} />
            {person.location}
          </span>
          {person.chips.map((chip) => (
            <span className="chip" key={chip.label}>
              {chip.label} <b>{chip.value}</b>
            </span>
          ))}
          {member && <span className="chip">org member</span>}
        </div>

        <span className="visit">
          <ArrowUpRight size={18} />
        </span>
      </a>
    </Reveal>
  )
}

export function People({ org }: { org: OrgData | null }) {
  return (
    <section className="section" id="people">
      <div className="container">
        <Reveal className="section-head">
          <span className="section-index">04</span>
          <div>
            <h2 className="section-title">The people</h2>
            <p className="section-copy" style={{ marginTop: 14 }}>
              Small on purpose. Every commit has a human behind it, and every human has a GitHub
              profile (well — most of the time).
            </p>
          </div>
        </Reveal>

        <div className="people">
          {PEOPLE.map((person, i) => (
            <PersonCard
              key={person.login}
              person={person}
              index={i}
              member={org?.members.find((m) => m.login.toLowerCase() === person.login.toLowerCase())}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
