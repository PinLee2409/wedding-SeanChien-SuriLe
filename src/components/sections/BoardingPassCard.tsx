import { forwardRef, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Plane } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { cn } from '../../lib/cn'
import { getOrderedCouple } from '../../lib/couple'
import type { GalleryPhoto } from '../../lib/galleryPhotos'
import { slotPhotos } from '../../lib/photoSlots'
import { fadeUpBlur, staggerContainer } from '../../lib/motion'
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
  /**
   * Enables the five-second photo story used by the on-page preview. Export
   * and QR destinations leave this disabled so their card stays deterministic.
   */
  animatePhoto?: boolean
  /**
   * Pins the poster to a user-selected gallery photo. The on-page preview may
   * still crossfade to it, while export/QR renders remain entirely static.
   */
  selectedPhoto?: GalleryPhoto
  /**
   * On-page preview only: cascade the pass details in as the card scrolls
   * into view. Export/QR leave this off so every field is painted upfront.
   */
  reveal?: boolean
}

const BOARDING_PASS_PHOTOS = slotPhotos('boardingPass')

const PHOTO_INTERVAL_MS = 5_000

const PHOTO_FOCUS: Record<string, string> = {
  'cuoi1_t04-04-032.jpg': 'object-[52%_16%]',
  'cuoi2_dsc09667.jpg': 'object-[50%_40%]',
  'cuoi1_t04-04-293.jpg': 'object-[50%_50%]',
  'cuoi2_dsc09678.jpg': 'object-[51%_60%]',
  'cuoi1_t04-04-248.jpg': 'object-[50%_49%]',
  'cuoi1_t04-04-327.jpg': 'object-[50%_61%]',
  'cuoi3_dscf0954.jpg': 'object-[50%_18%]',
}

