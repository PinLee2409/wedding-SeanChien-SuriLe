import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { useReducedMotion } from 'motion/react'
import confetti from 'canvas-confetti'
import { Heart, Plane, Send } from 'lucide-react'
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

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'thanks' | 'error'>(
    'idle',
  )
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

  const onSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!canSubmit) return

      const wish = sanitiseWishes([
        { name: trimmedName, message: trimmedMessage, ts: Date.now() },
      ])[0]
      if (!wish) return

      setStatus('sending')

      // The wish appears on the wall immediately and survives reloads on
      // this device even when no shared endpoint is configured.
      setLocalWishes((prev) => {
        const next = [...prev, wish].slice(-WISHES_MAX)
        saveLocalWishes(next)
        return next
      })

      let delivered = true
      if (endpoint) {
        try {
          // text/plain keeps the request "simple" (no CORS preflight) and
          // no-cors lets an Apps Script endpoint accept it from any origin.
          await fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              name: wish.name,
              message: wish.message,
              ts: wish.ts,
            }),
          })
        } catch {
          delivered = false
        }
      }

      setStatus(delivered ? 'thanks' : 'error')
      if (delivered) {
        setMessage('')
        confetti({
          particleCount: 36,
          spread: 80,
          startVelocity: 26,
          scalar: 1.25,
          origin: { x: 0.5, y: 0.72 },
          shapes: [
            confetti.shapeFromText({ text: '✈️', scalar: 1.25 }),
            confetti.shapeFromText({ text: '💛', scalar: 1.25 }),
          ],
          disableForReducedMotion: true,
          zIndex: 60,
        })
      }
      window.setTimeout(() => setStatus('idle'), 4500)
    },
    [canSubmit, endpoint, trimmedMessage, trimmedName],
  )

  return (
    <section
      id="wishes"
      className="relative overflow-hidden bg-gradient-to-b from-warm-white via-sky-soft/55 to-ivory py-20"
      aria-label={t.guestbook.title}
    >
      <RomanticAura className="opacity-70" />
      <SectionRomance direction="ltr" planeTop="12%" />

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
