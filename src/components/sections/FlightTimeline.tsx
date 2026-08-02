import { useEffect, useRef, useState } from 'react'
import { Cloud, Plane, PlaneLanding, PlaneTakeoff, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import type { MotionValue } from 'motion/react'
import type { TimelineItem, WeddingConfig } from '../../config/wedding.config'
import { cn } from '../../lib/cn'
import { photoSrcSet } from '../../lib/galleryPhotos'
import type { GalleryPhoto } from '../../lib/galleryPhotos'
import { slotPhotos } from '../../lib/photoSlots'
import { useI18n } from '../../i18n/LanguageContext'
import type { TimelineCopy } from '../../i18n/translations'
import { SectionHeading } from '../ui/SectionHeading'
import { SmartImage } from '../ui/SmartImage'
import { Reveal } from '../ui/Reveal'

const ICONS: Record<TimelineItem['icon'], LucideIcon> = {
  ticket: Ticket,
  'plane-takeoff': PlaneTakeoff,
  cloud: Cloud,
  'plane-landing': PlaneLanding,
}

/**
 * Real photographs for the four legs. The config no longer carries image paths
 * — the old `images/timeline-1..4.jpg` were never supplied and rendered as
 * placeholders, which is why this section had been dropped from the page.
 * These four landscape frames are deliberately different from the ones the
 * boarding pass cycles through.
 */
const LEG_PHOTOS = slotPhotos('timeline')

/** Node geometry: a 48px badge with the progress ring drawn just inside it. */
const NODE_RADIUS = 22
const RING_LENGTH = 2 * Math.PI * NODE_RADIUS

/** How close to a node the aircraft gets before it hands over and disappears. */
const PLANE_HIDE_RADIUS = 0.018
/** …and how far past it before the aircraft is fully back. */
const PLANE_SHOW_RADIUS = 0.05

function TimelineRow({
  item,
  copy,
  photo,
  index,
  progress,
  from,
  to,
  reduce,
}: {
  item: TimelineItem
  /** Localised date/title/description for this leg. */
  copy: TimelineCopy
  /** Gallery photograph for this leg. */
  photo?: GalleryPhoto
  index: number
  /** Scroll progress along the whole route, 0…1. */
  progress: MotionValue<number>
  /** Where the previous node sat, and where this one sits, on that scale. */
  from: number
  to: number
  reduce: boolean
}) {
  const Icon = ICONS[item.icon]
  const isLeft = index % 2 === 0
  const isWide = photo?.orientation === 'landscape'

  // The ring fills as the aircraft covers the leg *into* this node, so the
  // badge reads as loading while the plane is still on its way.
  const span = to > from ? to : from + 0.001
  const ringProgress = useTransform(progress, [from, span], [0, 1], {
    clamp: true,
  })
  const ringOffset = useTransform(
    ringProgress,
    (value) => RING_LENGTH * (1 - value),
  )

  const [lit, setLit] = useState(reduce)
  useMotionValueEvent(ringProgress, 'change', (value) => {
    if (!reduce) setLit(value >= 0.995)
  })

  return (
    <Reveal
      as="li"
      delay={index * 0.06}
      className="relative md:grid md:grid-cols-2 md:items-center md:gap-10"
    >
      {/* Node on the line — dim until the aircraft arrives, then lit. */}
      <span
        data-timeline-node
        className={cn(
          'absolute left-6 top-0 z-10 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border-2 transition-colors duration-500 ease-out md:left-1/2',
          lit
            ? 'border-gold bg-gold text-warm-white shadow-[0_0_0_6px_rgba(198,138,116,0.16),0_10px_24px_-10px_rgba(198,138,116,0.85)]'
            : 'border-gold/20 bg-warm-white text-gold/45 shadow-[0_8px_20px_-12px_rgba(27,42,74,0.45)]',
        )}
        aria-hidden="true"
      >
        {/* The loading ring: an arc that draws itself closed on approach. */}
        <svg
          className="absolute inset-0 h-full w-full -rotate-90 text-gold"
          viewBox="0 0 48 48"
          fill="none"
        >
          <motion.circle
            cx="24"
            cy="24"
            r={NODE_RADIUS}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            style={{ strokeDashoffset: reduce ? 0 : ringOffset }}
          />
        </svg>

        <motion.span
          className="relative inline-flex"
          animate={lit && !reduce ? { scale: [1, 1.22, 1] } : { scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </motion.span>
      </span>

      {/* Text. The block hugs the route on both sides, but the copy itself is
          always ranged left — a three-line paragraph set ragged-left is hard
          work to read, and the phase caption is dropped because the icon on
          the route already says which leg this is. */}
      <div
        className={cn(
          'pl-16 md:row-start-1 md:pl-0',
          isLeft ? 'md:col-start-1 md:pr-12' : 'md:col-start-2 md:pl-12',
        )}
      >
        <div className={cn('max-w-[31rem]', isLeft && 'md:ml-auto')}>
          {/* Only the wedding day carries a real date; the other legs
              deliberately carry none rather than an invented one. */}
          {copy.date && (
            <p className="mb-2 font-mono text-[0.7rem] tracking-[0.2em] text-gold-dark">
              {copy.date}
            </p>
          )}
          <h3 className="font-display text-[clamp(1.45rem,4vw,2.05rem)] leading-[1.16] text-navy">
            {copy.title}
          </h3>
          <span
            className="mt-4 block h-px w-10 bg-gold/50"
            aria-hidden="true"
          />
          <p className="mt-4 text-justify text-[0.95rem] leading-[1.8] text-navy-500">
            {copy.description}
          </p>
        </div>
      </div>

      {/* Image. The frame takes the photograph's own shape so nothing is cut —
          these legs mix uprights and a landscape, and one fixed 4:3 frame was
          taking about half of every upright. Uprights are held to a narrower
          column as well, or a 2:3 frame at full width would make each leg
          taller than the screen. */}
      <div
        className={cn(
          'group mt-4 overflow-hidden rounded-2xl border border-gold/20 shadow-[0_18px_44px_-30px_rgba(27,42,74,0.65)] transition-shadow duration-500 hover:shadow-[0_26px_56px_-28px_rgba(27,42,74,0.8)] md:row-start-1 md:mt-0',
          'ml-16 md:ml-0',
          isLeft ? 'md:col-start-2 md:ml-12' : 'md:col-start-1 md:mr-12',
          isWide ? 'w-full' : 'w-full max-w-[19rem]',
          !isWide && !isLeft && 'md:ml-auto',
        )}
      >
        <SmartImage
          src={photo?.display}
          srcSet={photo ? photoSrcSet(photo) : undefined}
          sizes={
            isWide ? '(min-width: 768px) 45vw, 70vw' : '(min-width: 768px) 19rem, 70vw'
          }
          alt={copy.title}
          label={copy.phase}
          fit="contain"
          className={cn(
            'w-full bg-ivory-deep',
            isWide ? 'aspect-[3/2]' : 'aspect-[2/3]',
          )}
        />
      </div>
    </Reveal>
  )
}

/**
 * The journey — four legs from the first promise to landing day. This is the
 * spine the whole invitation hangs on: the final leg *is* the wedding date, so
 * it hands straight over to the flight details below.
 */
export function FlightTimeline({ config }: { config: WeddingConfig }) {
  const reduce = !!useReducedMotion()
  const { t } = useI18n()
  const routeRef = useRef<HTMLDivElement>(null)

  // The route draws itself in step with the scroll rather than firing once, so
  // the guest feels they are flying the line instead of watching it replay.
  const { scrollYProgress } = useScroll({
    target: routeRef,
    offset: ['start 78%', 'end 62%'],
  })
  const flown = useSpring(scrollYProgress, {
    stiffness: 84,
    damping: 26,
    mass: 0.45,
  })

  // Where each node actually sits along the route, measured from layout — the
  // rows are not equal heights, so an even split would drift out of step.
  const legCount = config.timeline.length
  const [measured, setMeasured] = useState<number[]>([])

  useEffect(() => {
    const element = routeRef.current
    if (!element) return undefined

    const measure = () => {
      const base = element.getBoundingClientRect()
      if (!base.height) return
      const nodes = element.querySelectorAll<HTMLElement>('[data-timeline-node]')
      setMeasured(
        Array.from(nodes, (node) => {
          const rect = node.getBoundingClientRect()
          return (rect.top + rect.height / 2 - base.top) / base.height
        }),
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [legCount])

  // Before the first measurement — and if a node ever goes missing — fall back
  // to an even spread so the ring and the aircraft still behave sensibly.
  const nodeAt =
    measured.length === legCount
      ? measured
      : config.timeline.map((_, index) => (index + 0.5) / legCount)

  const nodeAtRef = useRef<number[]>(nodeAt)
  nodeAtRef.current = nodeAt

  const planeTop = useTransform(flown, (value) => `${value * 100}%`)
  // The aircraft bows out as it reaches a node — the node's ring takes over —
  // and only fades back in once the guest scrolls on past it.
  const planeOpacity = useTransform(flown, (value) => {
    if (value <= 0.012 || value >= 0.988) return 0
    const nodes = nodeAtRef.current
    if (nodes.length === 0) return 1
    const nearest = Math.min(...nodes.map((node) => Math.abs(value - node)))
    if (nearest <= PLANE_HIDE_RADIUS) return 0
    if (nearest >= PLANE_SHOW_RADIUS) return 1
    return (nearest - PLANE_HIDE_RADIUS) / (PLANE_SHOW_RADIUS - PLANE_HIDE_RADIUS)
  })

  return (
    <section
      id="timeline"
      className="relative overflow-hidden bg-ivory px-5 pb-24 pt-16 sm:pt-20"
      aria-label={t.timeline.title}
    >
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <SectionHeading
            kicker={t.timeline.kicker}
            title={t.timeline.title}
            subtitle={t.timeline.subtitle}
          />
        </Reveal>

        <div ref={routeRef} className="relative mt-16">
          {/* The route ahead, waiting to be flown. */}
          <span
            className="absolute bottom-0 left-6 top-0 w-px bg-gold/15 md:left-1/2 md:-translate-x-1/2"
            aria-hidden="true"
          />
          {/* The distance already covered. */}
          <motion.span
            className="absolute bottom-0 left-6 top-0 w-px origin-top bg-gradient-to-b from-gold/45 via-gold to-gold/45 md:left-1/2 md:-translate-x-1/2"
            aria-hidden="true"
            style={reduce ? undefined : { scaleY: flown }}
          />
          {/* The aircraft riding the line between nodes. */}
          {!reduce && (
            <motion.span
              className="pointer-events-none absolute left-6 z-20 md:left-1/2"
              style={{ top: planeTop, opacity: planeOpacity }}
              aria-hidden="true"
            >
              <span className="block -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory p-1 text-gold drop-shadow-[0_2px_6px_rgba(198,138,116,0.55)]">
                <Plane className="h-4 w-4 rotate-[135deg]" strokeWidth={1.7} />
              </span>
            </motion.span>
          )}

          <ol className="flex flex-col gap-16">
            {config.timeline.map((item, index) => (
              <TimelineRow
                key={item.phase}
                item={item}
                copy={
                  t.timeline.items[index] ?? {
                    phase: item.phase,
                    date: item.date,
                    title: item.title,
                    description: item.description,
                  }
                }
                photo={LEG_PHOTOS[index]}
                index={index}
                progress={flown}
                from={index === 0 ? 0 : nodeAt[index - 1]}
                to={nodeAt[index]}
                reduce={reduce}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
