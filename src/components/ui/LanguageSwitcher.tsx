import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Languages } from 'lucide-react'
import type { Lang } from '../../i18n/translations'
import { translations } from '../../i18n/translations'
import { useI18n } from '../../i18n/LanguageContext'
import { cn } from '../../lib/cn'

const LANG_ORDER: Lang[] = ['vi', 'en', 'tw']

/** Short badge shown on the floating button. */
const BADGE: Record<Lang, string> = { vi: 'VI', en: 'EN', tw: '繁' }

/**
 * Floating language switcher: a globe button opening a compact glass menu of
 * the three supported languages. Same interaction pattern as the ThemePicker.
 */
export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

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
            aria-label={t.ui.chooseLang}
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-14 right-0 w-44 origin-bottom-right rounded-2xl border border-gold/30 glass p-2 shadow-2xl"
          >
            {LANG_ORDER.map((code) => {
              const active = code === lang
              return (
                <button
                  key={code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setLang(code)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                    active
                      ? 'bg-white/70 font-semibold text-navy'
                      : 'text-navy-500 hover:bg-white/50 hover:text-navy',
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 text-center font-mono text-[11px] text-gold-dark">
                      {BADGE[code]}
                    </span>
                    {translations[code].langName}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 shrink-0 text-gold-dark" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.ui.chooseLang}
        aria-expanded={open}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="relative grid h-12 w-12 place-items-center rounded-full border border-gold/50 glass text-navy shadow-lg"
      >
        <Languages className="h-5 w-5" strokeWidth={1.7} />
        <span className="absolute -bottom-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full border border-gold/40 bg-warm-white px-0.5 font-mono text-[8px] font-bold text-gold-dark shadow-sm">
          {BADGE[lang]}
        </span>
      </motion.button>
    </div>
  )
}
