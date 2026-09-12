import { useCallback, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import confetti from 'canvas-confetti'
import { Check, Minus, Plus, Send, Ticket, X } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { cn } from '../../lib/cn'
import { useI18n } from '../../i18n/LanguageContext'
import { easeLux } from '../../lib/motion'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { RomanticAura } from '../decorations/RomanticAura'
import { SectionRomance } from '../decorations/SectionRomance'

const STORAGE_KEY = 'wedding-rsvp-v1'
/** Stable per-device id. The endpoint keys its rows on this, so a guest who
 *  changes their mind overwrites their own reply instead of adding a second
 *  one — see scripts/rsvp-endpoint.gs. */
const DEVICE_KEY = 'wedding-rsvp-device-v1'
/** Timestamps of what this device has sent, for the local send limits. */
const SENDS_KEY = 'wedding-rsvp-sends-v1'
const NAME_MAX = 40
const MESSAGE_MAX = 200
/** Quiet period between two sends, and the most any one device may send.
 *  Both are courtesies, not security: anything typed into a browser console
 *  walks straight past them, which is why the endpoint enforces its own. */
const RESEND_QUIET_MS = 15_000
const SENDS_MAX = 10
const GOLD_COLORS = ['#c68a74', '#e9c5b5', '#fffefd', '#dba8a3']

interface Rsvp {
  name: string
  attending: boolean
  guests: number
  message: string
  ts: number
}

/** The reply as the couple reads it in their sheet. Deliberately *not*
 *  translated: the guest may be reading in English or Chinese, but the two
 *  people counting the seats read Vietnamese, and a column that mixes three
 *  languages cannot be sorted or counted. */
function wireMessage(rsvp: Rsvp, revised: boolean): string {
  const answer = rsvp.attending
    ? `✅ THAM DỰ · ${rsvp.guests} khách`
    : '❌ KHÔNG THAM DỰ'
  // An endpoint that overwrites shows only the final answer, so the marker
  // says "they changed their mind"; one that still appends needs it to tell
  // which of two rows for the same guest is the live one.
  const head = revised ? `${answer} (đã sửa)` : answer
  return rsvp.message ? `${head} — ${rsvp.message}` : head
}

/** True when re-sending would tell the couple nothing they do not have. */
function sameAnswer(a: Rsvp, b: Rsvp): boolean {
  return (
    a.name === b.name &&
    a.attending === b.attending &&
    a.message === b.message &&
    (!a.attending || a.guests === b.guests)
  )
}

function readStored(): Rsvp | null {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!raw || typeof raw !== 'object') return null
    const item = raw as Record<string, unknown>
    const name = String(item.name ?? '')
      .trim()
      .slice(0, NAME_MAX)
    if (!name) return null
    return {
      name,
      attending: item.attending !== false,
      guests: Math.max(1, Number(item.guests) || 1),
      message: String(item.message ?? '')
        .trim()
        .slice(0, MESSAGE_MAX),
      ts: Number(item.ts) || 0,
    }
  } catch {
    return null
  }
}

function saveStored(rsvp: Rsvp): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvp))
  } catch {
    /* private mode — the reply is already on its way to the couple */
  }
}

/** The id this device signs its reply with, minted on first use. Without
 *  storage it is per-session: the guest still gets one row per visit rather
 *  than one per tap, which is the case that actually happens. */
function deviceId(): string {
  const mint = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  try {
    const existing = localStorage.getItem(DEVICE_KEY)
    if (existing) return existing
    const fresh = mint()
    localStorage.setItem(DEVICE_KEY, fresh)
    return fresh
  } catch {
    return mint()
  }
}

/** Forgets whose reply this device holds, so the next one starts a new row.
 *  One phone passed around a table replies for each person in turn, rather
 *  than the second guest quietly editing the first guest's answer. */
function forgetDevice(): void {
  try {
    localStorage.removeItem(DEVICE_KEY)
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore storage errors */
  }
}

function readSends(): number[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(SENDS_KEY) ?? '[]')
    if (!Array.isArray(raw)) return []
    return raw.map(Number).filter((ts) => Number.isFinite(ts) && ts > 0)
  } catch {
    return []
  }
}

function recordSend(ts: number): void {
  try {
    localStorage.setItem(SENDS_KEY, JSON.stringify([...readSends(), ts]))
  } catch {
    /* ignore storage errors */
  }
}