/* ── A labelled field with a hairline underline ─────────────────────────── */
function Field({
  label,
  value,
  align = 'left',
  nowrap = true,
  numeric = false,
}: {
  label: string
  value: string
  align?: 'left' | 'center' | 'right'
  nowrap?: boolean
  /** Numeric data (flight code, time, date) — rendered in the clean
   *  monospace face so the digits are even and aligned, unlike the serif's
   *  old-style figures which read as size-mismatched next to the labels. */
  numeric?: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-[0.15em]',
        align === 'center' && 'items-center text-center',
        align === 'right' && 'items-end text-right',
      )}
    >
      {/* The gold caption. Enlarged with the tracking eased back, so the extra
          size buys legibility instead of just making the line wider. */}
      <span className="whitespace-nowrap text-[0.88em] font-medium uppercase tracking-[0.14em] text-gold-dark">
        {label}
      </span>
      <span
        className={cn(
          'leading-tight text-navy',
          numeric
            ? 'font-mono text-[1.22em] font-medium tabular-nums tracking-[0.01em]'
            : 'font-display text-[1.38em] font-semibold',
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
  (
    {
      config,
      guestName,
      className,
      fontPx,
      animatePhoto = false,
      selectedPhoto,
      reveal = false,
    },
    ref,
  ) => {
    const { event, date, venue, boardingPass } = config
    const { t, lang } = useI18n()
    const reduce = !!useReducedMotion()
    const doReveal = reveal && !reduce
    const [photoIndex, setPhotoIndex] = useState(0)
    const weekday = formatWeekday(date.iso, lang)
    const passenger = guestName.trim() || t.pass.passengerFallback
    const flightNo = `LOVE-${event.flightCode}`
    const [firstPartner, secondPartner] = getOrderedCouple(config)
    const canTransitionPhoto = animatePhoto && !reduce
    const canAutoAdvance =
      canTransitionPhoto && !selectedPhoto && BOARDING_PASS_PHOTOS.length > 1
    const activePhoto =
      selectedPhoto ?? BOARDING_PASS_PHOTOS[photoIndex % BOARDING_PASS_PHOTOS.length]

    useEffect(() => {
      if (!canAutoAdvance) return undefined

      for (const photo of BOARDING_PASS_PHOTOS) {
        const preload = new Image()
        preload.src = photo.full
      }

      const timer = window.setInterval(() => {
        setPhotoIndex((current) => (current + 1) % BOARDING_PASS_PHOTOS.length)
      }, PHOTO_INTERVAL_MS)

      return () => window.clearInterval(timer)
    }, [canAutoAdvance])

    return (
      <div
        ref={ref}
        style={fontPx ? { fontSize: `${fontPx}px` } : undefined}
        className={cn(
          'relative isolate w-full overflow-hidden rounded-[1.5rem] border border-gold/40 bg-cream font-sans text-navy sm:rounded-[1.75rem]',
          /* Every size on the card is em-based off this one figure, so raising
             it enlarges the whole pass at once. It is a share of the card's own
             width, which means narrowing the card also shrinks the type —
             the two have to be tuned together. */
          'text-[3.5cqw] shadow-[0_30px_60px_-30px_rgba(71,35,59,0.45),0_2px_6px_rgba(71,35,59,0.06)]',
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
              <span className="text-[0.68em] uppercase tracking-[0.28em] text-gold-light">
                {event.airline}
              </span>
            </div>
            <span className="text-[0.68em] uppercase tracking-[0.28em] text-gold-light">
              {t.pass.label}
            </span>
          </div>
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Poster */}
        <div className="px-[1.1em] pt-[1.1em]">
          <div className="relative overflow-hidden rounded-[1rem] ring-1 ring-gold/30 sm:rounded-[1.15rem]">
            <div
              /* 2:3 — the shape of the photographs themselves, so the couple is
                 shown whole instead of being cut down to a letterbox strip. */
              className="relative aspect-[2/3] w-full overflow-hidden bg-ivory-deep"
              role="img"
              aria-label={`${firstPartner.person.name} & ${secondPartner.person.name}`}
            >
              {canTransitionPhoto && activePhoto ? (
                <AnimatePresence initial={false} mode="sync">
                  <motion.div
                    key={activePhoto.filename}
                    className="absolute inset-0 will-change-transform"
                    /* No slow push-in any more: the frame now matches the
                       photograph exactly, so any zoom would start eating the
                       edges again. The crossfade alone carries the change. */
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ opacity: { duration: 1.05, ease: 'easeInOut' } }}
                    aria-hidden="true"
                  >
                    <SmartImage
                      src={activePhoto.full}
                      alt=""
                      loading="eager"
                      fit="cover"
                      placeholder="bare"
                      className="h-full w-full"
                      imgClassName={PHOTO_FOCUS[activePhoto.filename] ?? 'object-center'}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <SmartImage
                  src={activePhoto?.full ?? boardingPass.poster}
                  alt=""
                  label={t.pass.photoLabel}
                  /* Export deliberately renders this static branch: the image
                     cannot change halfway through html-to-image capture. */
                  loading="eager"
                  fit="cover"
                  className="h-full w-full"
                  imgClassName={
                    activePhoto
                      ? (PHOTO_FOCUS[activePhoto.filename] ?? 'object-center')
                      : undefined
                  }
                />
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cream/25 to-transparent" />
          </div>
        </div>

        {/* Content — cascades in on the on-page preview, static on export. */}
        <motion.div
          variants={staggerContainer}
          initial={doReveal ? 'hidden' : false}
          {...(doReveal
            ? { whileInView: 'visible', viewport: { once: true, amount: 0.2 } }
            : { animate: 'visible' })}
        >
          {/* Names */}
          <motion.div
            variants={fadeUpBlur}
            className="flex flex-col items-center px-[1.5em] pt-[1em] text-center"
          >
            <span className="text-[0.84em] uppercase tracking-[0.24em] text-gold-dark">
              {t.pass.weddingOf}
            </span>
            <p className="mt-[0.35em] whitespace-nowrap font-display text-[2.15em] font-semibold leading-[1.1]">
              {firstPartner.person.name}
              <span className="mx-[0.25em] text-gold">&amp;</span>
              {secondPartner.person.name}
            </p>
            <span className="mt-[0.4em] text-[0.98em] uppercase tracking-[0.18em] text-navy-400">
              {weekday} · {date.displayDate}
            </span>
          </motion.div>

          {/* Route From → To */}
          <motion.div
            variants={fadeUpBlur}
            className="flex items-center justify-between gap-[0.8em] px-[1.5em] pt-[1.1em]"
          >
            <div className="flex flex-col">
              <span className="text-[0.86em] uppercase tracking-[0.14em] text-gold-dark">{t.pass.from}</span>
              <span className="whitespace-nowrap font-display text-[1.58em] font-semibold leading-none">
                {t.pass.fromValue}
              </span>
            </div>
            <div className="flex flex-1 items-center text-gold">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/70" />
              <Plane className="mx-[0.3em] h-[1.3em] w-[1.3em] rotate-45" strokeWidth={1.6} />
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/70" />
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="text-[0.86em] uppercase tracking-[0.14em] text-gold-dark">{t.pass.to}</span>
              <span className="whitespace-nowrap font-display text-[1.58em] font-semibold leading-none">
                {t.pass.toValue}
              </span>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            variants={fadeUpBlur}
            className="mt-[1em] flex flex-col gap-[0.9em] px-[1.5em]"
          >
            <div className="border-t border-dashed border-gold/30 pt-[0.9em]">
              <Field label={t.pass.passenger} value={passenger} nowrap={false} />
            </div>
            {/* Time and date share one field. As three columns they were fighting
                for room at this type size; together they also read the way a
                guest actually thinks about it — one moment, not two figures. */}
            <div className="flex items-start justify-between gap-x-[0.9em]">
              <Field label={t.pass.flight} value={flightNo} numeric />
              <Field
                label={t.pass.when}
                value={`${date.time} · ${date.displayDate.replace(/\s·\s/g, '/')}`}
                align="right"
                numeric
              />
            </div>
            {/* Venue — the one detail every guest actually needs on the pass. */}
            <div className="border-t border-dashed border-gold/30 pt-[0.9em]">
              <Field
                label={t.pass.venue}
                value={venue.hall ? `${venue.name} · ${venue.hall}` : venue.name}
                nowrap={false}
              />
            </div>
          </motion.div>

          {/* Perforation */}
          <div className="relative mt-[1.1em] py-[0.2em]">
            <div className="mx-[1.5em] border-t border-dashed border-gold/40" />
            <span className="absolute left-0 top-1/2 h-[1.4em] w-[1.4em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory" />
            <span className="absolute right-0 top-1/2 h-[1.4em] w-[1.4em] translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory" />
          </div>

          {/* The stub used to carry a barcode, the flight number again and the
              hashtag. The flight number is already a field above, so all of it
              was repetition below the fold of the card. */}
          <div className="pb-[1.2em]" aria-hidden="true" />
        </motion.div>
      </div>
    )
  },
)

BoardingPassCard.displayName = 'BoardingPassCard'
