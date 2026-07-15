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
  const photoDepth = useTransform(scrollYProgress, [0, 1], [0, 52])
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
    pointerX.set(horizontal * 12)
    pointerY.set(vertical * 8)
  }

  const resetParallax = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-navy text-warm-white"
      aria-label={t.hero.aria}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
    >
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-[minmax(25rem,0.88fr)_minmax(0,1.12fr)]">
        {/* The portrait owns a separate canvas. Nothing textual is ever placed
            over it, so both faces remain clear at every breakpoint. */}
        <div className="relative order-1 min-h-[44svh] overflow-hidden border-b border-gold-light/35 sm:min-h-[54svh] lg:order-2 lg:min-h-[100svh] lg:border-b-0 lg:border-l">
          <motion.div
            className="pointer-events-none absolute -inset-x-5 -inset-y-16"
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
                    ? { scale: [1.045, 1.015] }
                    : { scale: 1.015 }
              }
              transition={{
                scale: {
                  duration: 14,
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
                  className="h-full w-full object-cover object-[50%_70%] md:object-[50%_55%] lg:object-[52%_50%]"
                />
              </picture>
            </motion.div>
          </motion.div>

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/5 via-transparent to-navy/30 lg:bg-[linear-gradient(90deg,rgba(11,22,43,0.18)_0%,transparent_20%,transparent_100%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-3 rounded-[1.75rem] border border-white/30 shadow-[inset_0_0_100px_rgba(11,22,43,0.12)] sm:inset-5 sm:rounded-[2.25rem] lg:rounded-[2.75rem]"
            aria-hidden="true"
          />

          <FlyingPlane
            top="11%"
            size={26}
            duration={26}
            repeatDelay={10}
            tone="text-gold-light"
            trailWidth="w-28"
            className="opacity-70"
          />

          <div
            className="pointer-events-none absolute bottom-7 right-7 z-10 hidden items-center gap-2 text-white/70 sm:flex lg:bottom-9 lg:right-9"
            aria-hidden="true"
          >
            <span className="h-px w-9 bg-gold-light/70" />
            <span className="label-caps text-[9px]">LOVE · {event.flightCode}</span>
          </div>
        </div>

        {/* Editorial invitation panel: independent from the photograph rather
            than a glass card floating on top of the couple. */}
        <div className="relative order-2 flex overflow-hidden bg-[linear-gradient(145deg,var(--color-navy)_0%,#223557_58%,var(--color-navy)_100%)] lg:order-1">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(232,213,160,0.15),transparent_32%),radial-gradient(circle_at_82%_86%,rgba(196,216,232,0.12),transparent_34%)]"
            aria-hidden="true"
          />
          <div
            className="paper-grain pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute bottom-[9%] left-0 h-px w-28 bg-gradient-to-r from-gold-light/50 to-transparent"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute right-0 top-[13%] h-px w-20 bg-gradient-to-l from-gold-light/40 to-transparent"
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

          <motion.div
            className="relative z-20 mx-auto flex w-full max-w-[39rem] flex-col justify-center px-5 py-14 sm:px-10 sm:py-16 lg:px-[clamp(2.5rem,5vw,5rem)] lg:py-20"
            variants={staggerContainer}
            initial={reduce ? 'visible' : 'hidden'}
            animate={reduce || isRevealed ? 'visible' : 'hidden'}
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-2.5 pr-14 text-sky-soft/80"
            >
              <span className="h-px w-9 bg-gold-light/55" />
              <Plane
                className="h-3.5 w-3.5 rotate-45 text-gold-light"
                strokeWidth={1.4}
              />
              <span className="label-caps text-[9px] sm:text-[10px]">
                {event.airline}
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-7 sm:mt-9">
              <p className="label-caps text-[10px] text-gold-light/90 sm:text-[11px]">
                {t.hero.kicker}
              </p>
              <h1 className="mt-2 font-display font-normal leading-[0.82] tracking-[-0.025em] text-warm-white">
                <span className="block text-[clamp(3.25rem,15vw,5.75rem)] lg:text-[clamp(4rem,6.3vw,6.4rem)]">
                  Flight to
                </span>
                <span className="text-gold-shimmer block pb-2 pl-[0.04em] text-[clamp(4.1rem,18vw,7.25rem)] italic lg:text-[clamp(5.2rem,7.7vw,8rem)]">
                  Forever
                </span>
              </h1>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-4 flex max-w-full flex-wrap items-center gap-x-3 gap-y-1 font-script text-[clamp(2.15rem,10vw,3.2rem)] leading-none text-warm-white sm:gap-x-4 lg:text-[clamp(2.6rem,3.8vw,3.65rem)]"
            >
              <motion.span
                initial={false}
                animate={
                  reduce || isRevealed
                    ? { x: 0, opacity: 1 }
                    : { x: -24, opacity: 0 }
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
                      : {
                          scale: [0.8, 1.45, 0.8],
                          opacity: [0.2, 0.48, 0.2],
                        }
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
                    : { x: 24, opacity: 0 }
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
              className="label-caps mt-4 text-[10px] text-sky-soft/85 sm:text-[11px]"
            >
              {weekday} · {date.displayDate}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-6 border-y border-gold-light/20 py-4 sm:mt-7 sm:py-5"
            >
              {guestName ? (
                <>
                  <span className="label-caps text-[9px] text-sky-soft/65 sm:text-[10px]">
                    {t.hero.inviteLabel}
                  </span>
                  <span className="mt-0.5 block font-script text-[1.9rem] leading-snug text-gold-light sm:text-[2.15rem]">
                    {guestName}
                  </span>
                </>
              ) : (
                <span className="font-display text-xl font-medium text-gold-light sm:text-2xl">
                  {t.hero.inviteFallback}
                </span>
              )}
              <p className="mt-1 max-w-lg text-[11px] leading-relaxed text-sky-soft/80 sm:text-xs">
                {t.hero.inviteLine}
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 w-full sm:mt-7">
              <Countdown
                iso={date.iso}
                tone="light"
                className="w-full gap-1.5 sm:gap-2.5 [&>div]:min-w-0 [&>div]:flex-1 [&>div]:rounded-[1rem] [&>div]:border-gold-light/20 [&>div]:bg-white/[0.055] [&>div]:px-1.5 [&>div]:py-2.5 sm:[&>div]:px-2 sm:[&>div]:py-3 [&>div>span:first-child]:font-display [&>div>span:first-child]:text-[1.7rem] [&>div>span:first-child]:font-medium [&>div>span:first-child]:leading-none [&>div>span:first-child]:tracking-[0.035em] [&>div>span:first-child]:tabular-nums sm:[&>div>span:first-child]:text-[2rem]"
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col items-center gap-2.5 sm:mt-9 lg:items-start"
            >
              <RunwayLights
                count={10}
                className="scale-x-90 text-gold-light opacity-70"
              />
              <motion.div
                className="flex flex-col items-center text-warm-white/60 lg:items-start"
                animate={reduce ? undefined : { y: [0, 4, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <span className="label-caps text-[8px]">{t.hero.scroll}</span>
                <ChevronDown className="h-4 w-4 lg:ml-2" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-2 z-30 rounded-[1.6rem] border border-white/10 sm:inset-3 sm:rounded-[2.1rem] lg:rounded-[2.8rem]"
        aria-hidden="true"
      />

      {/* A two-panel aperture opens once the guest has boarded. */}
      {!reduce && (
        <div
          className="pointer-events-none absolute inset-0 z-40"
          aria-hidden="true"
        >
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
