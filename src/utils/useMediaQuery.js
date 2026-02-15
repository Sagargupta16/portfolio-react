import { useCallback, useMemo, useSyncExternalStore } from 'react'

const useMediaQuery = (query = '(max-width: 768px)') => {
  const mql = useMemo(() => globalThis.matchMedia(query), [query])

  const subscribe = useCallback(
    callback => {
      mql.addEventListener('change', callback)
      return () => mql.removeEventListener('change', callback)
    },
    [mql]
  )

  const getSnapshot = useCallback(() => mql.matches, [mql])

  return useSyncExternalStore(subscribe, getSnapshot)
}

export default useMediaQuery