/** How long this device must wait, and whether it has spent its sends. */
function sendGuard(now: number): { waitMs: number; spent: boolean } {
  const sends = readSends()
  const last = sends.length ? Math.max(...sends) : 0
  return {
    waitMs: Math.max(0, RESEND_QUIET_MS - (now - last)),
    spent: sends.length >= SENDS_MAX,
  }
}

/** One of the two answers, dressed as a gate card the guest picks. */
function AnswerCard({
  icon,
  label,
  selected,
  tone,
  onSelect,
}: {
  icon: typeof Check
  label: string
  selected: boolean
  tone: 'gold' | 'quiet'
  onSelect: () => void
}) {
  const Icon = icon

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2',
        selected
          ? tone === 'gold'
            ? 'border-gold bg-gold/12 text-navy shadow-[0_16px_32px_-22px_rgba(200,164,92,0.9)]'
            : 'border-navy/35 bg-navy/5 text-navy'
          : 'border-navy/15 bg-ivory text-navy-500 hover:border-gold/50 hover:text-navy',
      )}
    >
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full border transition',
          selected
            ? tone === 'gold'
              ? 'border-gold bg-gold text-warm-white'
              : 'border-navy/40 bg-navy/10 text-navy'
            : 'border-navy/20 text-navy-400',
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="text-sm leading-snug">{label}</span>
    </button>
  )
}

/**
 * Check-in — the one thing we ask of every guest: are you coming?
 *
 * A reply lands in the couple's sheet through `config.rsvp.endpoint` as an
 * ordinary `{ name, message, ts, site }` row, the answer written into
 * `message` so nothing on the receiving end has to change. The device also
 * remembers its own reply, so a guest returning to the invitation sees their
 * confirmation stub rather than an empty form they might fill in twice.
 */
