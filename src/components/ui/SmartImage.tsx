import { useState, type CSSProperties } from 'react'
import { Plane } from 'lucide-react'
import { cn } from '../../lib/cn'

interface SmartImageProps {
  src?: string
  alt: string
  /** Classes for the wrapper (control aspect-ratio / rounding here). */
  className?: string
  /** Classes for the <img> itself. */
  imgClassName?: string
  /** Inline styles for the <img> (e.g. a per-photo object-position). */
  imgStyle?: CSSProperties
  /** Caption shown on the elegant fallback when the image is missing. */
  label?: string
  /** Loading strategy for the underlying image. */
  loading?: 'lazy' | 'eager'
  /** 'full' shows an icon + label on the fallback; 'bare' is gradient only
   *  (used behind text, e.g. the hero background). */
  placeholder?: 'full' | 'bare'
  /** How the image relates to its frame:
   *  'cover'     — the layout sizes the frame; the image crops to fill it.
   *  'fill'      — the layout sizes the frame; the image stretches to fill it
   *                (nothing is cropped away, the photo is gently squeezed).
   *  'natural-w' — the frame width is fixed; its height follows the image ratio.
   *  'natural-h' — the frame height is fixed; its width follows the image ratio. */
  fit?: 'cover' | 'fill' | 'natural-w' | 'natural-h'
}

/**
 * An <img> that degrades to a refined, on-brand placeholder when the source
 * is missing or fails to load — so the site looks intentional before the
 * couple adds their real photos.
 */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  imgStyle,
  label,
  loading = 'lazy',
  placeholder = 'full',
  fit = 'cover',
}: SmartImageProps) {
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !src || failed

  return (
    <div className={cn('relative overflow-hidden bg-ivory-deep', className)}>
      {showPlaceholder ? (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-sky-soft via-ivory to-ivory-deep',
            (fit === 'cover' || fit === 'fill') && 'absolute inset-0',
            // Natural frames have no layout-imposed size, so the fallback
            // provides its own pleasant aspect until a real photo arrives.
            fit === 'natural-w' && 'aspect-[4/3] w-full',
            fit === 'natural-h' && 'aspect-[4/3] h-full',
          )}
        >
          {placeholder === 'full' && (
            <>
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40"
                aria-hidden="true"
              >
                <Plane className="h-6 w-6 text-gold" strokeWidth={1.3} />
              </span>
              <span className="label-caps px-4 text-center text-[10px] text-navy-400">
                {label ?? alt}
              </span>
            </>
          )}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          style={imgStyle}
          className={cn(
            'block',
            fit === 'cover' && 'h-full w-full object-cover',
            fit === 'fill' && 'h-full w-full object-fill',
            fit === 'natural-w' && 'h-auto w-full',
            fit === 'natural-h' && 'h-full w-auto',
            imgClassName,
          )}
        />
      )}
    </div>
  )
}
