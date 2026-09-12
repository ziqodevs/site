import { Header } from '@/components/Header'
import { Backdrop } from '@/components/Backdrop'
import { Cursor } from '@/components/Cursor'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Work } from '@/components/Work'
import { Repos } from '@/components/Repos'
import { People } from '@/components/People'
import { EdgeCta } from '@/components/EdgeCta'
import { Footer } from '@/components/Footer'
import { CommandPalette } from '@/components/CommandPalette'
import { Toaster } from '@/components/Toaster'
import { useOrgData } from '@/hooks/useOrg'
import { useAccent, useTheme } from '@/hooks/useTheme'

export default function App() {
  const { theme, setTheme, toggle } = useTheme()
  const { accent, setAccent } = useAccent()
  const { data: org, status, refresh } = useOrgData()

  return (
    <>
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      <Backdrop />
      <Cursor />
      <div className="grain" aria-hidden="true" />

      <Header />

      <main>
        <Hero org={org} />
        <About org={org} theme={theme} accent={accent} setTheme={setTheme} setAccent={setAccent} />
        <Work />
        <Repos org={org} status={status} refresh={refresh} />
        <People org={org} />
        <EdgeCta />
      </main>

      <Footer />

      <CommandPalette
        org={org}
        theme={theme}
        accent={accent}
        toggleTheme={toggle}
        setAccent={setAccent}
        refresh={refresh}
      />
      <Toaster />
    </>
  )
}
