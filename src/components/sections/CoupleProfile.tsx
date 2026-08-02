import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Person, WeddingConfig } from '../../config/wedding.config'
import { cn } from '../../lib/cn'
import { getOrderedCouple } from '../../lib/couple'
import type { CoupleKey } from '../../lib/couple'
import portraitFraming from '../../config/portraitFraming.json'
import { easeLux } from '../../lib/motion'
import { useI18n } from '../../i18n/LanguageContext'
import { RomanticAura } from '../decorations/RomanticAura'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { SmartImage } from '../ui/SmartImage'

const PORTRAIT_SIZE = 'w-[clamp(5.75rem,30vw,10rem)]'

interface Framing {
  /** Zoom factor inside the arch frame. */
  scale: number
  /** Focal point in percent — drives both the crop and the zoom origin. */
  x: number
  y: number
}

const DEFAULT_FRAMING: Framing = { scale: 1, x: 50, y: 8 }

function framingFor(key: CoupleKey): Framing {
  const value = (portraitFraming as Record<string, unknown>)[key]
  return value && typeof value === 'object' ? { ...DEFAULT_FRAMING, ...value } : DEFAULT_FRAMING
}

function ProfileCard({
  person,
  role,
  entryX,
  delay,
  framing,
  reverseFrame = false,
}: {
  person: Person
  role: string
  entryX: number
  delay: number
  /** Crop and zoom for this portrait, tuned in the photo admin. */
  framing: Framing
  reverseFrame?: boolean
}) {
  const reduce = useReducedMotion()

  return (
    <motion.article
      className="group relative flex min-w-0 flex-col items-center text-center"
      initial={reduce ? false : { opacity: 0, x: entryX, scale: 0.97 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      whileHover={reduce ? undefined : { y: -4 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.78, ease: easeLux, delay }}
    >
      <div className={cn('relative', PORTRAIT_SIZE)}>
        <span
          className={cn(
            'absolute inset-1 border border-gold/30 bg-gold-light/15 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0',
            'rounded-t-[999px] rounded-b-[1.8rem] sm:rounded-b-[2.4rem]',
            reverseFrame
              ? '-translate-x-1.5 translate-y-1.5'
              : 'translate-x-1.5 translate-y-1.5',
          )}
          aria-hidden="true"
        />
        <span
          className="absolute -inset-1 rounded-full bg-gold/0 blur-lg transition duration-500 group-hover:bg-gold/20"
          aria-hidden="true"
        />
        <SmartImage
          src={person.photo}
          alt={person.name}
          label=""
          /* 2:3 — the same shape as the photographs themselves, so a portrait
             at scale 1 is shown whole rather than cropped into a square. */
          className="relative aspect-[2/3] w-full rounded-t-[999px] rounded-b-[1.8rem] border-[3px] border-warm-white shadow-[0_18px_38px_-20px_rgba(27,42,74,0.72)] ring-1 ring-gold/35 sm:rounded-b-[2.4rem] sm:border-[5px]"
          imgStyle={{
            objectPosition: `${framing.x}% ${framing.y}%`,
            transform: framing.scale === 1 ? undefined : `scale(${framing.scale})`,
            transformOrigin: `${framing.x}% ${framing.y}%`,
          }}
        />
      </div>

      <span className="label-caps mt-3 text-[clamp(0.62rem,2.6vw,0.82rem)] text-gold sm:mt-4">
        {role}
      </span>
      <h3 className="mt-1.5 max-w-full text-balance break-words font-display text-[clamp(1.15rem,4.8vw,2.1rem)] font-semibold leading-tight text-navy">
        {person.fullName ?? person.name}
      </h3>
    </motion.article>
  )
}

/** Couple portraits — ordered per repository and joined as one composition. */
function CoupleCard({ config }: { config: WeddingConfig }) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const orderedCouple = getOrderedCouple(config)

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.25rem] border border-gold/20 bg-gradient-to-br from-warm-white/90 via-ivory/85 to-sky-soft/55 p-3 shadow-[0_24px_70px_-42px_rgba(27,42,74,0.55)] backdrop-blur-sm sm:rounded-[3rem] sm:p-7 lg:p-10">
      <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-rose/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -right-14 h-56 w-56 rounded-full bg-sky/20 blur-3xl" aria-hidden="true" />

      <div className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-1 sm:gap-5">
        <span
          className="pointer-events-none absolute left-[12%] right-[12%] top-[clamp(2.875rem,15vw,5rem)] border-t border-dashed border-gold/30"
          aria-hidden="true"
        />
        <ProfileCard
          person={orderedCouple[0].person}
          role={
            orderedCouple[0].key === 'groom'
              ? t.couple.groomRole
              : t.couple.brideRole
          }
          entryX={-22}
          delay={0}
          framing={framingFor(orderedCouple[0].key)}
        />

        {/* A permanent visual bond between both portraits, including 320px. */}
        <motion.div
          className="relative z-10 flex h-[clamp(5.75rem,30vw,10rem)] w-10 items-center justify-center sm:w-16"
          aria-hidden="true"
          initial={reduce ? false : { opacity: 0, scale: 0.55 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            type: 'spring',
            stiffness: 210,
            damping: 14,
            delay: reduce ? 0 : 0.48,
          }}
        >
          <span className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <span className="absolute h-14 w-14 rounded-full bg-rose/15 blur-xl sm:h-20 sm:w-20" />
          <span className="relative grid h-10 w-10 place-items-center rounded-full border border-gold/45 bg-warm-white text-rose shadow-[0_10px_25px_-12px_rgba(200,120,140,0.7)] sm:h-13 sm:w-13">
            <motion.span
              className="inline-flex"
              animate={reduce ? undefined : { scale: [1, 1.14, 1] }}
              transition={{
                duration: 0.85,
                repeat: Infinity,
                repeatDelay: 2.6,
                ease: 'easeInOut',
              }}
            >
              <Heart
                className="h-5 w-5 fill-current sm:h-6 sm:w-6"
                strokeWidth={1.4}
              />
            </motion.span>
          </span>
        </motion.div>

        <ProfileCard
          person={orderedCouple[1].person}
          role={
            orderedCouple[1].key === 'groom'
              ? t.couple.groomRole
              : t.couple.brideRole
          }
          entryX={22}
          delay={0.12}
          reverseFrame
          framing={framingFor(orderedCouple[1].key)}
        />
      </div>
    </div>
  )
}

/**
 * "The flight crew" — the couple introduced straight after the hero, so guests
 * know who they are flying with before the journey is told. Opens the long
 * ivory run that carries through the timeline into the flight details.
 */
export function CoupleProfile({ config }: { config: WeddingConfig }) {
  const { t } = useI18n()

  return (
    <section
      id="couple"
      className="relative overflow-hidden bg-gradient-to-b from-cream via-ivory to-ivory px-5 py-20 sm:py-24"
      aria-label={t.couple.title}
    >
      <RomanticAura className="opacity-60" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            kicker={t.couple.kicker}
            title={t.couple.title}
            subtitle={t.couple.subtitle}
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-12 sm:mt-14">
          <CoupleCard config={config} />
        </Reveal>
      </div>
    </section>
  )
}
