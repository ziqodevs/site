import { useCallback, useEffect, useState } from 'react'
import { cachedOrgData, fetchEdge, fetchOrgData } from '@/lib/api'
import type { EdgeInfo, OrgData } from '@/lib/types'

type Status = 'loading' | 'ready' | 'error'

/** org + repos + members, painted from cache first and revalidated in background */
export function useOrgData() {
  const [data, setData] = useState<OrgData | null>(() => cachedOrgData())
  const [status, setStatus] = useState<Status>(data ? 'ready' : 'loading')

  const refresh = useCallback(async () => {
    try {
      setStatus('loading')
      const next = await fetchOrgData()
      setData(next)
      setStatus('ready')
    } catch {
      setStatus((s) => (s === 'ready' ? 'ready' : 'error'))
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, status, refresh }
}

/** the Cloudflare datacenter answering this request */
export function useEdgeInfo() {
  const [edge, setEdge] = useState<EdgeInfo | null>(null)

  useEffect(() => {
    let alive = true
    fetchEdge()
      .then((info) => {
        if (alive) setEdge(info)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  return edge
}
