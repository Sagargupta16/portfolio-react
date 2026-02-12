import { useMemo, useSyncExternalStore } from 'react'

const useMediaQuery = (query = '(max-width: 768px)') => {
  const subscribe = useMemo(() => {
    return callback => {
      const mql = globalThis.matchMedia(query)
      mql.addEventListener('change', callback)
      return () => mql.removeEventListener('change', callback)
    }
  }, [query])

  const getSnapshot = () => globalThis.matchMedia(query).matches

  return useSyncExternalStore(subscribe, getSnapshot)
}

export default useMediaQuery
