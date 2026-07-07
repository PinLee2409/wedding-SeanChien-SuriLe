import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Download, FileText, LoaderCircle } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { exportElementToPdf, exportElementToPng } from '../../lib/exportCard'
import { cardEntrance } from '../../lib/motion'
import { useI18n } from '../../i18n/LanguageContext'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { BoardingPassCard } from './BoardingPassCard'

/** Fixed export geometry — deterministic, high-res, never cropped. */
const EXPORT_WIDTH = 900
const EXPORT_PADDING = 70
const EXPORT_FONT_PX = 23

/** Turn a (possibly Vietnamese) name into a safe file slug. */
function slugify(input: string): string {
  return (
    input
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'guest'
  )
}

type Busy = 'png' | 'pdf' | null

export function DownloadInvitation({
  config,
  guestName,
}: {
  config: WeddingConfig
  guestName: string
}) {
  const reduce = useReducedMotion()
  const { t } = useI18n()
  const exportRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState<string | null>(null)

  const fileBase = useMemo(
    () => `wedding-invitation-${slugify(guestName)}`,
    [guestName],
  )

  const handleExport = async (type: 'png' | 'pdf') => {
    if (!exportRef.current || busy) return
    setError(null)
    setBusy(type)
    try {
      if (type === 'png') await exportElementToPng(exportRef.current, fileBase)
      else await exportElementToPdf(exportRef.current, fileBase)
    } catch (err) {
      console.error('Invitation export failed:', err)
      setError(t.download.error)
      window.setTimeout(() => setError(null), 4500)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section
      id="boarding-pass"
      className="relative bg-gradient-to-b from-cream via-ivory to-cream px-4 py-20 sm:px-6"
      aria-label={t.download.title}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-10">
        <Reveal>
          <SectionHeading
            kicker={t.download.kicker}
            title={t.download.title}
            subtitle={t.download.subtitle}
          />
        </Reveal>

        {/* Display card — fluid, no transform, roomy padding so nothing crops. */}
        <motion.div
          className="w-full px-2 py-4"
          variants={cardEntrance}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          style={{ perspective: 1000 }}
        >
          <div className="mx-auto w-full max-w-[400px] [container-type:inline-size] sm:max-w-[440px]">
            <BoardingPassCard config={config} guestName={guestName} />
          </div>
        </motion.div>

        {/* Buttons */}
        <Reveal delay={0.1} className="flex w-full flex-col items-center gap-3" blur={false}>
          <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleExport('png')}
              disabled={busy !== null}
              className="btn btn-primary flex-1"
            >
              {busy === 'png' ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {t.download.png}
            </button>
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={busy !== null}
              className="btn btn-ghost flex-1"
            >
              {busy === 'pdf' ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {t.download.pdf}
            </button>
          </div>
          <p aria-live="polite" className="min-h-[1.1rem] text-center text-xs text-navy-400">
            {busy ? t.download.generating : t.download.hint}
          </p>
        </Reveal>
      </div>

      {/* Hidden, fixed-size export node (ivory padding around the card). */}
      <div className="pointer-events-none fixed left-[-99999px] top-0" aria-hidden="true">
        <div
          ref={exportRef}
          className="[container-type:inline-size]"
          style={{
            width: EXPORT_WIDTH,
            padding: EXPORT_PADDING,
            background: '#f8f2f0',
          }}
        >
          <BoardingPassCard
            config={config}
            guestName={guestName}
            fontPx={EXPORT_FONT_PX}
          />
        </div>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-rose/40 bg-warm-white px-5 py-3 text-sm text-navy shadow-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            role="alert"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
