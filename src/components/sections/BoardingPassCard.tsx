import { forwardRef } from 'react'
import { Plane } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { WeddingConfig } from '../../config/wedding.config'
import { cn } from '../../lib/cn'
import { getOrderedCouple } from '../../lib/couple'
import { pickGalleryPhotos } from '../../lib/galleryPhotos'
import { buildCardViewUrl } from '../../lib/guest'
import { useI18n } from '../../i18n/LanguageContext'
import { formatWeekday } from '../../i18n/translations'
import { SmartImage } from '../ui/SmartImage'

interface BoardingPassCardProps {
  config: WeddingConfig
  guestName: string
  className?: string
  /**
   * Fixed root font-size in px. When omitted the card is fluid (scales with its
   * container via `cqw`). Export passes an explicit value for deterministic,
   * crop-free, high-resolution output.
   */
  fontPx?: number
}

const [boardingPassGalleryPhoto] = pickGalleryPhotos([
  'cuoi1_t04-04-293.jpg',
])

/* ── Decorative CSS barcode (widths in em → fully fluid) ─────────────────── */
const BAR_WIDTHS = [
  2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 4, 1,
  2, 1, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1, 2, 3, 1, 2, 1,
]

function Barcode() {
  return (
    <div className="flex h-[2.6em] items-stretch gap-[0.06em]" aria-hidden="true">
      {BAR_WIDTHS.map((w, i) => (
        <span key={i} className="bg-navy" style={{ width: `${w * 0.05}em` }} />
      ))}
    </div>
  )
}

/* ── Real, personalised QR — opens the standalone invitation card ───────── */
function QrCode({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-[0.35em]" role="img" aria-label={label}>
      <div className="grid h-[7em] w-[7em] place-items-center overflow-hidden rounded-[0.28em] bg-white shadow-[0_0_0_1px_rgba(71,35,59,0.1)]">
        <QRCodeSVG
          value={value}
          size={160}
          level="M"
          marginSize={4}
          bgColor="#ffffff"
          fgColor="#1b2a4a"
          className="h-full w-full"
          aria-hidden="true"
        />
      </div>
      <span className="max-w-[9em] text-center text-[0.48em] font-semibold uppercase leading-tight tracking-[0.12em] text-gold-dark">
        {label}
      </span>
    </div>
  )
}

/* ── A labelled field with a hairline underline ─────────────────────────── */
function Field({
  label,
  value,
  align = 'left',
  nowrap = true,
}: {
  label: string
  value: string
  align?: 'left' | 'center' | 'right'
  nowrap?: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-[0.15em]',
        align === 'center' && 'items-center text-center',
        align === 'right' && 'items-end text-right',
      )}
    >
      <span className="text-[0.6em] font-medium uppercase tracking-[0.22em] text-gold-dark">
        {label}
      </span>
      <span
        className={cn(
          'font-display text-[1.05em] font-semibold leading-tight text-navy',
          nowrap && 'whitespace-nowrap',
          !nowrap && 'text-balance',
        )}
      >
        {value}
      </span>
    </div>
  )
}

/**
 * Luxury wedding boarding pass. Fully fluid (em/cqw based) so it never crops.
 * Rendered via forwardRef so the export helpers can capture the DOM node.
 */