export function RsvpConfirm({ config }: { config: WeddingConfig }) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const endpoint = config.rsvp.endpoint.trim()
  const site = config.rsvp.site.trim()
  const maxGuests = Math.max(1, config.rsvp.maxGuests)

  const formRef = useRef<HTMLFormElement>(null)

  // Read once, before the first paint, so a guest who has already replied
  // never sees the empty form flash by and fill itself in.
  const [stored] = useState<Rsvp | null>(() =>
    typeof window === 'undefined' ? null : readStored(),
  )

  const [name, setName] = useState(stored?.name ?? '')
  const [attending, setAttending] = useState<boolean | null>(
    stored?.attending ?? null,
  )
  const [guests, setGuests] = useState(stored?.guests ?? 1)
  const [message, setMessage] = useState(stored?.message ?? '')
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'error' | 'tooSoon' | 'tooMany'
  >('idle')
  const [waitSeconds, setWaitSeconds] = useState(0)
  const [confirmed, setConfirmed] = useState<Rsvp | null>(stored)

  /** What the couple last heard from this device — the yardstick for "has
   *  anything actually changed?", which `stored` stops being after a send. */
  const sentRef = useRef<Rsvp | null>(stored)
  /** Bots fill every field they find; a guest never sees this one. */
  const trapRef = useRef<HTMLInputElement>(null)

  const trimmedName = name.trim()
  const canSubmit =
    trimmedName.length > 0 && attending !== null && status !== 'sending'

  /** Posts the reply and resolves delivered? — never rejects. */
  const dispatch = useCallback(
    (rsvp: Rsvp, revised: boolean): Promise<boolean> => {
      if (!endpoint) return Promise.resolve(true)
      // text/plain keeps the request "simple" (no CORS preflight) and no-cors
      // lets an Apps Script endpoint accept it from any origin.
      return fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          // The row this reply owns. An endpoint that keys on it replaces the
          // guest's earlier answer; one that ignores it appends, and the
          // marker inside `message` says which row won.
          id: deviceId(),
          name: rsvp.name,
          message: wireMessage(rsvp, revised),
          ts: rsvp.ts,
          site,
          // Sent alongside for the day the sheet grows columns of its own;
          // an endpoint that ignores them still gets the whole answer above.
          attending: rsvp.attending,
          guests: rsvp.attending ? rsvp.guests : 0,
          note: rsvp.message,
        }),
      })
        .then(() => true)
        .catch(() => false)
    },
    [endpoint, site],
  )

  const onSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!canSubmit || attending === null) return

      const now = Date.now()
      const rsvp: Rsvp = {
        name: trimmedName.slice(0, NAME_MAX),
        attending,
        guests: attending ? Math.min(Math.max(1, guests), maxGuests) : 1,
        message: message.trim().slice(0, MESSAGE_MAX),
        ts: now,
      }

      const sent = sentRef.current

      // Reopening the form and closing it again is the commonest path back
      // here, and most of the time nothing was actually changed. Say thank
      // you, send nothing: the couple keep the row they already have.
      if (sent && sameAnswer(sent, rsvp)) {
        setStatus('idle')
        setConfirmed(sent)
        return
      }

      // A filled trap is a bot. Behave exactly as we would for a guest so
      // there is nothing to learn from the response, and post nothing.
      if (trapRef.current?.value) {
        setStatus('idle')
        setConfirmed(rsvp)
        return
      }

      const guard = sendGuard(now)
      if (guard.spent) {
        setStatus('tooMany')
        return
      }
      if (guard.waitMs > 0) {
        setWaitSeconds(Math.ceil(guard.waitMs / 1000))
        setStatus('tooSoon')
        return
      }

      setStatus('sending')
      const delivered = await dispatch(rsvp, sent !== null)
      if (!delivered) {
        setStatus('error')
        return
      }

      recordSend(now)
      saveStored(rsvp)
      sentRef.current = rsvp
      setStatus('idle')
      setConfirmed(rsvp)

      if (rsvp.attending) {
        const rect = formRef.current?.getBoundingClientRect()
        confetti({
          particleCount: 70,
          spread: 70,
          startVelocity: 42,
          origin: {
            x: rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5,
            y: rect
              ? Math.max(0.05, rect.top / window.innerHeight)
              : 0.4,
          },
          colors: GOLD_COLORS,
          disableForReducedMotion: true,
          zIndex: 5,
        })
      }
    },
    [
      attending,
      canSubmit,
      dispatch,
      guests,
      maxGuests,
      message,
      trimmedName,
    ],
  )

  const stepGuests = (delta: number) =>
    setGuests((prev) => Math.min(Math.max(1, prev + delta), maxGuests))

  return (
    <section
      id="rsvp"
      className="relative overflow-hidden bg-gradient-to-b from-warm-white via-sky-soft/45 to-warm-white py-20"
      aria-label={t.rsvp.title}
    >
      <RomanticAura className="opacity-70" />
      <SectionRomance direction="ltr" planeTop="10%" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <Reveal className="px-5">
          <SectionHeading
            kicker={t.rsvp.kicker}
            title={t.rsvp.title}
            subtitle={t.rsvp.subtitle}
          />
        </Reveal>

        <Reveal delay={0.12} className="mx-5 mt-8 sm:mx-auto">
          <AnimatePresence mode="wait" initial={false}>
            {confirmed ? (
              <motion.div
                key="stub"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: easeLux }}
                className="relative overflow-hidden rounded-3xl border border-gold/35 bg-white/85 px-6 py-8 text-center shadow-[0_24px_50px_-30px_rgba(27,42,74,0.35)] backdrop-blur-md sm:px-10"
              >
                <span className="label-caps flex items-center justify-center gap-2 text-[10px] text-gold-dark">
                  <Ticket className="h-3.5 w-3.5" strokeWidth={1.6} />
                  {t.rsvp.stubLabel}
                </span>

                <p className="mt-4 font-script text-4xl leading-tight text-navy">
                  {confirmed.name}
                </p>

                <p className="mt-3 text-sm leading-relaxed text-navy-500">
                  {confirmed.attending
                    ? t.rsvp.confirmedYes
                    : t.rsvp.confirmedNo}
                </p>

                {confirmed.attending && (
                  <p className="mt-4 font-mono text-sm text-gold-dark">
                    {confirmed.guests} {t.rsvp.guestsUnit}
                  </p>
                )}

                {confirmed.message && (
                  <p className="mt-4 text-balance text-sm italic leading-relaxed text-navy-400">
                    “{confirmed.message}”
                  </p>
                )}

                <div className="mt-6 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle')
                      setConfirmed(null)
                    }}
                    className="btn btn-ghost"
                  >
                    {t.rsvp.change}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      forgetDevice()
                      sentRef.current = null
                      setName('')
                      setAttending(null)
                      setGuests(1)
                      setMessage('')
                      setStatus('idle')
                      setConfirmed(null)
                    }}
                    className="cursor-pointer text-xs text-navy-400 underline decoration-gold/40 underline-offset-4 transition hover:text-gold-dark"
                  >
                    {t.rsvp.another}
                  </button>
                </div>

                <div
                  aria-hidden
                  className="card-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
                />
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                onSubmit={onSubmit}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: easeLux }}
                className="relative overflow-hidden rounded-3xl border border-gold/30 bg-white/80 px-4 py-6 shadow-[0_24px_50px_-30px_rgba(27,42,74,0.35)] backdrop-blur-md sm:px-8 sm:py-8"
              >
                {/* Off-screen rather than display:none — a bot reading the
                    DOM fills it, a guest never reaches it. */}
                <input
                  ref={trapRef}
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[-9999px] h-px w-px opacity-0"
                />

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="rsvp-name"
                    className="label-caps text-[10px] text-navy-400"
                  >
                    {t.rsvp.nameLabel}
                  </label>
                  <input
                    id="rsvp-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={NAME_MAX}
                    placeholder={t.rsvp.namePlaceholder}
                    className="w-full rounded-xl border border-navy/15 bg-ivory px-4 py-2.5 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                  />
                </div>

                <fieldset className="mt-5">
                  <legend className="label-caps mb-2 text-[10px] text-navy-400">
                    {t.rsvp.attendingLabel}
                  </legend>
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <AnswerCard
                      icon={Check}
                      label={t.rsvp.yes}
                      tone="gold"
                      selected={attending === true}
                      onSelect={() => setAttending(true)}
                    />
                    <AnswerCard
                      icon={X}
                      label={t.rsvp.no}
                      tone="quiet"
                      selected={attending === false}
                      onSelect={() => setAttending(false)}
                    />
                  </div>
                </fieldset>

                {/* Party size only matters to someone who is coming, so it
                    unfolds with the "yes" rather than sitting there unasked. */}
                <AnimatePresence initial={false}>
                  {attending === true && (
                    <motion.div
                      key="guests"
                      initial={reduce ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={reduce ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: easeLux }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-navy/12 bg-ivory px-4 py-3">
                        <span
                          id="rsvp-guests-label"
                          className="label-caps text-[10px] text-navy-400"
                        >
                          {t.rsvp.guestsLabel}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => stepGuests(-1)}
                            disabled={guests <= 1}
                            aria-label={`${t.rsvp.guestsLabel} −`}
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-navy/20 text-navy transition hover:border-gold hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                          <output
                            aria-labelledby="rsvp-guests-label"
                            className="min-w-14 text-center font-mono text-base text-navy"
                          >
                            {guests}
                          </output>
                          <button
                            type="button"
                            onClick={() => stepGuests(1)}
                            disabled={guests >= maxGuests}
                            aria-label={`${t.rsvp.guestsLabel} +`}
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-navy/20 text-navy transition hover:border-gold hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-5 flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <label
                      htmlFor="rsvp-message"
                      className="label-caps text-[10px] text-navy-400"
                    >
                      {t.rsvp.messageLabel}
                    </label>
                    <span className="font-mono text-[10px] text-navy-400">
                      {message.length}/{MESSAGE_MAX}
                    </span>
                  </div>
                  <textarea
                    id="rsvp-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={MESSAGE_MAX}
                    rows={3}
                    placeholder={t.rsvp.messagePlaceholder}
                    className="w-full resize-none rounded-xl border border-navy/15 bg-ivory px-4 py-2.5 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn btn-gold mt-6 w-full"
                >
                  <Send className="h-4 w-4" />
                  {status === 'sending' ? t.rsvp.sending : t.rsvp.submit}
                </button>

                <p
                  role="status"
                  aria-live="polite"
                  className={cn(
                    'mt-3 min-h-5 text-balance text-center text-sm transition-opacity',
                    status === 'error' && 'text-rose',
                    (status === 'tooSoon' || status === 'tooMany') &&
                      'text-gold-dark',
                    (status === 'idle' || status === 'sending') && 'opacity-0',
                  )}
                >
                  {status === 'tooSoon'
                    ? t.rsvp.tooSoon.replace('{s}', String(waitSeconds))
                    : status === 'tooMany'
                      ? t.rsvp.tooMany
                      : t.rsvp.error}
                </p>

                <div
                  aria-hidden
                  className="card-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
                />
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>

        {/* The thank-you sits outside the card so it survives the swap. */}
        <p
          role="status"
          aria-live="polite"
          className="mt-4 min-h-5 px-5 text-center text-sm text-gold-dark"
        >
          {confirmed
            ? confirmed.attending
              ? t.rsvp.thanksYes
              : t.rsvp.thanksNo
            : ''}
        </p>
      </div>
    </section>
  )
}
