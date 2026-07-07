import { CalendarPlus, Clock, MapPin } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { downloadICS } from '../../lib/ics'
import { useI18n } from '../../i18n/LanguageContext'
import { formatWeekday } from '../../i18n/translations'
import { SectionHeading } from '../ui/SectionHeading'
import { Countdown } from '../ui/Countdown'
import { Reveal } from '../ui/Reveal'

/**
 * Flight details — one centred glass card. Deliberately light so the page
 * flows ivory → sky and saves the single dark "night" moment for the finale.
 * No street address or embedded map: the venue name + a Maps link is enough.
 */
export function WeddingDetails({ config }: { config: WeddingConfig }) {
  const { date, venue } = config
  const { t, lang } = useI18n()
  const weekday = formatWeekday(date.iso, lang)

  return (
    <section
      id="details"
      className="bg-gradient-to-b from-ivory via-sky-soft/60 to-ivory px-5 py-20"
      aria-label={t.details.title}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            kicker={t.details.kicker}
            title={t.details.title}
            subtitle={t.details.subtitle}
          />
        </Reveal>

        <Reveal
          delay={0.08}
          className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-6 rounded-3xl border border-gold/30 bg-white/70 p-8 text-center shadow-[0_24px_50px_-30px_rgba(27,42,74,0.35)] backdrop-blur-md"
        >
          <div>
            <span className="label-caps text-[10px] text-gold-dark">
              {t.details.departure}
            </span>
            <p className="mt-1 font-display text-5xl font-semibold text-navy">
              {date.displayDate}
            </p>
            <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-navy-500">
              <Clock className="h-3.5 w-3.5 text-gold-dark" />
              {weekday} · {t.details.boardingAt} {date.time}
            </p>
          </div>

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          <div>
            <span className="label-caps text-[10px] text-gold-dark">
              {t.details.venue}
            </span>
            <p className="mt-1 font-display text-2xl text-navy">{venue.name}</p>
            {venue.hall && (
              <p className="mt-0.5 text-sm text-navy-500">{venue.hall}</p>
            )}
          </div>

          <Countdown iso={date.iso} tone="navy" />

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            {venue.mapLink && (
              <a
                href={venue.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold flex-1"
              >
                <MapPin className="h-4 w-4" />
                {t.details.openMaps}
              </a>
            )}
            <button
              type="button"
              onClick={() =>
                downloadICS(config, {
                  summary: t.calendar.summary
                    .replace('{groom}', config.couple.groom.name)
                    .replace('{bride}', config.couple.bride.name),
                  description: t.calendar.description,
                })
              }
              className="btn btn-ghost flex-1"
            >
              <CalendarPlus className="h-4 w-4" />
              {t.details.addCalendar}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
