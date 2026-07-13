import { useId } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'
import { useI18n } from '../../i18n/LanguageContext'

interface MusicToggleProps {
  isPlaying: boolean
  onToggle: () => void
  className?: string
  variant?: 'floating' | 'inline'
  muted?: boolean
  volume?: number
  trackTitle?: string
  trackArtist?: string
  onToggleMute?: () => void
  onVolumeChange?: (volume: number) => void
}

interface RecordButtonProps {
  isPlaying: boolean
  onToggle: () => void
  label: string
  describedBy?: string
  variant: 'floating' | 'inline'
}

function RecordButton({
  isPlaying,
  onToggle,
  label,
  describedBy,
  variant,
}: RecordButtonProps) {
  const reduce = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={isPlaying}
      aria-label={label}
      aria-describedby={describedBy}
      title={label}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      whileHover={reduce ? undefined : { scale: 1.05 }}
      className={cn(
        'group relative grid shrink-0 place-items-center rounded-full border text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2',
        variant === 'floating'
          ? 'h-12 w-12 border-gold/50 bg-white/75 shadow-md'
          : 'h-11 w-11 border-navy/20 bg-white/60 shadow-sm backdrop-blur-md',
      )}
    >
      <span
        className={cn(
          'relative grid place-items-center rounded-full transition-opacity duration-500',
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
        <span className="grid h-2.5 w-2.5 place-items-center rounded-full bg-gold ring-1 ring-navy/30">
          <span className="h-[3px] w-[3px] rounded-full bg-navy/70" />
        </span>
        <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/25 to-transparent" />
      </span>

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

      {isPlaying && !reduce && (
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-gold/40" />
      )}
    </motion.button>
  )
}

/**
 * The inline variant is a compact vinyl play/pause button. The floating
 * variant becomes a complete music console with the current track, mute and a
 * touch-friendly volume slider.
 */
export function MusicToggle({
  isPlaying,
  onToggle,
  className,
  variant = 'floating',
  muted = false,
  volume = 0.55,
  trackTitle,
  trackArtist,
  onToggleMute,
  onVolumeChange,
}: MusicToggleProps) {
  const reduce = useReducedMotion()
  const { t } = useI18n()
  const trackId = useId()
  const playLabel = isPlaying ? t.ui.musicOff : t.ui.musicOn
  const muteLabel = muted ? t.ui.musicUnmute : t.ui.musicMute
  const volumePercent = Math.round(volume * 100)
  const fullTrackName = [trackArtist, trackTitle].filter(Boolean).join(' — ')

  if (variant === 'inline' || !onToggleMute || !onVolumeChange) {
    return (
      <div className={className}>
        <RecordButton
          isPlaying={isPlaying}
          onToggle={onToggle}
          label={playLabel}
          variant="inline"
        />
      </div>
    )
  }

  return (
    <motion.div
      role="group"
      aria-label={t.ui.music}
      initial={reduce ? false : { opacity: 0, x: 18, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'glass grid w-[19rem] max-w-[calc(100vw-2.5rem)] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-[1.35rem] border border-gold/45 p-2 shadow-[0_16px_38px_-18px_rgba(27,42,74,0.55)]',
        className,
      )}
    >
      <RecordButton
        isPlaying={isPlaying}
        onToggle={onToggle}
        label={playLabel}
        describedBy={trackId}
        variant="floating"
      />

      <div className="min-w-0 px-1 text-left">
        <p className="label-caps text-[8px] leading-none text-gold-dark">
          {t.ui.musicNowPlaying}
        </p>
        <p
          id={trackId}
          aria-live="polite"
          className="mt-1 truncate text-[11px] font-semibold leading-tight text-navy"
          title={fullTrackName}
        >
          {fullTrackName || t.ui.music}
        </p>
        <label className="mt-2 flex items-center gap-2" title={t.ui.musicVolume}>
          <span className="sr-only">{t.ui.musicVolume}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            aria-label={t.ui.musicVolume}
            aria-valuetext={`${volumePercent}%`}
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2"
          />
          <span className="w-7 text-right font-mono text-[9px] text-navy-500">
            {volumePercent}%
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={onToggleMute}
        aria-pressed={muted}
        aria-label={muteLabel}
        title={muteLabel}
        className="grid h-11 w-11 place-items-center rounded-full border border-gold/35 bg-white/65 text-navy transition hover:border-gold hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2"
      >
        {muted ? (
          <VolumeX className="h-4.5 w-4.5" strokeWidth={1.7} />
        ) : (
          <Volume2 className="h-4.5 w-4.5" strokeWidth={1.7} />
        )}
      </button>
    </motion.div>
  )
}
