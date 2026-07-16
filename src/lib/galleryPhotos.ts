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

const LANDSCAPE_FILENAMES = new Set([
  'cuoi1_t04-04-248.jpg',
  'cuoi1_t04-04-293.jpg',
  'cuoi1_t04-04-327.jpg',
  'cuoi2_dsc09678.jpg',
  'cuoi3_dscf0859.jpg',
  'cuoi3_dscf9011.jpg',
  'cuoi3_dscf9015.jpg',
  'cuoi3_dscf9017.jpg',
  'cuoi3_dscf9029.jpg',
  'cuoi3_dscf9054.jpg',
  'cuoi3_dscf9107.jpg',
])

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

export function pickGalleryPhotos(filenames: readonly string[]) {
  return filenames
    .map((filename) => photosByFilename.get(filename))
    .filter((photo): photo is GalleryPhoto => Boolean(photo))
}
