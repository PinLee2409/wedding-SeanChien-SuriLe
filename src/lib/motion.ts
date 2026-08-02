/** Shared Motion variants — consistent, soft, romantic. */

import type { Variants } from 'motion/react'

export const easeLux = [0.22, 1, 0.36, 1] as const

/**
 * Fade + rise + a touch of blur — the house reveal.
 *
 * `filter` is the one property here the compositor cannot hand to the GPU: it
 * repaints every frame, and a stagger fires a dozen of these at once. Keeping
 * the blur small buys most of the softness for a fraction of the work, and it
 * is dropped entirely once the element has arrived so nothing keeps a filter
 * layer alive afterwards.
 */
export const fadeUpBlur: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.988, filter: 'blur(2.5px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: easeLux,
      filter: { duration: 0.45, ease: 'easeOut' },
    },
  },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeLux } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: easeLux } },
}

/** Premium card entrance: fade + lift + slight scale/tilt. */
export const cardEntrance: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.975, filter: 'blur(2px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.86,
      ease: easeLux,
      filter: { duration: 0.4, ease: 'easeOut' },
    },
  },
}

/** Parent that reveals children one after another. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.085,
      delayChildren: 0.05,
      when: 'beforeChildren',
    },
  },
}

/** Standard "reveal on scroll" viewport config. */
export const viewportOnce = {
  once: true,
  amount: 0.16,
  margin: '0px 0px -6% 0px',
} as const
