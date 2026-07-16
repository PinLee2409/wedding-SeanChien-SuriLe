import { useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'
import { Download, FileText, Heart, LoaderCircle, Plane } from 'lucide-react'
import type { WeddingConfig } from '../../config/wedding.config'
import { exportElementToPdf, exportElementToPng } from '../../lib/exportCard'
import type { GalleryPhoto } from '../../lib/galleryPhotos'
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
  'cuoi3_dscf0954.jpg',
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
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto>()
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
      className="relative overflow-hidden bg-gradient-to-b from-cream via-ivory to-sky-soft/70 px-2 pb-12 pt-20 sm:px-6 sm:pb-16 sm:pt-24"
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

        {/*
          A collectible travel scene. Phones use a compact photo rail above the
          pass; the wider fan only returns when all three columns genuinely fit.
        */}
        <motion.div
          className="invitation-scene relative w-full overflow-hidden rounded-[1.75rem] border border-white/80 px-1.5 pb-7 pt-8 shadow-[0_28px_80px_-48px_rgba(27,42,74,0.58)] sm:rounded-[2.5rem] sm:px-6 sm:pb-11 sm:pt-12 lg:px-8 lg:py-16"
          variants={cardEntrance}
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          style={{ perspective: 1400 }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-[54%] h-[64%] w-[132%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-gold/30 sm:top-[55%] sm:h-[68%] sm:w-[88%] lg:top-1/2 lg:h-[76%] lg:max-w-4xl"
            aria-hidden="true"
          />
          <span className="invitation-route-plane" aria-hidden="true">
            <span className="h-px w-10 bg-gradient-to-l from-gold/70 to-transparent sm:w-16" />
            <Plane
              className="h-4 w-4 rotate-45 text-gold-dark drop-shadow-[0_2px_5px_rgba(166,132,58,0.3)] sm:h-5 sm:w-5"
              strokeWidth={1.5}
            />
          </span>
          <span
            className="invitation-scene-heart invitation-scene-heart--one"
            aria-hidden="true"
          >
            <Heart className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
          </span>
          <span
            className="invitation-scene-heart invitation-scene-heart--two"
            aria-hidden="true"
          >
            <Heart className="h-4 w-4 fill-current" strokeWidth={0} />
          </span>
          <span
            className="invitation-scene-heart invitation-scene-heart--three"
            aria-hidden="true"
          >
            <Heart className="h-3 w-3 fill-current" strokeWidth={0} />
          </span>
          <motion.div
            className="absolute bottom-[2.5%] left-1/2 z-10 h-24 w-[92%] max-w-[29rem] -translate-x-1/2 rounded-[1.6rem] border border-gold/20 bg-gradient-to-br from-ivory-deep via-cream to-beige shadow-[0_28px_50px_-34px_rgba(27,42,74,0.5)] sm:bottom-[4%] sm:h-28 sm:rounded-[2rem] lg:bottom-[7%] lg:h-32 lg:max-w-[34rem]"
            initial={reduce ? false : { y: 34, opacity: 0 }}
            whileInView={reduce ? undefined : { y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          />

          <div className="relative z-20 grid grid-cols-2 items-end justify-items-center gap-x-2.5 gap-y-6 px-0.5 sm:gap-x-5 sm:gap-y-8 sm:px-2 md:grid-cols-[minmax(6rem,1fr)_minmax(0,425px)_minmax(6rem,1fr)] md:items-center md:gap-x-0 md:gap-y-0 md:px-0 lg:grid-cols-[minmax(9rem,1fr)_minmax(0,440px)_minmax(9rem,1fr)]">
            {SCENE_PHOTOS.map((photo, index) => {
              const isSelected = selectedPhoto?.filename === photo.filename
              return (
                <motion.button
                  type="button"
                  key={photo.filename}
                  className={[
                    'invitation-photo-selector group relative z-10 row-start-1 w-[clamp(4.75rem,24vw,6rem)] cursor-pointer rounded-[1.35rem] bg-white p-1.5 pb-4 text-left shadow-[0_22px_48px_-25px_rgba(27,42,74,0.68)] transition-[box-shadow,opacity] duration-500 sm:w-28 sm:rounded-[1.6rem] sm:p-2 sm:pb-6 md:w-[clamp(7.5rem,15vw,10rem)] lg:w-[clamp(10rem,17vw,12rem)] lg:pb-7',
                    'focus-visible:z-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/35',
                    index === 0
                      ? 'invitation-photo-selector--left col-start-1 md:col-start-1'
                      : 'invitation-photo-selector--right col-start-2 md:col-start-3',
                    isSelected
                      ? 'opacity-100 ring-2 ring-gold shadow-[0_26px_55px_-24px_rgba(157,105,46,0.6)]'
                      : 'opacity-90 ring-1 ring-gold/25 hover:opacity-100',
                  ].join(' ')}
                  initial={
                    reduce
                      ? false
                      : {
                          opacity: 0,
                          x: index === 0 ? 22 : -22,
                          y: 16,
                          scale: 0.96,
                        }
                  }
                  whileInView={
                    reduce
                      ? undefined
                      : {
                          opacity: isSelected ? 1 : 0.9,
                          x: 0,
                          y: 0,
                          scale: 1,
                        }
                  }
                  whileHover={
                    reduce
                      ? undefined
                      : {
                          scale: 1.045,
                          y: -5,
                        }
                  }
                  whileTap={
                    reduce
                      ? undefined
                      : {
                          scale: 0.975,
                        }
                  }
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.75,
                    delay: 0.18 + index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  aria-label={`${t.pass.photoLabel} ${index + 1}`}
                  aria-pressed={isSelected}
                  aria-controls="boarding-pass-preview"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <SmartImage
                    src={photo.display}
                    alt=""
                    fit="cover"
                    placeholder="bare"
                    className="aspect-[2/3] w-full rounded-[1rem] sm:rounded-[1.15rem]"
                    imgClassName="object-center transition-transform duration-700 group-hover:scale-[1.035]"
                  />
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-white/80 bg-rose text-white shadow-md sm:right-3 sm:top-3 sm:h-8 sm:w-8"
                        initial={reduce ? false : { opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        aria-hidden="true"
                      >
                        <Heart className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}

            <motion.div
              id="boarding-pass-preview"
              className="relative z-20 col-span-2 col-start-1 row-start-2 mx-auto w-[88vw] max-w-[21rem] rounded-[1.5rem] [container-type:inline-size] sm:w-full sm:max-w-[420px] sm:rounded-[1.75rem] md:col-span-1 md:col-start-2 md:row-start-1 md:max-w-[clamp(400px,42vw,425px)] lg:max-w-[440px]"
              onPointerMove={handlePointerMove}
              onPointerLeave={resetTilt}
              style={{
                rotateX: reduce ? 0 : smoothTiltX,
                rotateY: reduce ? 0 : smoothTiltY,
                transformStyle: 'preserve-3d',
              }}
            >
              <BoardingPassCard
                config={config}
                guestName={guestName}
                animatePhoto
                selectedPhoto={selectedPhoto}
              />
              <motion.span
                className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[1.5rem] mix-blend-screen sm:rounded-[1.75rem]"
                style={{ background: glareBackground }}
                aria-hidden="true"
              />
              {!reduce && (
                <span
                  className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem]"
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
            selectedPhoto={selectedPhoto}
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
