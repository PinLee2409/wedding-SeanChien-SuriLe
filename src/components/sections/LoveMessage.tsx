import { Heart, Plane } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import type { WeddingConfig } from '../../config/wedding.config'
import { getOrderedCouple } from '../../lib/couple'
import { useI18n } from '../../i18n/LanguageContext'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { PassportStamp } from '../decorations/PassportStamp'
import { RomanticAura } from '../decorations/RomanticAura'
import { CoupleProfile } from './CoupleProfile'

const envelopeEase = [0.22, 1, 0.36, 1] as const

const flapVariants: Variants = {
  closed: { rotateX: 0, zIndex: 50 },
  open: {
    rotateX: -178,
    transition: {
      duration: 1.05,
      delay: 0.18,
      ease: envelopeEase,
    },
    // The flap stays above the pocket while it crosses 90 degrees, then
    // settles behind the letter before the paper begins to rise.
    transitionEnd: { zIndex: 10 },
  },
}

const sealVariants: Variants = {
  closed: { opacity: 1, scale: 1, y: 0 },
  open: {
    opacity: 0,
    scale: 0.72,
    y: 8,
    transition: { duration: 0.34, delay: 0.06, ease: 'easeOut' },
  },
}

const letterVariants: Variants = {
  closed: {
    y: '78%',
    scale: 0.985,
    clipPath: 'inset(0 0 78% 0)',
  },
  open: {
    y: '0%',
    scale: 1,
    clipPath: 'inset(0 0 0% 0)',
    transition: {
      duration: 1.35,
      delay: 1.02,
      ease: envelopeEase,
    },
  },
}

const contentVariants: Variants = {
  closed: { opacity: 0, y: 20, filter: 'blur(8px)' },
  open: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.72,
      delay: 2.02,
      delayChildren: 2.04,
      staggerChildren: 0.11,
      ease: envelopeEase,
    },
  },
}

const contentItemVariants: Variants = {
  closed: { opacity: 0, y: 14 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: envelopeEase },
  },
}

