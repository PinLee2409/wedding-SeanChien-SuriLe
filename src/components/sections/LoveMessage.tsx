import { Heart, Plane } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import type { WeddingConfig } from '../../config/wedding.config'
import { getOrderedCouple } from '../../lib/couple'
import { useI18n } from '../../i18n/LanguageContext'
import { PassportStamp } from '../decorations/PassportStamp'
import { RomanticAura } from '../decorations/RomanticAura'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { CoupleProfile } from './CoupleProfile'

const envelopeEase = [0.22, 1, 0.36, 1] as const

const flapVariants: Variants = {
  closed: { rotateX: 0, opacity: 1, visibility: 'visible', zIndex: 50 },
  open: {
    rotateX: -158,
    opacity: 0,
    transition: {
      rotateX: { duration: 0.72, delay: 0.24, ease: envelopeEase },
      opacity: { duration: 0.16, delay: 0.8, ease: 'easeOut' },
    },
    // A transformed 3D face can paint above siblings even after its z-index
    // changes. Hide it once the fold finishes, before the letter starts rising.
    transitionEnd: { visibility: 'hidden', zIndex: 10 },
  },
}

const sealVariants: Variants = {
  closed: { opacity: 1, scale: 1, y: 0 },
  open: {
    opacity: 0,
    scale: 0.72,
    y: 10,
    transition: { duration: 0.28, delay: 0.08, ease: 'easeOut' },
  },
}

const letterVariants: Variants = {
  closed: { opacity: 0.4, y: '68%', scale: 0.965, rotateX: -5 },
  open: {
    opacity: 1,
    y: '0%',
    scale: 1,
    rotateX: 0,
    transition: { duration: 1.08, delay: 0.9, ease: envelopeEase },
  },
}

const contentVariants: Variants = {
  closed: { opacity: 0, y: 18, filter: 'blur(7px)' },
  open: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      delay: 1.62,
      delayChildren: 1.68,
      staggerChildren: 0.1,
      ease: envelopeEase,
    },
  },
}

const contentItemVariants: Variants = {
  closed: { opacity: 0, y: 12 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.56, ease: envelopeEase },
  },
}

