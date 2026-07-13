import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'

/** Slow rose-and-champagne light that makes intimate sections feel alive. */
export function RomanticAura({ className }: { className?: string }) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <motion.span
        className="absolute -left-20 top-[8%] h-72 w-72 rounded-full bg-rose/25 blur-3xl will-change-transform sm:h-96 sm:w-96"
        animate={
          reduce
            ? { opacity: 0.28 }
            : {
                x: [0, 34, 12, 0],
                y: [0, 24, -12, 0],
                scale: [0.92, 1.12, 1.02, 0.92],
                opacity: [0.22, 0.42, 0.3, 0.22],
              }
        }
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="absolute -right-24 bottom-[4%] h-80 w-80 rounded-full bg-gold-light/30 blur-3xl will-change-transform sm:h-[28rem] sm:w-[28rem]"
        animate={
          reduce
            ? { opacity: 0.26 }
            : {
                x: [0, -28, -8, 0],
                y: [0, -18, 18, 0],
                scale: [1.04, 0.9, 1.12, 1.04],
                opacity: [0.2, 0.38, 0.28, 0.2],
              }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: -5,
        }}
      />
    </div>
  )
}
