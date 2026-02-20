import { useCallback, useMemo, useSyncExternalStore } from 'react'

const getServerSnapshot = () => false

const useMediaQuery = (query = '(max-width: 768px)') => {
  const isClient = typeof window !== 'undefined'
  
  const mql = useMemo(() => {
    return isClient ? window.matchMedia(query) : null
  }, [query, isClient])

  const subscribe = useCallback(
    callback => {
      if (!mql) return () => {}
      mql.addEventListener('change', callback)
      return () => mql.removeEventListener('change', callback)
    },
    [mql]
  )

  const getSnapshot = useCallback(() => (mql ? mql.matches : false), [mql])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export default useMediaQuery
