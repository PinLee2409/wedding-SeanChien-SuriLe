import { CalendarPlus, Clock, Heart, MapPin, Sparkles } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { downloadICS } from '../../lib/ics'
import { useI18n } from '../../i18n/LanguageContext'
import { formatWeekday } from '../../i18n/translations'
import { SectionHeading } from '../ui/SectionHeading'
import { Countdown } from '../ui/Countdown'
import { Reveal } from '../ui/Reveal'
import { RomanticAura } from '../decorations/RomanticAura'
import { SectionRomance } from '../decorations/SectionRomance'

/**
 * Flight details — one centred glass card. Deliberately light so the page
 * flows ivory → sky and saves the single dark "night" moment for the finale.
 * No street address or embedded map: the venue name + a Maps link is enough.
 */
export function WeddingDetails({ config }: { config: WeddingConfig }) {
  const { date, venue } = config
  const { t, lang } = useI18n()
  const weekday = formatWeekday(date.iso, lang)
  const venueAddress = venue.addressTranslations?.[lang] ?? venue.address

  return (
    <section
      id="details"
      className="relative overflow-hidden bg-gradient-to-b from-ivory via-sky-soft/60 to-ivory px-5 py-20"
      aria-label={t.details.title}
    >
      <RomanticAura className="opacity-75" />
      <SectionRomance direction="rtl" planeTop="16%" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            kicker={t.details.kicker}
            title={t.details.title}
            subtitle={t.details.subtitle}
          />
        </Reveal>

        <Reveal
          delay={0.08}
          className="relative mx-auto mt-12 flex max-w-xl flex-col items-center gap-6 overflow-hidden rounded-3xl border border-gold/30 bg-white/70 px-4 py-8 text-center shadow-[0_24px_50px_-30px_rgba(27,42,74,0.35)] backdrop-blur-md sm:p-8"
        >
          <div className="relative w-full">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[12%] -inset-y-2 animate-pulse-soft rounded-full bg-[radial-gradient(closest-side,rgba(232,180,184,0.3),rgba(232,213,160,0.16)_58%,transparent_78%)] blur-lg"
            />
            <Sparkles
              aria-hidden
              className="absolute -top-1 right-[9%] h-4 w-4 animate-twinkle text-gold/80"
            />
            <Sparkles
              aria-hidden
              className="absolute bottom-6 left-[7%] h-3 w-3 animate-twinkle text-rose [animation-delay:-1.5s]"
            />
            <span className="label-caps relative text-[10px] text-gold-dark">
              {t.details.departure}
            </span>
            <p className="relative mt-2 whitespace-nowrap font-mono text-[clamp(1.5rem,7.2vw,2.5rem)] font-normal leading-none tracking-[0.06em] text-navy sm:text-[2.65rem] sm:tracking-[0.08em]">
              {date.displayDate}
            </p>
            <p className="relative mt-2.5 flex items-center justify-center gap-1.5 text-sm text-navy-500">
              <Clock className="h-3.5 w-3.5 text-gold-dark" />
              {weekday} · {t.details.boardingAt} {date.time}
            </p>
          </div>

          <div aria-hidden className="flex items-center gap-2.5">
            <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold/60 sm:w-20" />
            <Heart className="h-3.5 w-3.5 animate-heart-beat fill-rose/60 text-rose" />
            <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold/60 sm:w-20" />
          </div>

          <div>
            <span className="label-caps text-[10px] text-gold-dark">
              {t.details.venue}
            </span>
            <p className="mt-1 font-display text-2xl text-navy">{venue.name}</p>
            {venue.hall && (
              <p className="mt-0.5 text-sm text-navy-500">{venue.hall}</p>
            )}
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-navy-500">
              {venueAddress}
            </p>
          </div>

          {(date.ceremonyTime || date.banquetTime) && (
            <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              {date.ceremonyTime && (
                <div className="rounded-2xl border border-gold/25 bg-ivory/70 px-3 py-3 sm:px-4 sm:py-3.5">
                  <span className="label-caps text-[9px] text-gold-dark">
                    {t.details.ceremony}
                  </span>
                  <p className="mt-1 font-mono text-base tracking-[0.06em] text-navy sm:text-lg">
                    {date.ceremonyTime}
                  </p>
                </div>
              )}
              {date.banquetTime && (
                <div className="rounded-2xl border border-gold/25 bg-ivory/70 px-3 py-3 sm:px-4 sm:py-3.5">
                  <span className="label-caps text-[9px] text-gold-dark">
                    {t.details.banquet}
                  </span>
                  <p className="mt-1 font-mono text-base tracking-[0.06em] text-navy sm:text-lg">
                    {date.banquetTime}
                  </p>
                </div>
              )}
            </div>
          )}

          <Countdown
            iso={date.iso}
            tone="navy"
            className="w-full max-w-[22rem] sm:w-auto sm:max-w-none"
          />

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

          <div
            aria-hidden
            className="card-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
          />
        </Reveal>
      </div>
    </section>
  )
}
