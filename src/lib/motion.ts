/** Shared Motion variants — consistent, soft, romantic. */

import type { Variants } from 'motion/react'

export const easeLux = [0.22, 1, 0.36, 1] as const

/** Fade + rise + subtle blur — the house reveal. */
export const fadeUpBlur: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.988, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.84, ease: easeLux },
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
  hidden: { opacity: 0, y: 22, scale: 0.975, filter: 'blur(3px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.88, ease: easeLux },
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
