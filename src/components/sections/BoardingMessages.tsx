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

/** Geometry captured the moment the guest presses send: the swoop pre-sampled
 *  into equal-arc-length keyframes so the plane can be driven purely by
 *  `transform` (translate + rotate) — the one thing every browser, iOS Safari
 *  included, always runs on the GPU compositor. */
interface FlightState {
  wish: Wish
  /** Plane-centre x/y for each keyframe, in px within the section. */
  xs: number[]
  ys: number[]
  /** Path tangent (deg) at each keyframe — the plane's bank angle. */
  angles: number[]
  /** Even timeline positions (constant speed, since samples are equal-arc). */
  times: number[]
  duration: number
  /** Timeline fraction at the hook moment. */
  pickupFraction: number
  startY: number
  pickupX: number
  pickupY: number
  confettiOrigin: { x: number; y: number }
}

/** The towed ticket hangs this far under the plane's flight path. */
const ROPE_DROP = 60
/** Keyframe samples along the swoop — enough for a silky line, few enough
 *  that the compositor never breaks a sweat. */
const FLIGHT_SAMPLES = 48

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

/** Builds one C¹-continuous swoop (two cubics sharing the hook tangent) and
 *  samples it at equal arc length. Equal-length samples + evenly spaced times
 *  give perfectly constant velocity — no stop-and-go at keyframe joints. */
function planFlight(
  pickupX: number,
  pickupY: number,
  sectionWidth: number,
): Pick<
  FlightState,
  'xs' | 'ys' | 'angles' | 'times' | 'duration' | 'pickupFraction'
> {
  const entryX = -240
  const entryY = pickupY - 130
  const exitX = sectionWidth + 240
  const exitY = pickupY - 190
  const tangent = { x: 130, y: 8 }
  const path =
    `M ${entryX} ${entryY} ` +
    `C ${entryX + 200} ${entryY + 20}, ${pickupX - tangent.x} ${pickupY - tangent.y}, ${pickupX} ${pickupY} ` +
    `C ${pickupX + tangent.x} ${pickupY + tangent.y}, ${exitX - 260} ${exitY + 110}, ${exitX} ${exitY}`

  const xs: number[] = []
  const ys: number[] = []
  const angles: number[] = []
  const times: number[] = []
  let pickupFraction = 0.45
  let duration = 2.8

  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    probe.setAttribute('d', path)
    svg.setAttribute('aria-hidden', 'true')
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
    svg.appendChild(probe)
    document.body.appendChild(svg)

    const total = probe.getTotalLength()
    let bestDist = Infinity
    for (let i = 0; i <= FLIGHT_SAMPLES; i += 1) {
      const t = i / FLIGHT_SAMPLES
      const len = t * total
      const point = probe.getPointAtLength(len)
      // Tangent from a short step either side of this sample.
      const ahead = probe.getPointAtLength(Math.min(total, len + 1))
      const behind = probe.getPointAtLength(Math.max(0, len - 1))
      xs.push(point.x)
      ys.push(point.y)
      angles.push(
        (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI,
      )
      times.push(t)
      const dist = (point.x - pickupX) ** 2 + (point.y - pickupY) ** 2
      if (dist < bestDist) {
        bestDist = dist
        pickupFraction = t
      }
    }
    duration = Math.min(3.4, Math.max(2.3, total / 640))
    svg.remove()
  } catch {
    // Fallback straight glide keeps the send-off working if SVG probing fails.
    for (let i = 0; i <= FLIGHT_SAMPLES; i += 1) {
      const t = i / FLIGHT_SAMPLES
      xs.push(entryX + (exitX - entryX) * t)
      ys.push(pickupY - 40 * t)
      angles.push(0)
      times.push(t)
    }
  }

  return { xs, ys, angles, times, duration, pickupFraction }
}

/** The little boarding-pass card that rides the rope. */
function MiniTicket({ wish }: { wish: Wish }) {
  const { t } = useI18n()
  return (
    <div className="rounded-lg border border-gold/40 bg-[#fffdfa] px-3 py-2 shadow-[0_14px_30px_-14px_rgba(27,42,74,0.55)]">
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
  )
}

/**
 * The send-off, mail-hook style: the plane never stops — it sweeps through
 * on one continuous curve at constant speed, hooks the waiting ticket in
 * passing and climbs away with it swinging on the rope. Every moving part is
 * driven by `transform` (translate/rotate) so the whole flight lives on the
 * GPU compositor and stays silky even on modest phones.
 */
