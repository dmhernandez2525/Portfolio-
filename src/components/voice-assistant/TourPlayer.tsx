/**
 * TourPlayer - Speechify-style floating player for guided tours
 *
 * This component provides a non-intrusive floating widget that stays
 * visible during tours without blocking the page content.
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play, Pause, SkipBack, SkipForward, X,
  Volume2, VolumeX, ChevronUp, ChevronDown,
  MessageCircle, HelpCircle
} from "lucide-react"
import { guidedTour, getTourProgress, nextTourStep, previousTourStep, endTour } from "@/services/voice-stocks/guidedTour"
import type { TourStep } from "@/types/voiceStocks"

interface TourPlayerProps {
  onOpenChat: () => void
  onAskQuestion: (question: string) => void
  speechEnabled: boolean
  onToggleSpeech: () => void
  isSpeaking: boolean
  onStopSpeaking: () => void
}

// Speed options
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const
type SpeedOption = typeof SPEED_OPTIONS[number]

export function TourPlayer({
  onOpenChat,
  onAskQuestion,
  speechEnabled,
  onToggleSpeech,
  isSpeaking,
  onStopSpeaking
}: TourPlayerProps) {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStep, setCurrentStep] = useState<TourStep | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 })
  const [speed, setSpeed] = useState<SpeedOption>(1)
  const [isExpanded, setIsExpanded] = useState(true)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  // Track if we're waiting for speech to finish before advancing
  const waitingForSpeechRef = useRef(false)
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Calculate delay based on speed (base 8 seconds for comprehensive tours)
  const getDelayForSpeed = useCallback((baseDelay: number = 8000) => {
    return Math.round(baseDelay / speed)
  }, [speed])

  // Auto-advance after speech finishes
  useEffect(() => {
    if (!isActive) return

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

      // Add delay after speech before advancing
      const delay = getDelayForSpeed(3000) // 3 second base delay after speech
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        if (!isPaused && isActive) {
          nextTourStep().catch(console.error)
        }
      }, delay)
    }

    // When speech starts, mark that we're waiting
    if (isSpeaking) {
      waitingForSpeechRef.current = true
      // Clear any pending auto-advance
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
  }, [isSpeaking, isActive, isPaused, getDelayForSpeed])

  // Subscribe to tour state changes
  useEffect(() => {
    const unsubscribeStep = guidedTour.onStepChange((step, _index) => {
      setCurrentStep(step)
      setProgress(getTourProgress())
      setIsActive(guidedTour.getState().isActive)

      // Pause the tour's internal timer - we manage timing ourselves
      if (step) {
        guidedTour.pause()
      }
    })

    const unsubscribeEnd = guidedTour.onTourEnd(() => {
      setIsActive(false)
      setCurrentStep(null)
      setProgress({ current: 0, total: 0, percent: 0 })
      setIsPaused(false)
    })

    // Check initial state
    const state = guidedTour.getState()
    setIsActive(state.isActive)
    if (state.isActive) {
      setCurrentStep(guidedTour.getCurrentStep())
      setProgress(getTourProgress())
    }

    return () => {
      unsubscribeStep()
      unsubscribeEnd()
    }
  }, [])

  const handlePlayPause = useCallback(() => {
    if (isPaused) {
      setIsPaused(false)
      // Resume will trigger auto-advance on next speech end
    } else {
      setIsPaused(true)
      // Stop any pending auto-advance
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current)
        autoAdvanceTimeoutRef.current = null
      }
      // Stop speaking
      if (isSpeaking) {
        onStopSpeaking()
      }
    }
  }, [isPaused, isSpeaking, onStopSpeaking])

  const handleNext = useCallback(() => {
    // Clear pending auto-advance
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }
    nextTourStep().catch(console.error)
  }, [])

  const handlePrevious = useCallback(() => {
    // Clear pending auto-advance
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }
    previousTourStep().catch(console.error)
  }, [])

  const handleEnd = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
    }
    endTour()
  }, [])

  const handleSpeedChange = useCallback((newSpeed: SpeedOption) => {
    setSpeed(newSpeed)
    setShowSpeedMenu(false)
  }, [])

  const handleAskAboutThis = useCallback(() => {
    if (currentStep) {
      onAskQuestion(`Tell me more about the ${currentStep.title} section`)
    }
  }, [currentStep, onAskQuestion])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="tour-player"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-center"
        >
        {/* Main Player Widget */}
        <div className="bg-background/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden w-16">
          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-2 flex justify-center hover:bg-muted/50 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col items-center pb-2"
              >
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

                {/* Ask Question Button */}
                <button
                  onClick={handleAskAboutThis}
                  className="p-2 rounded-lg hover:bg-muted transition-colors mb-2"
                  title="Ask about this section"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                {/* Open Full Chat */}
                <button
                  onClick={onOpenChat}
                  className="p-2 rounded-lg hover:bg-muted transition-colors mb-2"
                  title="Open full chat"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                {/* Divider */}
                <div className="w-8 h-px bg-border mb-2" />

                {/* End Tour */}
                <button
                  onClick={handleEnd}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                  title="End tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Current Step Info Tooltip (shows on hover or when expanded) */}
        {currentStep && isExpanded && (
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
      )}
    </AnimatePresence>
  )
}

export default TourPlayer
