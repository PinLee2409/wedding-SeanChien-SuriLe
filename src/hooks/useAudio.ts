import { useCallback, useEffect, useRef, useState } from 'react'

export interface AudioTrack {
  src: string
  title: string
  artist: string
}

const VOLUME_STORAGE_KEY = 'wedding.music.volume.v1'
const MUTED_STORAGE_KEY = 'wedding.music.muted.v1'

const clampVolume = (value: number) => Math.min(1, Math.max(0, value))

function readStoredVolume(fallback: number) {
  try {
    const storedValue = window.localStorage.getItem(VOLUME_STORAGE_KEY)
    if (storedValue === null) return fallback
    const stored = Number(storedValue)
    return Number.isFinite(stored) ? clampVolume(stored) : fallback
  } catch {
    return fallback
  }
}

function readStoredMuted() {
  try {
    return window.localStorage.getItem(MUTED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function resolveTrackSource(src: string) {
  if (/^(?:https?:|blob:|data:)/i.test(src)) return src
  return `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`
}

/**
 * Controls a sequential wedding playlist with one reusable audio element.
 * Playback begins only from an explicit visitor gesture, then moves through
 * every track and wraps back to the first one. Volume and mute preferences are
 * shared by both invitation variants on the same GitHub Pages origin.
 */
export function useAudio(
  tracks: readonly AudioTrack[],
  initialVolume = 0.55,
) {
  const safeInitialVolume = clampVolume(initialVolume)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const indexRef = useRef(0)
  const wantsPlaybackRef = useRef(false)
  const failedTracksRef = useRef(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [volume, setVolumeState] = useState(() =>
    readStoredVolume(safeInitialVolume),
  )
  const [muted, setMutedState] = useState(readStoredMuted)
  const volumeRef = useRef(volume)
  const mutedRef = useRef(muted)

  useEffect(() => {
    if (tracks.length === 0) return

    const audio = new Audio()
    audio.preload = 'auto'
    audio.loop = false
    audio.volume = volumeRef.current
    audio.muted = mutedRef.current
    audio.src = resolveTrackSource(tracks[0].src)
    audioRef.current = audio

    const loadTrack = (nextIndex: number, continuePlaying: boolean) => {
      const nextTrack = tracks[nextIndex]
      if (!nextTrack) return

      indexRef.current = nextIndex
      setCurrentTrackIndex(nextIndex)
      audio.src = resolveTrackSource(nextTrack.src)
      audio.load()

      if (!continuePlaying) return

      void audio.play().catch(() => {
        // The error event normally advances to the next track. This catch is
        // still required because play() rejection must never become unhandled.
        setIsPlaying(false)
      })
    }

    const advance = () => {
      if (!wantsPlaybackRef.current) return
      failedTracksRef.current += 1

      // If an entire cycle fails, stop instead of spinning through bad URLs.
      if (failedTracksRef.current >= tracks.length) {
        wantsPlaybackRef.current = false
        setIsPlaying(false)
        return
      }

      const nextIndex = (indexRef.current + 1) % tracks.length
      loadTrack(nextIndex, true)
    }

    const handleEnded = () => {
      failedTracksRef.current = 0
      const nextIndex = (indexRef.current + 1) % tracks.length
      loadTrack(nextIndex, wantsPlaybackRef.current)
    }
    const handleError = () => advance()
    const handlePlaying = () => {
      failedTracksRef.current = 0
      setIsPlaying(true)
    }
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('pause', handlePause)
    audio.load()

    return () => {
      wantsPlaybackRef.current = false
      audio.pause()
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('pause', handlePause)
      audio.removeAttribute('src')
      audioRef.current = null
    }
  }, [tracks])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || tracks.length === 0) return

    wantsPlaybackRef.current = true
    failedTracksRef.current = 0
    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      // A browser can still reject playback in unusual embed contexts. The
      // visible play control remains available for the next visitor gesture.
      wantsPlaybackRef.current = false
      setIsPlaying(false)
    }
  }, [tracks.length])

  const pause = useCallback(() => {
    wantsPlaybackRef.current = false
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause()
      return
    }
    void play()
  }, [isPlaying, pause, play])

  const setVolume = useCallback((nextValue: number) => {
    const nextVolume = clampVolume(nextValue)
    volumeRef.current = nextVolume
    setVolumeState(nextVolume)

    const audio = audioRef.current
    if (audio) audio.volume = nextVolume

    // Raising the slider is treated as an explicit request to hear the music.
    if (nextVolume > 0 && mutedRef.current) {
      mutedRef.current = false
      setMutedState(false)
      if (audio) audio.muted = false
    }

    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(nextVolume))
      if (nextVolume > 0) {
        window.localStorage.setItem(MUTED_STORAGE_KEY, 'false')
      }
    } catch {
      // Storage may be unavailable in private or hardened browsing modes.
    }
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    const effectivelyMuted = mutedRef.current || volumeRef.current === 0
    const nextMuted = !effectivelyMuted

    if (!nextMuted && volumeRef.current === 0) {
      const restoredVolume = safeInitialVolume || 0.55
      volumeRef.current = restoredVolume
      setVolumeState(restoredVolume)
      if (audio) audio.volume = restoredVolume
      try {
        window.localStorage.setItem(VOLUME_STORAGE_KEY, String(restoredVolume))
      } catch {
        // Keep the in-memory setting even when storage is unavailable.
      }
    }

    mutedRef.current = nextMuted
    setMutedState(nextMuted)
    if (audio) audio.muted = nextMuted

    try {
      window.localStorage.setItem(MUTED_STORAGE_KEY, String(nextMuted))
    } catch {
      // Keep the in-memory setting even when storage is unavailable.
    }
  }, [safeInitialVolume])

  return {
    enabled: tracks.length > 0,
    isPlaying,
    isMuted: muted || volume === 0,
    volume,
    currentTrack: tracks[currentTrackIndex] ?? tracks[0],
    currentTrackIndex,
    play,
    pause,
    toggle,
    toggleMute,
    setVolume,
  }
}
