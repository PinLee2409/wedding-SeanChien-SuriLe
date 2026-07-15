import { useCountdown } from '../../hooks/useCountdown'
import { cn } from '../../lib/cn'
import { useI18n } from '../../i18n/LanguageContext'

interface CountdownProps {
  iso: string
  tone?: 'navy' | 'light'
  className?: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Live countdown display with four elegant tiles. */
export function Countdown({ iso, tone = 'navy', className }: CountdownProps) {
  const { t } = useI18n()
  const { days, hours, minutes, seconds, isPast } = useCountdown(iso)

  if (isPast) {
    return (
      <p
        className={cn(
          'font-display text-xl',
          tone === 'light' ? 'text-warm-white' : 'text-navy',
          className,
        )}
      >
        {t.countdown.departed}
      </p>
    )
  }

  const units: Array<[string, string]> = [
    [String(days), t.countdown.days],
    [pad(hours), t.countdown.hours],
    [pad(minutes), t.countdown.minutes],
    [pad(seconds), t.countdown.seconds],
  ]

  const tileClass =
    tone === 'light'
      ? 'border-warm-white/25 bg-white/10 text-warm-white backdrop-blur-sm'
      : 'border-gold/30 bg-warm-white text-navy shadow-sm'
  const labelClass = tone === 'light' ? 'text-sky-soft' : 'text-navy-400'

  return (
    <div className={cn('flex items-stretch gap-2.5 sm:gap-3.5', className)}>
      {units.map(([value, label]) => (
        <div
          key={label}
          className={cn(
            'flex min-w-[62px] flex-col items-center rounded-xl border px-2 py-2.5 sm:min-w-[74px] sm:py-3',
            tileClass,
          )}
        >
          <span className="font-display text-[2rem] font-medium leading-none tracking-[0.035em] tabular-nums sm:text-[2.35rem]">
            {value}
          </span>
          <span className={cn('label-caps mt-1 text-[9px]', labelClass)}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
