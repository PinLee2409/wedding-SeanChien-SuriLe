import { useEffect, useRef } from 'react'
import { useInView } from 'motion/react'
import confetti from 'canvas-confetti'
import { Plane } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { useI18n } from '../../i18n/LanguageContext'
import { formatWeekday } from '../../i18n/translations'
import { Clouds } from '../decorations/Clouds'
import { FlyingPlane } from '../decorations/FlyingPlane'
import { FloatingHearts } from '../decorations/FloatingHearts'
import { RunwayLights } from '../decorations/RunwayLights'
import { Reveal } from '../ui/Reveal'

const GOLD_COLORS = ['#c68a74', '#e9c5b5', '#fffefd', '#dba8a3']

export function FinalThankYou({ config }: { config: WeddingConfig }) {
  const { couple, date, event } = config
  const { t, lang } = useI18n()
  const weekday = formatWeekday(date.iso, lang)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (!inView) return
    // canvas-confetti auto-skips when the user prefers reduced motion.
    const shoot = (originX: number, angle: number) =>
      confetti({
        particleCount: 40,
        spread: 60,
        angle,
        startVelocity: 45,
        origin: { x: originX, y: 0.7 },
        colors: GOLD_COLORS,
        disableForReducedMotion: true,
        zIndex: 5,
      })
    shoot(0.15, 60)
    shoot(0.85, 120)
  }, [inView])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[80svh] flex-col items-center justify-center overflow-hidden bg-navy px-5 py-24 text-center text-warm-white"
      aria-label={t.thanks.heading}
    >
      <Clouds tone="sky" className="opacity-20" />

      {/* A farewell squadron crossing the night sky, rising hearts below. */}
      <FloatingHearts className="z-[1] opacity-70" />
      <FlyingPlane top="13%" size={24} duration={20} tone="text-gold" trailWidth="w-24" />
      <FlyingPlane
        top="24%"
        size={16}
        duration={27}
        delay={-9}
        repeatDelay={4}
        direction="rtl"
        tone="text-sky-soft"
        trailWidth="w-16"
      />
      <FlyingPlane
        top="82%"
        size={20}
        duration={23}
        delay={-4}
        repeatDelay={5}
        tone="text-rosegold"
        trailWidth="w-20"
      />

      <Reveal className="relative z-10 flex flex-col items-center gap-5">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-gold/40 text-gold">
          <Plane className="h-7 w-7 rotate-45" strokeWidth={1.4} />
        </span>

        <p className="label-caps text-xs text-gold">{t.thanks.tagline}</p>

        <h2 className="font-display text-5xl font-semibold sm:text-6xl">
          {t.thanks.heading}
        </h2>

        <p className="max-w-md text-balance text-sm leading-relaxed text-sky-soft sm:text-base">
          {t.thanks.message}
        </p>

        <div className="mt-2 flex items-center gap-4 font-script text-4xl leading-snug sm:text-5xl">
          <span>{couple.groom.name}</span>
          <span className="font-display text-3xl text-gold">&amp;</span>
          <span>{couple.bride.name}</span>
        </div>

        <p className="label-caps text-[11px] text-warm-white/80">
          {weekday} · {date.displayDate}
        </p>

        {couple.hashtag && (
          <p className="font-mono text-sm text-gold">{couple.hashtag}</p>
        )}
      </Reveal>

      <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-3">
        <RunwayLights count={12} />
        <p className="label-caps text-[9px] text-warm-white/50">
          {event.airline} · {`LOVE-${event.flightCode}`}
        </p>
      </div>
    </section>
  )
}
