import { useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'

interface RunwayLightsProps {
  count?: number
  className?: string
}

/** A row of runway-edge lights that pulse in a gentle sequence. */
export function RunwayLights({ count = 12, className }: RunwayLightsProps) {
  const reduce = useReducedMotion()
  const lightsRef = useRef<HTMLDivElement>(null)
  const inView = useInView(lightsRef, { amount: 'some' })

  return (
    <div
      ref={lightsRef}
      className={cn('flex items-center justify-center gap-2.5 text-gold', className)}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 w-1.5 rounded-full bg-current',
            reduce ? 'opacity-45' : 'animate-runway',
          )}
          style={{
            animationDelay: `${(i % 6) * 0.13}s`,
            animationPlayState: inView ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  )
}
