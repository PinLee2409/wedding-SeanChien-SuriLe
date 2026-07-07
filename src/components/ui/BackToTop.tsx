import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronUp } from 'lucide-react'
import { useI18n } from '../../i18n/LanguageContext'

/** Elegant back-to-top control that appears after scrolling down. */
export function BackToTop() {
  const { t } = useI18n()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={t.ui.backToTop}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.92 }}
          className="grid h-12 w-12 place-items-center rounded-full border border-gold/50 glass text-navy shadow-lg"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={1.7} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
