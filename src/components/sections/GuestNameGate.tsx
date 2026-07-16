import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Plane, Ticket } from 'lucide-react'
import { cn } from '../../lib/cn'
import { pickGalleryPhotos } from '../../lib/galleryPhotos'
import { MAX_GUEST_NAME_LENGTH } from '../../lib/guest'
import { useI18n } from '../../i18n/LanguageContext'
import { SmartImage } from '../ui/SmartImage'

const [GATE_PHOTO] = pickGalleryPhotos(['cuoi2_dsc09678.jpg'])

interface GuestNameGateProps {
  open: boolean
  flightCode: string
  onSubmit: (name: string) => void
  onSkip: () => void
}

/**
 * Elegant modal shown on every page load. Lets the visitor type
 * their name to "unlock" the personalised invitation.
 */
export function GuestNameGate({
  open,
  flightCode,
  onSubmit,
  onSkip,
}: GuestNameGateProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Autofocus the field and lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // preventScroll: focusing must never scroll the page behind the overlay.
    const focusTimer = window.setTimeout(
      () => inputRef.current?.focus({ preventScroll: true }),
      400,
    )

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = original
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onSkip])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    // Stays mounted; open/close is a CSS fade + `inert`. (AnimatePresence
    // unmounting proved unreliable here — an exited-but-not-removed overlay
    // silently swallows every click on the page.)
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-5 transition-[opacity,visibility] duration-500 ease-out',
        open ? 'opacity-100' : 'invisible opacity-0',
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      aria-hidden={!open}
      inert={open ? undefined : true}
    >
          {/* The first glimpse of the journey sits behind the boarding call. */}
          <motion.div
            className="absolute inset-0 overflow-hidden bg-navy"
            onClick={onSkip}
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.7 }}
          >
            {GATE_PHOTO && (
              <motion.div
                className="absolute inset-0"
                animate={
                  reduce || !open
                    ? { scale: 1.03 }
                    : { scale: [1.08, 1.03], x: [8, 0] }
                }
                transition={{ duration: 8, ease: [0.22, 1, 0.36, 1] }}
              >
                <SmartImage
                  src={GATE_PHOTO.display}
                  alt=""
                  loading="eager"
                  fit="cover"
                  placeholder="bare"
                  className="h-full w-full"
                  imgClassName="object-[54%_58%]"
                />
              </motion.div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-navy/78 via-navy/70 to-navy/92" />
            <div className="absolute inset-0 backdrop-blur-[2px]" />
          </motion.div>

          <div
            className={cn(
              'pointer-events-none absolute left-1/2 top-1/2 h-[min(82vw,46rem)] w-[min(82vw,46rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-gold/25',
              open && !reduce && 'animate-gentle-rotate',
            )}
            aria-hidden="true"
          >
            <Plane className="absolute left-1/2 top-[-0.7rem] h-6 w-6 -translate-x-1/2 rotate-45 text-gold" strokeWidth={1.4} />
          </div>

          {/* Floating ambient sparkles behind the card. CSS-animated on
              purpose: infinite Motion loops inside an AnimatePresence subtree
              block exit completion, so the dialog would never unmount. */}
          {open && !reduce && (
            <>
              <span className="animate-twinkle absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-gold/40" />
              <span
                className="animate-twinkle absolute right-1/4 top-1/3 h-1.5 w-1.5 rounded-full bg-gold-light/50"
                style={{ animationDelay: '0.8s', animationDuration: '3.5s' }}
              />
              <span
                className="animate-twinkle absolute bottom-1/3 left-1/3 h-1 w-1 rounded-full bg-gold/30"
                style={{ animationDelay: '1.5s', animationDuration: '5s' }}
              />
            </>
          )}

          {/* Card */}
          <motion.form
            onSubmit={handleSubmit}
            className="paper-grain relative w-full max-w-md overflow-hidden rounded-[2rem] border border-gold/45 bg-warm-white/95 shadow-2xl backdrop-blur-xl"
            style={{ boxShadow: '0 34px 85px -24px rgba(6, 15, 34, 0.78), 0 0 55px rgba(200, 164, 92, 0.15)' }}
            initial={reduce ? false : { opacity: 0, y: 44, scale: 0.9, rotateX: 9 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{ duration: reduce ? 0 : 0.75, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.12 }}
          >
            <span className="absolute left-0 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy" aria-hidden="true" />
            <span className="absolute right-0 top-1/2 h-7 w-7 translate-x-1/2 -translate-y-1/2 rounded-full bg-navy" aria-hidden="true" />
            {/* Ticket header strip with subtle gradient */}
            <motion.div
              className="flex items-center justify-between border-b border-gold/30 bg-gradient-to-r from-navy via-navy-700 to-navy px-6 py-4 text-warm-white"
              initial={reduce ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <span className="label-caps text-[10px] font-medium text-gold-light">
                First Class Love
              </span>
              <span className="font-mono text-[10px] tracking-[0.22em] text-gold-light">
                LOVE · {flightCode}
              </span>
            </motion.div>

            <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
              {/* Icon with glow ring animation */}
              <motion.span
                className="relative grid h-20 w-20 place-items-center rounded-full border border-gold/45 bg-gradient-to-br from-ivory to-gold-light/25 text-gold-dark shadow-[0_0_28px_rgba(200,164,92,0.2)]"
                initial={reduce ? false : { opacity: 0, scale: 0.5, rotate: -18 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <Ticket className="h-8 w-8" strokeWidth={1.35} />
                <span className="absolute -bottom-2 rounded-full border border-gold/30 bg-warm-white px-2 py-0.5 font-mono text-[8px] tracking-[0.2em] text-navy">VIP</span>
              </motion.span>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h2
                  id="gate-title"
                  className="font-display text-2xl text-navy font-semibold"
                >
                  {t.gate.title}
                </h2>
                <p className="mt-1.5 text-sm text-navy-400">{t.gate.subtitle}</p>
              </motion.div>

              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label htmlFor="guest-name" className="sr-only">
                  {t.gate.subtitle}
                </label>
                <input
                  id="guest-name"
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  maxLength={MAX_GUEST_NAME_LENGTH}
                  placeholder={t.gate.placeholder}
                  autoComplete="name"
                  className="w-full rounded-xl border border-navy/10 bg-ivory px-4 py-3.5 text-center text-navy outline-none transition-all duration-300 focus:border-gold focus:ring-2 focus:ring-gold/25 focus:shadow-[0_0_16px_rgba(200,164,92,0.12)]"
                />
              </motion.div>

              <motion.div
                className="w-full flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <button
                  type="submit"
                  disabled={!value.trim()}
                  className="btn btn-primary w-full"
                >
                  {t.gate.submit}
                  <Plane className="h-4 w-4 rotate-45" strokeWidth={1.6} />
                </button>

                <button
                  type="button"
                  onClick={onSkip}
                  className="text-xs text-navy-400 underline-offset-4 transition-all duration-300 hover:text-gold-dark hover:underline"
                >
                  {t.gate.skip}
                </button>
              </motion.div>
            </div>
          </motion.form>
    </div>
  )
}
