import { Heart, Plane } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { WeddingConfig } from '../../config/wedding.config'
import { getOrderedCouple } from '../../lib/couple'
import { useI18n } from '../../i18n/LanguageContext'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { PassportStamp } from '../decorations/PassportStamp'
import { RomanticAura } from '../decorations/RomanticAura'
import { CoupleProfile } from './CoupleProfile'

export function LoveMessage({ config }: { config: WeddingConfig }) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [firstPartner, secondPartner] = getOrderedCouple(config)

  return (
    <section
      id="message"
      className="relative overflow-hidden bg-gradient-to-b from-warm-white via-rose/10 to-ivory px-5 py-24 sm:py-28"
      aria-label={t.love.title}
    >
      <RomanticAura />

      <PassportStamp
        top="Save the Date"
        date={config.date.displayDate.replace(/\s·\s/g, '.').slice(0, 5)}
        bottom="Approved"
        className="absolute -right-2 top-8 hidden opacity-70 md:grid"
      />

      <div className="relative z-10 mx-auto max-w-3xl [perspective:1200px]">
        <div className="relative pt-14 sm:pt-20">
          <motion.div
            className="pointer-events-none absolute left-1/2 top-8 h-44 w-[92%] -translate-x-1/2 origin-top bg-gradient-to-b from-beige via-ivory-deep to-cream shadow-[0_22px_45px_-30px_rgba(27,42,74,0.55)] [clip-path:polygon(0_0,100%_0,50%_100%)] sm:top-12 sm:h-56"
            initial={reduce ? false : { rotateX: 0, opacity: 0 }}
            whileInView={
              reduce ? undefined : { rotateX: -118, opacity: [0, 1, 0.78] }
            }
            viewport={{ once: true, amount: 0.32 }}
            transition={{ duration: 1.15, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          />

          <motion.article
            className="paper-grain relative overflow-hidden rounded-[2rem] border border-gold/30 bg-warm-white/95 px-6 pb-10 pt-12 text-center shadow-[0_34px_80px_-42px_rgba(27,42,74,0.62)] sm:rounded-[2.5rem] sm:px-12 sm:pb-14 sm:pt-14"
            initial={reduce ? false : { opacity: 0, y: 56, scale: 0.96, rotateX: 5 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 1, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="absolute inset-x-0 top-0 h-2"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, var(--color-navy) 0 18px, transparent 18px 28px, var(--color-rose) 28px 46px, transparent 46px 56px)',
              }}
              aria-hidden="true"
            />

            <div className="mb-8 flex items-center justify-center gap-3 text-gold-dark" aria-hidden="true">
              <span className="h-px w-16 border-t border-dashed border-gold/55 sm:w-24" />
              <motion.span
                initial={reduce ? false : { x: -26, opacity: 0, rotate: 30 }}
                whileInView={reduce ? undefined : { x: 0, opacity: 1, rotate: 45 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.85, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Plane className="h-5 w-5" strokeWidth={1.4} />
              </motion.span>
              <span className="h-px w-16 border-t border-dashed border-gold/55 sm:w-24" />
            </div>

            <Reveal>
              <SectionHeading kicker={t.love.kicker} title={t.love.title} />
            </Reveal>

            <div className="mt-9 flex flex-col items-center gap-5">
              {t.love.body.map((paragraph, i) => (
                <motion.p
                  key={i}
                  className="text-balance font-display text-xl italic leading-relaxed text-navy sm:text-2xl"
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.75, delay: 0.56 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                >
                  {paragraph}
                </motion.p>
              ))}
              <p className="mt-2 text-sm text-navy-400">{t.love.signature}</p>
              <motion.span
                className="inline-flex text-rose"
                aria-hidden="true"
                animate={
                  reduce
                    ? undefined
                    : { scale: [1, 1.18, 1], rotate: [0, -4, 0, 4, 0] }
                }
                transition={{
                  duration: 1.05,
                  repeat: Infinity,
                  repeatDelay: 3.2,
                  ease: 'easeInOut',
                }}
              >
                <Heart className="h-5 w-5 fill-current" strokeWidth={1.2} />
              </motion.span>
              <p className="font-script text-4xl leading-snug text-gold-dark sm:text-5xl">
                {firstPartner.person.name} &amp; {secondPartner.person.name}
              </p>
            </div>
          </motion.article>

          <div
            className="pointer-events-none absolute -bottom-5 left-1/2 -z-10 h-36 w-[94%] -translate-x-1/2 rounded-b-[2.5rem] border border-gold/20 bg-gradient-to-br from-ivory-deep via-cream to-beige shadow-[0_24px_55px_-38px_rgba(27,42,74,0.58)]"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Couple & family — always two columns */}
      <Reveal delay={0.1} className="relative z-10 mt-20">
        <CoupleProfile config={config} />
      </Reveal>
    </section>
  )
}
