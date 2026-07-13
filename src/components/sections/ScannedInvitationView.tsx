import { ArrowRight, Heart, Plane } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { WeddingConfig } from '../../config/wedding.config'
import { useI18n } from '../../i18n/LanguageContext'
import { BoardingPassCard } from './BoardingPassCard'

interface ScannedInvitationViewProps {
  config: WeddingConfig
  guestName: string
  onOpenFullInvitation: () => void
}

/**
 * Scan destination for the QR printed on the invitation. It deliberately
 * bypasses the name gate and presents the personalised card immediately.
 */
export function ScannedInvitationView({
  config,
  guestName,
  onOpenFullInvitation,
}: ScannedInvitationViewProps) {
  const reduce = useReducedMotion()
  const { t } = useI18n()

  return (
    <main
      className="relative min-h-svh overflow-hidden bg-ivory px-4 py-7 sm:px-6 sm:py-12"
      aria-label={t.download.title}
    >
      <motion.div
        className="pointer-events-none absolute -left-28 top-[-5rem] h-80 w-80 rounded-full bg-rose/25 blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.16, 1], opacity: [0.35, 0.62, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -right-32 bottom-[-6rem] h-96 w-96 rounded-full bg-gold-light/35 blur-3xl"
        animate={reduce ? undefined : { scale: [1.12, 0.94, 1.12], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {!reduce && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <motion.span
            className="absolute left-[8%] top-[20%] text-rose/45"
            animate={{ y: [8, -18, 8], rotate: [-8, 8, -8] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="h-5 w-5 fill-current" strokeWidth={1} />
          </motion.span>
          <motion.span
            className="absolute right-[7%] top-[42%] text-gold/45"
            animate={{ y: [-10, 16, -10], rotate: [8, -7, 8] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="h-4 w-4 fill-current" strokeWidth={1} />
          </motion.span>
        </div>
      )}

      <section className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center gap-5">
        <h1 className="sr-only">{t.download.title}</h1>
        <motion.div
          className="flex items-center gap-2 text-gold-dark"
          initial={reduce ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <Plane className="h-4 w-4 rotate-45" strokeWidth={1.5} />
          <span className="label-caps text-[10px]">{t.download.kicker}</span>
        </motion.div>

        <motion.div
          className="w-full max-w-[440px] [container-type:inline-size]"
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.965 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <BoardingPassCard config={config} guestName={guestName} />
        </motion.div>

        <motion.button
          type="button"
          onClick={onOpenFullInvitation}
          className="btn btn-primary"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reduce ? 0 : 0.55 }}
        >
          {t.ui.openFullInvitation}
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </section>
    </main>
  )
}
