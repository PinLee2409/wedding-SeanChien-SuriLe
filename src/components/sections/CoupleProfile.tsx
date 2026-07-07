import { Heart } from 'lucide-react'
import type { Person } from '../../config/wedding.config'
import { cn } from '../../lib/cn'
import { useI18n } from '../../i18n/LanguageContext'
import { SmartImage } from '../ui/SmartImage'

function ProfileCard({
  person,
  side,
  role,
  parents,
}: {
  person: Person
  side: string
  role: string
  parents: string
}) {
  return (
    <div
      className={cn(
        'group relative flex h-full flex-col items-center rounded-3xl border border-gold/20 bg-warm-white/70 text-center',
        'p-[clamp(0.75rem,3.5vw,2rem)] shadow-sm backdrop-blur-sm transition duration-500',
        'hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_22px_44px_-26px_rgba(198,138,116,0.65)]',
      )}
    >
      {/* Avatar with soft gold glow on hover */}
      <div className="relative">
        <span
          className="absolute -inset-1 rounded-full bg-gold/0 blur-md transition duration-500 group-hover:bg-gold/25"
          aria-hidden="true"
        />
        <SmartImage
          src={person.photo}
          alt={person.name}
          label=""
          className="relative aspect-square w-[clamp(4.5rem,22vw,9rem)] rounded-full border-2 border-gold/40 shadow-md"
        />
      </div>

      <span className="label-caps mt-[clamp(0.6rem,2vw,1rem)] text-[clamp(0.55rem,2.2vw,0.7rem)] text-gold">
        {side}
      </span>
      <h3 className="mt-1 font-display font-semibold leading-tight text-navy text-[clamp(1.05rem,3.6vw,1.7rem)]">
        {person.fullName ?? person.name}
      </h3>
      <p className="mt-0.5 text-navy-400 text-[clamp(0.72rem,2.4vw,0.9rem)]">
        {role}
      </p>
      {parents && (
        <p className="mt-2 leading-relaxed text-navy-400 text-[clamp(0.64rem,2.2vw,0.8rem)]">
          {parents}
        </p>
      )}
    </div>
  )
}

/** Groom & bride — ALWAYS two columns on every screen size. */
export function CoupleProfile({
  groom,
  bride,
}: {
  groom: Person
  bride: Person
}) {
  const { t } = useI18n()

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="grid grid-cols-2 items-stretch gap-[clamp(0.6rem,3.5vw,2.5rem)]">
        <ProfileCard
          person={groom}
          side={t.couple.groomSide}
          role={t.couple.groomRole}
          parents={t.couple.groomParents}
        />
        <ProfileCard
          person={bride}
          side={t.couple.brideSide}
          role={t.couple.brideRole}
          parents={t.couple.brideParents}
        />
      </div>

      {/* Center heart accent (hidden on the smallest screens) */}
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 place-items-center sm:grid"
        aria-hidden="true"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-warm-white text-gold shadow-md">
          <Heart className="h-5 w-5 fill-current" />
        </span>
      </span>
    </div>
  )
}
