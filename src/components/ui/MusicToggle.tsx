import { useEffect, useId, useRef, useState, type Ref } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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
  onClick: () => void
  label: string
  describedBy?: string
  variant: 'floating' | 'inline'
  expanded?: boolean
  controls?: string
  buttonRef?: Ref<HTMLButtonElement>
}

function RecordButton({
  isPlaying,
  onClick,
  label,
  describedBy,
  variant,
  expanded,
  controls,
  buttonRef,
}: RecordButtonProps) {
  const reduce = useReducedMotion()

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-pressed={variant === 'inline' ? isPlaying : undefined}
      aria-expanded={variant === 'floating' ? expanded : undefined}
      aria-controls={variant === 'floating' ? controls : undefined}
      aria-label={label}
      aria-describedby={describedBy}
      title={label}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      whileHover={reduce ? undefined : { scale: 1.05 }}
      className={cn(
        'group relative grid shrink-0 place-items-center rounded-full border text-navy transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2',
        variant === 'floating'
          ? 'h-13 w-13 border-gold/50 bg-white/80 shadow-[0_12px_28px_-14px_rgba(27,42,74,0.65)] backdrop-blur-md'
          : 'h-11 w-11 border-navy/20 bg-white/60 shadow-sm backdrop-blur-md',
        variant === 'floating' &&
          expanded &&
          'border-gold bg-white shadow-[0_14px_34px_-14px_rgba(200,164,92,0.75)]',
      )}
    >
      <span
        className={cn(
          'relative grid place-items-center rounded-full transition-opacity duration-500',
          variant === 'floating' ? 'h-8 w-8' : 'h-[26px] w-[26px]',
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
 * The hero uses a compact play/pause record. The floating record acts as a
 * disclosure: its full player opens smoothly to the left and closes back to a
 * single vinyl disc, without changing playback by surprise.
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
  const panelId = useId()
  const trackId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const recordRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const playLabel = isPlaying ? t.ui.musicOff : t.ui.musicOn
  const muteLabel = muted ? t.ui.musicUnmute : t.ui.musicMute
  const volumePercent = Math.round(volume * 100)
  const fullTrackName = [trackArtist, trackTitle].filter(Boolean).join(' — ')

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && !wrapperRef.current?.contains(target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      recordRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (variant === 'inline' || !onToggleMute || !onVolumeChange) {
    return (
      <div className={className}>
        <RecordButton
          isPlaying={isPlaying}
          onClick={onToggle}
          label={playLabel}
          variant="inline"
        />
      </div>
    )
  }

  return (
    <div
      ref={wrapperRef}
      className={cn('relative flex items-center justify-end gap-2', className)}
    >
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="group"
            aria-label={t.ui.music}
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, x: 14, scale: 0.95 }
            }
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, x: 10, scale: 0.96 }
            }
            transition={
              reduce
                ? { duration: 0.1 }
                : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
            }
            style={{ transformOrigin: 'right center' }}
            className="glass grid min-h-14 w-[min(16rem,calc(100vw-6rem))] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-[1.35rem] border border-gold/45 p-1.5 shadow-[0_16px_38px_-18px_rgba(27,42,74,0.55)]"
          >
            <button
              type="button"
              onClick={onToggle}
              aria-pressed={isPlaying}
              aria-label={playLabel}
              title={playLabel}
              className="grid h-11 w-11 place-items-center rounded-full border border-gold/35 bg-white/70 text-navy transition hover:border-gold hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" strokeWidth={1.7} />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-current" strokeWidth={1.7} />
              )}
            </button>

            <div className="min-w-0 px-0.5 text-left">
              <p className="label-caps text-[7px] leading-none text-gold-dark">
                {t.ui.musicNowPlaying}
              </p>
              <p
                id={trackId}
                aria-live="polite"
                className="mt-1 truncate text-[10px] font-semibold leading-tight text-navy"
                title={fullTrackName}
              >
                {fullTrackName || t.ui.music}
              </p>
              <label
                className="mt-1.5 flex items-center gap-1.5"
                title={t.ui.musicVolume}
              >
                <span className="sr-only">{t.ui.musicVolume}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(event) =>
                    onVolumeChange(Number(event.target.value))
                  }
                  aria-label={t.ui.musicVolume}
                  aria-valuetext={`${volumePercent}%`}
                  className="h-1.5 min-w-0 flex-1 cursor-pointer accent-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2"
                />
                <span className="w-7 text-right font-mono text-[8px] text-navy-500">
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
              className="grid h-11 w-11 place-items-center rounded-full border border-gold/35 bg-white/70 text-navy transition hover:border-gold hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2"
            >
              {muted ? (
                <VolumeX className="h-4.5 w-4.5" strokeWidth={1.7} />
              ) : (
                <Volume2 className="h-4.5 w-4.5" strokeWidth={1.7} />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <RecordButton
        isPlaying={isPlaying}
        onClick={() => setIsOpen((open) => !open)}
        label={t.ui.music}
        describedBy={isOpen ? trackId : undefined}
        variant="floating"
        expanded={isOpen}
        controls={panelId}
        buttonRef={recordRef}
      />
    </div>
  )
}
