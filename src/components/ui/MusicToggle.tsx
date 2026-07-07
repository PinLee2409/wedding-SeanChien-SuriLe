import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'
import { useI18n } from '../../i18n/LanguageContext'

interface MusicToggleProps {
  isPlaying: boolean
  onToggle: () => void
  className?: string
  variant?: 'floating' | 'inline'
}

/**
 * Music button styled as a spinning vinyl record. The record turns while the
 * song plays and freezes — holding its current angle — when paused. A tiny
 * equalizer badge reinforces the playing state. Never autoplays; toggles on tap.
 */
export function MusicToggle({
  isPlaying,
  onToggle,
  className,
  variant = 'floating',
}: MusicToggleProps) {
  const reduce = useReducedMotion()
  const { t } = useI18n()
  const label = isPlaying ? t.ui.musicOff : t.ui.musicOn

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={isPlaying}
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.06 }}
      className={cn(
        'group relative grid place-items-center rounded-full border text-navy transition-colors',
        variant === 'floating'
          ? 'h-12 w-12 border-gold/50 glass shadow-lg'
          : 'h-11 w-11 border-navy/20 bg-white/60 backdrop-blur-md shadow-sm',
        className,
      )}
    >
      {/* Vinyl record — grooves drawn as concentric radial rings; spins only
          while playing and freezes at its current angle when paused. */}
      <span
        className={cn(
          'relative grid place-items-center rounded-full transition-[opacity] duration-500',
          variant === 'floating' ? 'h-7 w-7' : 'h-[26px] w-[26px]',
          !reduce && 'animate-spin-disc',
          !isPlaying && 'opacity-80',
        )}
        style={{
          animationPlayState: isPlaying ? 'running' : 'paused',
          background:
            'radial-gradient(circle at 50% 50%, var(--color-gold-light) 0 12%, var(--color-navy) 13% 26%, var(--color-navy-600) 27% 40%, var(--color-navy) 41% 55%, var(--color-navy-600) 56% 100%)',
          boxShadow: 'inset 0 0 3px rgba(0,0,0,0.35)',
        }}
      >
        {/* Center label + spindle hole */}
        <span className="grid h-2.5 w-2.5 place-items-center rounded-full bg-gold ring-1 ring-navy/30">
          <span className="h-[3px] w-[3px] rounded-full bg-navy/70" />
        </span>
        {/* A glossy glint that turns with the record. */}
        <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/25 to-transparent" />
      </span>

      {/* Equalizer badge — dances only while the song is playing. */}
      {isPlaying && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-end justify-center gap-[1.5px] rounded-full border border-gold/40 bg-warm-white/90 pb-[3px] shadow-sm"
          aria-hidden="true"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                'w-[2px] origin-bottom rounded-full bg-gold-dark',
                !reduce && 'animate-equalize',
              )}
              style={{ height: '7px', animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
      )}

      {/* Soft pulsing ring while playing. */}
      {isPlaying && (
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-gold/40" />
      )}
    </motion.button>
  )
}
