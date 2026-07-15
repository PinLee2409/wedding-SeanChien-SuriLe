import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { Plane } from 'lucide-react'

/**
 * Signature "flight path" progress indicator pinned to the top of the page.
 * A champagne trail fills as the guest scrolls and a tiny plane rides its tip
 * — how far you've flown through the invitation. Spring-eased so the plane
 * glides. Hidden from screen readers; static under reduced motion.
 */
export function ScrollProgress() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })
  // Keep the plane inside the viewport at both ends of the flight.
  const planeX = useTransform(progress, (v) => `calc(${v * 100}vw - ${v * 30}px)`)

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* Champagne contrail */}
      <motion.div
        style={{ scaleX: reduce ? scrollYProgress : progress }}
        className="h-[3px] origin-left bg-gradient-to-r from-gold-light via-gold to-gold-dark shadow-[0_0_10px_var(--color-gold)]"
      />
      {/* The little plane riding the tip of the trail */}
      <motion.span
        style={{ x: planeX }}
        className="absolute -top-[7px] left-0 text-gold-dark drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
      >
        <Plane className="h-4 w-4 rotate-45" strokeWidth={2} fill="currentColor" />
      </motion.span>
    </div>
  )
}
