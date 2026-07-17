import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { motion, useReducedMotion } from 'motion/react'
import confetti from 'canvas-confetti'
import { Heart, Plane, Send, Sparkles } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { cn } from '../../lib/cn'
import { useI18n } from '../../i18n/LanguageContext'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { RomanticAura } from '../decorations/RomanticAura'
import { SectionRomance } from '../decorations/SectionRomance'

interface Wish {
  id: string
  name: string
  message: string
  ts: number
}

const STORAGE_KEY = 'wedding-boarding-wishes-v1'
const NAME_MAX = 40
const MESSAGE_MAX = 200
const WISHES_MAX = 60
/** Minimum tickets per lane so the marquee loop never looks sparse. */
const LANE_MIN = 5
const SEAT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

function hashCode(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** A playful, deterministic seat like "12C" printed on each ticket. */
function seatCode(wish: Wish): string {
  const h = hashCode(`${wish.name}·${wish.message}`)
  return `${(h % 28) + 1}${SEAT_LETTERS[h % SEAT_LETTERS.length]}`
}

/** Accepts any untrusted list (remote endpoint, localStorage) and returns
 *  clean, length-capped wishes with stable ids. */
function sanitiseWishes(raw: unknown): Wish[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === 'object',
    )
    .map((item) => {
      const name = String(item.name ?? '')
        .trim()
        .slice(0, NAME_MAX)
      const message = String(item.message ?? '')
        .trim()
        .slice(0, MESSAGE_MAX)
      const ts = Number(item.ts ?? 0) || 0
      return { id: `${ts}-${hashCode(`${name}·${message}`)}`, name, message, ts }
    })
    .filter((wish) => wish.name.length > 0 && wish.message.length > 1)
    .slice(-WISHES_MAX)
}

function readLocalWishes(): Wish[] {
  try {
    return sanitiseWishes(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
  } catch {
    return []
  }
}

function saveLocalWishes(wishes: Wish[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        wishes.map(({ name, message, ts }) => ({ name, message, ts })),
      ),
    )
  } catch {
    /* ignore storage errors */
  }
}

function WishTicket({ wish, tilt }: { wish: Wish; tilt: 'left' | 'right' }) {
  const { t } = useI18n()

  return (
    <article
      className={cn(
        'relative w-60 shrink-0 self-stretch overflow-hidden rounded-xl border border-gold/30 bg-white/85 px-4 pb-2.5 pt-3 text-left shadow-[0_16px_34px_-22px_rgba(27,42,74,0.5)] backdrop-blur-sm sm:w-64',
        tilt === 'left' ? 'rotate-[-1.1deg]' : 'rotate-[1.2deg]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="label-caps flex items-center gap-1.5 text-[8px] text-gold-dark">
          <Plane className="h-3 w-3 rotate-45" strokeWidth={1.6} />
          {t.guestbook.wishLabel}
        </span>
        <span className="font-mono text-[10px] tracking-[0.12em] text-navy-400">
          {t.guestbook.seat} {seatCode(wish)}
        </span>
      </div>

      <p className="mt-2 min-h-[3.75rem] text-[13px] leading-relaxed text-navy [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
        {wish.message}
      </p>

      <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-dashed border-navy/15 pt-2">
        <span className="truncate font-script text-lg leading-snug text-gold-dark">
          {wish.name}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-navy/70">
          <Heart className="h-3 w-3 fill-rose/60 text-rose" strokeWidth={1.5} />
          <span
            className="h-4 w-10 opacity-50"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 3px)',
            }}
            aria-hidden="true"
          />
        </span>
      </div>
    </article>
  )
}

function WishLane({
  wishes,
  reverse,
  duration,
  paused,
}: {
  wishes: Wish[]
  reverse?: boolean
  duration: string
  paused: boolean
}) {
  if (wishes.length === 0) return null

  // Top up short lanes so the -50% loop point is never visibly empty.
  const filled: Wish[] = []
  while (filled.length < Math.max(LANE_MIN, wishes.length)) {
    filled.push(...wishes.slice(0, LANE_MIN))
  }

  const segment = (hidden: boolean) => (
    <div className="photo-marquee-segment py-3" aria-hidden={hidden || undefined}>
      {filled.map((wish, index) => (
        <WishTicket
          key={`${wish.id}-${index}`}
          wish={wish}
          tilt={index % 2 === 0 ? 'left' : 'right'}
        />
      ))}
    </div>
  )

  return (
    <div
      className="photo-marquee"
      style={{ '--marquee-duration': duration } as CSSProperties}
    >
      <div
        className={cn(
          'photo-marquee-track',
          reverse && 'photo-marquee-track--reverse',
          paused && 'photo-marquee-track--paused',
        )}
      >
        {segment(false)}
        {segment(true)}
      </div>
    </div>
  )
}