function WishFlight({
  flight,
  onDone,
}: {
  flight: FlightState
  onDone: () => void
}) {
  const {
    wish,
    xs,
    ys,
    angles,
    times,
    duration,
    pickupFraction,
    startY,
    pickupX,
    pickupY,
    confettiOrigin,
  } = flight

  const pickupSeconds = pickupFraction * duration
  /** Timeline fraction right after the hook, when the hand-over happens. */
  const swap = Math.min(pickupFraction + 0.015, 1)
  // The waiting ticket's top-centre must coincide with the towed copy the
  // instant they swap: plane centre + rope drop (ticket is w-44 ≈ 176px).
  const hangX = pickupX - 88
  const hangY = pickupY + ROPE_DROP
  const willChange = { willChange: 'transform' } as CSSProperties

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
    }, pickupSeconds * 1000)
    return () => window.clearTimeout(timer)
  }, [confettiOrigin, pickupSeconds])

  const rideTransition = { duration, times, ease: 'linear' as const }

  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      {/* Outer group carries only the translate — the single most reliably
          composited animation there is. Constant speed (equal-arc samples +
          even times + linear) means no deceleration at any joint. */}
      <motion.div
        className="absolute left-0 top-0 h-px w-px"
        style={willChange}
        initial={false}
        animate={{ x: xs, y: ys }}
        transition={rideTransition}
        onAnimationComplete={onDone}
      >
        {/* Banking layer: rotates with the path tangent. Rope stays out of
            here so the towed ticket always hangs straight down. */}
        <motion.div
          className="absolute left-0 top-0 h-px w-px"
          style={willChange}
          initial={false}
          animate={{ rotate: angles }}
          transition={rideTransition}
        >
          <span className="absolute right-3 top-0 h-px w-20 -translate-y-1/2 bg-gradient-to-l from-gold-dark/70 via-gold/40 to-transparent" />
          <Plane
            className="absolute -left-4 -top-4 h-8 w-8 rotate-45 text-gold-dark drop-shadow-[0_5px_8px_rgba(27,42,74,0.32)]"
            strokeWidth={1.4}
          />
        </motion.div>

        {/* Tow rope, knot and the towed copy of the ticket — hangs vertically
            from the plane centre and fades in the instant the hook passes. */}
        <motion.div
          className="absolute left-0 top-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 1] }}
          transition={{ duration, times: [0, pickupFraction, swap, 1], ease: 'linear' }}
        >
          <span className="absolute left-0 top-1 h-14 w-px -translate-x-1/2 bg-gradient-to-b from-gold-dark/80 to-gold/40" />
          <span className="absolute left-0 top-[3.4rem] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-dark/80" />
          <div
            className="absolute left-0 w-44 -translate-x-1/2 animate-[ticket-flutter_0.85s_ease-in-out_infinite]"
            style={{ top: ROPE_DROP }}
          >
            <MiniTicket wish={wish} />
          </div>
        </motion.div>
      </motion.div>

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
            delay: pickupSeconds + delay,
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
            delay: pickupSeconds + delay,
            ease: 'easeOut',
          }}
        >
          <Heart className="h-3 w-3 fill-rose/70" strokeWidth={1.4} />
        </motion.span>
      ))}

      {/* Whoosh streaks as the pair accelerates out of frame. */}
      {[
        { w: 'w-24', oy: -58, delay: 0 },
        { w: 'w-14', oy: -28, delay: 0.09 },
      ].map(({ w, oy, delay }) => (
        <motion.span
          key={`whoosh-${w}-${oy}`}
          className={cn(
            'absolute left-0 top-0 h-px bg-gradient-to-l from-white/90 via-gold-light/60 to-transparent',
            w,
          )}
          style={{ y: pickupY + oy }}
          initial={{ x: pickupX + 170, opacity: 0 }}
          animate={{
            x: [pickupX + 170, pickupX + 460],
            opacity: [0, 0.85, 0],
          }}
          transition={{
            duration: 0.6,
            delay: duration * 0.68 + delay,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* The waiting ticket: rises from the form, hovers at hook height and
          hands itself to the plane's towed copy the instant the hook
          passes — the swap is a 40ms cross-fade at identical coordinates. */}
      <motion.div
        className="absolute left-0 top-0 w-44 origin-top"
        initial={false}
        animate={{
          x: hangX,
          y: [startY, hangY + 8, hangY + 2, hangY, hangY, hangY],
          rotate: [-5, 2, -1, 0, 0, 0],
          scale: [0.45, 1, 1, 1, 1, 1],
          opacity: [0, 1, 1, 1, 0, 0],
        }}
        transition={{
          duration,
          times: [
            0,
            Math.min(0.3, pickupFraction * 0.6),
            pickupFraction * 0.9,
            pickupFraction,
            swap,
            1,
          ],
          ease: 'easeOut',
        }}
      >
        <MiniTicket wish={wish} />
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
      // Safety net: if the tab is throttled mid-flight, land the wish anyway
      // (5.2s comfortably covers the longest possible 3.4s flight).
      window.setTimeout(() => void finalizeWish(wish), 5200)

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
      const pickupY = Math.max(120, formRect.top - sectionRect.top - 150)
      setFlight({
        wish,
        ...planFlight(pickupX, pickupY, sectionRect.width),
        startY: formRect.top - sectionRect.top + 90,
        pickupX,
        pickupY,
        confettiOrigin: {
          x: (formRect.left + formRect.width / 2) / window.innerWidth,
          y: Math.max(0.05, (sectionRect.top + pickupY + 40) / window.innerHeight),
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
