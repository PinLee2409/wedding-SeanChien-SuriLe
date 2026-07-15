import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/cn'
import {
  pickGalleryPhotos,
  type GalleryPhoto,
} from '../../lib/galleryPhotos'
import { useI18n } from '../../i18n/LanguageContext'
import { Clouds } from '../decorations/Clouds'
import { FlyingPlane } from '../decorations/FlyingPlane'
import { RunwayLights } from '../decorations/RunwayLights'
import { RevealItem, SectionReveal } from '../ui/SectionReveal'
import { SmartImage } from '../ui/SmartImage'

interface StoryPhoto {
  photo: GalleryPhoto
  desktopSlot: string
  mobileSlot: string
  shape: string
  focus?: string
  floatDelay: number
}

const STORY_SPECS = [
  {
    filename: 'cuoi2_dsc09678.jpg',
    desktopSlot: 'left-1/4 top-[6%] z-20 w-1/2',
    mobileSlot: 'order-1 col-span-2 aspect-[3/2]',
    shape: 'rounded-[2rem] sm:rounded-[2.75rem]',
    floatDelay: 0,
  },
  {
    filename: 'cuoi1_t04-04-032.jpg',
    desktopSlot: 'left-0 top-[15%] z-10 w-[22%]',
    mobileSlot: 'order-2 col-span-1 aspect-[2/3]',
    shape: 'rounded-t-[999px] rounded-b-[2rem]',
    floatDelay: -1.4,
  },
  {
    filename: 'cuoi2_dsc09667.jpg',
    desktopSlot: 'right-0 top-[15%] z-10 w-[22%]',
    mobileSlot: 'order-3 col-span-1 aspect-[2/3]',
    shape: 'rounded-t-[999px] rounded-b-[2rem]',
    floatDelay: -2.8,
  },
  {
    filename: 'cuoi1_t04-04-248.jpg',
    desktopSlot: 'bottom-[7%] left-[27%] z-30 w-[22%]',
    mobileSlot: 'order-4 col-span-2 aspect-[3/2] sm:col-span-1',
    shape: 'rounded-[1.5rem] sm:rounded-[2rem]',
    floatDelay: -3.7,
  },
  {
    filename: 'cuoi1_t04-04-293.jpg',
    desktopSlot: 'bottom-[7%] right-[27%] z-30 w-[22%]',
    mobileSlot: 'order-5 col-span-2 aspect-[3/2] sm:col-span-1',
    shape: 'rounded-[1.5rem] sm:rounded-[2rem]',
    floatDelay: -4.9,
  },
] as const

const STORY_PHOTOS: StoryPhoto[] = STORY_SPECS.flatMap((spec) => {
  const [photo] = pickGalleryPhotos([spec.filename])
  return photo ? [{ ...spec, photo }] : []
})

function FloatingPhoto({
  item,
  label,
  className,
}: {
  item: StoryPhoto
  label: string
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={cn('h-full w-full', className)}
      animate={
        reduce
          ? undefined
          : {
              y: [0, -9, 0, 6, 0],
              rotate: [0, 0.35, 0, -0.3, 0],
            }
      }
      transition={{
        duration: 8.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: item.floatDelay,
      }}
    >
      <div
        className={cn(
          'group relative h-full w-full overflow-hidden border-[5px] border-white/90 bg-white shadow-[0_30px_65px_-30px_rgba(27,42,74,0.58)] ring-1 ring-gold/25 sm:border-[7px]',
          item.shape,
        )}
      >
        <SmartImage
          src={item.photo.display}
          alt={label}
          fit="cover"
          placeholder="bare"
          className="h-full w-full"
          imgClassName={cn(
            'transition-transform duration-[1200ms] ease-out group-hover:scale-[1.035]',
            item.focus,
          )}
        />
        <motion.span
          className="pointer-events-none absolute -inset-y-1/4 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent mix-blend-screen"
          initial={false}
          animate={reduce ? { x: '-180%' } : { x: ['-180%', '520%'] }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            repeatDelay: 5.5,
            ease: 'easeInOut',
            delay: Math.abs(item.floatDelay),
          }}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  )
}

export function FlightPhotoStory() {
  const { t } = useI18n()
  const sectionLabel = `${t.gallery.title} · Flight to Forever`

  if (STORY_PHOTOS.length === 0) return null

  return (
    <section
      id="flight-photo-story"
      className="relative overflow-hidden bg-gradient-to-b from-ivory via-sky-soft/75 to-warm-white px-4 py-20 sm:px-6 sm:py-24"
      aria-label={sectionLabel}
    >
      <h2 className="sr-only">{sectionLabel}</h2>
      <Clouds tone="white" className="opacity-45" />

      <div
        className="pointer-events-none absolute -left-[8%] -right-[8%] h-28 -rotate-1 rounded-[50%] border-t border-dashed border-gold/50"
        style={{ top: 'clamp(4rem, 6vw, 5rem)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-warm-white)_0%,transparent_68%)] opacity-70 blur-2xl"
        aria-hidden="true"
      />

      <FlyingPlane
        top="calc(clamp(4rem, 6vw, 5rem) - 1.375rem)"
        size={44}
        duration={20}
        repeatDelay={2}
        tone="text-navy"
        trailWidth="w-40"
      />

      {/* Mobile and tablet: a closed two-column composition with fixed ratios. */}
      <SectionReveal className="relative z-10 mx-auto grid max-w-3xl grid-cols-2 gap-3 pt-12 sm:grid-cols-2 sm:gap-4 lg:hidden">
        {STORY_PHOTOS.map((item, index) => (
          <RevealItem key={item.photo.filename} className={item.mobileSlot}>
            <FloatingPhoto
              item={item}
              label={`${t.gallery.photo} ${index + 1}`}
            />
          </RevealItem>
        ))}
      </SectionReveal>

      {/* Desktop: a cinematic window wall with two floating photo postcards. */}
      <SectionReveal className="relative z-10 mx-auto hidden h-[clamp(34rem,47vw,41rem)] max-w-6xl pt-10 lg:block">
        {STORY_PHOTOS.map((item, index) => (
          <RevealItem
            key={item.photo.filename}
            className={cn(
              'absolute',
              item.desktopSlot,
              item.photo.orientation === 'landscape'
                ? 'aspect-[3/2]'
                : 'aspect-[2/3]',
            )}
          >
            <FloatingPhoto
              item={item}
              label={`${t.gallery.photo} ${index + 1}`}
            />
          </RevealItem>
        ))}
      </SectionReveal>

      <RunwayLights
        count={16}
        className="relative z-10 mx-auto mt-10 opacity-80 sm:mt-12"
      />
    </section>
  )
}
