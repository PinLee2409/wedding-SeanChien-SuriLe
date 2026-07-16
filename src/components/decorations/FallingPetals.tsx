import { useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'

interface PetalDef {
  left: string
  size: number
  /** Fall time in seconds — longer = lazier. */
  duration: number
  /** Negative delay starts the petal mid-air so the sky is alive at load. */
  delay: number
  opacity: number
  /** Horizontal sway distance, e.g. "5vw". */
  drift: string
  /** Total rotation over one fall. */
  spin: string
  tone: string
}

// Hand-scattered so the fall never looks like rain on a grid.
const PETALS: PetalDef[] = [
  { left: '4%', size: 18, duration: 13, delay: 0, opacity: 0.55, drift: '5vw', spin: '260deg', tone: 'text-rose' },
  { left: '12%', size: 12, duration: 16, delay: -6, opacity: 0.4, drift: '-4vw', spin: '-200deg', tone: 'text-rosegold' },
  { left: '24%', size: 15, duration: 11, delay: -3, opacity: 0.5, drift: '3vw', spin: '320deg', tone: 'text-rose' },
  { left: '35%', size: 10, duration: 17, delay: -10, opacity: 0.35, drift: '-6vw', spin: '180deg', tone: 'text-gold-light' },
  { left: '48%', size: 16, duration: 14, delay: -7, opacity: 0.5, drift: '4vw', spin: '-280deg', tone: 'text-rose' },
  { left: '58%', size: 11, duration: 18, delay: -2, opacity: 0.38, drift: '-3vw', spin: '220deg', tone: 'text-rosegold' },
  { left: '68%', size: 14, duration: 12, delay: -9, opacity: 0.5, drift: '5vw', spin: '300deg', tone: 'text-rose' },
  { left: '78%', size: 12, duration: 15, delay: -5, opacity: 0.42, drift: '-5vw', spin: '-240deg', tone: 'text-gold-light' },
  { left: '88%', size: 17, duration: 13, delay: -11, opacity: 0.5, drift: '3vw', spin: '260deg', tone: 'text-rose' },
  { left: '95%', size: 10, duration: 16, delay: -4, opacity: 0.35, drift: '-4vw', spin: '200deg', tone: 'text-rosegold' },
]

/** A single rose petal — a soft asymmetric teardrop. */
function PetalShape({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2 C 18 6, 21 12, 17 18 C 14 22, 8 22, 6 17 C 4 11, 7 5, 12 2 Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Rose petals drifting down over the whole page — the quintessential wedding
 * ambience. Fixed overlay, non-interactive, and removed entirely when the
 * visitor prefers reduced motion (a static petal field would just be noise).
 */
export function FallingPetals({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-30 overflow-hidden', className)}
      aria-hidden="true"
    >
      {PETALS.map((p, i) => (
        <span
          key={i}
          className={cn(
            'absolute -top-6 animate-petal-fall',
            p.tone,
            i >= 6 && 'hidden sm:block',
          )}
          style={{
            left: p.left,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ['--petal-opacity' as string]: p.opacity,
            ['--petal-drift' as string]: p.drift,
            ['--petal-spin' as string]: p.spin,
          }}
        >
          <PetalShape size={p.size} />
        </span>
      ))}
    </div>
  )
}
