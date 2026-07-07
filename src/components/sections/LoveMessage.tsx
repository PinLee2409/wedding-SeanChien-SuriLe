import type { WeddingConfig } from '../../config/wedding.config'
import { useI18n } from '../../i18n/LanguageContext'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { PassportStamp } from '../decorations/PassportStamp'
import { CoupleProfile } from './CoupleProfile'

export function LoveMessage({ config }: { config: WeddingConfig }) {
  const { couple } = config
  const { t } = useI18n()

  return (
    <section
      id="message"
      className="relative overflow-hidden bg-ivory px-5 py-24"
      aria-label={t.love.title}
    >
      <PassportStamp
        top="Save the Date"
        date={config.date.displayDate.replace(/\s·\s/g, '.').slice(0, 5)}
        bottom="Approved"
        className="absolute -right-2 top-8 hidden opacity-70 md:grid"
      />

      <div className="mx-auto max-w-2xl">
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
          <p className="font-display text-2xl text-gold-dark">
            {couple.groom.name} &amp; {couple.bride.name}
          </p>
        </Reveal>
      </div>

      {/* Couple & family — always two columns */}
      <Reveal delay={0.1} className="mt-16">
        <CoupleProfile groom={couple.groom} bride={couple.bride} />
      </Reveal>
    </section>
  )
}
