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
/** Concurrent tickets drifting through the wish sky. */
const SKY_SLOTS = 10
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

function WishTicket({
  wish,
  compact,
  className,
}: {
  wish: Wish
  compact?: boolean
  className?: string
}) {
  const { t } = useI18n()

  return (
    // Deliberately no backdrop-filter: these cards animate constantly and
    // re-sampling the backdrop every frame is what makes low-end phones drop
    // frames. A near-opaque background reads the same at a fraction of cost.
    <article
      className={cn(
        'relative overflow-hidden rounded-xl border border-gold/30 bg-[#fffdfa] text-left shadow-[0_14px_28px_-18px_rgba(27,42,74,0.45)]',
        compact ? 'w-52 px-3.5 pb-2 pt-2.5' : 'w-60 px-4 pb-2.5 pt-3 sm:w-64',
        className,
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

      <p
        className={cn(
          'mt-1.5 overflow-hidden text-[12.5px] leading-relaxed text-navy [display:-webkit-box] [-webkit-box-orient:vertical]',
          compact ? '[-webkit-line-clamp:2]' : 'min-h-[3.5rem] [-webkit-line-clamp:3]',
        )}
      >
        {wish.message}
      </p>

      <div className="mt-2 flex items-center justify-between gap-3 border-t border-dashed border-navy/15 pt-1.5">
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

/** One lane of the sky. When its ticket drifts off the top it comes back
 *  around showing the next wish, so every message gets its turn aloft. */
function WishSkySlot({
  slot,
  slots,
  wishes,
}: {
  slot: number
  slots: number
  wishes: Wish[]
}) {
  const [round, setRound] = useState(0)
  const wish = wishes[(slot + round * slots) % wishes.length]
  const far = slot % 3 === 2

  const seed = slot * 137 + 41
  const style = {
    '--wish-left': `min(${4 + ((slot * 61.8) % 72)}%, calc(100% - 14rem))`,
    '--wish-duration': `${21 + (seed % 12)}s`,
    '--wish-delay': `${-((slot * 173) % 29)}s`,
    '--wish-drift': `${((seed * 3) % 56) - 28}px`,
    '--wish-tilt': `${((seed * 7) % 9) - 4}deg`,
    '--wish-scale': far ? 0.82 : 1,
    '--wish-opacity': far ? 0.72 : 1,
    zIndex: far ? 1 : 2,
  } as CSSProperties

  return (
    // The far layer stays desktop-only: phones get fewer animated layers,
    // which is the difference between silky and stuttery on weak GPUs.
    <div
      className={cn('wish-float', far && 'max-sm:hidden')}
      style={style}
      onAnimationIteration={() => setRound((value) => value + 1)}
    >
      <WishTicket wish={wish} compact />
    </div>
  )
}

/** The wish sky: tickets float upward like the hearts elsewhere on the
 *  page — slow, layered and pausable under the guest's finger. */
function WishSky({ wishes }: { wishes: Wish[] }) {
  const slots = Math.min(SKY_SLOTS, wishes.length <= 4 ? wishes.length * 2 : SKY_SLOTS)

  return (
    <div
      className="relative h-[24rem] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)]"
      aria-hidden="true"
    >
      {Array.from({ length: slots }, (_, slot) => (
        <WishSkySlot key={slot} slot={slot} slots={slots} wishes={wishes} />
      ))}
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

/** Shared timeline: the ticket pops free and hovers, the plane swoops in
 *  from high on the left, dips to hook the rope with a little snatch, then
 *  climbs out fast. Plane and ticket share `times`, so they never drift. */
const FLIGHT_TIMES = [0, 0.13, 0.32, 0.4, 0.46, 0.6, 0.8, 1]
const FLIGHT_EASE = [
  'linear',
  'easeOut',
  'easeInOut',
  'easeInOut',
  'easeInOut',
  'easeInOut',
  'easeIn',
] as const
const FLIGHT_DURATION = 3
const PICKUP_AT_MS = FLIGHT_TIMES[4] * FLIGHT_DURATION * 1000

/** Emoji shapes are rasterised once up front — doing it inside the pickup
 *  timeout caused a visible frame drop right at the snatch moment. */
type WishConfettiShape = ReturnType<typeof confetti.shapeFromText>
let wishConfettiShapes: WishConfettiShape[] | null = null
function getWishConfettiShapes(): WishConfettiShape[] {
  if (!wishConfettiShapes) {
    wishConfettiShapes = [
      confetti.shapeFromText({ text: '✈️', scalar: 1.2 }),
      confetti.shapeFromText({ text: '💛', scalar: 1.2 }),
    ]
  }
  return wishConfettiShapes
}

/**
 * The send-off: a courier plane swoops down, snatches the guest's freshly
 * written ticket onto a tow rope and hauls it into the sky, shedding
 * sparkles, a couple of hearts and a whoosh on the way out.
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
    // Warm the emoji rasters now, while the ticket is still rising.
    const shapes = getWishConfettiShapes()
    const timer = window.setTimeout(() => {
      confetti({
        particleCount: 18,
        spread: 70,
        startVelocity: 24,
        scalar: 1.2,
        origin: confettiOrigin,
        shapes,
        disableForReducedMotion: true,
        zIndex: 60,
      })
    }, PICKUP_AT_MS)
    return () => window.clearTimeout(timer)
  }, [confettiOrigin])

  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      {/* The courier plane: high entry, banking swoop, dip, snatch, climb. */}
      <motion.span
        className="absolute left-0 top-0"
        initial={false}
        animate={{
          x: [
            -220,
            -220,
            planeX * 0.45 - 90,
            planeX,
            planeX + 20,
            planeX + glide * 0.28,
            planeX + glide * 0.62,
            exitX,
          ],
          y: [
            planeY - 96,
            planeY - 96,
            planeY - 48,
            planeY + 3,
            planeY,
            planeY - 28,
            planeY - 66,
            planeY - 156,
          ],
          rotate: [16, 16, 9, 1, -2, -6, -10, -14],
          opacity: [0, 0, 1, 1, 1, 1, 1, 0],
        }}
        transition={{
          duration: FLIGHT_DURATION,
          times: FLIGHT_TIMES,
          ease: [...FLIGHT_EASE],
        }}
      >
        <span className="absolute right-full top-1/2 mr-1 h-px w-20 -translate-y-1/2 bg-gradient-to-l from-gold-dark/70 via-gold/40 to-transparent" />
        <Plane
          className="h-8 w-8 rotate-45 text-gold-dark drop-shadow-[0_6px_10px_rgba(27,42,74,0.35)]"
          strokeWidth={1.4}
        />
      </motion.span>

      {/* Sparkle burst the instant the rope hooks on. */}
      {[
        { dx: -26, dy: -6, delay: 0 },
        { dx: 20, dy: -20, delay: 0.09 },
        { dx: 4, dy: 18, delay: 0.16 },
      ].map(({ dx, dy, delay }) => (
        <motion.span
          key={`sparkle-${dx}-${dy}`}
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

      {/* A couple of tiny hearts spill loose and tumble down. */}
      {[
        { dx: -12, fall: 46, sway: -22, delay: 0.05 },
        { dx: 16, fall: 60, sway: 18, delay: 0.16 },
        { dx: 2, fall: 38, sway: 8, delay: 0.28 },
      ].map(({ dx, fall, sway, delay }) => (
        <motion.span
          key={`heart-${dx}-${fall}`}
          className="absolute left-0 top-0 text-rose"
          style={{ x: pickupX + dx, y: pickupY + 16 }}
          initial={{ opacity: 0, y: pickupY + 16, scale: 0.6 }}
          animate={{
            opacity: [0, 0.9, 0],
            y: [pickupY + 16, pickupY + 16 + fall * 0.5, pickupY + 16 + fall],
            x: [pickupX + dx, pickupX + dx + sway * 0.5, pickupX + dx + sway],
            rotate: [0, sway, sway * 1.6],
            scale: [0.6, 1, 0.7],
          }}
          transition={{
            duration: 1,
            delay: PICKUP_AT_MS / 1000 + delay,
            ease: 'easeOut',
          }}
        >
          <Heart className="h-3 w-3 fill-rose/70" strokeWidth={1.4} />
        </motion.span>
      ))}

      {/* Whoosh streaks as the pair accelerates out of frame. */}
      {[
        { w: 'w-24', oy: -46, delay: 0 },
        { w: 'w-14', oy: -16, delay: 0.09 },
      ].map(({ w, oy, delay }) => (
        <motion.span
          key={`whoosh-${w}-${oy}`}
          className={cn(
            'absolute left-0 top-0 h-px bg-gradient-to-l from-white/90 via-gold-light/60 to-transparent',
            w,
          )}
          style={{ y: planeY + oy }}
          initial={{ x: pickupX + glide * 0.3, opacity: 0 }}
          animate={{
            x: [pickupX + glide * 0.3, pickupX + glide * 0.85],
            opacity: [0, 0.85, 0],
          }}
          transition={{
            duration: 0.6,
            delay: FLIGHT_DURATION * 0.66 + delay,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* The guest's ticket: pops free, hovers, gets snatched, sails away. */}
      <motion.div
        className="absolute left-0 top-0 w-44 origin-top"
        initial={false}
        animate={{
          x: [
            hangX,
            hangX,
            hangX,
            hangX,
            hangX,
            hangX + glide * 0.28,
            hangX + glide * 0.62,
            hangX + glide,
          ],
          y: [
            startY,
            hangY + 6,
            hangY + 10,
            hangY + 7,
            hangY,
            hangY - 24,
            hangY - 62,
            hangY - 152,
          ],
          rotate: [-5, 2, -2, -1, 0, 4, 7, 9],
          scale: [0.45, 1, 1, 1, 1, 1, 1, 0.88],
          opacity: [0, 1, 1, 1, 1, 1, 1, 0],
        }}
        transition={{
          duration: FLIGHT_DURATION,
          times: FLIGHT_TIMES,
          ease: [...FLIGHT_EASE],
        }}
        onAnimationComplete={onDone}
      >
        {/* Tow rope + knot — appears the moment the plane hooks on. */}
        <motion.span
          className="absolute -top-12 left-1/2 h-12 w-px -translate-x-1/2 bg-gradient-to-b from-gold-dark/80 to-gold/40"
          initial={false}
          animate={{ opacity: [0, 0, 0, 0, 1, 1, 1, 1] }}
          transition={{ duration: FLIGHT_DURATION, times: FLIGHT_TIMES }}
        >
          <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-dark/80" />
        </motion.span>

        {/* Inner flutter keeps the towed ticket alive like a banner. */}
        <div className="animate-[ticket-flutter_0.85s_ease-in-out_infinite] rounded-lg border border-gold/40 bg-white/95 px-3 py-2 shadow-[0_14px_30px_-14px_rgba(27,42,74,0.55)]">
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
 * Boarding messages — the guest book. Wishes float up through the section
 * like the hearts elsewhere on the page, each one a little boarding pass;
 * a small form lets every guest send their own ticket skyward. With
 * `config.guestbook.endpoint` set the wishes are shared between all guests
 * (per-site via `config.guestbook.site`), otherwise they stay on-device.
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
  const site = config.guestbook.site.trim()

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
    fetch(`${endpoint}?site=${encodeURIComponent(site)}`, {
      signal: controller.signal,
    })
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
  }, [endpoint, site])

  const wishes = useMemo(() => {
    const seeds = sanitiseWishes(
      t.guestbook.seeds.map((seed, index) => ({ ...seed, ts: index + 1 })),
    )
    const merged = new Map<string, Wish>()
    for (const wish of [...seeds, ...remoteWishes, ...localWishes]) {
      merged.set(wish.id, wish)
    }
    // Newest first, so a fresh wish takes the next free lane in the sky.
    return [...merged.values()]
      .slice(-WISHES_MAX)
      .sort((a, b) => b.ts - a.ts)
  }, [t.guestbook.seeds, remoteWishes, localWishes])

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
          site,
        }),
      })
        .then(() => true)
        .catch(() => false)
    },
    [endpoint, site],
  )

  /** Lands the wish: put it in the sky and show the outcome. Guarded so the
   *  flight callback and its safety timer can't land the same wish twice. */
  const finalizeWish = useCallback(async (wish: Wish) => {
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
  }, [])

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
        // No theatrics: deliver straight to the sky.
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
        exitX: sectionRect.width + 220,
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
      <SectionRomance direction="ltr" planeTop="8%" />

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

        {/* Wishes float up through the sky like hearts; under reduced
            motion they rest as a quiet, readable grid instead. */}
        <Reveal delay={0.08} className="mt-6">
          {reduced ? (
            <div className="flex flex-wrap items-stretch justify-center gap-4 px-5 py-6">
              {wishes.slice(0, 6).map((wish) => (
                <WishTicket key={wish.id} wish={wish} />
              ))}
            </div>
          ) : (
            <WishSky wishes={wishes} />
          )}
        </Reveal>

        <Reveal
          delay={0.14}
          className="relative mx-5 mt-6 sm:mx-auto sm:w-full sm:max-w-xl"
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