export const BoardingPassCard = forwardRef<HTMLDivElement, BoardingPassCardProps>(
  ({ config, guestName, className, fontPx }, ref) => {
    const { event, couple, date, venue, boardingPass } = config
    const { t, lang } = useI18n()
    const weekday = formatWeekday(date.iso, lang)
    const passenger = guestName.trim() || t.pass.passengerFallback
    const flightNo = `LOVE-${event.flightCode}`
    const [firstPartner, secondPartner] = getOrderedCouple(config)
    const qrUrl = buildCardViewUrl(guestName, lang, config.site.publicUrl)

    return (
      <div
        ref={ref}
        style={fontPx ? { fontSize: `${fontPx}px` } : undefined}
        className={cn(
          'relative isolate w-full overflow-hidden rounded-[1.5em] border border-gold/40 bg-cream font-sans text-navy',
          'text-[3cqw] shadow-[0_30px_60px_-30px_rgba(71,35,59,0.45),0_2px_6px_rgba(71,35,59,0.06)]',
          className,
        )}
      >
        {/* warm radial + grain */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_-10%,#fef7f4_0%,transparent_60%)]" />
        <div className="paper-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-multiply" />

        {/* Header */}
        <div className="relative bg-gradient-to-br from-navy-700 to-navy px-[1.5em] py-[1em] text-warm-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[0.55em]">
              <Plane className="h-[1.2em] w-[1.2em] rotate-45 text-gold" strokeWidth={1.6} />
              <span className="text-[0.62em] uppercase tracking-[0.28em] text-gold-light">
                {event.airline}
              </span>
            </div>
            <span className="text-[0.62em] uppercase tracking-[0.28em] text-gold-light">
              {t.pass.label}
            </span>
          </div>
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Poster */}
        <div className="px-[1.1em] pt-[1.1em]">
          <div className="relative overflow-hidden rounded-[0.9em] ring-1 ring-gold/30">
            <SmartImage
              src={boardingPassGalleryPhoto?.full ?? boardingPass.poster}
              alt={`${firstPartner.person.name} & ${secondPartner.person.name}`}
              label={t.pass.photoLabel}
              /* Eager so the (possibly missing) poster resolves to a real image
                 or a placeholder BEFORE export — a pending 404 <img> would make
                 html-to-image reject. */
              loading="eager"
              fit="cover"
              className="aspect-[3/2] w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cream/25 to-transparent" />
          </div>
        </div>

        {/* Names */}
        <div className="flex flex-col items-center px-[1.5em] pt-[1em] text-center">
          <span className="text-[0.58em] uppercase tracking-[0.34em] text-gold-dark">
            {t.pass.weddingOf}
          </span>
          <p className="mt-[0.35em] whitespace-nowrap font-display text-[1.85em] font-semibold leading-[1.1]">
            {firstPartner.person.name}
            <span className="mx-[0.25em] text-gold">&amp;</span>
            {secondPartner.person.name}
          </p>
          <span className="mt-[0.35em] text-[0.66em] uppercase tracking-[0.24em] text-navy-400">
            {weekday} · {date.displayDate}
          </span>
        </div>

        {/* Route From → To */}
        <div className="flex items-center justify-between gap-[0.8em] px-[1.5em] pt-[1.1em]">
          <div className="flex flex-col">
            <span className="text-[0.58em] uppercase tracking-[0.22em] text-gold-dark">{t.pass.from}</span>
            <span className="whitespace-nowrap font-display text-[1.2em] font-semibold leading-none">
              {t.pass.fromValue}
            </span>
          </div>
          <div className="flex flex-1 items-center text-gold">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/70" />
            <Plane className="mx-[0.3em] h-[1.1em] w-[1.1em] rotate-45" strokeWidth={1.6} />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/70" />
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-[0.58em] uppercase tracking-[0.22em] text-gold-dark">{t.pass.to}</span>
            <span className="whitespace-nowrap font-display text-[1.2em] font-semibold leading-none">
              {t.pass.toValue}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="mt-[1em] flex flex-col gap-[0.9em] px-[1.5em]">
          <div className="border-t border-dashed border-gold/30 pt-[0.9em]">
            <Field label={t.pass.passenger} value={passenger} nowrap={false} />
          </div>
          <div className="grid grid-cols-3 items-start gap-x-[0.7em]">
            <Field label={t.pass.flight} value={flightNo} />
            <Field label={t.pass.boarding} value={date.time} align="center" />
            <Field label={t.pass.date} value={date.displayDate} align="right" />
          </div>
          {/* Venue — the one detail every guest actually needs on the pass. */}
          <div className="border-t border-dashed border-gold/30 pt-[0.9em]">
            <Field
              label={t.pass.venue}
              value={venue.hall ? `${venue.name} · ${venue.hall}` : venue.name}
              nowrap={false}
            />
          </div>
        </div>

        {/* Perforation */}
        <div className="relative mt-[1.1em] py-[0.2em]">
          <div className="mx-[1.5em] border-t border-dashed border-gold/40" />
          <span className="absolute left-0 top-1/2 h-[1.4em] w-[1.4em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory" />
          <span className="absolute right-0 top-1/2 h-[1.4em] w-[1.4em] translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory" />
        </div>

        {/* Stub: barcode + QR */}
        <div className="flex items-end justify-between gap-[1em] px-[1.5em] pb-[1.4em] pt-[0.8em]">
          <div className="flex min-w-0 flex-col gap-[0.5em]">
            <Barcode />
            <span className="font-mono text-[0.62em] tracking-[0.2em] text-navy-400">
              {flightNo} · {event.flightCode}
            </span>
            {couple.hashtag && (
              <span className="truncate text-[0.6em] leading-snug text-navy-400">
                {couple.hashtag}
              </span>
            )}
          </div>
          <QrCode value={qrUrl} label={t.pass.scanQr} />
        </div>
      </div>
    )
  },
)

BoardingPassCard.displayName = 'BoardingPassCard'
