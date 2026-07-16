import { Fragment, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Heart, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useInView, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'
import {
  galleryPhotos,
  pickGalleryPhotos,
  type GalleryPhoto,
} from '../../lib/galleryPhotos'
import { useI18n } from '../../i18n/LanguageContext'
import { SectionRomance } from '../decorations/SectionRomance'
import { Reveal } from '../ui/Reveal'
import { RevealItem, SectionReveal } from '../ui/SectionReveal'
import { SmartImage } from '../ui/SmartImage'

interface GalleryLightboxImage {
  src: string
  alt: string
}

interface FeatureSpec {
  filename: string
  tabletSlot: string
  desktopSlot: string
  focus?: string
}

/**
 * Return to the earlier, balanced album rhythm: portrait pairs are broken up
 * by landscape frames so the grid stays full at every breakpoint.
 */
const FEATURE_SPECS: FeatureSpec[] = [
  {
    filename: 'cuoi1_t04-04-032.jpg',
    tabletSlot: 'md:col-start-1 md:row-start-1 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-1 lg:row-start-1 lg:row-span-4',
  },
  {
    filename: 'cuoi2_dsc09644.jpg',
    tabletSlot: 'md:col-start-3 md:row-start-1 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-7 lg:row-start-1 lg:row-span-4',
  },
  {
    filename: 'cuoi2_dsc09678.jpg',
    tabletSlot: 'md:col-start-1 md:row-start-4 md:col-span-3 md:row-span-2',
    desktopSlot: 'lg:col-start-4 lg:row-start-1 lg:row-span-2',
  },
  {
    filename: 'cuoi1_t04-04-293.jpg',
    tabletSlot: 'md:col-start-4 md:row-start-4 md:col-span-3 md:row-span-2',
    desktopSlot: 'lg:col-start-4 lg:row-start-3 lg:row-span-2',
  },
  {
    filename: 'cuoi1_t04-04-193.jpg',
    tabletSlot: 'md:col-start-5 md:row-start-1 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-10 lg:row-start-1 lg:row-span-4',
  },
  {
    filename: 'cuoi2_dsc09667.jpg',
    tabletSlot: 'md:col-start-1 md:row-start-6 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-1 lg:row-start-5 lg:row-span-4',
  },
  {
    filename: 'cuoi1_t04-04-151.jpg',
    tabletSlot: 'md:col-start-3 md:row-start-6 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-4 lg:row-start-5 lg:row-span-4',
  },
  {
    filename: 'cuoi2_dsc09717.jpg',
    tabletSlot: 'md:col-start-5 md:row-start-6 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-10 lg:row-start-5 lg:row-span-4',
  },
  {
    filename: 'cuoi1_t04-04-248.jpg',
    tabletSlot: 'md:col-start-1 md:row-start-9 md:col-span-3 md:row-span-2',
    desktopSlot: 'lg:col-start-7 lg:row-start-5 lg:row-span-2',
  },
  {
    filename: 'cuoi1_t04-04-327.jpg',
    tabletSlot: 'md:col-start-4 md:row-start-9 md:col-span-3 md:row-span-2',
    desktopSlot: 'lg:col-start-7 lg:row-start-7 lg:row-span-2',
  },
]

const FEATURED_PHOTOS = FEATURE_SPECS.flatMap((spec) => {
  const [photo] = pickGalleryPhotos([spec.filename])
  return photo ? [{ spec, photo }] : []
})

function stablePhotoScore(photo: GalleryPhoto, seed: number) {
  let value = seed
  for (const character of photo.filename) {
    value = Math.imul(value ^ character.charCodeAt(0), 16_777_619)
  }
  return value >>> 0
}

/** Stable mixing avoids both repeated poses and a visual jump on reload. */
function mixPhotos(photos: GalleryPhoto[], seed: number) {
  return [...photos].sort(
    (first, second) =>
      stablePhotoScore(first, seed) - stablePhotoScore(second, seed),
  )
}

/**
 * Round-robin every shoot so the marquee feels like one shared album. Keeping
 * equal opening runs also guarantees all eleven Cuoi3 moments are visible.
 */
function weaveSources(...sources: GalleryPhoto[][]) {
  const result: GalleryPhoto[] = []
  const longestSource = Math.max(0, ...sources.map((source) => source.length))

  for (let index = 0; index < longestSource; index++) {
    for (const source of sources) {
      const photo = source[index]
      if (photo) result.push(photo)
    }
  }

  return result
}

const MIXED_MARQUEE_PHOTOS = weaveSources(
  mixPhotos(
    galleryPhotos.filter((photo) => photo.filename.startsWith('cuoi1_')),
    0x1a2b3c,
  ),
  mixPhotos(
    galleryPhotos.filter((photo) => photo.filename.startsWith('cuoi2_')),
    0x4d5e6f,
  ),
  mixPhotos(
    galleryPhotos.filter((photo) => photo.filename.startsWith('cuoi3_')),
    0x7a8b9c,
  ),
).slice(0, 33)

const SOFT_TILTS = [
  'rotate-[-0.65deg]',
  'rotate-[0.55deg]',
  'rotate-[-0.25deg]',
  'rotate-[0.35deg]',
] as const

/** A slightly more playful rhythm for the moving strip, repeated verbatim in
 * both marquee segments so the infinite-loop seam stays perfectly aligned. */
const MARQUEE_TILTS = [
  '-rotate-[2.15deg] translate-y-1',
  'rotate-[1.55deg] -translate-y-1',
  '-rotate-[1.05deg] translate-y-0.5',
  'rotate-[2.25deg] translate-y-1',
  '-rotate-[1.65deg] -translate-y-0.5',
  'rotate-[0.9deg] -translate-y-1',
] as const

function MarqueePhotoCard({
  photo,
  index,
}: {
  photo: GalleryPhoto
  index: number
}) {
  return (
    <figure
      aria-hidden="true"
      className={cn(
        'group/tile relative h-24 shrink-0 overflow-hidden rounded-[1.3rem] bg-gradient-to-br from-white via-white to-rose/20 p-[3px] shadow-[0_18px_38px_-22px_rgba(27,42,74,0.7)] ring-1 ring-rosegold/20 transition-[transform,box-shadow] duration-500 ease-out hover:z-10 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_24px_46px_-20px_rgba(27,42,74,0.76)] sm:h-28 sm:rounded-[1.55rem] sm:p-1 lg:h-32',
        photo.orientation === 'landscape'
          ? 'w-36 sm:w-[10.5rem] lg:w-48'
          : 'w-[4.9rem] sm:w-[5.75rem] lg:w-[6.6rem]',
        MARQUEE_TILTS[index % MARQUEE_TILTS.length],
      )}
    >
      <SmartImage
        src={photo.thumb}
        alt=""
        fit="cover"
        placeholder="bare"
        className="h-full w-full rounded-[1.05rem] ring-1 ring-navy/5 sm:rounded-[1.25rem]"
        imgClassName={cn(
          'transition-transform duration-700 ease-out group-hover/tile:scale-[1.04]',
          photo.orientation === 'portrait'
            ? 'object-[center_35%]'
            : 'object-center',
        )}
      />
    </figure>
  )
}

function HeartDivider() {
  return (
    <span
      className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/65 shadow-[0_8px_20px_-12px_rgba(122,63,104,0.72)] ring-1 ring-rosegold/10"
      aria-hidden="true"
    >
      <Heart
        className="h-3 w-3 fill-rose/55 text-rosegold/75"
        strokeWidth={1.25}
      />
    </span>
  )
}

function MarqueeSegment({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="photo-marquee-segment">
      {photos.map((photo, index) => (
        <Fragment key={photo.filename}>
          <MarqueePhotoCard photo={photo} index={index} />
          <HeartDivider />
        </Fragment>
      ))}
    </div>
  )
}

function MarqueeLane({
  photos,
  duration,
  reduce,
  active,
}: {
  photos: GalleryPhoto[]
  duration: number
  reduce: boolean
  active: boolean
}) {
  if (photos.length === 0) return null

  if (reduce) {
    return (
      <div
        className="flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
        aria-label="Photo strip"
      >
        {photos.map((photo, index) => (
          <Fragment key={photo.filename}>
            <div className="snap-center">
              <MarqueePhotoCard photo={photo} index={index} />
            </div>
            <HeartDivider />
          </Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className="photo-marquee py-2 sm:py-3">
      <div
        className={cn(
          'photo-marquee-track',
          !active && 'photo-marquee-track--paused',
        )}
        style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
        aria-hidden="true"
      >
        <MarqueeSegment photos={photos} />
        <div className="shrink-0" aria-hidden="true">
          <MarqueeSegment photos={photos} />
        </div>
      </div>
    </div>
  )
}

function GalleryLightbox({
  image,
  onClose,
}: {
  image: GalleryLightboxImage | null
  onClose: () => void
}) {
  const { t } = useI18n()
  const [zoomed, setZoomed] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!image) return undefined

    const previousOverflow = document.body.style.overflow
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>('button') ?? [],
      ).filter((element) => !element.hasAttribute('disabled'))
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [image, onClose])

  if (!image) return null

  const zoomLabel = zoomed ? t.ui.unzoomPhoto : t.ui.zoomPhoto

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/88 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        aria-label={t.ui.close}
        onClick={onClose}
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-warm-white/95 text-navy shadow-lg transition hover:-translate-y-0.5 hover:text-gold-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <X className="h-5 w-5" strokeWidth={1.8} />
      </button>

      <button
        type="button"
        aria-label={zoomLabel}
        onClick={(event) => {
          event.stopPropagation()
          setZoomed((value) => !value)
        }}
        className={cn(
          'relative max-h-[88vh] max-w-[96vw] overflow-hidden rounded-2xl border border-gold/25 bg-navy/30 shadow-2xl',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-navy',
          zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
        )}
      >
        <img
          src={image.src}
          alt={image.alt}
          className={cn(
            'block max-h-[88vh] max-w-[96vw] object-contain transition-transform duration-300 ease-out',
            zoomed && 'scale-[1.65]',
          )}
        />
        <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-warm-white/95 text-navy shadow-md">
          {zoomed ? (
            <ZoomOut className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <ZoomIn className="h-4 w-4" strokeWidth={1.8} />
          )}
        </span>
      </button>
    </div>,
    document.body,
  )
}

export function MediaGallery() {
  const { t } = useI18n()
  const reduce = !!useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const marqueeActive = useInView(sectionRef, { margin: '240px 0px' })
  const [lightboxImage, setLightboxImage] = useState<GalleryLightboxImage | null>(
    null,
  )

  if (FEATURED_PHOTOS.length === 0) return null

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="relative overflow-hidden bg-gradient-to-b from-warm-white via-ivory to-ivory py-12 sm:py-16 lg:py-20"
      aria-label={t.gallery.title}
    >
      <h2 className="sr-only">{t.gallery.title}</h2>
      <SectionRomance direction="ltr" planeTop="47%" />

      <div
        className="pointer-events-none absolute inset-x-0 top-1/4 h-1/2 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,var(--color-rose)_0%,transparent_72%)] opacity-[0.12]"
        aria-hidden="true"
      />

      <SectionReveal className="relative z-10 mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-1 sm:gap-4 sm:px-7 md:grid-cols-6 md:auto-rows-[clamp(7.125rem,15vw,9.5rem)] lg:grid-cols-12 lg:auto-rows-[clamp(5rem,6.6vw,5.75rem)] lg:gap-5 lg:px-10">
        {FEATURED_PHOTOS.map(({ photo, spec }, index) => {
          const label = `${t.gallery.photo} ${index + 1}`

          return (
            <RevealItem
              key={photo.filename}
              className={cn(
                'min-h-0',
                photo.orientation === 'landscape'
                  ? 'col-span-2 aspect-[3/2]'
                  : 'col-span-1 aspect-[2/3]',
                'md:aspect-auto',
                spec.tabletSlot,
                'lg:col-span-3',
                spec.desktopSlot,
              )}
            >
              <button
                type="button"
                aria-label={label}
                onClick={() =>
                  setLightboxImage({ src: photo.full, alt: label })
                }
                className={cn(
                  'group block h-full w-full overflow-hidden rounded-[1.25rem] border-[3px] border-white/95 bg-white shadow-[0_20px_48px_-28px_rgba(27,42,74,0.68)] ring-1 ring-gold/15 transition-[transform,box-shadow] duration-500 hover:z-20 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_28px_58px_-26px_rgba(27,42,74,0.74)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ivory sm:rounded-[1.65rem] sm:border-4',
                  SOFT_TILTS[index % SOFT_TILTS.length],
                )}
              >
                <SmartImage
                  src={photo.display}
                  alt={label}
                  fit="cover"
                  placeholder="bare"
                  className="h-full w-full rounded-[inherit]"
                  imgClassName={cn(
                    'transition-transform duration-700 ease-out group-hover:scale-[1.03]',
                    spec.focus,
                  )}
                />
              </button>
            </RevealItem>
          )
        })}
      </SectionReveal>

      <Reveal
        delay={0.08}
        className="relative z-10 mt-9 border-y border-gold/10 bg-white/25 py-2 sm:mt-12 sm:py-3"
      >
        <MarqueeLane
          photos={MIXED_MARQUEE_PHOTOS}
          duration={74}
          reduce={reduce}
          active={marqueeActive}
        />
      </Reveal>

      <GalleryLightbox
        key={lightboxImage?.src ?? 'closed'}
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </section>
  )
}
