import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Heart, Plane } from 'lucide-react'
import { cn } from '../../lib/cn'
import {
  pickGalleryPhotos,
  type GalleryPhoto,
} from '../../lib/galleryPhotos'
import { useI18n } from '../../i18n/LanguageContext'
import { Clouds } from '../decorations/Clouds'
import { SmartImage } from '../ui/SmartImage'

/**
 * The order intentionally alternates Cuoi1 and Cuoi2. Besides making every
 * five-second change feel fresh, this prevents one location or outfit from
 * appearing as a long, repetitive block.
 */
const WINDOW_PHOTOS = pickGalleryPhotos([
  'cuoi1_t04-04-248.jpg',
  'cuoi2_dsc09678.jpg',
  'cuoi1_t04-04-032.jpg',
  'cuoi2_dsc09667.jpg',
  'cuoi1_t04-04-293.jpg',
  'cuoi2_dsc09717.jpg',
  'cuoi1_t04-04-193.jpg',
  'cuoi2_dsc09644.jpg',
  'cuoi1_t04-04-327.jpg',
  'cuoi2_dsc09704.jpg',
])

const PORTRAIT_PHOTOS = pickGalleryPhotos([
  'cuoi1_t04-04-032.jpg',
  'cuoi2_dsc09667.jpg',
  'cuoi1_t04-04-193.jpg',
  'cuoi2_dsc09717.jpg',
  'cuoi1_t04-04-151.jpg',
  'cuoi2_dsc09704.jpg',
])

const WINDOW_RADIUS = '44% 44% 38% 38% / 25% 25% 40% 40%'
const WINDOW_INNER_RADIUS = '42% 42% 36% 36% / 23% 23% 38% 38%'
const PHOTO_INTERVAL_MS = 5_000

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

function useRotatingPhotoIndex({
  count,
  active,
  reduced,
}: {
  count: number
  active: boolean
  reduced: boolean
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active || reduced || count < 2) return undefined

    let timer: number | undefined
    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer)
      timer = undefined
    }
    const start = () => {
      stop()
      if (document.visibilityState !== 'visible') return
      timer = window.setInterval(
        () => setIndex((current) => (current + 1) % count),
        PHOTO_INTERVAL_MS,
      )
    }
    const handleVisibility = () => start()

    start()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [active, count, reduced])

  return index
}

