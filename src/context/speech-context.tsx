/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { useSpeechSynthesis, type SpeechSynthesisOptions } from "@/hooks/useSpeechSynthesis"

export type SpeechSource = "assistant" | "tour" | "ask" | "system" | string

type SpeechQueueMeta = {
  source?: SpeechSource
  priority?: "queue" | "immediate"
  id?: string
}

interface SpeechRequest {
  id: string
  text: string
  options?: SpeechSynthesisOptions
  source: SpeechSource
  resolve: () => void
  reject: (error: Error) => void
}

// Storage keys for persistence
const STORAGE_KEYS = {
  rate: 'speech-rate',
  pitch: 'speech-pitch',
  volume: 'speech-volume',
  voice: 'speech-voice',
}

// Default values
const DEFAULTS = {
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8,
}

interface SpeechContextValue {
  speakText: (text: string, options?: SpeechSynthesisOptions, meta?: SpeechQueueMeta) => Promise<void>
  stopSpeaking: () => void
  cancelSource: (source: SpeechSource) => void
  isSpeaking: boolean
  isPaused: boolean
  speechEnabled: boolean
  toggleSpeechEnabled: () => void
  setSpeechEnabled: (value: boolean | ((prev: boolean) => boolean)) => void
  currentSource: SpeechSource | null
  queueLength: number
  pause: () => void
  resume: () => void
  // Voice settings
  speechRate: number
  setSpeechRate: (rate: number) => void
  speechPitch: number
  setSpeechPitch: (pitch: number) => void
  speechVolume: number
  setSpeechVolume: (volume: number) => void
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  setSelectedVoice: (voice: SpeechSynthesisVoice | string | null) => void
}

const SpeechContext = createContext<SpeechContextValue | undefined>(undefined)

const generateRequestId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

// Load from localStorage with fallback
const loadSetting = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return defaultValue
    return JSON.parse(stored) as T
  } catch {
    return defaultValue
  }
}

// Save to localStorage
const saveSetting = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors
  }
}

export function SpeechProvider({ children }: { children: ReactNode }) {
  const {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    enabled,
    setEnabled,
    toggleEnabled,
    voices,
    selectedVoice,
    setVoice,
  } = useSpeechSynthesis()

  const [queue, setQueue] = useState<SpeechRequest[]>([])
  const [currentRequest, setCurrentRequest] = useState<SpeechRequest | null>(null)
  const [currentSource, setCurrentSource] = useState<SpeechSource | null>(null)
  const isMountedRef = useRef(true)

  // Voice settings with persistence
  const [speechRate, setSpeechRateState] = useState(() => loadSetting(STORAGE_KEYS.rate, DEFAULTS.rate))
  const [speechPitch, setSpeechPitchState] = useState(() => loadSetting(STORAGE_KEYS.pitch, DEFAULTS.pitch))
  const [speechVolume, setSpeechVolumeState] = useState(() => loadSetting(STORAGE_KEYS.volume, DEFAULTS.volume))

  // Wrapped setters that persist to localStorage
  const setSpeechRate = useCallback((rate: number) => {
    setSpeechRateState(rate)
    saveSetting(STORAGE_KEYS.rate, rate)
  }, [])

  const setSpeechPitch = useCallback((pitch: number) => {
    setSpeechPitchState(pitch)
    saveSetting(STORAGE_KEYS.pitch, pitch)
  }, [])

  const setSpeechVolume = useCallback((volume: number) => {
    setSpeechVolumeState(volume)
    saveSetting(STORAGE_KEYS.volume, volume)
  }, [])

  // Restore voice selection when voices load
  useEffect(() => {
    if (voices.length === 0) return
    const savedVoiceName = loadSetting<string | null>(STORAGE_KEYS.voice, null)
    if (savedVoiceName) {
      setVoice(savedVoiceName)
    }
  }, [voices, setVoice])

  // Wrapped voice setter that persists
  const setSelectedVoice = useCallback((voice: SpeechSynthesisVoice | string | null) => {
    setVoice(voice)
    const voiceName = typeof voice === 'string' ? voice : voice?.name ?? null
    saveSetting(STORAGE_KEYS.voice, voiceName)
  }, [setVoice])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      stop()
      setQueue([])
      setCurrentRequest(null)
    }
  }, [stop])

  const currentRequestIdRef = useRef<string | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (currentRequest || queue.length === 0) return

    const [next, ...rest] = queue
    setQueue(rest)
    setCurrentRequest(next)
    setCurrentSource(next.source)
    currentRequestIdRef.current = next.id

    speak(next.text, next.options)
      .then(() => next.resolve())
      .catch((error) => next.reject(error))
      .finally(() => {
        if (!isMountedRef.current) return
        if (currentRequestIdRef.current !== next.id) return
        currentRequestIdRef.current = null
        setCurrentRequest(null)
        setCurrentSource(null)
      })
  }, [queue, currentRequest, speak])
  /* eslint-enable react-hooks/set-state-in-effect */

  const speakText = useCallback(
    (text: string, options?: SpeechSynthesisOptions, meta?: SpeechQueueMeta) => {
      const source = meta?.source ?? "assistant"
      const priority = meta?.priority ?? "queue"

      // Merge context settings with passed options (options take precedence)
      const mergedOptions: SpeechSynthesisOptions = {
        rate: options?.rate ?? speechRate,
        pitch: options?.pitch ?? speechPitch,
        volume: options?.volume ?? speechVolume,
        ...options,
      }

      return new Promise<void>((resolve, reject) => {
        const request: SpeechRequest = {
          id: meta?.id ?? generateRequestId(),
          text,
          options: mergedOptions,
          source,
          resolve,
          reject,
        }

        setQueue(prev => {
          if (priority === "immediate") {
            return [request, ...prev.filter(item => item.source !== source)]
          }
          return [...prev, request]
        })

        if (priority === "immediate") {
          stop()
        }
      })
    },
    [stop, speechRate, speechPitch, speechVolume]
  )

  const stopSpeaking = useCallback(() => {
    setQueue([])
    stop()
  }, [stop])

  const cancelSource = useCallback(
    (source: SpeechSource) => {
      setQueue(prev => prev.filter(item => item.source !== source))
      if (currentRequest?.source === source) {
        stop()
      }
    },
    [currentRequest, stop]
  )

  const value: SpeechContextValue = {
    speakText,
    stopSpeaking,
    cancelSource,
    isSpeaking,
    isPaused,
    speechEnabled: enabled,
    toggleSpeechEnabled: toggleEnabled,
    setSpeechEnabled: setEnabled,
    currentSource,
    queueLength: queue.length + (currentRequest ? 1 : 0),
    pause,
    resume,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    speechVolume,
    setSpeechVolume,
    voices,
    selectedVoice,
    setSelectedVoice,
  }

  return (
    <SpeechContext.Provider value={value}>
      {children}
    </SpeechContext.Provider>
  )
}

export function useSpeechController() {
  const context = useContext(SpeechContext)
  if (!context) {
    throw new Error("useSpeechController must be used within a SpeechProvider")
  }
  return context
}
