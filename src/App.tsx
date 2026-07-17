import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import confetti from 'canvas-confetti'
import { weddingConfig } from './config/wedding.config'
import { useGuestName } from './hooks/useGuestName'
import { useAudio } from './hooks/useAudio'
import { useTheme } from './hooks/useTheme'
import { HeroSection } from './components/sections/HeroSection'
import { GuestNameGate } from './components/sections/GuestNameGate'
import { DownloadInvitation } from './components/sections/DownloadInvitation'
import { MediaGallery } from './components/sections/MediaGallery'
import { FlightPhotoStory } from './components/sections/FlightPhotoStory'
import { WeddingDetails } from './components/sections/WeddingDetails'
import { LoveMessage } from './components/sections/LoveMessage'
import { BoardingMessages } from './components/sections/BoardingMessages'
import { GuestLinkGenerator } from './components/sections/GuestLinkGenerator'
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

function App() {
  const reduce = useReducedMotion()
  const { guestName, setGuestName } = useGuestName()
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
  // Show the name gate on every page load / reload.
  // A scanned QR is the exception: its dedicated view opens the card directly.
  const [gateDismissed, setGateDismissed] = useState(cardView)
  const gateOpen = !gateDismissed

  const startMusicAfterGate = () => {
    // A direct attempt covers normal browsers. The short follow-up covers
    // embedded webviews that register the gate click only after its handler
    // finishes; calling play() on an already-playing element is harmless.
    void play()
    window.setTimeout(() => void play(), 160)
  }

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

  if (cardView) {
    return (
      <ScannedInvitationView
        config={weddingConfig}
        guestName={guestName}
        onOpenFullInvitation={() => {
          clearCardViewInUrl()
          startMusicAfterGate()
          setGateDismissed(true)
          setCardView(false)
          window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0)
        }}
      />
    )
  }

  return (
    // IMPORTANT: no `filter`/`transform` on this root — any filter value (even
    // blur(0px) left inline by Motion) turns it into the containing block for
    // every `position: fixed` descendant, which made the guest gate span the
    // whole page height and autofocus-scroll the layout to mid-page.
    <motion.div
      className="relative min-h-screen"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <ScrollProgress />

      <FloatingDecor />
      <FallingPetals />

      <GuestNameGate
        open={gateOpen}
        flightCode={weddingConfig.event.flightCode}
        onSubmit={(name) => {
          // The gate click is the browser-approved gesture that starts the
          // playlist with sound. Playback then continues across all 3 songs.
          startMusicAfterGate()
          setGuestName(name)
          setGateDismissed(true)
          // A soft burst of hearts welcomes the guest aboard.
          confetti({
            particleCount: 45,
            spread: 90,
            startVelocity: 32,
            scalar: 1.6,
            origin: { x: 0.5, y: 0.55 },
            shapes: [confetti.shapeFromText({ text: '💗', scalar: 1.6 })],
            disableForReducedMotion: true,
            zIndex: 60,
          })
        }}
        onSkip={() => {
          startMusicAfterGate()
          setGateDismissed(true)
        }}
      />

      <main className="relative z-10">
        <HeroSection
          config={weddingConfig}
          guestName={guestName}
          isMusicPlaying={isPlaying}
          onToggleMusic={toggle}
          musicEnabled={musicEnabled}
          isRevealed={gateDismissed}
        />

        <DownloadInvitation config={weddingConfig} guestName={guestName} />

        <WeddingDetails config={weddingConfig} />

        <RouteDivider className="bg-gradient-to-b from-ivory to-warm-white" />

        <MediaGallery />

        <FlightPhotoStory />

        <LoveMessage config={weddingConfig} />

        <BoardingMessages config={weddingConfig} guestName={guestName} />

        <GuestLinkGenerator />

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
