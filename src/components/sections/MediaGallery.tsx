import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'
import { useI18n } from '../../i18n/LanguageContext'
import { Reveal } from '../ui/Reveal'
import { RevealItem, SectionReveal } from '../ui/SectionReveal'
import { SmartImage } from '../ui/SmartImage'

interface PhotoEntry {
  filename: string
  src: string
}

interface GalleryLightboxImage {
  src: string
  alt: string
}

const PHOTO_ENTRIES = Object.entries(
  import.meta.glob('../../assets/marquee/*.jpg', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => ({
    filename: path.split('/').pop() ?? path,
    src: src as string,
  })) satisfies PhotoEntry[]

const PHOTO_POOL = PHOTO_ENTRIES.map(({ src }) => src)

/**
 * A small editorial selection anchors the section. The complete photo set
 * remains available in the two moving lanes below, so every visit feels a
 * little different without changing the carefully balanced first view.
 */
const FEATURED_FILENAMES = [
  'cuoi1_t04-04-032.jpg',
  'cuoi1_t04-04-193.jpg',
  'cuoi1_t04-04-248.jpg',
  'cuoi1_t04-04-293.jpg',
  'cuoi2_dsc09644.jpg',
  'cuoi2_dsc09667.jpg',
  'cuoi2_dsc09668.jpg',
  'cuoi2_dsc09678.jpg',
  'cuoi2_dsc09704.jpg',
  'cuoi2_dsc09717.jpg',
] as const

const FEATURED_PHOTOS = (() => {
  const byName = new Map(PHOTO_ENTRIES.map((entry) => [entry.filename, entry]))
  const picked = FEATURED_FILENAMES.map((name) => byName.get(name)).filter(
    (entry): entry is PhotoEntry => Boolean(entry),
  )

  // Keep the section useful if the selected source files are renamed later.
  if (picked.length < 8) {
    const used = new Set(picked.map(({ src }) => src))
    for (const entry of PHOTO_ENTRIES) {
      if (!used.has(entry.src)) {
        picked.push(entry)
        used.add(entry.src)
      }
      if (picked.length === 10) break
    }
  }

  return picked
})()

const FRAME_STYLES = [
  'rounded-[1.75rem]',
  'rounded-t-[5rem] rounded-b-[1.5rem]',
  'rounded-[1.25rem]',
  'rounded-t-[1.5rem] rounded-b-[4rem]',
] as const

function drawRandom<T>(pool: T[], count: number): T[] {
  const deck = [...pool]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck.slice(0, count)
}

function MarqueeLane({
  srcs,
  reverse = false,
  duration,
  reduce,
}: {
  srcs: string[]
  reverse?: boolean
  duration: number
  reduce: boolean
}) {
  if (srcs.length === 0) return null

  const lane = reduce ? srcs : [...srcs, ...srcs]

  return (
    <div
      className={cn(
        'group relative',
        !reduce &&
          '[mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 sm:gap-4',
          reduce
            ? 'w-full overflow-x-auto px-4 pb-2 sm:px-6'
            : 'w-max animate-marquee will-change-transform group-hover:[animation-play-state:paused]',
        )}
        style={
          reduce
            ? undefined
            : {
                animationDuration: `${duration}s`,
                animationDirection: reverse ? 'reverse' : 'normal',
              }
        }
      >
        {lane.map((src, index) => (
          <SmartImage
            key={`${src}-${index}`}
            src={src}
            alt=""
            fit="natural-h"
            placeholder="bare"
            className={cn(
              'h-28 w-auto shrink-0 border border-white/70 shadow-[0_14px_35px_-22px_rgba(27,42,74,0.6)] ring-1 ring-gold/15 transition duration-500 group-hover:rotate-0 sm:h-36',
              index % 3 === 0
                ? 'rotate-[0.8deg] rounded-[1.5rem]'
                : index % 3 === 1
                  ? '-rotate-[0.8deg] rounded-t-[3rem] rounded-b-[1rem]'
                  : 'rounded-[1rem]',
            )}
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ))}
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

  useEffect(() => {
    if (!image) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [image, onClose])

  if (!image) return null

  const zoomLabel = zoomed ? t.ui.unzoomPhoto : t.ui.zoomPhoto

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <button
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
          'relative max-h-[84vh] max-w-[94vw] overflow-hidden rounded-2xl border border-gold/25 bg-navy/30 shadow-2xl',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-navy',
          zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
        )}
      >
        <img
          src={image.src}
          alt={image.alt}
          className={cn(
            'block max-h-[84vh] max-w-[94vw] object-contain transition-transform duration-300 ease-out',
            zoomed && 'scale-[1.8]',
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
  const [lightboxImage, setLightboxImage] = useState<GalleryLightboxImage | null>(
    null,
  )
  const [laneSrcs] = useState(() => drawRandom(PHOTO_POOL, 30))
  const laneA = laneSrcs.slice(0, Math.ceil(laneSrcs.length / 2))
  const laneB = laneSrcs.slice(Math.ceil(laneSrcs.length / 2))

  if (PHOTO_ENTRIES.length === 0) return null

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-gradient-to-b from-warm-white via-ivory to-ivory py-12 sm:py-16 lg:py-20"
      aria-label={t.gallery.title}
    >
      <h2 className="sr-only">{t.gallery.title}</h2>

      <div
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-0 h-1/2 bg-[radial-gradient(ellipse_65%_75%_at_50%_50%,var(--color-rose)_0%,transparent_72%)] opacity-[0.12]"
        aria-hidden="true"
      />

      <SectionReveal className="relative z-10 mx-auto columns-2 max-w-6xl gap-3 px-4 sm:columns-3 sm:gap-4 sm:px-6 lg:columns-4">
        {FEATURED_PHOTOS.map((photo, index) => {
          const label = `${t.gallery.photo} ${index + 1}`

          return (
            <RevealItem
              key={photo.src}
              className="mb-3 break-inside-avoid sm:mb-4"
            >
              <button
                type="button"
                aria-label={label}
                onClick={() => setLightboxImage({ src: photo.src, alt: label })}
                className="group block w-full transition-transform duration-500 hover:-translate-y-1 focus:outline-none focus-visible:rounded-[1.75rem] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ivory"
              >
                <SmartImage
                  src={photo.src}
                  alt={label}
                  fit="natural-w"
                  placeholder="bare"
                  className={cn(
                    'w-full border border-white/80 shadow-[0_20px_45px_-26px_rgba(27,42,74,0.65)] ring-1 ring-gold/15',
                    FRAME_STYLES[index % FRAME_STYLES.length],
                  )}
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
              </button>
            </RevealItem>
          )
        })}
      </SectionReveal>

      <Reveal delay={0.08} className="relative z-10 mt-10 sm:mt-14">
        <div className="flex flex-col gap-3 sm:gap-4">
          <MarqueeLane srcs={laneA} duration={62} reduce={!!reduce} />
          <MarqueeLane
            srcs={laneB}
            reverse
            duration={76}
            reduce={!!reduce}
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
