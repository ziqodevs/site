/**
 * A 40-line typed event bus. Components communicate through named events
 * instead of prop-drilling or a context tree — keeps the tree shallow and the
 * bundle small.
 */

export type BusEvents = {
  'toast:show': { message: string; icon?: string }
  'palette:open': { initial?: string }
  'palette:close': undefined
  'terminal:focus': undefined
  'theme:set': { theme: 'dark' | 'light' }
  'accent:set': { accent: string }
}

type Handler<T> = (payload: T) => void

const handlers = new Map<string, Set<Handler<never>>>(new Map())

export function on<K extends keyof BusEvents>(event: K, handler: Handler<BusEvents[K]>): () => void {
  let set = handlers.get(event)
  if (!set) {
    set = new Set()
    handlers.set(event, set)
  }
  set.add(handler as Handler<never>)
  return () => set!.delete(handler as Handler<never>)
}

export function emit<K extends keyof BusEvents>(event: K, ...args: BusEvents[K] extends undefined ? [] : [BusEvents[K]]): void {
  const set = handlers.get(event)
  if (!set) return
  for (const handler of set) (handler as Handler<BusEvents[K]>)(args[0] as BusEvents[K])
}

/* convenience shorthands used across the app */
export const toast = (message: string, icon?: string): void => emit('toast:show', { message, icon })
export const openPalette = (initial?: string): void => emit('palette:open', { initial })
