import { motion, useReducedMotion } from 'motion/react'
import { ChevronDown, Plane } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { fadeUp, staggerContainer } from '../../lib/motion'
import { useI18n } from '../../i18n/LanguageContext'
import { formatWeekday } from '../../i18n/translations'
import { Clouds } from '../decorations/Clouds'
import { FlyingPlane } from '../decorations/FlyingPlane'
import { FloatingHearts } from '../decorations/FloatingHearts'
import { RunwayLights } from '../decorations/RunwayLights'
import { Countdown } from '../ui/Countdown'
import { MusicToggle } from '../ui/MusicToggle'
import { SmartImage } from '../ui/SmartImage'

interface HeroSectionProps {
  config: WeddingConfig
  guestName: string
  isMusicPlaying: boolean
  onToggleMusic: () => void
  musicEnabled: boolean
}

export function HeroSection({
  config,
  guestName,
  isMusicPlaying,
  onToggleMusic,
  musicEnabled,
}: HeroSectionProps) {
  const reduce = useReducedMotion()
  const { t, lang } = useI18n()
  const { event, couple, date, hero } = config
  const weekday = formatWeekday(date.iso, lang)

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-sky-soft px-5 py-16 text-center text-navy"
      aria-label={t.hero.aria}
    >
      {/* Background: video if provided, otherwise a poster image. */}
      <div className="absolute inset-0">
        {hero.backgroundVideo ? (
          <video
            className="h-full w-full object-cover"
            src={hero.backgroundVideo}
            poster={hero.backgroundImage}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <SmartImage
            src={hero.backgroundImage}
            alt=""
            loading="eager"
            placeholder="bare"
            className="h-full w-full"
          />
        )}
        {/* Bright elegant sky gradient — follows the active colour theme. */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-soft/90 via-ivory/70 to-beige/80" />
      </div>

      {/* Ambient sky: clouds, a squadron of planes and a field of hearts. */}
      <Clouds className="opacity-40" />
      <FloatingHearts className="z-[5]" />
      <FlyingPlane top="16%" size={28} duration={17} tone="text-navy" />
      <FlyingPlane
        top="30%"
        size={20}
        duration={22}
        delay={-6}
        repeatDelay={3}
        direction="rtl"
        tone="text-gold-dark"
        trailWidth="w-20"
      />
      <FlyingPlane
        top="52%"
        size={16}
        duration={26}
        delay={-12}
        repeatDelay={4}
        tone="text-navy-500"
        trailWidth="w-16"
      />
      <FlyingPlane
        top="68%"
        size={22}
        duration={20}
        delay={-3}
        repeatDelay={6}
        direction="rtl"
        tone="text-rosegold"
        trailWidth="w-24"
      />

      {/* "Airplane window" frame */}
      <div className="pointer-events-none absolute inset-3 rounded-[2rem] border border-navy/10 sm:inset-5" />

      {/* Music toggle — top right */}
      {musicEnabled && (
        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
          <MusicToggle
            isPlaying={isMusicPlaying}
            onToggle={onToggleMusic}
            variant="inline"
          />
        </div>
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 flex max-w-xl flex-col items-center gap-5"
        variants={staggerContainer}
        initial={reduce ? 'visible' : 'hidden'}
        animate="visible"
      >
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-2 text-navy-400"
        >
          <span className="h-px w-8 bg-navy-400/60" />
          <Plane className="h-4 w-4 rotate-45 text-gold" strokeWidth={1.5} />
          <span className="label-caps text-[11px]">{event.airline}</span>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="label-caps text-xs text-gold-dark sm:text-sm"
        >
          {t.hero.kicker}
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="text-display font-display font-semibold uppercase tracking-wide text-navy"
        >
          Flight to{' '}
          <span className="text-gold-shimmer block">Forever</span>
        </motion.h1>

        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center gap-4 font-script text-[clamp(2.1rem,7.5vw,3.4rem)] leading-snug text-navy"
        >
          <span>{couple.groom.name}</span>
          <Plane className="h-5 w-5 shrink-0 rotate-45 text-gold-dark" strokeWidth={1.5} />
          <span>{couple.bride.name}</span>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col items-center gap-1">
          <p className="label-caps text-sm text-navy-600">
            {weekday} · {date.displayDate}
          </p>
        </motion.div>

        {/* Personalised greeting */}
        <motion.div
          variants={fadeUp}
          className="mt-1 flex flex-col items-center rounded-2xl border border-gold/30 bg-white/60 px-6 py-4 shadow-sm backdrop-blur-md"
        >
          {guestName ? (
            <>
              <span className="label-caps text-[11px] text-navy-400">
                {t.hero.inviteLabel}
              </span>
              <span className="mt-1.5 font-script text-3xl leading-snug text-gold-dark sm:text-4xl">
                {guestName}
              </span>
            </>
          ) : (
            <span className="font-display text-xl font-semibold text-gold-dark sm:text-2xl">
              {t.hero.inviteFallback}
            </span>
          )}
          <p className="mt-2 text-xs text-navy-600 sm:text-sm">{t.hero.inviteLine}</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Countdown iso={date.iso} tone="navy" className="mt-2" />
        </motion.div>
      </motion.div>

      {/* Runway lights + scroll cue */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-3">
        <RunwayLights count={10} className="opacity-80" />
        {!reduce && (
          <motion.div
            className="flex flex-col items-center text-navy/60"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="label-caps text-[9px]">{t.hero.scroll}</span>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        )}
      </div>
    </section>
  )
}
