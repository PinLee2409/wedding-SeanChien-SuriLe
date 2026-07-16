import { Plane } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'
import { easeLux } from '../../lib/motion'

/** A dashed flight-route line with endpoint dots and a plane — used between sections. */
export function RouteDivider({ className }: { className?: string }) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      aria-hidden="true"
    >
      <div className="relative mx-auto w-full max-w-md px-5 py-2 sm:py-3">
        <svg
          viewBox="0 0 400 44"
          className="block h-auto w-full text-gold/70"
          focusable="false"
        >
          <motion.circle
            cx="8"
            cy="30"
            r="4"
            fill="currentColor"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.65 }}
            transition={{ duration: 0.35 }}
          />
          <motion.circle
            cx="8"
            cy="30"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 0.5 }}
            viewport={{ once: true, amount: 0.65 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          />
          <motion.path
            d="M12 30 Q 200 -4 388 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 7"
            strokeLinecap="round"
            initial={reduce ? false : { opacity: 0.2, strokeDashoffset: 44 }}
            whileInView={reduce ? undefined : { opacity: 1, strokeDashoffset: 0 }}
            viewport={{ once: true, amount: 0.65 }}
            transition={{ duration: 1.55, ease: easeLux }}
          />
          <motion.circle
            cx="392"
            cy="30"
            r="4"
            fill="currentColor"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.65 }}
            transition={{ duration: 0.35, delay: 1.05 }}
          />
          <motion.circle
            cx="392"
            cy="30"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 0.5 }}
            viewport={{ once: true, amount: 0.65 }}
            transition={{ duration: 0.45, delay: 1.15 }}
          />
        </svg>

        <motion.span
          className="absolute text-gold"
          style={{ marginLeft: -10, marginTop: -10 }}
          initial={
            reduce
              ? { left: '50%', top: '26%' }
              : { left: '3%', top: '68%', opacity: 0, scale: 0.72 }
          }
          whileInView={
            reduce
              ? undefined
              : {
                  left: ['3%', '50%', '97%'],
                  top: ['68%', '20%', '68%'],
                  opacity: [0, 1, 0.7],
                  scale: [0.72, 1, 0.86],
                }
          }
          viewport={{ once: true, amount: 0.65 }}
          transition={{
            duration: 1.65,
            ease: easeLux,
            delay: 0.12,
            times: [0, 0.5, 1],
          }}
        >
          <Plane className="h-5 w-5 rotate-45" strokeWidth={1.5} />
        </motion.span>
      </div>
    </div>
  )
}
