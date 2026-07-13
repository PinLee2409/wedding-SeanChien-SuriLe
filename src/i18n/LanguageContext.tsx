/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang, Translation } from './translations'
import { LOCALES, getSavedLang, saveLang, translations } from './translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  enabledLanguages: readonly Lang[]
  /** The active dictionary — `t.gate.title`, `t.ui.close`, … */
  t: Translation
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Guest-facing language state (vi / en / tw). Persisted to localStorage and
 * mirrored onto <html lang> so screen readers and search engines follow along.
 */
export function LanguageProvider({
  children,
  enabledLanguages,
  defaultLanguage,
}: {
  children: ReactNode
  enabledLanguages: readonly Lang[]
  defaultLanguage: Lang
}) {
  const [lang, setLangState] = useState<Lang>(() =>
    getSavedLang(enabledLanguages, defaultLanguage),
  )

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

    // QR links pin their original language in the URL. Keep that value in
    // sync so a later reload does not undo the guest's language choice.
    const url = new URL(window.location.href)
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', next)
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        enabledLanguages,
        t: translations[lang],
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>')
  return ctx
}
