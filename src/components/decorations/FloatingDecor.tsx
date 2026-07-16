/** Page-level cinematic overlay: faint floral line art, golden sparkles,
 *  a soft vignette and paper grain. Purely decorative & non-interactive. */

const SPARKLES = [
  { top: '14%', left: '8%', size: 10, delay: 0, duration: 4.2 },
  { top: '22%', left: '86%', size: 7, delay: 1.1, duration: 3.6 },
  { top: '48%', left: '5%', size: 6, delay: 2.2, duration: 4.8 },
  { top: '58%', left: '92%', size: 9, delay: 0.6, duration: 4.1 },
  { top: '74%', left: '12%', size: 8, delay: 1.7, duration: 5.1 },
  { top: '82%', left: '80%', size: 6, delay: 2.6, duration: 3.9 },
  { top: '36%', left: '50%', size: 5, delay: 3.1, duration: 4.6 },
]

function Sparkle({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="text-gold"
    >
      <path
        d="M12 0c.7 6.2 5.1 10.6 12 11.3-6.9.7-11.3 5.1-12 12-.7-6.9-5.1-11.3-12-12C6.9 10.6 11.3 6.2 12 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

function FloralCorner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M10 190 C 40 150, 40 110, 70 90 C 100 70, 110 40, 120 10" />
      <path d="M70 90 C 55 75, 40 72, 25 78 M70 90 C 78 70, 76 54, 66 42" />
      <path d="M95 60 C 82 50, 66 50, 54 58 M95 60 C 104 44, 104 28, 96 16" />
      <path d="M120 40 C 108 33, 92 35, 82 44 M120 40 C 130 27, 132 12, 126 2" />
      <circle cx="120" cy="10" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="25" cy="78" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FloatingDecor() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
      aria-hidden="true"
    >
      {/* Soft vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_180px_50px_rgba(27,42,74,0.06)]" />

      {/* Paper grain */}
      <div className="paper-grain absolute inset-0 opacity-[0.05] mix-blend-multiply" />

      {/* Floral line art in opposite corners */}
      <FloralCorner className="absolute -left-6 top-2 h-40 w-40 text-gold/15" />
      <FloralCorner className="absolute -right-6 bottom-2 h-40 w-40 rotate-180 text-gold/15" />

      {/* Golden sparkles */}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className={
            i >= 4
              ? 'absolute hidden animate-twinkle sm:block'
              : 'absolute animate-twinkle'
          }
          style={{
            top: s.top,
            left: s.left,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          <Sparkle size={s.size} />
        </span>
      ))}
    </div>
  )
}
