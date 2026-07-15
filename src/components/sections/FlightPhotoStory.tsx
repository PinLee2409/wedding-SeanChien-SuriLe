import { useRef, type ReactNode } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { Plane } from 'lucide-react'
import { cn } from '../../lib/cn'
import {
  pickGalleryPhotos,
  type GalleryPhoto,
} from '../../lib/galleryPhotos'
import { useI18n } from '../../i18n/LanguageContext'
import { Clouds } from '../decorations/Clouds'
import { SmartImage } from '../ui/SmartImage'

const LANDSCAPE_PHOTOS = pickGalleryPhotos([
  'cuoi2_dsc09678.jpg',
  'cuoi1_t04-04-248.jpg',
  'cuoi1_t04-04-293.jpg',
])

const PORTRAIT_PHOTOS = pickGalleryPhotos([
  'cuoi1_t04-04-032.jpg',
  'cuoi2_dsc09667.jpg',
])

const WINDOW_RADIUS = '44% 44% 38% 38% / 25% 25% 40% 40%'
const WINDOW_INNER_RADIUS = '42% 42% 36% 36% / 23% 23% 38% 38%'

function WindowShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden border border-white/95 bg-gradient-to-b from-white via-ivory-deep to-beige shadow-[0_36px_90px_-38px_rgba(27,42,74,0.72),inset_0_0_0_1px_rgba(200,164,92,0.28)]',
        className,
      )}
      style={{ borderRadius: WINDOW_RADIUS }}
    >
      <div
        className="absolute inset-[clamp(0.75rem,2.2vw,2rem)] overflow-hidden bg-navy shadow-[inset_0_0_32px_rgba(27,42,74,0.5)] ring-1 ring-navy/15"
        style={{ borderRadius: WINDOW_INNER_RADIUS }}
      >
        {children}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/14 via-transparent to-navy/18"
          aria-hidden="true"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-[clamp(0.4rem,1vw,0.85rem)] border border-gold/20"
        style={{ borderRadius: WINDOW_INNER_RADIUS }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[20%] right-[20%] top-[clamp(0.55rem,1.3vw,1rem)] h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90"
        aria-hidden="true"
      />
    </div>
  )
}

function CinematicLayer({
  photo,
  progress,
  opacityInput,
  opacityOutput,
  scaleInput,
  scaleOutput,
  reduced,
  reducedVisible = false,
}: {
  photo: GalleryPhoto
  progress: MotionValue<number>
  opacityInput: number[]
  opacityOutput: number[]
  scaleInput: number[]
  scaleOutput: number[]
  reduced: boolean
  reducedVisible?: boolean
}) {
  const opacity = useTransform(progress, opacityInput, opacityOutput)
  const scale = useTransform(progress, scaleInput, scaleOutput)

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={
        reduced
          ? { opacity: reducedVisible ? 1 : 0, scale: 1 }
          : { opacity, scale }
      }
      aria-hidden="true"
    >
      <SmartImage
        src={photo.display}
        alt=""
        fit="cover"
        placeholder="bare"
        className="h-full w-full"
      />
    </motion.div>
  )
}

function PortraitPolaroid({
  photo,
  alt,
  side,
  y,
  rotate,
  opacity,
  reduced,
}: {
  photo: GalleryPhoto
  alt: string
  side: 'left' | 'right'
  y: MotionValue<number>
  rotate: MotionValue<number>
  opacity: MotionValue<number>
  reduced: boolean
}) {
  return (
    <motion.figure
      className={cn(
        'absolute z-30 w-[clamp(9rem,16vw,14rem)] bg-white p-2.5 pb-8 shadow-[0_28px_58px_-28px_rgba(27,42,74,0.68)] ring-1 ring-gold/20 xl:p-3 xl:pb-10',
        side === 'left'
          ? 'left-[2.5%] top-[22%]'
          : 'right-[2.5%] top-[20%]',
      )}
      style={
        reduced
          ? { opacity: 1, y: 0, rotate: side === 'left' ? -5 : 5 }
          : { opacity, y, rotate }
      }
    >
      <div className="aspect-[2/3] overflow-hidden bg-ivory">
        <SmartImage
          src={photo.display}
          alt={alt}
          fit="cover"
          placeholder="bare"
          className="h-full w-full"
        />
      </div>
      <span
        className="absolute bottom-3 left-1/2 h-px w-8 -translate-x-1/2 bg-gold/45"
        aria-hidden="true"
      />
    </motion.figure>
  )
}

function MobileWindowCard({
  photo,
  alt,
  index,
}: {
  photo: GalleryPhoto
  alt: string
  index: number
}) {
  return (
    <article className="w-[82vw] max-w-sm shrink-0 snap-center">
      <WindowShell className="aspect-[4/5] w-full p-0">
        <SmartImage
          src={photo.display}
          alt={alt}
          fit="cover"
          placeholder="bare"
          className="h-full w-full"
        />
        <span className="absolute bottom-5 right-6 rounded-full border border-white/35 bg-navy/35 px-3 py-1 font-mono text-[10px] tracking-[0.22em] text-white backdrop-blur-sm">
          {String(index + 1).padStart(2, '0')} / {String(LANDSCAPE_PHOTOS.length).padStart(2, '0')}
        </span>
      </WindowShell>
    </article>
  )
}

