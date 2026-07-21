import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { weddingConfig } from './config/wedding.config'
import { useAudio } from './hooks/useAudio'
import { useTheme } from './hooks/useTheme'
import { HeroSection } from './components/sections/HeroSection'
import { DownloadInvitation } from './components/sections/DownloadInvitation'
import { MediaGallery } from './components/sections/MediaGallery'
import { FlightPhotoStory } from './components/sections/FlightPhotoStory'
import { WeddingDetails } from './components/sections/WeddingDetails'
import { LoveMessage } from './components/sections/LoveMessage'
import { FinalThankYou } from './components/sections/FinalThankYou'
import { ScannedInvitationView } from './components/sections/ScannedInvitationView'
import { RouteDivider } from './components/decorations/RouteDivider'
import { FloatingDecor } from './components/decorations/FloatingDecor'
import { FallingPetals } from './components/decorations/FallingPetals'
import { MusicToggle } from './components/ui/MusicToggle'
import { BackToTop } from './components/ui/BackToTop'
import { ThemePicker } from './components/ui/ThemePicker'
import { LanguageSwitcher } from './components/ui/LanguageSwitcher'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { clearCardViewInUrl, isCardViewFromUrl } from './lib/guest'

/** One invitation for everyone — no per-guest name. Every passenger is our
 *  honoured "Quý khách", so the whole site runs on the generic fallbacks. */
const GUEST_NAME = ''

function App() {
  const reduce = useReducedMotion()
  const { themeId, setTheme, themes } = useTheme()
  const {
    isPlaying,
    isMuted,
    volume,
    currentTrack,
    play,
    toggle,
    toggleMute,
    setVolume,
    enabled: musicEnabled,
  } = useAudio(weddingConfig.music.tracks, weddingConfig.music.initialVolume)

  const [cardView, setCardView] = useState(() => isCardViewFromUrl())

  // Always open at the top. scrollRestoration is disabled in main.tsx before
  // first paint; here we force the position instantly ("instant" bypasses the
  // CSS smooth-scroll, which could be interrupted mid-flight by layout shifts
  // and strand the page half-way down). Also covers bfcache restores.
  useEffect(() => {
    const toTop = () =>
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    toTop()
    window.addEventListener('pageshow', toTop)
    return () => window.removeEventListener('pageshow', toTop)
  }, [])

  // No entry gate anymore, so the ambient playlist starts on the guest's very
  // first interaction — the gesture every browser needs to allow sound.
  useEffect(() => {
    if (!musicEnabled || cardView) return undefined
    const start = () => void play()
    const opts = { once: true, passive: true } as const
    window.addEventListener('pointerdown', start, opts)
    window.addEventListener('keydown', start, opts)
    window.addEventListener('touchstart', start, opts)
    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
      window.removeEventListener('touchstart', start)
    }
  }, [musicEnabled, cardView, play])

  if (cardView) {
    return (
      <ScannedInvitationView
        config={weddingConfig}
        guestName={GUEST_NAME}
        onOpenFullInvitation={() => {
          clearCardViewInUrl()
          void play()
          setCardView(false)
          window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0)
        }}
      />
    )
  }

  return (
    <motion.div
      className="relative min-h-screen"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <ScrollProgress />

      <FloatingDecor />
      <FallingPetals />

      <main className="relative z-10">
        <HeroSection
          config={weddingConfig}
          guestName={GUEST_NAME}
          isMusicPlaying={isPlaying}
          onToggleMusic={toggle}
          musicEnabled={musicEnabled}
          isRevealed
        />

        <DownloadInvitation config={weddingConfig} guestName={GUEST_NAME} />

        <WeddingDetails config={weddingConfig} />

        <RouteDivider className="bg-gradient-to-b from-ivory to-warm-white" />

        <MediaGallery />

        <FlightPhotoStory />

        <LoveMessage config={weddingConfig} />

        <FinalThankYou config={weddingConfig} />
      </main>

      {/* Floating controls */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        <BackToTop />
        <LanguageSwitcher />
        <ThemePicker themes={themes} activeId={themeId} onSelect={setTheme} />
        {musicEnabled && (
          <MusicToggle
            isPlaying={isPlaying}
            onToggle={toggle}
            muted={isMuted}
            volume={volume}
            trackTitle={currentTrack?.title}
            trackArtist={currentTrack?.artist}
            onToggleMute={toggleMute}
            onVolumeChange={setVolume}
          />
        )}
      </div>
    </motion.div>
  )
}

export default App
