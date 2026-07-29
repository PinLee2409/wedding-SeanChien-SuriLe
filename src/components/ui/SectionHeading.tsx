import { Plane } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'
import { easeLux } from '../../lib/motion'

interface SectionHeadingProps {
  kicker?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  tone?: 'navy' | 'light'
}

/** Reusable section header: gold kicker, serif title, plane hairline divider. */
export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = 'center',
  tone = 'navy',
}: SectionHeadingProps) {
  const isCenter = align === 'center'
  const reduce = useReducedMotion()
  const lineInitial = reduce ? false : { opacity: 0, scaleX: 0 }
  const lineVisible = { opacity: 1, scaleX: 1 }

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        isCenter ? 'items-center text-center' : 'items-start text-left',
      )}
    >
      {kicker && (
        <span className="label-caps text-gold-shimmer text-[clamp(0.6rem,2.4vw,0.72rem)]">
          {kicker}
        </span>
      )}
      <h2
        className={cn(
          'text-section text-balance',
          tone === 'light' ? 'text-warm-white' : 'text-navy',
        )}
      >
        {title}
      </h2>

      <div
        className={cn(
          'mt-1 flex items-center gap-2 text-gold',
          isCenter ? 'justify-center' : 'justify-start',
        )}
        aria-hidden="true"
      >
        <motion.span
          className="h-px w-10 origin-right bg-gradient-to-r from-transparent to-gold"
          initial={lineInitial}
          whileInView={lineVisible}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.65, ease: easeLux }}
        />
        <motion.span
          className={cn('inline-flex', reduce && '-rotate-12')}
          initial={reduce ? false : { opacity: 0, rotate: -32, scale: 0.55 }}
          whileInView={
            reduce ? undefined : { opacity: 1, rotate: -12, scale: 1 }
          }
          viewport={{ once: true, amount: 0.8 }}
          transition={
            reduce
              ? undefined
              : {
                  type: 'spring',
                  stiffness: 180,
                  damping: 15,
                  delay: 0.2,
                }
          }
        >
          <Plane className="h-3.5 w-3.5" strokeWidth={1.5} />
        </motion.span>
        <motion.span
          className="h-px w-10 origin-left bg-gradient-to-l from-transparent to-gold"
          initial={lineInitial}
          whileInView={lineVisible}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.65, ease: easeLux }}
        />
      </div>

      {subtitle && (
        <p
          className={cn(
            'max-w-xl text-balance text-sm leading-relaxed sm:text-base',
            tone === 'light' ? 'text-sky-soft' : 'text-navy-400',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
