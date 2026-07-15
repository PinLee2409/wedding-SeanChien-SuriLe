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
import { Reveal } from '../ui/Reveal'
import { RevealItem, SectionReveal } from '../ui/SectionReveal'
import { SmartImage } from '../ui/SmartImage'

interface GalleryLightboxImage {
  src: string
  alt: string
}

interface FeatureSpec {
  filename: string
  role: 'hero' | 'portrait'
  desktopSlot: string
  focus?: string
}

/** One generous centrepiece with four quiet portraits around its edges. */
const FEATURE_SPECS: FeatureSpec[] = [
  {
    filename: 'cuoi2_dsc09678.jpg',
    role: 'hero',
    desktopSlot:
      'lg:left-[16%] lg:top-[13%] lg:z-10 lg:w-[68%]',
  },
  {
    filename: 'cuoi1_t04-04-032.jpg',
    role: 'portrait',
    desktopSlot: 'lg:left-0 lg:top-[2%] lg:z-20 lg:w-[22%]',
  },
  {
    filename: 'cuoi2_dsc09667.jpg',
    role: 'portrait',
    desktopSlot: 'lg:right-0 lg:top-[2%] lg:z-20 lg:w-[22%]',
  },
  {
    filename: 'cuoi1_t04-04-193.jpg',
    role: 'portrait',
    desktopSlot: 'lg:bottom-[2%] lg:left-0 lg:z-20 lg:w-[22%]',
    focus: 'object-[50%_38%]',
  },
  {
    filename: 'cuoi2_dsc09717.jpg',
    role: 'portrait',
    desktopSlot: 'lg:bottom-[2%] lg:right-0 lg:z-20 lg:w-[22%]',
    focus: 'object-[50%_42%]',
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

/** Spread the two shoots proportionally, including at the loop boundary. */
function weaveSources(first: GalleryPhoto[], second: GalleryPhoto[]) {
  const result: GalleryPhoto[] = []
  const total = first.length + second.length
  let firstIndex = 0
  let secondIndex = 0

  for (let position = 0; position < total; position++) {
    const desiredFirstCount = Math.round(
      ((position + 1) * first.length) / total,
    )
    if (firstIndex < desiredFirstCount && firstIndex < first.length) {
      result.push(first[firstIndex])
      firstIndex += 1
    } else if (secondIndex < second.length) {
      result.push(second[secondIndex])
      secondIndex += 1
    } else if (firstIndex < first.length) {
      result.push(first[firstIndex])
      firstIndex += 1
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
).slice(0, 28)

function MarqueePhotoCard({ photo }: { photo: GalleryPhoto }) {
  return (
    <figure
      aria-hidden="true"
      className="group/tile relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-[1.35rem] border border-white/95 bg-white p-1 shadow-[0_16px_34px_-22px_rgba(27,42,74,0.68)] ring-1 ring-gold/15 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_22px_42px_-20px_rgba(27,42,74,0.76)] sm:h-28 sm:w-[5.25rem] sm:rounded-[1.6rem] sm:p-1.5 lg:h-32 lg:w-24"
    >
      <SmartImage
        src={photo.thumb}
        alt=""
        fit="cover"
        placeholder="bare"
        className="h-full w-full rounded-[inherit]"
        imgClassName="transition-transform duration-700 ease-out group-hover/tile:scale-[1.04]"
      />
    </figure>
  )
}

function HeartDivider() {
  return (
    <Heart
      className="h-3.5 w-3.5 shrink-0 fill-rose/45 text-rosegold/75 sm:h-4 sm:w-4"
      strokeWidth={1.25}
      aria-hidden="true"
    />
  )
}

function MarqueeSegment({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="photo-marquee-segment">
      {photos.map((photo) => (
        <Fragment key={photo.filename}>
          <MarqueePhotoCard photo={photo} />
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
        {photos.map((photo) => (
          <Fragment key={photo.filename}>
            <div className="snap-center">
              <MarqueePhotoCard photo={photo} />
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
      className="relative overflow-hidden bg-gradient-to-b from-warm-white via-ivory to-ivory py-16 sm:py-24 lg:py-28"
      aria-label={t.gallery.title}
    >
      <h2 className="sr-only">{t.gallery.title}</h2>

      <div
        className="pointer-events-none absolute inset-x-0 top-[18%] h-[62%] bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,var(--color-rose)_0%,transparent_72%)] opacity-[0.12]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[2.25rem] border border-white/90 bg-white/55 p-3 pb-6 shadow-[0_34px_90px_-54px_rgba(27,42,74,0.52)] ring-1 ring-gold/15 backdrop-blur-[2px] sm:rounded-[3rem] sm:p-7 sm:pb-8 lg:p-12 lg:pb-10">
          <div
            className="pointer-events-none absolute left-1/2 top-[42%] h-[70%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-warm-white)_0%,transparent_70%)] opacity-75 blur-2xl"
            aria-hidden="true"
          />

          <SectionReveal className="relative z-10 grid grid-cols-2 gap-3 sm:gap-5 lg:block lg:h-[clamp(36rem,52vw,43rem)]">
            {FEATURED_PHOTOS.map(({ photo, spec }, index) => {
              const label = `${t.gallery.photo} ${index + 1}`
              const hero = spec.role === 'hero'

              return (
                <RevealItem
                  key={photo.filename}
                  className={cn(
                    hero
                      ? 'col-span-2 aspect-[3/2]'
                      : 'col-span-1 aspect-[2/3]',
                    'min-h-0 lg:absolute',
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
                      'group block h-full w-full overflow-hidden border-[4px] border-white/95 bg-white shadow-[0_24px_58px_-30px_rgba(27,42,74,0.62)] ring-1 ring-gold/20 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_32px_68px_-28px_rgba(27,42,74,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ivory sm:border-[6px]',
                      hero
                        ? 'rounded-[1.75rem] sm:rounded-[2.5rem]'
                        : 'rounded-t-[999px] rounded-b-[1.5rem] sm:rounded-b-[2rem]',
                    )}
                  >
                    <SmartImage
                      src={photo.display}
                      alt={label}
                      fit="cover"
                      placeholder="bare"
                      className="h-full w-full"
                      imgClassName={cn(
                        'transition-transform duration-700 ease-out group-hover:scale-[1.025]',
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
            className="relative z-10 mt-7 border-t border-gold/15 pt-5 sm:mt-10 sm:pt-7 lg:mt-12 lg:pt-8"
          >
            <MarqueeLane
              photos={MIXED_MARQUEE_PHOTOS}
              duration={78}
              reduce={reduce}
              active={marqueeActive}
            />
          </Reveal>
        </div>
      </div>

      <GalleryLightbox
        key={lightboxImage?.src ?? 'closed'}
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </section>
  )
}
