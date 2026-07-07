import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Palette, Shuffle, X } from 'lucide-react'
import type { Theme } from '../../config/themes'
import { cn } from '../../lib/cn'
import { useI18n } from '../../i18n/LanguageContext'

interface ThemePickerProps {
  themes: Theme[]
  activeId: string
  onSelect: (id: string) => void
}

/**
 * Floating colour-scheme switcher. A palette button opens a glass panel of
 * palettes; picking one re-themes the whole invitation instantly. The panel
 * scrolls when there are many palettes, and each card previews its mood.
 */
export function ThemePicker({ themes, activeId, onSelect }: ThemePickerProps) {
  const { t: tr } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Bring the active palette into view when the panel opens.
  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(
      () => activeRef.current?.scrollIntoView({ block: 'nearest' }),
      50,
    )
    return () => window.clearTimeout(timer)
  }, [open])

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={tr.ui.chooseTheme}
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-14 right-0 w-[19rem] origin-bottom-right rounded-3xl border border-gold/30 glass p-3 shadow-2xl"
          >
            <div className="mb-2.5 flex items-center justify-between px-1.5">
              <span className="flex items-center gap-2">
                <span className="text-gold-shimmer label-caps text-[11px]">
                  {tr.ui.themes}
                </span>
                <span className="rounded-full bg-gold/15 px-1.5 py-px text-[9px] font-semibold text-gold-dark">
                  {themes.length}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    // Jump to a random palette that isn't the current one.
                    const rest = themes.filter((t) => t.id !== activeId)
                    const pick = rest[Math.floor(Math.random() * rest.length)]
                    if (pick) onSelect(pick.id)
                  }}
                  aria-label={tr.ui.random}
                  title={tr.ui.random}
                  className="grid h-6 w-6 place-items-center rounded-full text-navy-400 transition-colors hover:bg-gold/15 hover:text-gold-dark"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={tr.ui.close}
                  className="grid h-6 w-6 place-items-center rounded-full text-navy-400 transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>

            <div className="slim-scroll grid max-h-[58vh] grid-cols-2 gap-2 overflow-y-auto pr-1">
              {themes.map((t) => {
                const active = t.id === activeId
                const [dark, accent, light] = t.swatch
                // Palette names follow the active language (vi falls back to
                // the canonical labels in config/themes.ts).
                const name = tr.themeNames[t.id] ?? { label: t.label, note: t.note }
                return (
                  <motion.button
                    key={t.id}
                    ref={active ? activeRef : undefined}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => onSelect(t.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'group relative flex flex-col items-stretch gap-2 rounded-2xl border p-2.5 text-left transition-colors',
                      active
                        ? 'border-gold bg-white/75 shadow-md ring-1 ring-gold/40'
                        : 'border-navy/10 bg-white/40 hover:border-gold/50 hover:bg-white/65',
                    )}
                  >
                    {/* Mood preview: a three-band gradient of the palette. */}
                    <span
                      className="relative h-8 w-full overflow-hidden rounded-xl ring-1 ring-black/5"
                      style={{
                        background: `linear-gradient(115deg, ${dark} 0 40%, ${accent} 40% 70%, ${light} 70% 100%)`,
                      }}
                    >
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-white/15" />
                      {active && (
                        <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-white/90 shadow-sm">
                          <Check className="h-3 w-3 text-gold-dark" />
                        </span>
                      )}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold leading-tight text-navy">
                        {name.label}
                      </span>
                      <span className="text-[9px] leading-tight text-navy-400">
                        {name.note}
                      </span>
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={tr.ui.chooseTheme}
        aria-expanded={open}
        whileHover={{ scale: 1.05, rotate: 8 }}
        whileTap={{ scale: 0.92 }}
        className={cn(
          'grid h-12 w-12 place-items-center rounded-full border border-gold/50 glass text-navy shadow-lg',
          !open && 'animate-pulse-glow',
        )}
      >
        <Palette className="h-5 w-5" strokeWidth={1.7} />
      </motion.button>
    </div>
  )
}
