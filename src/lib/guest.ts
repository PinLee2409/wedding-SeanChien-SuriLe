import type { Lang } from '../i18n/translations'

/** Helpers for personalised invitation URLs (frontend-only). */

export const GUEST_PARAM = 'guest'
export const VIEW_PARAM = 'view'
export const CARD_VIEW = 'card'
export const LANG_PARAM = 'lang'
export const MAX_GUEST_NAME_LENGTH = 80

/** Keep the printed name and the name opened from its QR exactly in sync. */
export function normaliseGuestName(name: string): string {
  return Array.from(name.trim()).slice(0, MAX_GUEST_NAME_LENGTH).join('')
}

/** Read + decode the guest name from the current (or given) query string. */
export function getGuestFromUrl(search: string = window.location.search): string {
  const params = new URLSearchParams(search)
  const raw = params.get(GUEST_PARAM)
  return raw ? normaliseGuestName(raw) : ''
}

/** Update the `guest` param in the address bar WITHOUT reloading the page. */
export function updateGuestInUrl(name: string): void {
  const url = new URL(window.location.href)
  const trimmed = normaliseGuestName(name)
  if (trimmed) {
    url.searchParams.set(GUEST_PARAM, trimmed)
  } else {
    url.searchParams.delete(GUEST_PARAM)
  }
  window.history.replaceState({}, '', url.toString())
}

/** Whether the current URL requests the standalone, scan-friendly card view. */
export function isCardViewFromUrl(
  search: string = window.location.search,
): boolean {
  return new URLSearchParams(search).get(VIEW_PARAM) === CARD_VIEW
}

/** Leave card view without losing the personalised guest or language params. */
export function clearCardViewInUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(VIEW_PARAM)
  window.history.replaceState({}, '', url.toString())
}

/**
 * Build a shareable, personalised invitation URL for a guest.
 * URLSearchParams safely encodes spaces, diacritics and punctuation.
 */
export function buildGuestUrl(name: string, baseUrl?: string): string {
  const base = baseUrl ?? `${window.location.origin}${window.location.pathname}`
  const url = new URL(base)
  url.search = ''
  url.hash = ''
  const trimmed = normaliseGuestName(name)
  if (trimmed) url.searchParams.set(GUEST_PARAM, trimmed)
  return url.toString()
}

/**
 * Build the canonical QR destination. The query route works on GitHub Pages,
 * preserves the guest name and opens the exact language used for the export.
 */
export function buildCardViewUrl(
  name: string,
  lang: Lang,
  baseUrl?: string,
): string {
  const url = new URL(
    buildGuestUrl(
      name,
      baseUrl ?? `${window.location.origin}${window.location.pathname}`,
    ),
  )
  url.searchParams.set(VIEW_PARAM, CARD_VIEW)
  url.searchParams.set(LANG_PARAM, lang)
  return url.toString()
}
