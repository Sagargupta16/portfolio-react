import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

const getServerSnapshot = () => false

const subscribe = callback => {
  if (globalThis.window == null) return () => {}
  const mql = globalThis.matchMedia(query)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

const getSnapshot = () => {
  if (globalThis.window == null) return false
  return globalThis.matchMedia(query).matches
}

const useReducedMotion = () => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export default useReducedMotion
