import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Plane, Ticket } from 'lucide-react'
import { cn } from '../../lib/cn'
import { MAX_GUEST_NAME_LENGTH } from '../../lib/guest'
import { useI18n } from '../../i18n/LanguageContext'

interface GuestNameGateProps {
  open: boolean
  onSubmit: (name: string) => void
  onSkip: () => void
}

/**
 * Elegant modal shown on every page load. Lets the visitor type
 * their name to "unlock" the personalised invitation.
 */
export function GuestNameGate({ open, onSubmit, onSkip }: GuestNameGateProps) {
  const { t } = useI18n()
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
          {/* Dark elegant backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-navy/75 backdrop-blur-md"
            onClick={onSkip}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Floating ambient sparkles behind the card. CSS-animated on
              purpose: infinite Motion loops inside an AnimatePresence subtree
              block exit completion, so the dialog would never unmount. */}
          <span className="animate-twinkle absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-gold/40" />
          <span
            className="animate-twinkle absolute right-1/4 top-1/3 h-1.5 w-1.5 rounded-full bg-gold-light/50"
            style={{ animationDelay: '0.8s', animationDuration: '3.5s' }}
          />
          <span
            className="animate-twinkle absolute bottom-1/3 left-1/3 h-1 w-1 rounded-full bg-gold/30"
            style={{ animationDelay: '1.5s', animationDuration: '5s' }}
          />

          {/* Card */}
          <motion.form
            onSubmit={handleSubmit}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-gold/30 bg-warm-white shadow-2xl"
            style={{ boxShadow: '0 25px 60px -15px rgba(27, 42, 74, 0.4), 0 0 40px rgba(200, 164, 92, 0.1)' }}
            initial={{ opacity: 0, y: 40, scale: 0.92, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            {/* Ticket header strip with subtle gradient */}
            <motion.div
              className="flex items-center justify-between bg-gradient-to-r from-ivory-deep via-cream to-ivory-deep px-6 py-3 text-navy border-b border-gold/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <span className="label-caps text-[10px] text-navy-400 font-medium">
                Boarding Pass
              </span>
              <span className="animate-float inline-flex" style={{ animationDuration: '3s' }}>
                <Plane className="h-4 w-4 rotate-45 text-gold" strokeWidth={1.5} />
              </span>
            </motion.div>

            <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
              {/* Icon with glow ring animation */}
              <motion.span
                className="grid h-16 w-16 place-items-center rounded-full border-2 border-gold/30 text-gold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 200 }}
                style={{ boxShadow: '0 0 20px rgba(200, 164, 92, 0.15)' }}
              >
                <span className="animate-float inline-flex" style={{ animationDuration: '4s' }}>
                  <Ticket className="h-7 w-7" strokeWidth={1.4} />
                </span>
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
