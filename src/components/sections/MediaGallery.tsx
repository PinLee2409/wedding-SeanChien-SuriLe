import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '../../lib/cn'
import { photoSrcSet } from '../../lib/galleryPhotos'
import { slotPhotos } from '../../lib/photoSlots'
import { useI18n } from '../../i18n/LanguageContext'
import { SectionRomance } from '../decorations/SectionRomance'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { RevealItem, SectionReveal } from '../ui/SectionReveal'
import { SmartImage } from '../ui/SmartImage'

interface GalleryLightboxImage {
  src: string
  alt: string
}

const GRID_PHOTOS = slotPhotos('galleryGrid')

/**
 * Prints scattered on a table. Nothing is cropped — every photograph is the same
 * upright 2:3, so the rhythm comes from the tilt, the vertical drift and the way
 * the mounts overlap, not from the frames.
 *
 * The tilt sits on the print itself; the stacking order and the drift sit on the
 * wrapper, because Motion writes its own `transform` for the reveal and would
 * otherwise wipe the rotation out.
 */
const SCATTER = [
  { tilt: 'rotate-[-6.5deg]', layer: 'z-[4]', drift: 'sm:mt-4' },
  { tilt: 'rotate-[4.5deg]', layer: 'z-[7]', drift: 'sm:-mt-10' },
  { tilt: 'rotate-[-2.5deg]', layer: 'z-[3]', drift: 'sm:mt-12' },
  { tilt: 'rotate-[7deg]', layer: 'z-[6]', drift: 'sm:-mt-5' },
  { tilt: 'rotate-[-5deg]', layer: 'z-[8]', drift: 'sm:mt-9' },
  { tilt: 'rotate-[3deg]', layer: 'z-[2]', drift: 'sm:-mt-12' },
] as const

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
  const [lightboxImage, setLightboxImage] = useState<GalleryLightboxImage | null>(
    null,
  )

  if (GRID_PHOTOS.length === 0) return null

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-gradient-to-b from-ivory via-cream to-ivory-deep py-12 sm:py-16 lg:py-20"
      aria-label={t.gallery.title}
    >
      <SectionRomance direction="ltr" planeTop="47%" />

      <div
        className="pointer-events-none absolute inset-x-0 top-1/4 h-1/2 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,var(--color-rose)_0%,transparent_72%)] opacity-[0.12]"
        aria-hidden="true"
      />

      <Reveal className="relative z-10 mx-auto max-w-7xl px-5 pb-10 sm:px-7 sm:pb-12 lg:px-10">
        <SectionHeading
          kicker={t.gallery.kicker}
          title={t.gallery.title}
          subtitle={t.gallery.subtitle}
        />
      </Reveal>

      {/* Flex rather than a grid: a grid packs its last row from the left, so
          an album whose count is not a multiple of the columns ends on a row
          of prints shoved to one side. `justify-center` centres every row,
          which only shows on the short one. */}
      <SectionReveal className="relative z-10 mx-auto flex max-w-5xl flex-wrap justify-center gap-x-1 gap-y-6 px-7 sm:gap-x-2 sm:gap-y-10 sm:px-12 lg:px-16">
        {GRID_PHOTOS.map((photo, index) => {
          const label = `${t.gallery.photo} ${index + 1}`
          const { tilt, layer, drift } = SCATTER[index % SCATTER.length]

          return (
            <RevealItem
              key={photo.filename}
              /* Widths leave slack so the wrap point stays put: two per row on
                 a phone, three from 640px up. */
              className={cn(
                'relative w-[46%] -mx-2 sm:w-[31%] sm:-mx-4',
                layer,
                drift,
                'hover:z-50',
              )}
            >
              <button
                type="button"
                aria-label={label}
                onClick={() => setLightboxImage({ src: photo.full, alt: label })}
                className={cn(
                  'group block w-full origin-center bg-warm-white p-2 pb-9 shadow-[0_10px_20px_-8px_rgba(27,42,74,0.35),0_26px_50px_-20px_rgba(27,42,74,0.55)] ring-1 ring-navy/10 transition-[transform,box-shadow,rotate,scale] duration-500 ease-out hover:rotate-0 hover:scale-[1.08] hover:shadow-[0_18px_30px_-10px_rgba(27,42,74,0.4),0_44px_72px_-26px_rgba(27,42,74,0.72)] focus:outline-none focus-visible:rotate-0 focus-visible:ring-2 focus-visible:ring-gold sm:p-2.5 sm:pb-12',
                  tilt,
                )}
              >
                {/* 'contain' against the mount: the frame keeps a steady 2:3 so
                    the page never reflows as files arrive, and the one
                    photograph that is not quite 2:3 keeps its edges. */}
                <SmartImage
                  src={photo.display}
                  srcSet={photoSrcSet(photo)}
                  sizes="(min-width: 640px) 32vw, 45vw"
                  alt={label}
                  fit="contain"
                  placeholder="bare"
                  className="aspect-[2/3] w-full bg-ivory-deep"
                />
              </button>
            </RevealItem>
          )
        })}
      </SectionReveal>

      <GalleryLightbox
        key={lightboxImage?.src ?? 'closed'}
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </section>
  )
}