export function FlightPhotoStory() {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const portraitOpacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.88, 1],
    [0, 1, 1, 0.45],
  )
  const leftPortraitY = useTransform(scrollYProgress, [0, 1], [38, -34])
  const rightPortraitY = useTransform(scrollYProgress, [0, 1], [-20, 34])
  const leftPortraitRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [-7, -4, -6],
  )
  const rightPortraitRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [7, 4, 6],
  )

  const routeScale = useTransform(scrollYProgress, [0, 1], [0.02, 1])
  const routeOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.92, 1],
    [0, 0.72, 0.72, 0.36],
  )
  const planeX = useTransform(scrollYProgress, [0, 1], ['-38vw', '38vw'])
  const planeY = useTransform(scrollYProgress, [0, 0.5, 1], [10, -12, 8])
  const planeRotate = useTransform(scrollYProgress, [0, 0.5, 1], [40, 46, 42])

  const sectionLabel = `${t.gallery.title} — Cabin Window Journey`

  if (LANDSCAPE_PHOTOS.length < 3 || PORTRAIT_PHOTOS.length < 2) return null

  return (
    <section
      ref={sectionRef}
      id="flight-photo-story"
      className={cn(
        'relative overflow-hidden bg-gradient-to-b from-ivory via-sky-soft to-warm-white',
        reduced ? 'lg:py-24' : 'lg:h-[260vh]',
      )}
      aria-label={sectionLabel}
    >
      <h2 className="sr-only">{sectionLabel}</h2>

      {/* Mobile: stable, touch-native cabin windows with no sticky scene. */}
      <div className="relative py-16 lg:hidden">
        <Clouds tone="white" className="opacity-50" />
        <div className="relative z-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[9vw] pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LANDSCAPE_PHOTOS.map((photo, index) => (
            <MobileWindowCard
              key={photo.filename}
              photo={photo}
              alt={`${t.gallery.photo} ${index + 1}`}
              index={index}
            />
          ))}
        </div>
        <div
          className="relative z-10 mx-auto mt-3 flex w-16 items-center justify-between"
          aria-hidden="true"
        >
          {LANDSCAPE_PHOTOS.map((photo, index) => (
            <span
              key={photo.filename}
              className={cn(
                'rounded-full bg-gold/45',
                index === 0 ? 'h-1.5 w-6' : 'h-1.5 w-1.5',
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop: the page becomes a cabin; scroll advances the view outside. */}
      <div
        className={cn(
          'relative hidden min-h-[100svh] items-center justify-center overflow-hidden lg:flex',
          !reduced && 'sticky top-0 h-[100svh]',
        )}
      >
        <Clouds tone="white" className="opacity-45" />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[72svh] w-[78vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-white/70 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-20 h-[min(68svh,43rem)] w-[min(70vw,58rem)]">
          <WindowShell className="h-full w-full">
            <CinematicLayer
              photo={LANDSCAPE_PHOTOS[0]}
              progress={scrollYProgress}
              opacityInput={[0, 0.26, 0.39]}
              opacityOutput={[1, 1, 0]}
              scaleInput={[0, 0.39]}
              scaleOutput={[1.015, 1.085]}
              reduced={reduced}
              reducedVisible
            />
            <CinematicLayer
              photo={LANDSCAPE_PHOTOS[1]}
              progress={scrollYProgress}
              opacityInput={[0.27, 0.4, 0.59, 0.72]}
              opacityOutput={[0, 1, 1, 0]}
              scaleInput={[0.3, 0.72]}
              scaleOutput={[1.015, 1.085]}
              reduced={reduced}
            />
            <CinematicLayer
              photo={LANDSCAPE_PHOTOS[2]}
              progress={scrollYProgress}
              opacityInput={[0.6, 0.73, 1]}
              opacityOutput={[0, 1, 1]}
              scaleInput={[0.62, 1]}
              scaleOutput={[1.015, 1.085]}
              reduced={reduced}
            />
          </WindowShell>
        </div>

        <PortraitPolaroid
          photo={PORTRAIT_PHOTOS[0]}
          alt={`${t.gallery.photo} 4`}
          side="left"
          y={leftPortraitY}
          rotate={leftPortraitRotate}
          opacity={portraitOpacity}
          reduced={reduced}
        />
        <PortraitPolaroid
          photo={PORTRAIT_PHOTOS[1]}
          alt={`${t.gallery.photo} 5`}
          side="right"
          y={rightPortraitY}
          rotate={rightPortraitRotate}
          opacity={portraitOpacity}
          reduced={reduced}
        />

        <motion.div
          className="pointer-events-none absolute bottom-[8%] left-[12vw] right-[12vw] z-40 h-12 origin-left rounded-[50%] border-t border-dashed border-gold/70"
          style={
            reduced
              ? { opacity: 0.65, scaleX: 1 }
              : { opacity: routeOpacity, scaleX: routeScale }
          }
          aria-hidden="true"
        />
        <motion.span
          className="pointer-events-none absolute bottom-[calc(8%+2.1rem)] left-1/2 z-40 text-gold-dark drop-shadow-[0_4px_8px_rgba(27,42,74,0.25)]"
          style={
            reduced
              ? { x: 0, y: -4, rotate: 43 }
              : { x: planeX, y: planeY, rotate: planeRotate }
          }
          aria-hidden="true"
        >
          <Plane className="h-8 w-8 xl:h-9 xl:w-9" strokeWidth={1.4} />
        </motion.span>
      </div>
    </section>
  )
}