export function LoveMessage({ config }: { config: WeddingConfig }) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [firstPartner, secondPartner] = getOrderedCouple(config)

  return (
    <section
      id="message"
      className="relative overflow-hidden bg-gradient-to-b from-warm-white via-rose/10 to-ivory px-4 py-24 sm:px-5 sm:py-28"
      aria-label={t.love.title}
    >
      <RomanticAura />

      <PassportStamp
        top="Save the Date"
        date={config.date.displayDate.replace(/\s·\s/g, '.').slice(0, 5)}
        bottom="Approved"
        className="absolute -right-2 top-8 hidden opacity-70 md:grid"
      />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl [perspective:1500px]"
        initial={reduce ? 'open' : 'closed'}
        whileInView="open"
        viewport={{ once: true, amount: 0.08, margin: '0px 0px 12% 0px' }}
      >
        <div className="relative isolate [transform-style:preserve-3d]">
          {/* The rear of the envelope remains behind every moving layer. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 rounded-[1.8rem] border border-gold/25 bg-gradient-to-br from-beige via-ivory-deep to-cream shadow-[0_26px_58px_-36px_rgba(27,42,74,0.7)] sm:h-48 sm:rounded-[2.4rem]"
            aria-hidden="true"
          />

          {/* Two-sided flap: the back face becomes visible after the 3D turn. */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-50 h-40 origin-top [transform-style:preserve-3d] sm:h-48"
            variants={flapVariants}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-beige via-ivory-deep to-cream [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-warm-white via-cream to-beige [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)] [transform:rotateX(180deg)]" />
            <div className="absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent [backface-visibility:hidden]" />
          </motion.div>

          {/*
           * The scene reserves the final paper height. In the closed state only
           * its top slice exists visually inside the envelope; it then travels
           * upward as the rest of the sheet is revealed. This keeps variable
           * translations responsive without measuring content in JavaScript.
           */}
          <motion.div
            className="relative z-20 mx-auto w-[94%] will-change-transform sm:w-[92%]"
            style={{
              filter: 'drop-shadow(0 30px 34px rgba(27, 42, 74, 0.2))',
            }}
            variants={letterVariants}
          >
            <article
              className="paper-grain relative overflow-hidden rounded-[1.65rem] border border-gold/30 bg-warm-white/95 px-5 pb-48 pt-11 text-center ring-1 ring-white/70 sm:rounded-[2.35rem] sm:px-12 sm:pb-56 sm:pt-14"
              aria-label={t.love.title}
            >
              <div
                className="absolute inset-x-0 top-0 h-2"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, var(--color-navy) 0 18px, transparent 18px 28px, var(--color-rose) 28px 46px, transparent 46px 56px)',
                }}
                aria-hidden="true"
              />

              <motion.div variants={contentVariants}>
                <motion.div
                  variants={contentItemVariants}
                  className="mb-7 flex items-center justify-center gap-3 text-gold-dark sm:mb-8"
                  aria-hidden="true"
                >
                  <span className="h-px w-14 border-t border-dashed border-gold/55 sm:w-24" />
                  <motion.span
                    className="inline-flex rotate-45"
                    animate={
                      reduce
                        ? undefined
                        : { x: [-2, 2, -2], y: [1, -1, 1] }
                    }
                    transition={{
                      duration: 3.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Plane className="h-5 w-5" strokeWidth={1.4} />
                  </motion.span>
                  <span className="h-px w-14 border-t border-dashed border-gold/55 sm:w-24" />
                </motion.div>

                <motion.div variants={contentItemVariants}>
                  <SectionHeading kicker={t.love.kicker} title={t.love.title} />
                </motion.div>

                <div className="mt-8 flex flex-col items-center gap-5 sm:mt-9">
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
                    className="mt-2 text-sm text-navy-400"
                  >
                    {t.love.signature}
                  </motion.p>

                  <motion.div variants={contentItemVariants}>
                    <motion.span
                      className="inline-flex text-rose"
                      aria-hidden="true"
                      animate={
                        reduce
                          ? undefined
                          : {
                              scale: [1, 1.18, 1],
                              rotate: [0, -4, 0, 4, 0],
                            }
                      }
                      transition={{
                        duration: 1.05,
                        repeat: Infinity,
                        repeatDelay: 3.2,
                        ease: 'easeInOut',
                      }}
                    >
                      <Heart
                        className="h-5 w-5 fill-current"
                        strokeWidth={1.2}
                      />
                    </motion.span>
                  </motion.div>

                  <motion.p
                    variants={contentItemVariants}
                    className="font-script text-4xl leading-snug text-gold-dark sm:text-5xl"
                  >
                    {firstPartner.person.name} &amp; {secondPartner.person.name}
                  </motion.p>
                </div>
              </motion.div>
            </article>
          </motion.div>

          {/* Front pocket always stays above the paper and hides its lower edge. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-40 overflow-hidden rounded-b-[1.8rem] sm:h-48 sm:rounded-b-[2.4rem]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-ivory-deep via-cream to-beige [clip-path:polygon(0_0,50%_52%,100%_0,100%_100%,0_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-beige/85 to-transparent [clip-path:polygon(0_0,50%_52%,0_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-bl from-warm-white/70 to-transparent [clip-path:polygon(100%_0,50%_52%,100%_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-beige/70 to-transparent [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
            <div className="absolute inset-0 rounded-b-[inherit] border border-t-0 border-gold/25" />
          </div>

          <span
            className="pointer-events-none absolute bottom-7 left-1/2 z-[60] -translate-x-1/2 sm:bottom-9"
            aria-hidden="true"
          >
            <motion.span
              className="grid h-12 w-12 place-items-center rounded-full border border-gold/35 bg-gradient-to-br from-rose via-rose to-gold text-warm-white shadow-[0_10px_24px_-12px_rgba(164,80,99,0.8)] sm:h-14 sm:w-14"
              variants={sealVariants}
            >
              <Heart
                className="h-5 w-5 fill-current sm:h-6 sm:w-6"
                strokeWidth={1.1}
              />
            </motion.span>
          </span>
        </div>
      </motion.div>

      {/* Couple & family — always two columns */}
      <Reveal delay={0.1} className="relative z-10 mt-20 sm:mt-24">
        <CoupleProfile config={config} />
      </Reveal>
    </section>
  )
}
