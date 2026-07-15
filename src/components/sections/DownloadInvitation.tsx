import { useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'
import { Download, FileText, LoaderCircle, Plane } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { exportElementToPdf, exportElementToPng } from '../../lib/exportCard'
import { pickGalleryPhotos } from '../../lib/galleryPhotos'
import { cardEntrance } from '../../lib/motion'
import { useI18n } from '../../i18n/LanguageContext'
import { RomanticAura } from '../decorations/RomanticAura'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'
import { BoardingPassCard } from './BoardingPassCard'

/** Fixed export geometry — deterministic, high-res, never cropped. */
const EXPORT_WIDTH = 900
const EXPORT_PADDING = 70
const EXPORT_FONT_PX = 23

const SCENE_PHOTOS = pickGalleryPhotos([
  'cuoi1_t04-04-032.jpg',
  'cuoi2_dsc09667.jpg',
])

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
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)
  const smoothTiltX = useSpring(tiltX, { stiffness: 180, damping: 24, mass: 0.7 })
  const smoothTiltY = useSpring(tiltY, { stiffness: 180, damping: 24, mass: 0.7 })
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.58), rgba(255,255,255,0.12) 20%, transparent 46%)`

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

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    tiltX.set((0.5 - y) * 5)
    tiltY.set((x - 0.5) * 5)
    glareX.set(x * 100)
    glareY.set(y * 100)
  }

  const resetTilt = () => {
    tiltX.set(0)
    tiltY.set(0)
    glareX.set(50)
    glareY.set(50)
  }

  return (
    <section
      id="boarding-pass"
      className="relative overflow-hidden bg-gradient-to-b from-cream via-ivory to-sky-soft/70 px-4 pb-12 pt-20 sm:px-6 sm:pb-16 sm:pt-24"
      aria-label={t.download.title}
    >
      <RomanticAura className="opacity-70" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 sm:gap-10">
        <Reveal>
          <SectionHeading
            kicker={t.download.kicker}
            title={t.download.title}
            subtitle={t.download.subtitle}
          />
        </Reveal>

        {/* First-class collectible scene: photographs fan open behind the pass. */}
        <motion.div
          className="relative w-full py-12 sm:py-16 lg:py-20"
          variants={cardEntrance}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          style={{ perspective: 1400 }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[76%] w-[96%] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-gold/35"
            aria-hidden="true"
          />
          <motion.span
            className="pointer-events-none absolute left-1/2 top-[10%] z-10 text-gold-dark"
            initial={reduce ? false : { x: -150, y: 24, opacity: 0, rotate: 38 }}
            whileInView={
              reduce
                ? undefined
                : { x: 150, y: -6, opacity: [0, 1, 1, 0], rotate: 48 }
            }
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 2.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <Plane className="h-7 w-7" strokeWidth={1.4} />
          </motion.span>

          {SCENE_PHOTOS.map((photo, index) => (
            <motion.figure
              key={photo.filename}
              className={
                index === 0
                  ? 'pointer-events-none absolute left-[-1.5rem] top-[17%] z-0 w-36 -rotate-[11deg] bg-white p-2 pb-8 shadow-[0_26px_55px_-28px_rgba(27,42,74,0.7)] ring-1 ring-gold/20 sm:left-[3%] sm:w-52 lg:left-[8%] lg:w-60'
                  : 'pointer-events-none absolute right-[-1.5rem] top-[13%] z-0 w-36 rotate-[10deg] bg-white p-2 pb-8 shadow-[0_26px_55px_-28px_rgba(27,42,74,0.7)] ring-1 ring-gold/20 sm:right-[3%] sm:w-52 lg:right-[8%] lg:w-60'
              }
              initial={
                reduce
                  ? false
                  : { opacity: 0, x: index === 0 ? 54 : -54, y: 26, rotate: 0 }
              }
              whileInView={
                reduce
                  ? undefined
                  : {
                      opacity: 0.92,
                      x: 0,
                      y: 0,
                      rotate: index === 0 ? -11 : 10,
                    }
              }
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 1, delay: 0.22 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            >
              <SmartImage
                src={photo.display}
                alt=""
                fit="cover"
                placeholder="bare"
                className="aspect-[2/3] w-full"
              />
            </motion.figure>
          ))}

          <motion.div
            className="absolute bottom-[7%] left-1/2 z-10 h-32 w-[min(94%,34rem)] -translate-x-1/2 rounded-[2rem] border border-gold/25 bg-gradient-to-br from-ivory-deep via-cream to-beige shadow-[0_28px_50px_-34px_rgba(27,42,74,0.5)]"
            initial={reduce ? false : { y: 34, opacity: 0 }}
            whileInView={reduce ? undefined : { y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          />

          <motion.div
            className="relative z-20 mx-auto w-full max-w-[400px] rounded-[1.5em] [container-type:inline-size] sm:max-w-[440px]"
            onPointerMove={handlePointerMove}
            onPointerLeave={resetTilt}
            style={{
              rotateX: reduce ? 0 : smoothTiltX,
              rotateY: reduce ? 0 : smoothTiltY,
              transformStyle: 'preserve-3d',
            }}
          >
            <BoardingPassCard config={config} guestName={guestName} />
            <motion.span
              className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[1.5em] mix-blend-screen"
              style={{ background: glareBackground }}
              aria-hidden="true"
            />
            {!reduce && (
              <span
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[1.5em]"
                aria-hidden="true"
              >
                <motion.span
                  className="absolute -bottom-1/4 -top-1/4 w-[28%] -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent mix-blend-screen"
                  initial={{ left: '-45%', opacity: 0 }}
                  whileInView={{ left: '125%', opacity: [0, 0.58, 0] }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{
                    duration: 1.25,
                    delay: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </span>
            )}
          </motion.div>
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
