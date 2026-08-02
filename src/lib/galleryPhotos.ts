import landscapeConfig from '../config/landscapePhotos.json'

export type PhotoOrientation = 'portrait' | 'landscape'

export interface GalleryPhoto {
  filename: string
  thumb: string
  display: string
  full: string
  orientation: PhotoOrientation
}

const thumbModules = import.meta.glob('../assets/marquee/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const displayModules = import.meta.glob('../assets/gallery/display/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const fullModules = import.meta.glob('../assets/gallery/full/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const LANDSCAPE_FILENAMES = new Set(landscapeConfig.landscape)

function filenameFromPath(path: string) {
  return path.split('/').pop() ?? path
}

function urlsByFilename(modules: Record<string, string>) {
  return new Map(
    Object.entries(modules).map(([path, url]) => [filenameFromPath(path), url]),
  )
}

const thumbByFilename = urlsByFilename(thumbModules)
const fullByFilename = urlsByFilename(fullModules)

export const galleryPhotos: GalleryPhoto[] = Object.entries(displayModules)
  .map(([path, display]) => {
    const filename = filenameFromPath(path)
    return {
      filename,
      thumb: thumbByFilename.get(filename) ?? display,
      display,
      full: fullByFilename.get(filename) ?? display,
      orientation: LANDSCAPE_FILENAMES.has(filename)
        ? ('landscape' as const)
        : ('portrait' as const),
    }
  })
  .sort((a, b) => a.filename.localeCompare(b.filename))

const photosByFilename = new Map(
  galleryPhotos.map((photo) => [photo.filename, photo]),
)

/**
 * The three renditions as a srcset so the browser fetches the smallest file
 * that still covers the box it is painted into. Widths are the nominal ones for
 * each orientation — a few percent out on an unusual crop only ever costs one
 * step up, never a wrong image.
 */
export function photoSrcSet(photo: GalleryPhoto): string {
  const widths =
    photo.orientation === 'landscape' ? [1200, 1600, 2400] : [800, 1067, 1600]
  return [photo.thumb, photo.display, photo.full]
    .map((url, index) => `${url} ${widths[index]}w`)
    .join(', ')
}

export function pickGalleryPhotos(filenames: readonly string[]) {
  return filenames
    .map((filename) => photosByFilename.get(filename))
    .filter((photo): photo is GalleryPhoto => Boolean(photo))
}
