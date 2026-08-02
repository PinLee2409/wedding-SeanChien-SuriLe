import slots from '../config/photoSlots.json'
import { pickGalleryPhotos } from './galleryPhotos'
import type { GalleryPhoto } from './galleryPhotos'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PHOTO SLOTS — which photograph sits where.
 * ─────────────────────────────────────────────────────────────────────────────
 *  The assignments live in `photoSlots.json` so the dev-only admin page can
 *  rewrite them without anyone editing component source. Components keep their
 *  own layout, cropping and ordering; they only ask here for the photographs.
 *
 *  A name that no longer exists in the gallery is dropped rather than rendered
 *  as a placeholder, so culling a photo can never leave a broken tile behind.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type PhotoSlotKey =
  | 'hero'
  | 'timeline'
  | 'boardingPass'
  | 'downloadScene'
  | 'galleryGrid'

const assignments = slots as Record<string, unknown>

/** Filenames assigned to a slot group, in order. */
export function slotFilenames(key: PhotoSlotKey): string[] {
  const value = assignments[key]
  return Array.isArray(value) ? value.filter((n): n is string => typeof n === 'string') : []
}

/** Resolved photographs for a slot group, in order, missing names skipped. */
export function slotPhotos(key: PhotoSlotKey): GalleryPhoto[] {
  return pickGalleryPhotos(slotFilenames(key))
}
