import { useCallback, useEffect, useState } from 'react'
import {
  getGuestFromUrl,
  normaliseGuestName,
  updateGuestInUrl,
} from '../lib/guest'

/**
 * Guest-name state kept in sync with the `?guest=` URL param.
 * Reading uses URLSearchParams; writing updates the URL without a reload.
 */
export function useGuestName() {
  const [guestName, setGuestNameState] = useState<string>(() =>
    typeof window === 'undefined' ? '' : getGuestFromUrl(),
  )

  // Keep in sync when the user navigates back/forward.
  useEffect(() => {
    const onPopState = () => setGuestNameState(getGuestFromUrl())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setGuestName = useCallback((name: string) => {
    const trimmed = normaliseGuestName(name)
    setGuestNameState(trimmed)
    updateGuestInUrl(trimmed)
  }, [])

  return { guestName, setGuestName, hasGuest: guestName.length > 0 }
}
