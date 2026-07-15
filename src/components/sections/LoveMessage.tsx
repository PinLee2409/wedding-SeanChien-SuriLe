import { Heart, Plane, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import type { WeddingConfig } from '../../config/wedding.config'
import { useI18n } from '../../i18n/LanguageContext'
import { getOrderedCouple } from '../../lib/couple'
import { RomanticAura } from '../decorations/RomanticAura'
import { Reveal } from '../ui/Reveal'
import { CoupleProfile } from './CoupleProfile'

const letterEase = [0.22, 1, 0.36, 1] as const

const stationeryVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 42,
    scale: 0.965,
    rotateX: 7,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.92,
      ease: letterEase,
      delayChildren: 0.28,
      staggerChildren: 0.1,
    },
  },
}

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.64, ease: letterEase },
  },
}

const routeVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.85, delay: 0.16, ease: letterEase },
  },
}

const sealVariants: Variants = {
  hidden: { opacity: 0, scale: 0.35, rotate: -24 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: -7,
    transition: {
      type: 'spring',
      stiffness: 180,
      damping: 14,
      delay: 0.54,
    },
  },
}

function OrnamentalCorners() {
  return (
    <div className="pointer-events-none absolute inset-3 sm:inset-5" aria-hidden="true">
      <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l border-t border-gold/50 sm:h-14 sm:w-14" />
      <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r border-t border-gold/50 sm:h-14 sm:w-14" />
      <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b border-l border-gold/50 sm:h-14 sm:w-14" />
      <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b border-r border-gold/50 sm:h-14 sm:w-14" />
    </div>
  )
}

