import { useEffect, useState } from 'react'
import { getState, subscribe } from './db'

/**
 * Re-renders the caller whenever the demo store changes, so pages can just read
 * `getState()` synchronously and stay in sync with any mutation (including ones
 * made from another tab via the storage event).
 */
export function useDb() {
  const [, force] = useState(0)

  useEffect(() => {
    const unsub = subscribe(() => force((n) => n + 1))
    const onStorage = (e) => {
      if (e.key === 'cryptoforge.db') force((n) => n + 1)
    }
    window.addEventListener('storage', onStorage)
    return () => {
      unsub()
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return getState()
}
