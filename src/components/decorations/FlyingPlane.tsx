import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Plane } from 'lucide-react'
import { cn } from '../../lib/cn'

interface FlyingPlaneProps {
  className?: string
  /** Vertical position of the flight path. */
  top?: string
  /** Icon size in pixels. */
  size?: number
  /** Seconds for one crossing. */
  duration?: number
  /** Start offset in seconds (negative = already in flight). */
  delay?: number
  /** Pause between crossings. */
  repeatDelay?: number
  /** Travel direction. */
  direction?: 'ltr' | 'rtl'
  /** Tailwind text-colour class for the plane + trail. */
  tone?: string
  /** Contrail width utility class, e.g. "w-28". Empty hides the trail. */
  trailWidth?: string
}

/**
 * A plane that glides across the sky trailing a champagne contrail. Fully
 * configurable so a whole squadron can share one component. Rests statically
 * when the visitor prefers reduced motion.
 */
export function FlyingPlane({
  className,
  top = '20%',
  size = 28,
  duration = 17,
  delay = 0,
  repeatDelay = 5,
  direction = 'ltr',
  tone = 'text-navy',
  trailWidth = 'w-28',
}: FlyingPlaneProps) {
  const reduce = useReducedMotion()
  const pathRef = useRef<HTMLDivElement>(null)
  const pathInView = useInView(pathRef, {
    amount: 'some',
    margin: '120px 0px 120px 0px',
  })
  const rtl = direction === 'rtl'

  const trail = trailWidth ? (
    <span
      className={cn(
        'h-px',
        trailWidth,
        rtl
          ? 'bg-gradient-to-r from-current/60 to-transparent'
          : 'bg-gradient-to-l from-current/60 to-transparent',
      )}
    />
  ) : null

  const planeIcon = (
    <Plane
      width={size}
      height={size}
      strokeWidth={1.5}
      className={cn(
        'shrink-0 drop-shadow-[0_2px_4px_rgba(45,20,35,0.2)]',
        rtl ? '-rotate-45 -scale-x-100' : 'rotate-45',
      )}
    />
  )

  if (reduce) {
    return (
      <div
        className={cn('pointer-events-none absolute', tone, className)}
        style={{ top, right: rtl ? '10%' : undefined, left: rtl ? undefined : '10%' }}
        aria-hidden="true"
      >
        {planeIcon}
      </div>
    )
  }

  return (
    <div
      ref={pathRef}
      className={cn(
        'pointer-events-none absolute inset-x-0 z-10 h-10 overflow-visible',
        tone,
        className,
      )}
      style={{ top }}
      aria-hidden="true"
    >
      {pathInView && (
        <motion.div
          className="absolute left-0 will-change-transform"
          initial={{ x: rtl ? '118vw' : '-18vw' }}
          animate={{ x: rtl ? '-18vw' : '118vw' }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay,
            delay,
          }}
        >
          <motion.div
            className="flex scale-[0.86] items-center gap-1.5 sm:scale-100 sm:gap-2"
            initial={{ opacity: 0, y: 2 }}
            animate={{
              opacity: [0, 0.85, 1, 1, 0.85, 0],
              y: [2, -3, 0, 2, -2, 2],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay,
              delay,
              times: [0, 0.08, 0.32, 0.68, 0.92, 1],
            }}
          >
            {rtl ? (
              <>
                {planeIcon}
                {trail}
              </>
            ) : (
              <>
                {trail}
                {planeIcon}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
