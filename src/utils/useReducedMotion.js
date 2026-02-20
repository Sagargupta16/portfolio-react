import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

const getServerSnapshot = () => false

const subscribe = callback => {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia(query)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

const getSnapshot = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

const useReducedMotion = () => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export default useReducedMotion