/** Geometry (in px, relative to the section) captured the moment the guest
 *  presses send, so the flight lines up with the form wherever it sits. */
interface FlightState {
  wish: Wish
  startY: number
  pickupX: number
  pickupY: number
  exitX: number
  confettiOrigin: { x: number; y: number }
}

/** Shared timeline: pop out of the form → hover → the plane hooks the ticket
 *  → both climb away. Plane and ticket use the same `times`, so they stay in
 *  perfect sync without any per-frame coupling. */
const FLIGHT_TIMES = [0, 0.16, 0.38, 0.46, 0.72, 1]
const FLIGHT_DURATION = 2.7
const PICKUP_AT_MS = FLIGHT_TIMES[3] * FLIGHT_DURATION * 1000

/**
 * The send-off: a little plane sweeps in, picks the guest's freshly written
 * ticket off the form and tows it away into the sky.
 */
function WishFlight({
  flight,
  onDone,
}: {
  flight: FlightState
  onDone: () => void
}) {
  const { t } = useI18n()
  const { wish, startY, pickupX, pickupY, exitX, confettiOrigin } = flight

  // Plane icon is 32px — offset so its centre rides the flight path.
  const planeX = pickupX - 16
  const planeY = pickupY - 16
  // Ticket (w-44 ≈ 176px) hangs centred on a short rope under the plane.
  const hangX = pickupX - 88
  const hangY = pickupY + 32
  const glide = exitX - pickupX

  useEffect(() => {
    const timer = window.setTimeout(() => {
      confetti({
        particleCount: 26,
        spread: 70,
        startVelocity: 24,
        scalar: 1.2,
        origin: confettiOrigin,
        shapes: [
          confetti.shapeFromText({ text: '✈️', scalar: 1.2 }),
          confetti.shapeFromText({ text: '💛', scalar: 1.2 }),
        ],
        disableForReducedMotion: true,
        zIndex: 60,
      })
    }, PICKUP_AT_MS)
    return () => window.clearTimeout(timer)
  }, [confettiOrigin])

  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      {/* The courier plane, with a soft light trail. */}
      <motion.span
        className="absolute left-0 top-0"
        initial={false}
        animate={{
          x: [-180, -180, planeX, planeX + 26, planeX + glide * 0.5, exitX],
          y: [
            planeY + 46,
            planeY + 46,
            planeY,
            planeY - 2,
            planeY - 38,
            planeY - 118,
          ],
          rotate: [6, 6, 0, -2, -6, -10],
          opacity: [0, 0, 1, 1, 1, 0],
        }}
        transition={{
          duration: FLIGHT_DURATION,
          times: FLIGHT_TIMES,
          ease: 'easeInOut',
        }}
      >
        <span className="absolute right-full top-1/2 mr-1 h-px w-16 -translate-y-1/2 bg-gradient-to-l from-gold-dark/70 via-gold/40 to-transparent" />
        <Plane
          className="h-8 w-8 rotate-45 text-gold-dark drop-shadow-[0_6px_10px_rgba(27,42,74,0.35)]"
          strokeWidth={1.4}
        />
      </motion.span>

      {/* Sparkle burst the instant the ticket is hooked. */}
      {[
        { dx: -26, dy: -6, delay: 0 },
        { dx: 20, dy: -20, delay: 0.09 },
        { dx: 4, dy: 18, delay: 0.16 },
      ].map(({ dx, dy, delay }) => (
        <motion.span
          key={`${dx}-${dy}`}
          className="absolute left-0 top-0 text-gold"
          style={{ x: pickupX + dx, y: pickupY + dy }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.25, 0], opacity: [0, 1, 0] }}
          transition={{
            duration: 0.55,
            delay: PICKUP_AT_MS / 1000 + delay,
            ease: 'easeOut',
          }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.span>
      ))}

      {/* The guest's ticket: rises from the form, then swings on the rope. */}
      <motion.div
        className="absolute left-0 top-0 w-44 origin-top"
        initial={false}
        animate={{
          x: [hangX, hangX, hangX, hangX, hangX + glide * 0.5, hangX + glide],
          y: [startY, hangY + 8, hangY + 14, hangY, hangY - 36, hangY - 116],
          rotate: [-5, 2, -2, 0, 4, 7],
          scale: [0.5, 1, 1, 1, 1, 0.9],
          opacity: [0, 1, 1, 1, 1, 0],
        }}
        transition={{
          duration: FLIGHT_DURATION,
          times: FLIGHT_TIMES,
          ease: 'easeInOut',
        }}
        onAnimationComplete={onDone}
      >
        {/* Tow rope + knot — appears the moment the plane hooks on. */}
        <motion.span
          className="absolute -top-12 left-1/2 h-12 w-px -translate-x-1/2 bg-gradient-to-b from-gold-dark/80 to-gold/40"
          initial={false}
          animate={{ opacity: [0, 0, 0, 1, 1, 1] }}
          transition={{ duration: FLIGHT_DURATION, times: FLIGHT_TIMES }}
        >
          <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-dark/80" />
        </motion.span>

        <div className="rounded-lg border border-gold/40 bg-white/95 px-3 py-2 shadow-[0_14px_30px_-14px_rgba(27,42,74,0.55)]">
          <span className="label-caps flex items-center gap-1 text-[7px] text-gold-dark">
            <Plane className="h-2.5 w-2.5 rotate-45" strokeWidth={1.6} />
            {t.guestbook.wishLabel}
          </span>
          <p className="mt-1 truncate text-[11px] leading-snug text-navy">
            {wish.message}
          </p>
          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span className="truncate font-script text-sm text-gold-dark">
              {wish.name}
            </span>
            <Heart
              className="h-2.5 w-2.5 shrink-0 fill-rose/60 text-rose"
              strokeWidth={1.5}
            />
          </span>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Boarding messages — the guest book. Wishes drift past as little boarding
 * passes in two opposing marquee lanes; a small form lets every guest add
 * their own ticket. With `config.guestbook.endpoint` set the wishes are
 * shared between all guests, otherwise they stay on the guest's device.
 */
