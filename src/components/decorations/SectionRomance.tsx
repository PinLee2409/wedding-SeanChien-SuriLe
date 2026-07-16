import { cn } from '../../lib/cn'
import { FloatingHearts } from './FloatingHearts'
import { FlyingPlane } from './FlyingPlane'

interface SectionRomanceProps {
  className?: string
  direction?: 'ltr' | 'rtl'
  planeTop?: string
  /** Keep some sections calmer while sharing the same flight motif. */
  showHearts?: boolean
}

/**
 * A restrained ambient layer for the quieter sections between photo moments.
 * It deliberately sits below section content, ignores pointer input and relies
 * on the shared decorations' reduced-motion fallbacks.
 */
export function SectionRomance({
  className,
  direction = 'ltr',
  planeTop = '18%',
  showHearts = true,
}: SectionRomanceProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-0 overflow-hidden',
        className,
      )}
      aria-hidden="true"
    >
      {showHearts && (
        <FloatingHearts
          count={6}
          className="z-0 opacity-[0.14] [mask-image:linear-gradient(to_top,black_0%,black_58%,transparent_100%)] sm:opacity-[0.18]"
        />
      )}

      <FlyingPlane
        className="opacity-30 sm:opacity-40"
        top={planeTop}
        size={20}
        duration={22}
        delay={direction === 'ltr' ? -4 : -11}
        repeatDelay={10}
        direction={direction}
        tone="text-gold-dark"
        trailWidth="w-20 sm:w-28"
      />
    </div>
  )
}
