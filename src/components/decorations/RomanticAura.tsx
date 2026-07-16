import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'

/** Slow rose-and-champagne light that makes intimate sections feel alive. */
export function RomanticAura({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const auraRef = useRef<HTMLDivElement>(null)
  const inView = useInView(auraRef, {
    amount: 'some',
    margin: '120px 0px 120px 0px',
  })
  const active = !reduce && inView

  return (
    <div
      ref={auraRef}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <motion.span
        className="absolute -left-16 top-[8%] h-56 w-56 rounded-full bg-rose/25 blur-3xl will-change-transform sm:-left-20 sm:h-96 sm:w-96"
        animate={
          active
            ? {
                x: [0, 20, 8, 0],
                y: [0, 14, -8, 0],
                scale: [0.95, 1.09, 1.01, 0.95],
                opacity: [0.22, 0.4, 0.3, 0.22],
              }
            : { x: 0, y: 0, scale: 1, opacity: 0.26 }
        }
        transition={
          active
            ? { duration: 18, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.45, ease: 'easeOut' }
        }
      />
      <motion.span
        className="absolute -right-16 bottom-[4%] h-64 w-64 rounded-full bg-gold-light/30 blur-3xl will-change-transform sm:-right-24 sm:h-[28rem] sm:w-[28rem]"
        animate={
          active
            ? {
                x: [0, -18, -6, 0],
                y: [0, -12, 12, 0],
                scale: [1.02, 0.93, 1.09, 1.02],
                opacity: [0.2, 0.36, 0.28, 0.2],
              }
            : { x: 0, y: 0, scale: 1, opacity: 0.24 }
        }
        transition={{
          ...(active
            ? {
                duration: 21,
                repeat: Infinity,
                ease: 'easeInOut' as const,
                delay: -5,
              }
            : { duration: 0.45, ease: 'easeOut' as const }),
        }}
      />
    </div>
  )
}