export function BoardingMessages({
  config,
  guestName,
}: {
  config: WeddingConfig
  guestName: string
}) {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const endpoint = config.guestbook.endpoint.trim()

  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const deliveryRef = useRef<Promise<boolean>>(Promise.resolve(true))
  const landedRef = useRef<string | null>(null)

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'thanks' | 'error'>(
    'idle',
  )
  const [flight, setFlight] = useState<FlightState | null>(null)
  const [localWishes, setLocalWishes] = useState<Wish[]>(() =>
    typeof window === 'undefined' ? [] : readLocalWishes(),
  )
  const [remoteWishes, setRemoteWishes] = useState<Wish[]>([])

  // The gate name is a warm default, but the guest can still sign as anyone.
  useEffect(() => {
    if (guestName) setName((prev) => prev || guestName.slice(0, NAME_MAX))
  }, [guestName])

  useEffect(() => {
    if (!endpoint) return undefined
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 8000)
    fetch(endpoint, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRemoteWishes(sanitiseWishes(data)))
      .catch(() => {
        /* the seeded + local wishes still carry the section */
      })
      .finally(() => window.clearTimeout(timer))
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [endpoint])

  const wishes = useMemo(() => {
    const seeds = sanitiseWishes(
      t.guestbook.seeds.map((seed, index) => ({ ...seed, ts: index + 1 })),
    )
    const merged = new Map<string, Wish>()
    for (const wish of [...seeds, ...remoteWishes, ...localWishes]) {
      merged.set(wish.id, wish)
    }
    return [...merged.values()].slice(-WISHES_MAX)
  }, [t.guestbook.seeds, remoteWishes, localWishes])

  const [laneA, laneB] = useMemo(() => {
    const a: Wish[] = []
    const b: Wish[] = []
    wishes.forEach((wish, index) => (index % 2 === 0 ? a : b).push(wish))
    return [a, b]
  }, [wishes])

  const trimmedName = name.trim()
  const trimmedMessage = message.trim()
  const canSubmit =
    trimmedName.length > 0 &&
    trimmedMessage.length > 1 &&
    status !== 'sending'

  /** Posts to the shared endpoint in the background; resolves delivered? */
  const dispatchWish = useCallback(
    (wish: Wish): Promise<boolean> => {
      if (!endpoint) return Promise.resolve(true)
      // text/plain keeps the request "simple" (no CORS preflight) and
      // no-cors lets an Apps Script endpoint accept it from any origin.
      return fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          name: wish.name,
          message: wish.message,
          ts: wish.ts,
        }),
      })
        .then(() => true)
        .catch(() => false)
    },
    [endpoint],
  )

  /** Lands the wish: put it on the wall and show the outcome. Guarded so the
   *  flight callback and its safety timer can't land the same wish twice. */
  const finalizeWish = useCallback(
    async (wish: Wish) => {
      if (landedRef.current === wish.id) return
      landedRef.current = wish.id
      const delivered = await deliveryRef.current
      setLocalWishes((prev) => {
        const next = [...prev, wish].slice(-WISHES_MAX)
        saveLocalWishes(next)
        return next
      })
      setFlight(null)
      setStatus(delivered ? 'thanks' : 'error')
      window.setTimeout(() => setStatus('idle'), 4500)
    },
    [],
  )

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      if (!canSubmit) return

      const wish = sanitiseWishes([
        { name: trimmedName, message: trimmedMessage, ts: Date.now() },
      ])[0]
      if (!wish) return

      setStatus('sending')
      setMessage('')
      landedRef.current = null
      deliveryRef.current = dispatchWish(wish)
      // Safety net: if the tab is throttled mid-flight, land the wish anyway.
      window.setTimeout(
        () => void finalizeWish(wish),
        (FLIGHT_DURATION + 1.6) * 1000,
      )

      const section = sectionRef.current
      const form = formRef.current
      if (reduced || !section || !form) {
        // No theatrics: deliver straight to the wall.
        void finalizeWish(wish)
        return
      }

      const sectionRect = section.getBoundingClientRect()
      const formRect = form.getBoundingClientRect()
      const pickupX = formRect.left - sectionRect.left + formRect.width / 2
      const pickupY = Math.max(96, formRect.top - sectionRect.top - 92)
      setFlight({
        wish,
        startY: formRect.top - sectionRect.top + 90,
        pickupX,
        pickupY,
        exitX: sectionRect.width + 200,
        confettiOrigin: {
          x: (formRect.left + formRect.width / 2) / window.innerWidth,
          y: Math.max(0.05, (sectionRect.top + pickupY + 24) / window.innerHeight),
        },
      })
    },
    [
      canSubmit,
      dispatchWish,
      finalizeWish,
      reduced,
      trimmedMessage,
      trimmedName,
    ],
  )

  return (
    <section
      ref={sectionRef}
      id="wishes"
      className="relative overflow-hidden bg-gradient-to-b from-warm-white via-sky-soft/55 to-ivory py-20"
      aria-label={t.guestbook.title}
    >
      <RomanticAura className="opacity-70" />
      <SectionRomance direction="ltr" planeTop="12%" />

      {flight && (
        <WishFlight flight={flight} onDone={() => finalizeWish(flight.wish)} />
      )}

      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal className="px-5">
          <SectionHeading
            kicker={t.guestbook.kicker}
            title={t.guestbook.title}
            subtitle={t.guestbook.subtitle}
          />
        </Reveal>

        {/* The wall of boarding wishes, drifting like passing air traffic. */}
        <Reveal delay={0.08} className="mt-10">
          <WishLane wishes={laneA} duration="52s" paused={reduced} />
          <WishLane wishes={laneB} duration="67s" reverse paused={reduced} />
        </Reveal>

        <Reveal
          delay={0.14}
          className="relative mx-5 mt-8 sm:mx-auto sm:w-full sm:max-w-xl"
        >
          <form
            ref={formRef}
            onSubmit={onSubmit}
            className="relative overflow-hidden rounded-3xl border border-gold/30 bg-white/80 px-4 py-6 shadow-[0_24px_50px_-30px_rgba(27,42,74,0.35)] backdrop-blur-md sm:px-8 sm:py-8"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="wish-name"
                className="label-caps text-[10px] text-navy-400"
              >
                {t.guestbook.nameLabel}
              </label>
              <input
                id="wish-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX}
                placeholder={t.guestbook.namePlaceholder}
                className="w-full rounded-xl border border-navy/15 bg-ivory px-4 py-2.5 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <label
                  htmlFor="wish-message"
                  className="label-caps text-[10px] text-navy-400"
                >
                  {t.guestbook.messageLabel}
                </label>
                <span className="font-mono text-[10px] text-navy-400">
                  {message.length}/{MESSAGE_MAX}
                </span>
              </div>
              <textarea
                id="wish-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MESSAGE_MAX}
                rows={3}
                placeholder={t.guestbook.messagePlaceholder}
                className="w-full resize-none rounded-xl border border-navy/15 bg-ivory px-4 py-2.5 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="btn btn-gold mt-5 w-full"
            >
              <Send className="h-4 w-4" />
              {status === 'sending' ? t.guestbook.sending : t.guestbook.submit}
            </button>

            <p
              role="status"
              aria-live="polite"
              className={cn(
                'mt-3 min-h-5 text-center text-sm transition-opacity',
                status === 'thanks' && 'text-gold-dark',
                status === 'error' && 'text-rose',
                (status === 'idle' || status === 'sending') && 'opacity-0',
              )}
            >
              {status === 'error' ? t.guestbook.error : t.guestbook.thanks}
            </p>

            <div
              aria-hidden
              className="card-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            />
          </form>
        </Reveal>
      </div>
    </section>
  )
}
