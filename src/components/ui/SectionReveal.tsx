import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'
import { fadeUpBlur, staggerContainer, viewportOnce } from '../../lib/motion'

type Tag = 'div' | 'ul' | 'ol' | 'section'

/** Orchestrating container: reveals its <RevealItem> children with a stagger. */
export function SectionReveal({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: Tag
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as]
  return (
    <MotionTag
      className={cn(className)}
      variants={staggerContainer}
      initial={reduce ? 'visible' : 'hidden'}
      whileInView={reduce ? undefined : 'visible'}
      viewport={viewportOnce}
    >
      {children}
    </MotionTag>
  )
}

/** A single staggered child. Must live inside <SectionReveal>. */
export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li'
}) {
  const MotionTag = motion[as]
  return (
    <MotionTag className={cn(className)} variants={fadeUpBlur}>
      {children}
    </MotionTag>
  )
}
