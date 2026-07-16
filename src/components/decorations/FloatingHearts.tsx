import { useReducedMotion } from 'motion/react'
import { Heart } from 'lucide-react'
import { cn } from '../../lib/cn'

interface HeartDef {
  left: string
  /** Vertical start anchor. */
  top: string
  size: number
  /** Animation length (s) — larger = slower rise. */
  duration: number
  /** Negative delay so hearts start mid-flight and fill the sky at load. */
  delay: number
  /** Peak opacity. */
  opacity: number
  /** Tailwind text-colour class for the fill. */
  tone: string
}

// A generous, hand-scattered field so the hero sky feels full of love.
const HEARTS: HeartDef[] = [
  { left: '6%', top: '78%', size: 22, duration: 14, delay: 0, opacity: 0.55, tone: 'text-rose' },
  { left: '14%', top: '88%', size: 14, duration: 11, delay: -3, opacity: 0.4, tone: 'text-gold' },
  { left: '22%', top: '70%', size: 28, duration: 17, delay: -8, opacity: 0.5, tone: 'text-rosegold' },
  { left: '30%', top: '90%', size: 16, duration: 12, delay: -5, opacity: 0.45, tone: 'text-rose' },
  { left: '38%', top: '82%', size: 12, duration: 10, delay: -2, opacity: 0.35, tone: 'text-gold' },
  { left: '46%', top: '92%', size: 20, duration: 15, delay: -9, opacity: 0.5, tone: 'text-rose' },
  { left: '54%', top: '74%', size: 26, duration: 16, delay: -6, opacity: 0.45, tone: 'text-rosegold' },
  { left: '62%', top: '88%', size: 14, duration: 11, delay: -1, opacity: 0.4, tone: 'text-gold' },
  { left: '70%', top: '80%', size: 18, duration: 13, delay: -7, opacity: 0.5, tone: 'text-rose' },
  { left: '78%', top: '90%', size: 24, duration: 15, delay: -4, opacity: 0.45, tone: 'text-rosegold' },
  { left: '86%', top: '72%', size: 13, duration: 10, delay: -10, opacity: 0.35, tone: 'text-gold' },
  { left: '92%', top: '84%', size: 20, duration: 14, delay: -6, opacity: 0.5, tone: 'text-rose' },
  { left: '10%', top: '60%', size: 12, duration: 18, delay: -12, opacity: 0.3, tone: 'text-rosegold' },
  { left: '50%', top: '58%', size: 15, duration: 19, delay: -11, opacity: 0.3, tone: 'text-rose' },
  { left: '82%', top: '56%', size: 13, duration: 20, delay: -14, opacity: 0.28, tone: 'text-gold' },
]

/** Static resting layout used when the visitor prefers reduced motion. */
const STATIC_HEARTS = HEARTS.slice(0, 8)

/**
 * A drifting field of hearts that rise gently up the hero sky. Purely
 * decorative; falls back to a scattered static layout with reduced motion.
 */
export function FloatingHearts({
  className,
  count = HEARTS.length,
}: {
  className?: string
  /** Limit the field for quieter sections; the hero keeps the full set. */
  count?: number
}) {
  const reduce = useReducedMotion()
  const field = HEARTS.slice(0, Math.max(0, Math.floor(count)))
  const hearts = reduce ? field.slice(0, STATIC_HEARTS.length) : field

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {hearts.map((h, i) => (
        <span
          key={i}
          className={cn('absolute', h.tone, !reduce && 'animate-heart-rise')}
          style={{
            left: h.left,
            top: h.top,
            opacity: reduce ? h.opacity * 0.7 : undefined,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            // Consumed by the keyframes to fade in/out at the right peak.
            ['--heart-opacity' as string]: h.opacity,
          }}
        >
          <Heart
            width={h.size}
            height={h.size}
            fill="currentColor"
            strokeWidth={0}
            className="drop-shadow-[0_2px_5px_rgba(200,120,140,0.25)]"
          />
        </span>
      ))}
    </div>
  )
}