export function LoveMessage({ config }: { config: WeddingConfig }) {
  const { t } = useI18n()
  const reduce = !!useReducedMotion()
  const [firstPartner, secondPartner] = getOrderedCouple(config)

  return (
    <section
      id="message"
      className="relative overflow-hidden bg-gradient-to-b from-warm-white via-rose/10 to-ivory px-4 py-20 sm:px-5 sm:py-28"
      aria-label={t.love.title}
    >
      <RomanticAura />

      <PassportStamp
        top="Save the Date"
        date={config.date.displayDate.replace(/\s·\s/g, '.').slice(0, 5)}
        bottom="Approved"
        className="absolute -right-2 top-8 hidden opacity-60 md:grid"
      />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl [perspective:1600px]"
        initial={reduce ? 'open' : 'closed'}
        whileInView="open"
        viewport={{ once: true, amount: 0.12 }}
      >
        {/*
         * The bottom padding owns the envelope's physical height. In the open
         * state the letter ends above that reserved area, so no flap or pocket
         * can ever cover the signature — regardless of copy length or viewport.
         */}
        <div className="relative isolate pb-36 [transform-style:preserve-3d] sm:pb-44">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-36 rounded-[1.75rem] border border-gold/25 bg-gradient-to-br from-beige via-ivory-deep to-cream shadow-[0_30px_64px_-38px_rgba(27,42,74,0.72)] sm:h-44 sm:rounded-[2.4rem]"
            aria-hidden="true"
          />

          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-50 h-36 origin-top [transform-style:preserve-3d] sm:h-44"
            variants={flapVariants}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-beige via-ivory-deep to-cream [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-warm-white via-cream to-beige [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)] [transform:rotateX(180deg)]" />
          </motion.div>

          <motion.article
            variants={letterVariants}
            className="paper-grain relative z-30 mx-auto w-[96%] rounded-[1.5rem] border border-gold/30 bg-warm-white/95 px-5 py-10 text-center shadow-[0_30px_60px_-36px_rgba(27,42,74,0.48)] ring-1 ring-white/75 will-change-transform sm:w-[92%] sm:rounded-[2.2rem] sm:px-12 sm:py-14"
            aria-label={t.love.title}
          >
            <div
              className="absolute inset-x-0 top-0 h-2 rounded-t-[inherit]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, var(--color-navy) 0 18px, transparent 18px 28px, var(--color-rose) 28px 46px, transparent 46px 56px)',
              }}
              aria-hidden="true"
            />

            <motion.div variants={contentVariants}>
              <motion.div
                variants={contentItemVariants}
                className="mb-6 flex items-center justify-center gap-3 text-gold-dark sm:mb-8"
                aria-hidden="true"
              >
                <span className="h-px w-12 border-t border-dashed border-gold/55 sm:w-24" />
                <Plane className="h-5 w-5 rotate-45" strokeWidth={1.4} />
                <span className="h-px w-12 border-t border-dashed border-gold/55 sm:w-24" />
              </motion.div>

              <motion.div variants={contentItemVariants}>
                <SectionHeading kicker={t.love.kicker} title={t.love.title} />
              </motion.div>

              <div className="mt-7 flex flex-col items-center gap-5 sm:mt-9">
                {t.love.body.map((paragraph, index) => (
                  <motion.p
                    key={index}
                    variants={contentItemVariants}
                    className="text-balance font-display text-lg italic leading-relaxed text-navy sm:text-2xl"
                  >
                    {paragraph}
                  </motion.p>
                ))}

                <motion.p
                  variants={contentItemVariants}
                  className="mt-1 text-sm text-navy-400"
                >
                  {t.love.signature}
                </motion.p>

                <motion.span
                  variants={contentItemVariants}
                  className="inline-flex text-rose"
                  aria-hidden="true"
                >
                  <motion.span
                    animate={
                      reduce
                        ? undefined
                        : { scale: [1, 1.16, 1], rotate: [0, -4, 0, 4, 0] }
                    }
                    transition={{
                      duration: 1.05,
                      repeat: Infinity,
                      repeatDelay: 3.1,
                      ease: 'easeInOut',
                    }}
                  >
                    <Heart className="h-5 w-5 fill-current" strokeWidth={1.2} />
                  </motion.span>
                </motion.span>

                <motion.p
                  variants={contentItemVariants}
                  className="max-w-full whitespace-nowrap font-script text-[clamp(1.65rem,7vw,3.4rem)] leading-snug text-gold-dark"
                >
                  {firstPartner.person.name} &amp; {secondPartner.person.name}
                </motion.p>
              </div>
            </motion.div>
          </motion.article>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-36 overflow-hidden rounded-b-[1.75rem] sm:h-44 sm:rounded-b-[2.4rem]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-ivory-deep via-cream to-beige [clip-path:polygon(0_0,50%_53%,100%_0,100%_100%,0_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-beige/80 to-transparent [clip-path:polygon(0_0,50%_53%,0_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-bl from-warm-white/75 to-transparent [clip-path:polygon(100%_0,50%_53%,100%_100%)]" />
            <div className="absolute inset-0 rounded-b-[inherit] border border-t-0 border-gold/25" />
          </div>

          <span
            className="pointer-events-none absolute bottom-7 left-1/2 z-[60] -translate-x-1/2 sm:bottom-9"
            aria-hidden="true"
          >
            <motion.span
              variants={sealVariants}
              className="grid h-12 w-12 place-items-center rounded-full border border-gold/35 bg-gradient-to-br from-rose via-rose to-gold text-warm-white shadow-[0_10px_24px_-12px_rgba(164,80,99,0.8)] sm:h-14 sm:w-14"
            >
              <Heart className="h-5 w-5 fill-current sm:h-6 sm:w-6" strokeWidth={1.1} />
            </motion.span>
          </span>
        </div>
      </motion.div>

      <Reveal delay={0.1} className="relative z-10 mt-12 sm:mt-16">
        <CoupleProfile config={config} />
      </Reveal>
    </section>
  )
}