function CinematicWindowImage({
  photo,
  alt,
  reduced,
}: {
  photo: GalleryPhoto
  alt: string
  reduced: boolean
}) {
  return (
    <div className="absolute inset-0" role="img" aria-label={alt}>
      <AnimatePresence initial={false}>
        <motion.div
          key={photo.filename}
          className="absolute inset-0 will-change-transform"
          initial={
            reduced
              ? false
              : { opacity: 0, scale: 1.075, filter: 'blur(7px)' }
          }
          animate={{ opacity: 1, scale: 1.015, filter: 'blur(0px)' }}
          exit={
            reduced
              ? undefined
              : { opacity: 0, scale: 1.045, filter: 'blur(4px)' }
          }
          transition={{
            duration: reduced ? 0 : 1.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          aria-hidden="true"
        >
          <SmartImage
            src={photo.display}
            alt=""
            fit="cover"
            loading="eager"
            placeholder="bare"
            className="h-full w-full"
            imgClassName={cn(
              photo.orientation === 'portrait' && 'object-[50%_38%]',
            )}
          />
        </motion.div>
      </AnimatePresence>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-navy/20"
        aria-hidden="true"
      />
      {!reduced && (
        <motion.div
          key={`glint-${photo.filename}`}
          className="pointer-events-none absolute -inset-y-1/4 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/28 to-transparent mix-blend-screen"
          initial={{ x: '-180%' }}
          animate={{ x: '560%' }}
          transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.35 }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

function PortraitPolaroid({
  photo,
  alt,
  side,
  active,
}: {
  photo: GalleryPhoto
  alt: string
  side: 'left' | 'right'
  active: boolean
}) {
  const reduced = !!useReducedMotion()
  const baseRotate = side === 'left' ? -5 : 5

  return (
    <motion.figure
      className={cn(
        'absolute z-30 hidden w-[clamp(9rem,16vw,14rem)] bg-white p-2.5 pb-8 shadow-[0_28px_58px_-28px_rgba(27,42,74,0.68)] ring-1 ring-gold/20 lg:block xl:p-3 xl:pb-10',
        side === 'left'
          ? 'left-[1.5%] top-[19%]'
          : 'right-[1.5%] top-[18%]',
      )}
      animate={
        reduced || !active
          ? { y: 0, rotate: baseRotate }
          : {
              y: side === 'left' ? [0, -9, 0, 6, 0] : [0, 7, 0, -8, 0],
              rotate:
                side === 'left'
                  ? [baseRotate, -3.8, baseRotate]
                  : [baseRotate, 3.8, baseRotate],
            }
      }
      transition={{
        duration: 8.5,
        repeat: reduced || !active ? 0 : Infinity,
        ease: 'easeInOut',
        delay: side === 'left' ? 0 : -3.2,
      }}
      role="img"
      aria-label={alt}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-ivory">
        <AnimatePresence initial={false}>
          <motion.div
            key={photo.filename}
            className="absolute inset-0"
            initial={reduced ? false : { opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 1.025 }}
            transition={{ duration: reduced ? 0 : 1.05, ease: 'easeOut' }}
            aria-hidden="true"
          >
            <SmartImage
              src={photo.display}
              alt=""
              fit="cover"
              placeholder="bare"
              className="h-full w-full"
              imgClassName="object-[50%_35%]"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <span
        className="absolute bottom-3 left-1/2 h-px w-8 -translate-x-1/2 bg-gold/45"
        aria-hidden="true"
      />
    </motion.figure>
  )
}

function FlightRoute({ active, reduced }: { active: boolean; reduced: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-[4%] bottom-[3%] z-40 h-16 sm:inset-x-[8%] sm:bottom-[5%]"
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-x-0 bottom-2 h-12 origin-left rounded-[50%] border-t border-dashed border-gold/65"
        initial={reduced ? false : { opacity: 0, scaleX: 0.08 }}
        whileInView={{ opacity: 0.72, scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: reduced ? 0 : 1.4, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.span
        className="absolute bottom-[2.1rem] left-1/2 flex items-center text-gold-dark drop-shadow-[0_4px_8px_rgba(27,42,74,0.25)]"
        initial={false}
        animate={
          reduced || !active
            ? { x: 0, y: -3, rotate: 43, opacity: 0.88 }
            : {
                x: ['-44vw', '44vw'],
                y: [8, -9, 5],
                rotate: [40, 46, 42],
                opacity: [0, 1, 1, 0],
              }
        }
        transition={{
          duration: 13.5,
          repeat: reduced || !active ? 0 : Infinity,
          repeatDelay: 1.8,
          ease: 'linear',
        }}
      >
        <Heart
          className="mr-1 h-3 w-3 -rotate-45 fill-rose/45 text-rose/70"
          strokeWidth={1.3}
        />
        <Plane className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.4} />
      </motion.span>
    </div>
  )
}

export function FlightPhotoStory() {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { margin: '180px 0px' })
  const [hoverPaused, setHoverPaused] = useState(false)
  const slideshowActive = inView && !hoverPaused
  const activeIndex = useRotatingPhotoIndex({
    count: WINDOW_PHOTOS.length,
    active: slideshowActive,
    reduced,
  })

  const activePhoto = WINDOW_PHOTOS[activeIndex]
  const leftPortrait = PORTRAIT_PHOTOS[activeIndex % PORTRAIT_PHOTOS.length]
  const rightPortrait =
    PORTRAIT_PHOTOS[(activeIndex + 3) % PORTRAIT_PHOTOS.length]

  useEffect(() => {
    if (reduced || !inView || WINDOW_PHOTOS.length < 2) return
    const nextIndex = activeIndex + 1
    const upcoming = [
      WINDOW_PHOTOS[nextIndex % WINDOW_PHOTOS.length],
      PORTRAIT_PHOTOS[nextIndex % PORTRAIT_PHOTOS.length],
      PORTRAIT_PHOTOS[(nextIndex + 3) % PORTRAIT_PHOTOS.length],
    ]
    for (const photo of upcoming) {
      const preload = new Image()
      preload.src = photo.display
    }
  }, [activeIndex, inView, reduced])

  if (!activePhoto || !leftPortrait || !rightPortrait) return null

  const sectionLabel = `${t.gallery.title} — Cabin Window Journey`
  const activeLabel = `${t.gallery.photo} ${activeIndex + 1}`

  return (
    <section
      ref={sectionRef}
      id="flight-photo-story"
      className="relative overflow-hidden bg-gradient-to-b from-ivory via-sky-soft to-warm-white py-16 sm:py-20 lg:py-24"
      aria-label={sectionLabel}
    >
      <h2 className="sr-only">{sectionLabel}</h2>
      <Clouds tone="white" className="opacity-50" />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-white/65 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex min-h-[31rem] items-center justify-center sm:min-h-[34rem] lg:min-h-[clamp(36rem,52vw,43rem)]">
          <motion.div
            className="relative z-20 aspect-[4/5] w-[min(86vw,25rem)] sm:aspect-[16/10] sm:w-[min(76vw,48rem)] lg:w-[min(68vw,58rem)]"
            initial={reduced ? false : { opacity: 0, y: 28, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setHoverPaused(true)}
            onMouseLeave={() => setHoverPaused(false)}
          >
            <WindowShell className="h-full w-full">
              <CinematicWindowImage
                photo={activePhoto}
                alt={activeLabel}
                reduced={reduced}
              />

              <div
                className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/25 bg-navy/25 px-3 py-2 backdrop-blur-sm sm:bottom-5"
                aria-hidden="true"
              >
                {WINDOW_PHOTOS.map((photo, index) => (
                  <motion.span
                    key={photo.filename}
                    className="h-1.5 rounded-full bg-white"
                    animate={{
                      width: index === activeIndex ? 20 : 6,
                      opacity: index === activeIndex ? 0.95 : 0.4,
                    }}
                    transition={{ duration: reduced ? 0 : 0.45 }}
                  />
                ))}
              </div>
            </WindowShell>
          </motion.div>

          <PortraitPolaroid
            photo={leftPortrait}
            alt={`${t.gallery.photo} ${activeIndex + 2}`}
            side="left"
            active={inView}
          />
          <PortraitPolaroid
            photo={rightPortrait}
            alt={`${t.gallery.photo} ${activeIndex + 3}`}
            side="right"
            active={inView}
          />

          <FlightRoute active={inView} reduced={reduced} />
        </div>
      </div>
    </section>
  )
}
