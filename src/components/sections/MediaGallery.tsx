import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
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
  tabletSlot: string
  desktopSlot: string
  focus?: string
}

/** Mobile order is P, P, L, L, P, P, P, P, L, L so every row closes. */
const FEATURE_SPECS: FeatureSpec[] = [
  {
    filename: 'cuoi1_t04-04-032.jpg',
    tabletSlot: 'md:col-start-1 md:row-start-1 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-1 lg:row-start-1 lg:row-span-4',
  },
  {
    filename: 'cuoi1_t04-04-193.jpg',
    tabletSlot: 'md:col-start-3 md:row-start-1 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-7 lg:row-start-1 lg:row-span-4',
  },
  {
    filename: 'cuoi1_t04-04-248.jpg',
    tabletSlot: 'md:col-start-1 md:row-start-4 md:col-span-3 md:row-span-2',
    desktopSlot: 'lg:col-start-4 lg:row-start-1 lg:row-span-2',
  },
  {
    filename: 'cuoi1_t04-04-293.jpg',
    tabletSlot: 'md:col-start-4 md:row-start-4 md:col-span-3 md:row-span-2',
    desktopSlot: 'lg:col-start-4 lg:row-start-3 lg:row-span-2',
  },
  {
    filename: 'cuoi2_dsc09644.jpg',
    tabletSlot: 'md:col-start-5 md:row-start-1 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-10 lg:row-start-1 lg:row-span-4',
  },
  {
    filename: 'cuoi2_dsc09667.jpg',
    tabletSlot: 'md:col-start-1 md:row-start-6 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-1 lg:row-start-5 lg:row-span-4',
  },
  {
    filename: 'cuoi2_dsc09704.jpg',
    tabletSlot: 'md:col-start-3 md:row-start-6 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-4 lg:row-start-5 lg:row-span-4',
    focus: 'object-[50%_62%]',
  },
  {
    filename: 'cuoi2_dsc09717.jpg',
    tabletSlot: 'md:col-start-5 md:row-start-6 md:col-span-2 md:row-span-3',
    desktopSlot: 'lg:col-start-10 lg:row-start-5 lg:row-span-4',
  },
  {
    filename: 'cuoi2_dsc09678.jpg',
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

const LANE_A = galleryPhotos.filter((_, index) => index % 2 === 0)
const LANE_B = galleryPhotos
  .filter((_, index) => index % 2 === 1)
  .reverse()

function MarqueePhotoCard({ photo, index }: { photo: GalleryPhoto; index: number }) {
  return (
    <SmartImage
      src={photo.thumb}
      alt=""
      fit="cover"
      placeholder="bare"
      className={cn(
        'group/tile relative h-28 shrink-0 overflow-hidden border border-white/80 shadow-[0_16px_34px_-22px_rgba(27,42,74,0.72)] ring-1 ring-gold/15 sm:h-36',
        photo.orientation === 'landscape' ? 'aspect-[3/2]' : 'aspect-[2/3]',
        index % 3 === 0
          ? 'rounded-[1.35rem]'
          : index % 3 === 1
            ? 'rounded-t-[3rem] rounded-b-[1.1rem]'
            : 'rounded-[1.1rem]',
      )}
      imgClassName="transition-transform duration-700 ease-out group-hover/tile:scale-[1.035]"
    />
  )
}

function MarqueeSegment({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="photo-marquee-segment">
      {photos.map((photo, index) => (
        <MarqueePhotoCard
          key={`${photo.filename}-${index}`}
          photo={photo}
          index={index}
        />
      ))}
    </div>
  )
}

function MarqueeLane({
  photos,
  reverse = false,
  duration,
  reduce,
  active,
}: {
  photos: GalleryPhoto[]
  reverse?: boolean
  duration: number
  reduce: boolean
  active: boolean
}) {
  if (photos.length === 0) return null

  if (reduce) {
    return (
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-6">
        {photos.map((photo, index) => (
          <div key={photo.filename} className="snap-center">
            <MarqueePhotoCard photo={photo} index={index} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="photo-marquee">
      <div
        className={cn(
          'photo-marquee-track',
          reverse && 'photo-marquee-track--reverse',
          !active && 'photo-marquee-track--paused',
        )}
        style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
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
  const reduce = useReducedMotion()
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

      <div
        className="pointer-events-none absolute inset-x-0 top-1/4 h-1/2 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,var(--color-rose)_0%,transparent_72%)] opacity-[0.12]"
        aria-hidden="true"
      />

      <SectionReveal className="relative z-10 mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 sm:gap-4 sm:px-6 md:grid-cols-6 md:auto-rows-[clamp(7.125rem,15vw,9.5rem)] lg:grid-cols-12 lg:auto-rows-[clamp(5rem,6.6vw,5.75rem)]">
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
                className="group block h-full w-full overflow-hidden rounded-[1.35rem] border border-white/85 shadow-[0_22px_52px_-28px_rgba(27,42,74,0.62)] ring-1 ring-gold/15 transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_58px_-26px_rgba(27,42,74,0.72)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ivory sm:rounded-[1.8rem]"
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

      <Reveal delay={0.08} className="relative z-10 mt-10 sm:mt-14">
        <div className="flex flex-col gap-3 sm:gap-4">
          <MarqueeLane
            photos={LANE_A}
            duration={72}
            reduce={!!reduce}
            active={marqueeActive}
          />
          <MarqueeLane
            photos={LANE_B}
            reverse
            duration={68}
            reduce={!!reduce}
            active={marqueeActive}
          />
        </div>
      </Reveal>

      <GalleryLightbox
        key={lightboxImage?.src ?? 'closed'}
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </section>
  )
}
