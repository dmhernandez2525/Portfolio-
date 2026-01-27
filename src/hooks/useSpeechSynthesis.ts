/**
 * useSpeechSynthesis Hook
 *
 * A robust Text-to-Speech hook that handles:
 * - Chrome's async voice loading
 * - Browser autoplay policy (user interaction tracking)
 * - Consistent error handling
 * - Speech state management
 *
 * This hook is shared between AIAssistant and AskAboutMe components.
 */

import { useState, useCallback, useEffect, useRef } from 'react'

interface UseSpeechSynthesisOptions {
  /** Initial enabled state */
  initialEnabled?: boolean
  /** Default speech rate (0.1 to 10) */
  defaultRate?: number
  /** Default pitch (0 to 2) */
  defaultPitch?: number
  /** Default volume (0 to 1) */
  defaultVolume?: number
  /** Enable debug logging */
  debug?: boolean
}

interface UseSpeechSynthesisReturn {
  /** Speak the given text */
  speak: (text: string, rate?: number) => void
  /** Stop any current speech */
  stop: () => void
  /** Whether speech is currently playing */
  isSpeaking: boolean
  /** Whether the TTS system is ready (voices loaded + user has interacted) */
  isReady: boolean
  /** Whether TTS is enabled by the user */
  enabled: boolean
  /** Toggle or set enabled state */
  setEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void
  /** Toggle enabled state */
  toggleEnabled: () => void
  /** Whether voices have been loaded */
  voicesLoaded: boolean
  /** Whether user has interacted with the page */
  hasUserInteracted: boolean
}

/**
 * Speech synthesis hook with robust browser compatibility
 */
export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const {
    initialEnabled = true,
    defaultRate = 1.0,
    defaultPitch = 1.0,
    defaultVolume = 0.8,
    debug = false,
  } = options

  // State
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Refs for stable callbacks
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const pendingSpeakRef = useRef<{ text: string; rate: number } | null>(null)

  const log = useCallback(
    (message: string, data?: Record<string, unknown>) => {
      if (debug) {
        console.log(`[TTS] ${message}`, data ?? '')
      }
    },
    [debug]
  )

  // Check if speech synthesis is available
  const isAvailable =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  // Handle voice loading (Chrome loads voices async)
  useEffect(() => {
    if (!isAvailable) return

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        setVoicesLoaded(true)
        log('Voices loaded', { count: voices.length })

        // If we had a pending speak, execute it now
        if (pendingSpeakRef.current) {
          const { text, rate } = pendingSpeakRef.current
          pendingSpeakRef.current = null
          // Use setTimeout to avoid calling during the event handler
          setTimeout(() => executeSpeech(text, rate), 0)
        }
      }
    }

    // Check immediately (Firefox has voices ready synchronously)
    checkVoices()

    // Also listen for voiceschanged (Chrome)
    window.speechSynthesis.addEventListener('voiceschanged', checkVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', checkVoices)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable])

  // Track user interaction for autoplay policy
  useEffect(() => {
    if (!isAvailable) return

    const markInteracted = () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true)
        log('User interaction detected')

        // If we had a pending speak, execute it now
        if (pendingSpeakRef.current && voicesLoaded) {
          const { text, rate } = pendingSpeakRef.current
          pendingSpeakRef.current = null
          setTimeout(() => executeSpeech(text, rate), 0)
        }
      }
    }

    // Listen for any user interaction
    document.addEventListener('click', markInteracted, { once: false })
    document.addEventListener('keydown', markInteracted, { once: false })
    document.addEventListener('touchstart', markInteracted, { once: false })

    return () => {
      document.removeEventListener('click', markInteracted)
      document.removeEventListener('keydown', markInteracted)
      document.removeEventListener('touchstart', markInteracted)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable, hasUserInteracted, voicesLoaded])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isAvailable) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isAvailable])

  // Core speech execution (internal)
  const executeSpeech = useCallback(
    (text: string, rate: number) => {
      if (!isAvailable) return

      log('Executing speech', { textLength: text.length, rate })

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = defaultPitch
      utterance.volume = defaultVolume

      // Try to select a good voice (prefer English)
      const voices = window.speechSynthesis.getVoices()
      const englishVoice = voices.find(
        (v) => v.lang.startsWith('en') && v.localService
      )
      if (englishVoice) {
        utterance.voice = englishVoice
      }

      utterance.onstart = () => {
        log('Speech started')
        setIsSpeaking(true)
      }

      utterance.onend = () => {
        log('Speech ended')
        setIsSpeaking(false)
        utteranceRef.current = null
      }

      utterance.onerror = (event) => {
        log('Speech error', { error: event.error })
        setIsSpeaking(false)
        utteranceRef.current = null
      }

      utteranceRef.current = utterance

      // Chrome bug workaround: pause and resume if speech gets stuck
      // This happens when speak() is called too quickly after cancel()
      window.speechSynthesis.speak(utterance)

      // Check if speech actually started after a short delay
      setTimeout(() => {
        if (
          utteranceRef.current === utterance &&
          !window.speechSynthesis.speaking &&
          !window.speechSynthesis.pending
        ) {
          log('Speech may be stuck, attempting retry')
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(utterance)
        }
      }, 100)
    },
    [isAvailable, defaultPitch, defaultVolume, log]
  )

  // Public speak function
  const speak = useCallback(
    (text: string, rate?: number) => {
      if (!enabled) {
        log('Speech disabled, ignoring')
        return
      }

      if (!isAvailable) {
        log('Speech synthesis not available')
        return
      }

      const effectiveRate = rate ?? defaultRate

      log('Speak requested', {
        textLength: text.length,
        rate: effectiveRate,
        voicesLoaded,
        hasUserInteracted,
      })

      // If not ready yet, queue the speech for later
      if (!voicesLoaded || !hasUserInteracted) {
        log('Not ready, queuing speech')
        pendingSpeakRef.current = { text, rate: effectiveRate }
        return
      }

      executeSpeech(text, effectiveRate)
    },
    [
      enabled,
      isAvailable,
      defaultRate,
      voicesLoaded,
      hasUserInteracted,
      executeSpeech,
      log,
    ]
  )

  // Stop speech
  const stop = useCallback(() => {
    if (isAvailable) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      utteranceRef.current = null
      log('Speech stopped')
    }
  }, [isAvailable, log])

  // Toggle enabled
  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      const newValue = !prev
      if (!newValue && isAvailable) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
      return newValue
    })
  }, [isAvailable])

  // Enhanced setEnabled that also stops speech when disabling
  const handleSetEnabled = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setEnabled((prev) => {
        const newValue = typeof value === 'function' ? value(prev) : value
        if (!newValue && isAvailable) {
          window.speechSynthesis.cancel()
          setIsSpeaking(false)
        }
        return newValue
      })
    },
    [isAvailable]
  )

  const isReady = voicesLoaded && hasUserInteracted

  return {
    speak,
    stop,
    isSpeaking,
    isReady,
    enabled,
    setEnabled: handleSetEnabled,
    toggleEnabled,
    voicesLoaded,
    hasUserInteracted,
  }
}

export type { UseSpeechSynthesisOptions, UseSpeechSynthesisReturn }
