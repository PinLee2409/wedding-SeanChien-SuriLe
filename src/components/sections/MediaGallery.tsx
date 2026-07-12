import { Fragment, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Heart, Plane, Play, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import type { WeddingConfig } from '../../config/wedding.config'
import type { GalleryImage } from '../../config/wedding.config'
import { cn } from '../../lib/cn'
import { useI18n } from '../../i18n/LanguageContext'
import { SectionHeading } from '../ui/SectionHeading'
import { SmartImage } from '../ui/SmartImage'
import { Reveal } from '../ui/Reveal'
import { SectionReveal, RevealItem } from '../ui/SectionReveal'

/**
 * Each photo gets its own frame personality — arch, oval, tilted polaroid,
 * wide panorama, postage stamp — so the wall reads like a curated exhibition
 * rather than a uniform grid.
 */
type FrameKind = 'arch' | 'wide' | 'oval' | 'polaroid' | 'stamp'

interface FrameDef {
  kind: FrameKind
  /** The photo's natural aspect — the frame hugs it, nothing is squeezed. */
  aspect: string
  /** md+ width share, proportional to the aspect, so each row lines up. */
  share: string
  /** Placement tweaks for the 2-column mobile grid. */
  mobile?: string
  /** Index into the localised polaroid captions (t.gallery.captions). */
  captionIdx?: 0 | 1
  /** Resting angle; straightens on hover. */
  tilt?: string
}

interface GalleryLightboxImage {
  src: string
  alt: string
  label: string
}

type WallCell =
  | { panel: true }
  | {
      panel: false
      frame: FrameDef
      image: GalleryImage | undefined
      index: number
    }

/**
 * Every optimized thumbnail in src/assets/marquee — Vite turns the folder
 * into a list of URLs at build time, so adding/removing files there is all
 * it takes to change the pool. A fresh random hand is drawn on every visit.
 */
const MARQUEE_POOL = Object.values(
  import.meta.glob('../../assets/marquee/*.jpg', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
) as string[]

/** Fisher–Yates shuffle, returning the first `count` cards. */
function drawRandom<T>(pool: T[], count: number): T[] {
  const deck = [...pool]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck.slice(0, count)
}

const PORTRAIT = { aspect: 'aspect-[2/3]', share: 'md:flex-[2]' }
const LANDSCAPE = {
  aspect: 'aspect-[3/2]',
  share: 'md:flex-[4.5]',
  mobile: 'max-md:order-last max-md:col-span-2',
}

function PhotoButton({
  label,
  onOpen,
  disabled,
  className,
  children,
}: {
  label: string
  onOpen?: () => void
  disabled?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={disabled ? undefined : onOpen}
      className={cn(
        'group block cursor-zoom-in appearance-none border-0 bg-transparent p-0 text-inherit',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-ivory',
        'disabled:cursor-default',
        className,
      )}
    >
      {children}
    </button>
  )
}

/**
 * Exhibition wall: three balanced rows. Widths are shared proportionally to
 * each photo's aspect ratio, so every frame in a row renders the same height
 * and no photo is ever distorted. 'panel' is the decorative centre plaque
 * between the two bottom-corner stamp frames.
 */
const WALL_ROWS: (FrameDef | 'panel')[][] = [
  [
    { kind: 'arch', ...PORTRAIT },
    { kind: 'wide', ...LANDSCAPE },
    { kind: 'oval', ...PORTRAIT },
  ],
  [
    { kind: 'polaroid', ...PORTRAIT, captionIdx: 0, tilt: '-rotate-2' },
    { kind: 'wide', ...LANDSCAPE },
    { kind: 'polaroid', ...PORTRAIT, captionIdx: 1, tilt: 'rotate-2' },
  ],
  [
    { kind: 'stamp', ...PORTRAIT, tilt: '-rotate-1' },
    'panel',
    { kind: 'stamp', ...PORTRAIT, tilt: 'rotate-1' },
  ],
]

function buildWallRows(images: GalleryImage[]): WallCell[][] {
  let wallIdx = 0

  return WALL_ROWS.map((row) =>
    row.map((item) => {
      if (item === 'panel') return { panel: true as const }

      const cell: WallCell = {
        panel: false,
        frame: item,
        image: images[wallIdx],
        index: wallIdx,
      }
      wallIdx += 1
      return cell
    }),
  )
}

function GalleryFrame({
  frame,
  index,
  src,
  alt,
  focus,
  onOpen,
}: {
  frame: FrameDef
  index: number
  src?: string
  alt: string
  /** object-position class when the photo and frame aspects differ. */
  focus?: string
  onOpen?: () => void
}) {
  const { t } = useI18n()
  const label = `${t.gallery.photo} ${index + 1}`
  const viewLabel = `${t.ui.viewPhoto}: ${alt || label}`
  const canOpen = Boolean(src && onOpen)
  // A photo with its own zoom keeps it — the hover zoom would undo it.
  const hasZoom = focus?.includes('scale-')
  const imgClass = cn(
    'transition-transform duration-700 ease-out',
    !hasZoom && 'group-hover:scale-[1.04]',
    focus,
  )

  if (frame.kind === 'polaroid') {
    // A white-bordered polaroid resting at a slight angle; straightens on hover.
    return (
      <figure
        className={cn(
          'group flex flex-col rounded-lg bg-warm-white p-2.5 pb-2 shadow-[0_14px_30px_-16px_rgba(27,42,74,0.35)] transition-transform duration-500 ease-out hover:rotate-0',
          frame.tilt,
        )}
      >
        <PhotoButton label={viewLabel} onOpen={onOpen} disabled={!canOpen} className="w-full">
          <SmartImage
            src={src}
            alt={alt}
            label={label}
            className={cn('w-full rounded-sm', frame.aspect)}
            imgClassName={imgClass}
          />
        </PhotoButton>
        <figcaption className="shrink-0 pt-2 text-center font-script text-xl leading-none text-navy-600">
          {t.gallery.captions[frame.captionIdx ?? 0]}
        </figcaption>
      </figure>
    )
  }

  if (frame.kind === 'stamp') {
    // A postage-stamp frame — white mat with a dashed gold inner border,
    // a little nod to love letters sent across the sky.
    return (
      <figure
        className={cn(
          'group rounded-md bg-warm-white p-2 shadow-[0_14px_30px_-16px_rgba(27,42,74,0.35)] transition-transform duration-500 ease-out hover:rotate-0',
          frame.tilt,
        )}
      >
        <div className="rounded-sm border border-dashed border-gold/50 p-1.5">
          <PhotoButton label={viewLabel} onOpen={onOpen} disabled={!canOpen} className="w-full">
            <SmartImage
              src={src}
              alt={alt}
              label={label}
              className={cn('w-full rounded-sm', frame.aspect)}
              imgClassName={imgClass}
            />
          </PhotoButton>
        </div>
      </figure>
    )
  }

  return (
    <PhotoButton label={viewLabel} onOpen={onOpen} disabled={!canOpen} className="w-full">
      <SmartImage
        src={src}
        alt={alt}
        label={label}
        className={cn(
          'w-full border border-gold/15 shadow-sm transition-shadow duration-500 group-hover:shadow-[0_18px_36px_-20px_rgba(71,35,59,0.5)]',
          frame.aspect,
          frame.kind === 'arch' && 'rounded-t-[999px] rounded-b-3xl',
          frame.kind === 'oval' && 'rounded-[50%]',
          frame.kind === 'wide' && 'rounded-3xl',
        )}
        imgClassName={imgClass}
      />
    </PhotoButton>
  )
}

/** Decorative plaque between the two bottom-corner stamps. */
function WallPanel({ config }: { config: WeddingConfig }) {
  const { couple, date } = config
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 rounded-3xl border border-gold/25 bg-gradient-to-br from-sky-soft/70 via-warm-white to-ivory p-6 text-center shadow-sm max-md:py-10 md:aspect-[3/2]">
      <Plane className="h-5 w-5 rotate-45 text-gold" strokeWidth={1.4} />
      <p className="font-script text-[clamp(1.7rem,4vw,2.6rem)] leading-tight text-navy-600">
        {couple.groom.name}
        <span className="mx-2 text-rose">♥</span>
        {couple.bride.name}
      </p>
      <span className="label-caps text-[10px] text-gold-dark">{date.displayDate}</span>
      {couple.hashtag && (
        <span className="text-xs text-navy-400">{couple.hashtag}</span>
      )}
    </div>
  )
}

/**
 * One marquee lane of photos. The content is duplicated so the -50% keyframe
 * loops seamlessly; `reverse` flips the direction so two stacked lanes glide
 * past each other. Hovering a lane pauses it so a photo can be admired.
 */
function MarqueeLane({
  srcs,
  reverse = false,
  duration = 32,
  reduce,
}: {
  srcs: string[]
  reverse?: boolean
  duration?: number
  reduce: boolean
}) {
  const { t } = useI18n()
  const lane = reduce ? srcs : [...srcs, ...srcs]

  return (
    <div
      className={cn(
        'group relative',
        !reduce &&
          '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3',
          reduce
            ? 'w-full overflow-x-auto pb-2'
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
        {lane.map((src, i) => (
          <Fragment key={src + i}>
            <div className="w-auto shrink-0 rounded-xl">
              <SmartImage
                src={src}
                alt=""
                label={`${t.gallery.photo} ${(i % srcs.length) + 1}`}
                fit="natural-h"
                className={cn(
                  'h-24 w-auto rounded-xl border border-gold/20 ring-1 ring-rose/20 shadow-sm transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105 sm:h-28',
                  i % 2 === 0 ? 'rotate-1' : '-rotate-1',
                )}
              />
            </div>
            {/* A little heart resting between every pair of memories. */}
            <Heart
              className="h-3.5 w-3.5 shrink-0 fill-current text-rose/70"
              strokeWidth={0}
              aria-hidden="true"
            />
          </Fragment>
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
      aria-label={image.alt || image.label}
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

      <figure
        className="relative max-w-[94vw] text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label={zoomLabel}
          onClick={() => setZoomed((value) => !value)}
          className={cn(
            'relative max-h-[84vh] max-w-[94vw] overflow-hidden rounded-2xl border border-gold/25 bg-navy/30 shadow-2xl',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-navy',
            zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
          )}
        >
          <img
            src={image.src}
            alt={image.alt || image.label}
            className={cn(
              'block max-h-[84vh] max-w-[94vw] object-contain transition-transform duration-300 ease-out',
              zoomed && 'scale-[1.9]',
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
      </figure>
    </div>,
    document.body,
  )
}

export function MediaGallery({ config }: { config: WeddingConfig }) {
  const { images, video, videoPoster } = config.gallery
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [lightboxImage, setLightboxImage] = useState<GalleryLightboxImage | null>(
    null,
  )

  // Draw 30 random memories from the marquee pool on every page load and
  // deal them across the two lanes, so each visit scrolls a different mix.
  const [laneSrcs] = useState(() => drawRandom(MARQUEE_POOL, 30))
  const laneA = laneSrcs.slice(0, Math.ceil(laneSrcs.length / 2))
  const laneB = laneSrcs.slice(Math.ceil(laneSrcs.length / 2))

  // Pair each wall slot with the next photo from the config, reading order.
  const wallRows = buildWallRows(images)

  return (
    <section
      id="gallery"
      className="overflow-hidden bg-gradient-to-b from-warm-white to-ivory px-5 py-20"
      aria-label={t.gallery.title}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            kicker={t.gallery.kicker}
            title={t.gallery.title}
            subtitle={t.gallery.subtitle}
          />
        </Reveal>

        {/* Feature video frame */}
        {video && (
          <Reveal delay={0.05} className="mx-auto mt-12 max-w-3xl">
            <figure className="group relative overflow-hidden rounded-3xl border border-gold/25 bg-navy shadow-xl">
              <video
                className="aspect-video w-full object-cover"
                src={video}
                poster={videoPoster}
                controls
                playsInline
                preload="metadata"
              />
              <figcaption className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-navy/70 px-3 py-1 text-warm-white backdrop-blur-sm">
                <Play className="h-3.5 w-3.5 fill-current text-gold" />
                <span className="label-caps text-[9px]">Pre-wedding Film</span>
              </figcaption>
            </figure>
          </Reveal>
        )}

        {/* Exhibition wall: three balanced rows — arch, panorama, oval,
            polaroids, and two stamp frames flanking a centre plaque. Every
            frame hugs its photo's natural ratio, so nothing is distorted. */}
        <SectionReveal className="mt-10 flex flex-col gap-4">
          {wallRows.map((row, r) => (
            <div key={r} className="grid grid-cols-2 gap-4 md:flex md:items-center">
              {row.map((cell, c) => {
                if (cell.panel) {
                  return (
                    <RevealItem
                      key={c}
                      className="max-md:order-last max-md:col-span-2 md:flex-[4.5]"
                    >
                      <WallPanel config={config} />
                    </RevealItem>
                  )
                }

                const image = cell.image

                return (
                  <RevealItem
                    key={c}
                    className={cn('group', cell.frame.share, cell.frame.mobile)}
                  >
                    <GalleryFrame
                      frame={cell.frame}
                      index={cell.index}
                      src={image?.src}
                      alt={image?.alt ?? ''}
                      focus={image?.focus}
                      onOpen={
                        image?.src
                          ? () =>
                              setLightboxImage({
                                src: image.src,
                                alt: image.alt,
                                label: `${t.gallery.photo} ${cell.index + 1}`,
                              })
                          : undefined
                      }
                    />
                  </RevealItem>
                )
              })}
            </div>
          ))}
        </SectionReveal>
      </div>

      {/* Memory lanes: two marquees gliding past each other — one drifts left,
          the other right — over a soft rose glow, with a heart tucked between
          every pair of photos. Static scrollable rows under reduced motion. */}
      <Reveal delay={0.1} className="relative mt-12">
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[130%] -translate-y-1/2 bg-[radial-gradient(ellipse_70%_100%_at_50%_50%,var(--color-rose)_0%,transparent_70%)] opacity-25"
          aria-hidden="true"
        />
        <p className="label-caps mb-4 text-center text-[10px] text-navy-400">
          <Heart className="mr-1.5 inline h-3 w-3 fill-current text-rose" strokeWidth={0} />
          {t.gallery.memoryLane}
          <Heart className="ml-1.5 inline h-3 w-3 fill-current text-rose" strokeWidth={0} />
        </p>
        <div className="flex flex-col gap-4">
          <MarqueeLane
            srcs={laneA}
            duration={60}
            reduce={!!reduce}
          />
          <MarqueeLane
            srcs={laneB}
            reverse
            duration={75}
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
