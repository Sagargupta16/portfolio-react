import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'
const subscribe = callback => {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}
const getSnapshot = () => window.matchMedia(query).matches

const useReducedMotion = () => {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export default useReducedMotion
