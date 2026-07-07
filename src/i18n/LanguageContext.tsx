import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang, Translation } from './translations'
import { LOCALES, getSavedLang, saveLang, translations } from './translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** The active dictionary — `t.gate.title`, `t.ui.close`, … */
  t: Translation
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Guest-facing language state (vi / en / tw). Persisted to localStorage and
 * mirrored onto <html lang> so screen readers and search engines follow along.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => getSavedLang())

  useEffect(() => {
    document.documentElement.lang = LOCALES[lang].toLowerCase()
    // Browser tab + share previews follow the language too.
    const { meta } = translations[lang]
    document.title = meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', meta.description)
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    saveLang(next)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>')
  return ctx
}
