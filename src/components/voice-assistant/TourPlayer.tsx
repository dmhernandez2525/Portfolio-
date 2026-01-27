/**
 * TourPlayer - Speechify-style floating player
 *
 * This component provides:
 * - Always visible mini FAB when collapsed
 * - Expanded player during tours with controls
 * - Speech synthesis with adjustable speed
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, ChevronDown,
  MessageCircle, Sparkles
} from "lucide-react"
import { guidedTour, getTourProgress, nextTourStep, previousTourStep, endTour } from "@/services/voice-stocks/guidedTour"
import type { TourStep } from "@/types/voiceStocks"

interface TourPlayerProps {
  onOpenChat: () => void
  speechEnabled: boolean
  onToggleSpeech: () => void
  isSpeaking: boolean
  onStopSpeaking: () => void
  onSpeak?: (text: string, rate?: number) => void
}

// Speed options for TTS
const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const
type SpeedOption = typeof SPEED_OPTIONS[number]

export function TourPlayer({
  onOpenChat,
  speechEnabled,
  onToggleSpeech,
  isSpeaking,
  onStopSpeaking,
  onSpeak
}: TourPlayerProps) {
  const [tourActive, setTourActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStep, setCurrentStep] = useState<TourStep | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 })
  const [speed, setSpeed] = useState<SpeedOption>(1)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  // Track if we're waiting for speech to finish before advancing
  const waitingForSpeechRef = useRef(false)
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speedRef = useRef(speed)

  // Keep speed ref in sync
  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  // Calculate delay based on speed
  const getDelayForSpeed = useCallback((baseDelay: number = 3000) => {
    return Math.round(baseDelay / speedRef.current)
  }, [])

  // Auto-advance after speech finishes
  useEffect(() => {
    if (!tourActive) return

    // Clear any pending timeout when paused
    if (isPaused) {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current)
        autoAdvanceTimeoutRef.current = null
      }
      return
    }

    // When speech ends and we were waiting, schedule next step
    if (!isSpeaking && waitingForSpeechRef.current) {
      waitingForSpeechRef.current = false

      const delay = getDelayForSpeed(3000)
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        if (!isPaused && tourActive) {
          nextTourStep().catch(console.error)
        }
      }, delay)
    }

    // When speech starts, mark that we're waiting
    if (isSpeaking) {
      waitingForSpeechRef.current = true
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current)
        autoAdvanceTimeoutRef.current = null
      }
    }

    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current)
      }
    }
  }, [isSpeaking, tourActive, isPaused, getDelayForSpeed])

  // Subscribe to tour state changes
  useEffect(() => {
    const unsubscribeStep = guidedTour.onStepChange((step) => {
      setCurrentStep(step)
      setProgress(getTourProgress())
      const active = guidedTour.getState().isActive
      setTourActive(active)

      // Auto-expand when tour starts
      if (active && step) {
        setIsExpanded(true)
        guidedTour.pause() // We manage timing ourselves
      }
    })

    const unsubscribeEnd = guidedTour.onTourEnd(() => {
      setTourActive(false)
      setCurrentStep(null)
      setProgress({ current: 0, total: 0, percent: 0 })
      setIsPaused(false)
      // Collapse when tour ends
      setIsExpanded(false)
    })

    // Intercept speak callbacks to apply our speed setting
    const unsubscribeSpeak = guidedTour.onSpeak((text) => {
      if (onSpeak) {
        onSpeak(text, speedRef.current)
      }
    })

    // Check initial state
    const state = guidedTour.getState()
    setTourActive(state.isActive)
    if (state.isActive) {
      setCurrentStep(guidedTour.getCurrentStep())
      setProgress(getTourProgress())
      setIsExpanded(true)
    }

    return () => {
      unsubscribeStep()
      unsubscribeEnd()
      unsubscribeSpeak()
    }
  }, [onSpeak])

  const handlePlayPause = useCallback(() => {
    if (isPaused) {
      setIsPaused(false)
    } else {
      setIsPaused(true)
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current)
        autoAdvanceTimeoutRef.current = null
      }
      if (isSpeaking) {
        onStopSpeaking()
      }
    }
  }, [isPaused, isSpeaking, onStopSpeaking])

  const handleNext = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }
    nextTourStep().catch(console.error)
  }, [])

  const handlePrevious = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }
    previousTourStep().catch(console.error)
  }, [])

  const handleCollapse = useCallback(() => {
    // If tour is active, just collapse the UI (don't end tour)
    if (tourActive) {
      setIsExpanded(false)
    } else {
      // If no tour, just toggle expanded state
      setIsExpanded(!isExpanded)
    }
  }, [tourActive, isExpanded])

  const handleEndTour = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
    }
    endTour()
    setIsExpanded(false)
  }, [])

  const handleSpeedChange = useCallback((newSpeed: SpeedOption) => {
    setSpeed(newSpeed)
    setShowSpeedMenu(false)
  }, [])

  const handleFABClick = useCallback(() => {
    if (tourActive) {
      // If tour is active, expand the player
      setIsExpanded(true)
    } else {
      // If no tour, open chat
      onOpenChat()
    }
  }, [tourActive, onOpenChat])

  // Render collapsed mini state - same position as expanded (middle of page)
  if (!isExpanded) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50"
      >
        <motion.button
          onClick={handleFABClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-2xl bg-background/95 backdrop-blur-lg border border-border shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group relative"
          title={tourActive ? "Expand tour player" : "Chat with AI Assistant"}
        >
          {tourActive ? (
            <>
              {/* Show progress ring when tour is active */}
              <svg className="absolute inset-1 w-12 h-12 -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress.percent / 100)}`}
                  className="text-primary transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <Sparkles className="w-5 h-5 text-primary relative z-10" />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                </span>
              )}
            </>
          ) : (
            <>
              <MessageCircle className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              </span>
            </>
          )}
        </motion.button>
      </motion.div>
    )
  }

  // Render expanded player
  return (
    <motion.div
      key="tour-player-expanded"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-center"
    >
      {/* Main Player Widget */}
      <div className="bg-background/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden w-16">
        {/* Collapse Toggle */}
        <button
          onClick={handleCollapse}
          className="w-full p-2 flex justify-center hover:bg-muted/50 transition-colors"
          title="Collapse"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center pb-2">
          {tourActive ? (
            <>
              {/* Progress Ring */}
              <div className="relative w-12 h-12 mb-2">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress.percent / 100)}`}
                    className="text-primary transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {progress.current}/{progress.total}
                </span>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  isPaused
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted hover:bg-muted/80"
                }`}
                title={isPaused ? "Resume tour" : "Pause tour"}
              >
                {isPaused ? (
                  <Play className="w-5 h-5 ml-0.5" />
                ) : isSpeaking ? (
                  <div className="flex gap-0.5 items-center">
                    <span className="w-1 h-3 bg-current rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                ) : (
                  <Pause className="w-5 h-5" />
                )}
              </button>

              {/* Navigation Buttons */}
              <div className="flex flex-col gap-1 mb-2">
                <button
                  onClick={handlePrevious}
                  disabled={progress.current <= 1}
                  className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous step"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={progress.current >= progress.total}
                  className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Divider */}
              <div className="w-8 h-px bg-border mb-2" />

              {/* Speed Control */}
              <div className="relative mb-2">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-2 py-1 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  title="Playback speed"
                >
                  {speed}x
                </button>

                <AnimatePresence>
                  {showSpeedMenu && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute right-full mr-2 top-0 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[60px]"
                    >
                      {SPEED_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`w-full px-3 py-1 text-xs text-left hover:bg-muted transition-colors ${
                            speed === s ? "text-primary font-medium" : ""
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Voice Toggle */}
              <button
                onClick={isSpeaking ? onStopSpeaking : onToggleSpeech}
                className={`p-2 rounded-lg transition-colors mb-2 ${
                  speechEnabled ? "hover:bg-muted" : "text-muted-foreground hover:bg-muted"
                }`}
                title={isSpeaking ? "Stop speaking" : speechEnabled ? "Disable voice" : "Enable voice"}
              >
                {isSpeaking ? (
                  <Volume2 className="w-4 h-4 animate-pulse text-primary" />
                ) : speechEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Divider */}
              <div className="w-8 h-px bg-border mb-2" />

              {/* Open Chat */}
              <button
                onClick={onOpenChat}
                className="p-2 rounded-lg hover:bg-muted transition-colors mb-2"
                title="Open chat"
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              {/* End Tour - smaller, less prominent */}
              <button
                onClick={handleEndTour}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                title="End tour"
              >
                End
              </button>
            </>
          ) : (
            <>
              {/* Non-tour expanded state */}
              <div className="p-2 text-center">
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-2">AI Assistant</p>
              </div>

              <button
                onClick={onOpenChat}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-2 mx-2"
                title="Open chat"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Current Step Info Tooltip */}
      {currentStep && tourActive && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 w-64 bg-background/95 backdrop-blur-lg border border-border rounded-xl p-4 shadow-xl pointer-events-none"
        >
          <h4 className="font-semibold text-sm mb-1">{currentStep.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {currentStep.description}
          </p>
          <div className="mt-2 text-[10px] text-muted-foreground/60">
            Step {progress.current} of {progress.total}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default TourPlayer
