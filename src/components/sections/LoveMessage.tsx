import { Heart } from 'lucide-react'
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
      className="relative overflow-hidden bg-ivory px-5 py-24"
      aria-label={t.love.title}
    >
      <RomanticAura />

      <PassportStamp
        top="Save the Date"
        date={config.date.displayDate.replace(/\s·\s/g, '.').slice(0, 5)}
        bottom="Approved"
        className="absolute -right-2 top-8 hidden opacity-70 md:grid"
      />

      <div className="relative z-10 mx-auto max-w-2xl">
        <Reveal>
          <SectionHeading kicker={t.love.kicker} title={t.love.title} />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center gap-5 text-center">
          {t.love.body.map((paragraph, i) => (
            <p
              key={i}
              className="text-balance font-display text-xl italic leading-relaxed text-navy sm:text-2xl"
            >
              {paragraph}
            </p>
          ))}
          <p className="mt-2 text-sm text-navy-400">{t.love.signature}</p>
          <motion.span
            className="inline-flex text-rose"
            aria-hidden="true"
            animate={
              reduce
                ? undefined
                : { scale: [1, 1.2, 1], rotate: [0, -4, 0, 4, 0] }
            }
            transition={{
              duration: 1.05,
              repeat: Infinity,
              repeatDelay: 2.2,
              ease: 'easeInOut',
            }}
          >
            <Heart className="h-5 w-5 fill-current" strokeWidth={1.2} />
          </motion.span>
          <p className="font-display text-2xl text-gold-dark">
            {firstPartner.person.name} &amp; {secondPartner.person.name}
          </p>
        </Reveal>
      </div>

      {/* Couple & family — always two columns */}
      <Reveal delay={0.1} className="relative z-10 mt-16">
        <CoupleProfile config={config} />
      </Reveal>
    </section>
  )
}