export function LoveMessage({ config }: { config: WeddingConfig }) {
  const { t } = useI18n()
  const reduce = !!useReducedMotion()
  const [firstPartner, secondPartner] = getOrderedCouple(config)
  const displayDate = config.date.displayDate.replace(/\s·\s/g, ' / ')

  return (
    <section
      id="message"
      className="relative overflow-hidden bg-gradient-to-b from-warm-white via-rose/10 to-ivory px-4 py-20 sm:px-6 sm:py-28"
      aria-label={t.love.title}
    >
      <RomanticAura />

      <div
        className="pointer-events-none absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-rose/15 blur-3xl sm:h-[30rem] sm:w-[30rem]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl [perspective:1400px]">
        <motion.div
          initial={reduce ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          className="relative px-1 py-6 sm:px-7 sm:py-9"
        >
          <motion.div
            className="pointer-events-none absolute inset-x-5 inset-y-8 rotate-[-2.2deg] rounded-[2rem] border border-gold/20 bg-gold-light/25 shadow-[0_28px_70px_-52px_rgba(27,42,74,0.85)] sm:inset-x-10 sm:rounded-[2.8rem]"
            initial={reduce ? false : { opacity: 0, rotate: 0, scale: 0.98 }}
            whileInView={
              reduce ? undefined : { opacity: 1, rotate: -2.2, scale: 1 }
            }
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, delay: 0.12, ease: letterEase }}
            aria-hidden="true"
          />

          <motion.div
            className="pointer-events-none absolute inset-x-5 inset-y-8 rotate-[1.6deg] rounded-[2rem] border border-rose/25 bg-rose/20 sm:inset-x-10 sm:rounded-[2.8rem]"
            initial={reduce ? false : { opacity: 0, rotate: 0, scale: 0.98 }}
            whileInView={
              reduce ? undefined : { opacity: 1, rotate: 1.6, scale: 1 }
            }
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, delay: 0.18, ease: letterEase }}
            aria-hidden="true"
          />

          <motion.article
            variants={stationeryVariants}
            className="paper-grain relative isolate overflow-visible rounded-[1.8rem] border border-gold/25 bg-warm-white/95 px-5 pb-10 pt-16 text-center shadow-[0_35px_90px_-50px_rgba(27,42,74,0.58),0_8px_24px_-16px_rgba(166,132,58,0.4)] ring-1 ring-white/80 sm:rounded-[3rem] sm:px-14 sm:pb-16 sm:pt-20 lg:px-20"
            aria-label={t.love.title}
          >
            <OrnamentalCorners />

            <div
              className="pointer-events-none absolute left-1/2 top-0 h-12 w-px -translate-x-1/2 bg-gradient-to-b from-gold/55 to-gold/10 sm:h-16"
              aria-hidden="true"
            />
            <div
              className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <motion.span
                variants={sealVariants}
                className="grid h-12 w-12 place-items-center rounded-full border border-gold-light/75 bg-gradient-to-br from-[#d79ba3] via-rose to-[#bd7f89] text-warm-white shadow-[0_12px_24px_-12px_rgba(164,80,99,0.9),inset_0_0_0_4px_rgba(255,255,255,0.14)] sm:h-14 sm:w-14"
              >
                <Heart className="h-5 w-5 fill-current" strokeWidth={1.1} />
              </motion.span>
            </div>

            <motion.div variants={contentVariants} className="relative mx-auto max-w-2xl">
              <div className="mb-6 flex items-center justify-center gap-3 text-gold-dark sm:mb-8">
                <motion.span
                  variants={routeVariants}
                  className="h-px min-w-0 flex-1 origin-right bg-gradient-to-r from-transparent via-gold/55 to-gold"
                  aria-hidden="true"
                />
                <motion.span
                  initial={reduce ? false : { opacity: 0, x: -28, rotate: -25 }}
                  whileInView={
                    reduce ? undefined : { opacity: 1, x: 0, rotate: -8 }
                  }
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.72, delay: 0.52, ease: letterEase }}
                  aria-hidden="true"
                >
                  <Plane className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.35} />
                </motion.span>
                <motion.span
                  variants={routeVariants}
                  className="h-px min-w-0 flex-1 origin-left bg-gradient-to-l from-transparent via-gold/55 to-gold"
                  aria-hidden="true"
                />
              </div>

              <motion.p
                variants={contentVariants}
                className="label-caps text-[0.58rem] text-gold-dark sm:text-[0.68rem]"
              >
                {t.love.kicker}
              </motion.p>

              <motion.h2
                variants={contentVariants}
                className="mx-auto mt-3 max-w-[18ch] text-balance font-display text-[clamp(2rem,8.6vw,3.8rem)] font-medium leading-[1.02] tracking-[-0.025em] text-navy"
              >
                {t.love.title}
              </motion.h2>

              <motion.div
                variants={contentVariants}
                className="mx-auto my-6 flex items-center justify-center gap-2.5 text-rose sm:my-8"
                aria-hidden="true"
              >
                <Sparkles className="h-3 w-3" strokeWidth={1.35} />
                <span className="h-1 w-1 rounded-full bg-gold" />
                <Heart className="h-3.5 w-3.5 fill-current" strokeWidth={1.1} />
                <span className="h-1 w-1 rounded-full bg-gold" />
                <Sparkles className="h-3 w-3" strokeWidth={1.35} />
              </motion.div>

              <div className="mx-auto flex max-w-[38rem] flex-col items-center gap-4 sm:gap-5">
                {t.love.body.map((paragraph, index) => (
                  <motion.p
                    key={index}
                    variants={contentVariants}
                    className="text-balance font-display text-[1.08rem] italic leading-[1.75] text-navy/90 sm:text-[1.42rem] sm:leading-[1.7]"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              <motion.div
                variants={contentVariants}
                className="mx-auto mt-8 flex max-w-md items-center gap-4 sm:mt-10"
                aria-hidden="true"
              >
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
                <Heart className="h-3 w-3 fill-rose text-rose" strokeWidth={1} />
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
              </motion.div>

              <motion.p
                variants={contentVariants}
                className="mt-5 text-xs leading-relaxed text-navy-400 sm:text-sm"
              >
                {t.love.signature}
              </motion.p>

              <motion.p
                variants={contentVariants}
                className="mx-auto mt-2 flex max-w-full flex-wrap items-baseline justify-center gap-x-2 font-script text-[clamp(1.7rem,7vw,3.4rem)] leading-[1.2] text-gold-dark sm:gap-x-3"
              >
                <span>{firstPartner.person.name}</span>
                <span className="font-display text-[0.58em] italic text-rose">
                  &amp;
                </span>
                <span>{secondPartner.person.name}</span>
              </motion.p>

              <motion.div
                variants={contentVariants}
                className="mt-7 flex items-center justify-center gap-3 text-[0.57rem] uppercase tracking-[0.22em] text-navy-400 sm:mt-9 sm:text-[0.64rem] sm:tracking-[0.3em]"
              >
                <span className="h-px w-5 bg-gold/40" aria-hidden="true" />
                <time dateTime={config.date.iso}>{displayDate}</time>
                <span className="h-px w-5 bg-gold/40" aria-hidden="true" />
              </motion.div>
            </motion.div>
          </motion.article>
        </motion.div>
      </div>

      <Reveal delay={0.1} className="relative z-10 mt-12 sm:mt-16">
        <CoupleProfile config={config} />
      </Reveal>
    </section>
  )
}
