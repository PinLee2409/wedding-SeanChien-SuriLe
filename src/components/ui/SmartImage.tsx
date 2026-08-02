import { useState, type CSSProperties } from 'react'
import { Plane } from 'lucide-react'
import { cn } from '../../lib/cn'

interface SmartImageProps {
  src?: string
  /** Candidate renditions — see photoSrcSet(). Paired with `sizes`, this lets
   *  a phone fetch the small file instead of the desktop one. */
  srcSet?: string
  /** How wide this image is painted, per breakpoint, e.g. "(min-width: 640px) 30vw, 45vw". */
  sizes?: string
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
   *  'contain'   — the layout sizes the frame; the whole image fits inside it,
   *                letterboxing against the frame rather than cropping.
   *  'fill'      — the layout sizes the frame; the image stretches to fill it
   *                (nothing is cropped away, the photo is gently squeezed).
   *  'natural-w' — the frame width is fixed; its height follows the image ratio.
   *  'natural-h' — the frame height is fixed; its width follows the image ratio. */
  fit?: 'cover' | 'contain' | 'fill' | 'natural-w' | 'natural-h'
}

/**
 * An <img> that degrades to a refined, on-brand placeholder when the source
 * is missing or fails to load — so the site looks intentional before the
 * couple adds their real photos.
 */
export function SmartImage({
  src,
  srcSet,
  sizes,
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
  const [loaded, setLoaded] = useState(false)
  const showPlaceholder = !src || failed

  // Lazy images fade up as they arrive, so a long gallery settles instead of
  // popping. Eager images never fade: the boarding-pass export rasterises the
  // card synchronously and would otherwise capture one mid-fade.
  const fades = loading === 'lazy'

  return (
    <div className={cn('relative overflow-hidden bg-ivory-deep', className)}>
      {showPlaceholder ? (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-sky-soft via-ivory to-ivory-deep',
            (fit === 'cover' || fit === 'contain' || fit === 'fill') &&
              'absolute inset-0',
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
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          style={imgStyle}
          className={cn(
            'block',
            fit === 'cover' && 'h-full w-full object-cover',
            fit === 'contain' && 'h-full w-full object-contain',
            fit === 'fill' && 'h-full w-full object-fill',
            fit === 'natural-w' && 'h-auto w-full',
            fit === 'natural-h' && 'h-full w-auto',
            fades && 'transition-opacity duration-700 ease-out motion-reduce:transition-none',
            fades && !loaded && 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </div>
  )
}
