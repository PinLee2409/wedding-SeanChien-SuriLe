import {
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ChevronDown, Plane } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { getOrderedCouple } from '../../lib/couple'
import { pickGalleryPhotos } from '../../lib/galleryPhotos'
import { fadeUp, staggerContainer } from '../../lib/motion'
import { useI18n } from '../../i18n/LanguageContext'
import { formatWeekday } from '../../i18n/translations'
import { Clouds } from '../decorations/Clouds'
import { FlyingPlane } from '../decorations/FlyingPlane'
import { RunwayLights } from '../decorations/RunwayLights'
import { Countdown } from '../ui/Countdown'
import { MusicToggle } from '../ui/MusicToggle'

interface HeroSectionProps {
  config: WeddingConfig
  guestName: string
  isMusicPlaying: boolean
  onToggleMusic: () => void
  musicEnabled: boolean
  isRevealed: boolean
}

const [MOBILE_HERO_PHOTO] = pickGalleryPhotos(['cuoi2_dsc09704.jpg'])
const [DESKTOP_HERO_PHOTO] = pickGalleryPhotos(['cuoi2_dsc09678.jpg'])

const easeCinematic = [0.22, 1, 0.36, 1] as const

export function HeroSection({
  config,
  guestName,
  isMusicPlaying,
  onToggleMusic,
  musicEnabled,
  isRevealed,
}: HeroSectionProps) {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const parallaxX = useSpring(pointerX, { stiffness: 90, damping: 24 })
  const parallaxY = useSpring(pointerY, { stiffness: 90, damping: 24 })
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const photoDepth = useTransform(scrollYProgress, [0, 1], [0, 58])
  const { t, lang } = useI18n()
  const { event, date, hero } = config
  const [firstPartner, secondPartner] = getOrderedCouple(config)
  const weekday = formatWeekday(date.iso, lang)
  const mobileHeroSrc = MOBILE_HERO_PHOTO?.full ?? hero.backgroundImage
  const desktopHeroSrc = DESKTOP_HERO_PHOTO?.full ?? mobileHeroSrc

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduce || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5
    pointerX.set(horizontal * 14)
    pointerY.set(vertical * 9)
  }

  const resetParallax = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[100svh] overflow-hidden bg-navy text-warm-white"
      aria-label={t.hero.aria}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
    >
      {/* Art-directed wedding portrait with three restrained layers of depth. */}
      <motion.div
        className="pointer-events-none absolute -inset-x-4 -inset-y-16"
        style={{ y: reduce ? 0 : photoDepth }}
        aria-hidden="true"
      >
        <motion.div
          className="h-full w-full will-change-transform"
          style={{
            x: reduce ? 0 : parallaxX,
            y: reduce ? 0 : parallaxY,
          }}
          initial={false}
          animate={
            reduce
              ? { scale: 1 }
              : isRevealed
                ? { scale: [1.065, 1.02] }
                : { scale: 1.02 }
          }
          transition={{
            scale: {
              duration: 15,
              repeat: 0,
              ease: easeCinematic,
            },
          }}
        >
          <picture className="block h-full w-full">
            <source media="(min-width: 768px)" srcSet={desktopHeroSrc} />
            <img
              src={mobileHeroSrc}
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-center md:object-[50%_55%]"
            />
          </picture>
        </motion.div>
      </motion.div>

      {/* Mobile vignette preserves the portrait; desktop shade reserves a calm
          editorial column without covering the couple. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/20 via-transparent to-navy/70 lg:bg-[linear-gradient(90deg,rgba(11,22,43,0.92)_0%,rgba(11,22,43,0.67)_36%,rgba(11,22,43,0.12)_65%,transparent_82%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_30%,rgba(255,255,255,0.14),transparent_34%)]"
        aria-hidden="true"
      />

      {/* Sparse ambience: one cloud field and one signature flight. */}
      <Clouds className="z-[2] opacity-[0.14] mix-blend-screen" />
      <FlyingPlane
        top="12%"
        size={28}
        duration={25}
        repeatDelay={9}
        tone="text-gold-light"
        trailWidth="w-32"
        className="opacity-75"
      />

      <div
        className="pointer-events-none absolute inset-3 z-10 rounded-[2rem] border border-white/15 shadow-[inset_0_0_90px_rgba(11,22,43,0.16)] sm:inset-5 lg:rounded-[2.75rem]"
        aria-hidden="true"
      />

      {musicEnabled && (
        <div className="absolute right-4 top-4 z-30 sm:right-7 sm:top-7">
          <MusicToggle
            isPlaying={isMusicPlaying}
            onToggle={onToggleMusic}
            variant="inline"
          />
        </div>
      )}

      <div className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-7xl items-start px-4 pb-44 pt-20 sm:px-6 sm:pb-52 sm:pt-24 lg:items-center lg:px-10 lg:pb-24 lg:pt-24">
        <motion.div
          className="relative mx-auto flex w-full max-w-[29rem] flex-col items-center gap-2.5 overflow-hidden rounded-[1.75rem] border border-white/20 bg-navy/55 p-4 text-center shadow-[0_30px_90px_-38px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-md min-[380px]:p-5 sm:gap-3 sm:rounded-[2.25rem] sm:p-6 lg:mx-0 lg:max-w-[35rem] lg:items-start lg:gap-3.5 lg:rounded-[2.5rem] lg:border-gold/25 lg:bg-navy/50 lg:p-8 lg:text-left lg:backdrop-blur-lg"
          variants={staggerContainer}
          initial={reduce ? 'visible' : 'hidden'}
          animate={reduce || isRevealed ? 'visible' : 'hidden'}
        >
          <span
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/90 to-transparent"
            aria-hidden="true"
          />

          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-2 text-sky-soft/85 lg:justify-start"
          >
            <span className="h-px w-8 bg-gold-light/55" />
            <Plane className="h-4 w-4 rotate-45 text-gold-light" strokeWidth={1.5} />
            <span className="label-caps text-[10px] sm:text-[11px]">{event.airline}</span>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="label-caps text-[10px] text-gold-light sm:text-xs"
          >
            {t.hero.kicker}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-display text-[clamp(2.5rem,12vw,4rem)] font-semibold uppercase leading-[0.88] tracking-[0.04em] text-warm-white sm:text-[clamp(3.25rem,9vw,4.65rem)] lg:text-[clamp(4rem,5.8vw,5.25rem)]"
          >
            <span className="block">Flight to</span>
            <span className="text-gold-shimmer block pb-1">Forever</span>
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 font-script text-[clamp(1.95rem,9vw,3.05rem)] leading-none text-warm-white lg:justify-start lg:text-[clamp(2.65rem,4vw,3.5rem)]"
          >
            <motion.span
              initial={false}
              animate={
                reduce || isRevealed
                  ? { x: 0, opacity: 1 }
                  : { x: -28, opacity: 0 }
              }
              transition={{
                duration: reduce ? 0 : 1.05,
                delay: !reduce && isRevealed ? 0.25 : 0,
                ease: easeCinematic,
              }}
            >
              {firstPartner.person.name}
            </motion.span>

            <motion.span
              className="relative grid h-9 w-9 shrink-0 place-items-center"
              initial={false}
              animate={
                reduce || isRevealed
                  ? { scale: 1, opacity: 1, rotate: 0 }
                  : { scale: 0.5, opacity: 0, rotate: -24 }
              }
              transition={{
                duration: reduce ? 0 : 0.9,
                delay: !reduce && isRevealed ? 0.48 : 0,
                ease: easeCinematic,
              }}
            >
              <motion.span
                className="pointer-events-none absolute inset-1 rounded-full bg-gold/45 blur-md"
                aria-hidden="true"
                animate={
                  reduce || !isRevealed
                    ? { scale: 1, opacity: 0.25 }
                    : { scale: [0.8, 1.45, 0.8], opacity: [0.2, 0.48, 0.2] }
                }
                transition={{
                  duration: 4.2,
                  repeat: reduce ? 0 : Infinity,
                  ease: 'easeInOut',
                }}
              />
              <Plane
                className="relative h-4 w-4 rotate-45 text-gold-light"
                strokeWidth={1.5}
              />
            </motion.span>

            <motion.span
              initial={false}
              animate={
                reduce || isRevealed
                  ? { x: 0, opacity: 1 }
                  : { x: 28, opacity: 0 }
              }
              transition={{
                duration: reduce ? 0 : 1.05,
                delay: !reduce && isRevealed ? 0.25 : 0,
                ease: easeCinematic,
              }}
            >
              {secondPartner.person.name}
            </motion.span>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="label-caps text-[10px] text-sky-soft/90 sm:text-xs"
          >
            {weekday} · {date.displayDate}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-1 flex w-full flex-col items-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm lg:items-start lg:px-5 lg:text-left"
          >
            {guestName ? (
              <>
                <span className="label-caps text-[9px] text-sky-soft/75 sm:text-[10px]">
                  {t.hero.inviteLabel}
                </span>
                <span className="mt-0.5 font-script text-[1.75rem] leading-snug text-gold-light sm:text-3xl">
                  {guestName}
                </span>
              </>
            ) : (
              <span className="font-display text-lg font-semibold text-gold-light sm:text-xl">
                {t.hero.inviteFallback}
              </span>
            )}
            <p className="mt-1 text-[11px] leading-relaxed text-sky-soft/90 sm:text-xs">
              {t.hero.inviteLine}
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="-my-1 flex w-full origin-center justify-center scale-[0.84] min-[360px]:scale-[0.94] sm:my-0 sm:scale-100 lg:justify-start"
          >
            <Countdown iso={date.iso} tone="light" />
          </motion.div>
        </motion.div>
      </div>

      {/* Runway and scroll cue remain visible but quiet over the portrait. */}
      <div className="absolute bottom-5 left-0 right-0 z-20 flex flex-col items-center gap-2.5 sm:bottom-7">
        <RunwayLights count={12} className="scale-x-75 text-gold-light opacity-75 sm:scale-x-100" />
        <motion.div
          className="flex flex-col items-center text-warm-white/70"
          animate={reduce ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="label-caps text-[9px]">{t.hero.scroll}</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </div>

      {/* A two-panel aperture opens once the guest has boarded. */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 z-40" aria-hidden="true">
          <motion.div
            className="absolute inset-y-0 left-0 w-[50.5%] bg-gradient-to-r from-navy via-navy to-navy-700"
            initial={{ x: 0 }}
            animate={{ x: isRevealed ? '-102%' : 0 }}
            transition={{ duration: 1.35, ease: easeCinematic }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-[50.5%] bg-gradient-to-l from-navy via-navy to-navy-700"
            initial={{ x: 0 }}
            animate={{ x: isRevealed ? '102%' : 0 }}
            transition={{ duration: 1.35, ease: easeCinematic }}
          />
          <motion.span
            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold-light to-transparent shadow-[0_0_28px_rgba(232,213,160,0.8)]"
            initial={{ opacity: 0.85, scaleY: 0.25 }}
            animate={
              isRevealed
                ? { opacity: 0, scaleY: 1 }
                : { opacity: 0.85, scaleY: 0.25 }
            }
            transition={{ duration: 0.75, ease: easeCinematic }}
          />
        </div>
      )}
    </section>
  )
}
