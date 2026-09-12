import { ORG_URL } from '@/data/site'
import { useMagnetic } from '@/hooks/useFx'
import { Reveal } from '@/hooks/useReveal'
import { useEdgeInfo } from '@/hooks/useOrg'
import { toast } from '@/lib/bus'
import { ArrowUpRight, Copy, Zap } from './Icons'

const DEPLOY_CMD = 'npx wrangler deploy'

export function EdgeCta() {
  const edge = useEdgeInfo()
  const githubBtn = useMagnetic<HTMLAnchorElement>(0.2)
  const copyBtn = useMagnetic<HTMLButtonElement>(0.2)

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('no clipboard')
      await navigator.clipboard.writeText(DEPLOY_CMD)
      toast('Copied — npx wrangler deploy')
    } catch {
      toast('Clipboard blocked — the command is: npx wrangler deploy')
    }
  }

  return (
    <section className="section" id="edge">
      <div className="container">
        <Reveal>
          <div className="cta-panel">
            <div className="section-label" style={{ marginBottom: 22 }}>
              05 / keep building
            </div>
            <h2 className="cta-title">
              Ideas become
              <br />
              <span className="line2">real projects.</span>
            </h2>
            <p className="section-copy" style={{ margin: '22px auto 34px', maxWidth: '46ch' }}>
              Follow the code, poke at the experiments, and see what gets built next. Or deploy
              your own copy of this exact site in one command.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a ref={githubBtn} className="btn btn-primary" href={ORG_URL} target="_blank" rel="noreferrer">
                Visit ziqodevs on GitHub
                <span className="btn-ico">
                  <ArrowUpRight size={15} />
                </span>
              </a>
              <button ref={copyBtn} className="btn" onClick={copy}>
                <Copy size={15} />
                <span className="mono" style={{ fontSize: 13 }}>
                  {DEPLOY_CMD}
                </span>
              </button>
            </div>

            <div className="edge-readout" aria-label="Edge delivery information">
              <span className="edge-chip">
                <span className="live" />
                served by <b>cloudflare workers</b>
              </span>
              <span className="edge-chip">
                <Zap size={12} />
                colo <b>{edge?.colo ?? '…'}</b>
              </span>
              <span className="edge-chip">
                country <b>{edge?.country ?? '…'}</b>
              </span>
              {edge?.tls && (
                <span className="edge-chip">
                  tls <b>{edge.tls}</b>
                </span>
              )}
              {edge?.ray && (
                <span className="edge-chip">
                  ray <b>{edge.ray}</b>
                </span>
              )}
              <span className="edge-chip">
                build <b>{edge?.version && edge.version !== 'dev' ? `v${edge.version}` : 'local'}</b>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
