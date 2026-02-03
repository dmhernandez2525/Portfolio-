/**
 * AIAssistant - Core AI assistant component
 *
 * Features:
 * - TourPlayer: Speechify-style floating player (always visible as mini FAB or expanded)
 * - Chat Dialog: Full chat interface opened via FAB or custom events
 * - Speech Recognition: Voice input via Web Speech API
 * - Text-to-Speech: Voice output via useSpeechSynthesis hook
 * - Voice Commands: Navigation and tour control via voiceCommandRouter
 *
 * Place this component in RootLayout so it persists across all pages.
 */

import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic, MicOff, Send, Bot, User,
  Volume2, VolumeX, Loader2, Sparkles, Navigation, Repeat, Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import { getFallbackResponse, generateSystemPrompt } from "./danielContext"
import { processVoiceCommand, navigationService } from "@/services/voice-stocks"
import { guidedTour } from "@/services/voice-stocks/guidedTour"
import { TourPlayer } from "./TourPlayer"
import { useSpeechController } from "@/context/speech-context"
import type { CommandContext } from "@/types/voiceStocks"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isNavigation?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const speechRecognitionSupported = typeof window !== "undefined" && getSpeechRecognition() !== null

export function AIAssistant() {
  const navigate = useNavigate()

  // Configure navigation service with React Router
  useEffect(() => {
    navigationService.setNavigate(navigate)
  }, [navigate])

  // UI State
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! I'm Daniel's AI assistant. Ask me anything — skills, projects, random fun facts. Or say \"give me a tour\" to explore the site!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [tourActive, setTourActive] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [talkMode, setTalkMode] = useState(false)

  // Text-to-Speech via shared speech controller (queue + Chrome handling)
  const {
    speakText,
    stopSpeaking,
    cancelSource,
    isSpeaking,
    speechEnabled,
    toggleSpeechEnabled,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    speechVolume,
    setSpeechVolume,
    voices,
    selectedVoice,
    setSelectedVoice,
  } = useSpeechController()

  // Voice settings menu state
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const wasSpeakingRef = useRef(false)
  const talkModeRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<Message[]>(messages)
  const isSpeakingRef = useRef(isSpeaking)
  const isListeningRef = useRef(isListening)
  const suppressTranscriptCommitRef = useRef(false)

  // Keep talkModeRef in sync with state for access in callbacks
  useEffect(() => {
    talkModeRef.current = talkMode
  }, [talkMode])

  // Keep message ref in sync with state
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    isSpeakingRef.current = isSpeaking
  }, [isSpeaking])

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])


  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Listen for custom 'open-ai-chat' event from CTAs
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true)
    window.addEventListener('open-ai-chat', handleOpenChat)
    return () => window.removeEventListener('open-ai-chat', handleOpenChat)
  }, [])

  // Listen for voice command stop events
  useEffect(() => {
    const handleStopSpeech = () => stopSpeaking()
    window.addEventListener('assistant-stop-speech', handleStopSpeech)
    return () => window.removeEventListener('assistant-stop-speech', handleStopSpeech)
  }, [stopSpeaking])

  useEffect(() => {
    const handleCancelTourSpeech = () => cancelSource("tour")
    window.addEventListener('assistant-cancel-tour-speech', handleCancelTourSpeech)
    return () => window.removeEventListener('assistant-cancel-tour-speech', handleCancelTourSpeech)
  }, [cancelSource])

  // Cleanup speech recognition on unmount (TTS cleanup handled by hook)
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch { /* ignore */ }
      }
    }
  }, [])

  // Connect to guided tour state and auto-enable Talk Mode during tours
  useEffect(() => {
    const unsubscribeStep = guidedTour.onStepChange(() => {
      const isActive = guidedTour.getState().isActive
      setTourActive(isActive)

      // When tour starts: close the chat modal so content is visible
      // Auto-enable Talk Mode for hands-free navigation via TourPlayer
      if (isActive && !talkModeRef.current) {
        setTalkMode(true)
        // Close the chat modal so the tour overlay doesn't block content
        setIsOpen(false)
      }
    })

    const unsubscribeEnd = guidedTour.onTourEnd(() => {
      setTourActive(false)
      // Optionally disable Talk Mode when tour ends
      // User can keep it on if they want continuous conversation
    })

    setTourActive(guidedTour.getState().isActive)

    return () => {
      unsubscribeStep()
      unsubscribeEnd()
    }
  }, [])

  // Callback for TourPlayer to trigger speech with custom rate
  // Uses shared speech controller so audio queues with assistant replies
  const handleTourSpeak = useCallback((text: string, rate?: number) => {
    speakText(text, { rate }, { source: "tour" })
  }, [speakText])

  // Speech Recognition
  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognition()
    if (!SpeechRecognitionCtor) {
      setSpeechError("Speech recognition is not supported in your browser.")
      setTimeout(() => setSpeechError(null), 4000)
      return
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
      recognitionRef.current = null
    }

    setTimeout(() => {
      try {
        const recognition = new SpeechRecognitionCtor()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = "en-US"
        recognition.maxAlternatives = 1

        let finalTranscript = ""
        let accumulatedForSession = "" // Track everything accumulated in this session for Talk Mode
        let lastInterimTranscript = "" // Track interim to commit on end
        let hadFinalResult = false

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let interim = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
              accumulatedForSession += transcript
              hadFinalResult = true
            } else {
              interim += transcript
            }
          }
          lastInterimTranscript = interim
          setInterimTranscript(interim)
          if (finalTranscript) {
            const textToCommit = finalTranscript
            finalTranscript = ""
            lastInterimTranscript = ""
            setInterimTranscript("")
            setInput(prev => prev + textToCommit)
          }
        }

        recognition.onstart = () => {
          setIsListening(true)
          setSpeechError(null)
          suppressTranscriptCommitRef.current = false
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            setSpeechError("Microphone access denied. Please allow microphone access.")
          } else if (event.error === 'audio-capture') {
            setSpeechError("No microphone found. Please connect a microphone.")
          } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
            setSpeechError(`Speech recognition error: ${event.error}`)
          }
          setIsListening(false)
          setInterimTranscript("")
          if (event.error !== 'aborted' && event.error !== 'no-speech') {
            setTimeout(() => setSpeechError(null), 5000)
          }
        }

        recognition.onend = () => {
          const leftoverTranscript = (!hadFinalResult && lastInterimTranscript) ? lastInterimTranscript : ""
          if (leftoverTranscript) {
            accumulatedForSession += leftoverTranscript
          }

          setIsListening(false)
          setInterimTranscript("")
          recognitionRef.current = null

          if (leftoverTranscript && !talkModeRef.current && !suppressTranscriptCommitRef.current) {
            setInput(prev => prev + leftoverTranscript)
          }
          suppressTranscriptCommitRef.current = false

          if (talkModeRef.current) {
            const fullTranscript = accumulatedForSession.trim()
            if (fullTranscript) {
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('talk-mode-send', { detail: { transcript: fullTranscript } }))
              }, 100)
            }
          }
        }

        recognitionRef.current = recognition
        recognition.start()
      } catch {
        setSpeechError("Failed to start speech recognition. Please try again.")
        setIsListening(false)
        setTimeout(() => setSpeechError(null), 4000)
      }
    }, 150)
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { /* ignore */ }
    }
    setIsListening(false)
    setInterimTranscript("")
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const sendMessage = useCallback(async (directMessage?: string) => {
    const combinedInput = directMessage ?? (input + (interimTranscript ? (input ? " " : "") + interimTranscript : ""))
    const trimmedInput = combinedInput.trim()
    if (!trimmedInput || isProcessing) return

    if (isListening) {
      suppressTranscriptCommitRef.current = true
      stopListening()
    }

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    if (!directMessage) {
      setInput("")
      setInterimTranscript("")
    }
    setIsProcessing(true)

    try {
      // Build conversation context
      const conversationHistory = [
        ...messagesRef.current.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.getTime()
        })),
        { id: userMessage.id, role: 'user' as const, content: trimmedInput, timestamp: Date.now() }
      ]

      const context: Partial<CommandContext> = {
        conversationHistory,
        tourState: guidedTour.getState()
      }

      // Try voice command processing first
      let commandResult
      try {
        commandResult = await processVoiceCommand(trimmedInput, context)
      } catch {
        commandResult = { handled: false, passToAI: true }
      }

      if (commandResult.handled) {
        if (commandResult.response) {
          const assistantMessage: Message = {
            id: generateMessageId(),
            role: "assistant",
            content: commandResult.response,
            timestamp: new Date(),
            isNavigation: true
          }
          setMessages(prev => [...prev, assistantMessage])

          if (commandResult.shouldSpeak) {
            speakText(commandResult.response, undefined, { source: "assistant" }).catch(() => {})
          }
        }

        if (commandResult.action) {
          await Promise.resolve(commandResult.action())
        }

        setTourActive(guidedTour.getState().isActive)
        return
      }

      // Fall back to AI response
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
      let response: string = ''
      let isNavResponse = false

      if (geminiApiKey) {
        try {
          // Intent detection for navigation
          const intentResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  role: "user",
                  parts: [{ text: `Analyze this user request and determine if they want to navigate somewhere.
Available pages: games, projects, philosophy, inventions, blog, social, tetris, snake, tanks, cookie-clicker, chess, agar, home
Available sections on home: hero, about, skills, experience, projects, contact

User request: "${trimmedInput}"

If this is a navigation request, respond with ONLY: NAV:target
If this is NOT a navigation request, respond with ONLY: CHAT` }]
                }],
                generationConfig: { maxOutputTokens: 20, temperature: 0.1 }
              })
            }
          )

          if (intentResponse.ok) {
            const intentData = await intentResponse.json()
            const intentResult = intentData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

            if (intentResult.startsWith('NAV:')) {
              const navTarget = intentResult.substring(4).trim()
              const navResult = await navigationService.navigateTo(navTarget)

              if (navResult.success) {
                response = navResult.message
                isNavResponse = true
              }
            }
          }
        } catch {
          // Intent detection failed, continue to chat
        }
      }

      if (!isNavResponse) {
        if (geminiApiKey) {
          try {
            const apiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{
                    role: "user",
                    parts: [{ text: generateSystemPrompt() + "\n\nUser question: " + trimmedInput }]
                  }],
                  generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
                })
              }
            )

            if (apiResponse.ok) {
              const data = await apiResponse.json()
              response = data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(trimmedInput)
            } else {
              response = getFallbackResponse(trimmedInput)
            }
          } catch {
            response = getFallbackResponse(trimmedInput)
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 800))
          response = getFallbackResponse(trimmedInput)
        }
      }

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        isNavigation: isNavResponse
      }
      setMessages(prev => [...prev, assistantMessage])
      speakText(response, undefined, { source: "assistant" }).catch(() => {})
    } finally {
      setIsProcessing(false)
      if (talkModeRef.current) {
        setTimeout(() => {
          if (talkModeRef.current && !isListeningRef.current && !isSpeakingRef.current) {
            startListening()
          }
        }, 700)
      }
    }
  }, [input, interimTranscript, isProcessing, isListening, stopListening, speakText, startListening])

  useEffect(() => {
    const handleTalkModeSend = (event: CustomEvent<{ transcript: string }>) => {
      const transcript = event.detail?.transcript
      if (transcript && talkMode) {
        setInput("")
        sendMessage(transcript)
      }
    }
    window.addEventListener('talk-mode-send', handleTalkModeSend as EventListener)
    return () => window.removeEventListener('talk-mode-send', handleTalkModeSend as EventListener)
  }, [talkMode, sendMessage])

  useEffect(() => {
    const wasSpeaking = wasSpeakingRef.current
    wasSpeakingRef.current = isSpeaking

    if (wasSpeaking && !isSpeaking && talkMode && !isProcessing) {
      setTimeout(() => {
        if (talkMode && !isProcessing) {
          startListening()
        }
      }, 300)
    }
  }, [isSpeaking, talkMode, isProcessing, startListening])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickQuestions = [
    "Give me a tour",
    "Go to games",
    "Show me projects",
    "What can Daniel do?"
  ]

  const displayText = input + (interimTranscript ? (input ? " " : "") + interimTranscript : "")

  return (
    <>
      {/* TourPlayer - Always visible as mini FAB or expanded during tours */}
      <TourPlayer
        onOpenChat={() => setIsOpen(true)}
        speechEnabled={speechEnabled}
        onToggleSpeech={toggleSpeechEnabled}
        isSpeaking={isSpeaking}
        onStopSpeaking={stopSpeaking}
        onSpeak={handleTourSpeak}
        onCancelSpeech={() => cancelSource("tour")}
      />

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 pb-2 border-b bg-gradient-to-r from-primary/10 to-transparent">
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">Ask About Daniel</div>
              {speechEnabled && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Volume2 className="w-3 h-3" />
                  <span>Voice on</span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Chat with Daniel's AI assistant to learn about his skills, projects, and experience.
            </DialogDescription>
          </DialogHeader>

          {/* Messages */}
          <div className="flex-1 min-h-0 max-h-[350px] overflow-y-auto overscroll-contain p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                      message.isNavigation ? "bg-green-500/20" : "bg-primary/20"
                    }`}>
                      {message.isNavigation ? (
                        <Navigation className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.isNavigation
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Tour hint */}
          {tourActive && (
            <div className="px-4 pb-2 border-t pt-2 bg-primary/5">
              <p className="text-xs text-muted-foreground text-center">
                Tour in progress — use the controls on the right side of the screen
              </p>
            </div>
          )}

          {/* Quick Questions */}
          {messages.length === 1 && !tourActive && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => sendMessage(q)}
                    disabled={isProcessing}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              {speechRecognitionSupported && (
                <>
                  <Button
                    variant={isListening ? "default" : "ghost"}
                    size="icon"
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`flex-shrink-0 h-9 w-9 ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={talkMode ? "default" : "ghost"}
                    size="icon"
                    onClick={() => {
                      const newTalkMode = !talkMode
                      setTalkMode(newTalkMode)
                      if (newTalkMode) {
                        if (!isListening && !isSpeaking) {
                          startListening()
                        }
                      } else if (isListening) {
                        suppressTranscriptCommitRef.current = true
                        stopListening()
                        setInterimTranscript("")
                      }
                    }}
                    disabled={isProcessing}
                    className={`flex-shrink-0 h-9 w-9 ${talkMode ? "bg-green-500 hover:bg-green-600" : ""}`}
                    title={talkMode ? "Disable Talk Mode (continuous conversation)" : "Enable Talk Mode (continuous conversation)"}
                  >
                    <Repeat className={`h-4 w-4 ${talkMode ? "animate-spin" : ""}`} style={{ animationDuration: talkMode ? "3s" : undefined }} />
                  </Button>
                </>
              )}

              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={displayText}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isListening
                      ? "Listening..."
                      : tourActive
                      ? "Say 'next', 'previous', or 'end tour'..."
                      : "Ask anything..."
                  }
                  className="w-full h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isProcessing}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isSpeaking) stopSpeaking()
                  else toggleSpeechEnabled()
                }}
                className="flex-shrink-0 h-9 w-9"
                title={isSpeaking ? "Stop speaking" : speechEnabled ? "Disable voice" : "Enable voice"}
              >
                {isSpeaking ? (
                  <Volume2 className="h-4 w-4 animate-pulse text-primary" />
                ) : speechEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>

              {/* Voice Settings Dropdown */}
              <DropdownMenu open={showVoiceSettings} onOpenChange={setShowVoiceSettings}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-9 w-9"
                    title="Voice settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-3">
                  <div className="space-y-4">
                    <div className="font-medium text-sm">Voice Settings</div>

                    {/* Speed */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Speed</span>
                        <span className="text-muted-foreground">{speechRate.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.25"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Pitch */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Pitch</span>
                        <span className="text-muted-foreground">{speechPitch.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={speechPitch}
                        onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Volume */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Volume</span>
                        <span className="text-muted-foreground">{Math.round(speechVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={speechVolume}
                        onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Voice Selection */}
                    {voices.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs">Voice</label>
                        <select
                          value={selectedVoice?.name ?? ''}
                          onChange={(e) => setSelectedVoice(e.target.value || null)}
                          className="w-full h-8 px-2 text-xs rounded border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Auto (system default)</option>
                          {voices
                            .filter(v => v.lang.startsWith('en'))
                            .map((voice) => (
                              <option key={voice.voiceURI} value={voice.name}>
                                {voice.name} ({voice.lang})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Reset Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setSpeechRate(1.0)
                        setSpeechPitch(1.0)
                        setSpeechVolume(0.8)
                        setSelectedVoice(null)
                      }}
                    >
                      Reset to Defaults
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => sendMessage()}
                disabled={!displayText.trim() || isProcessing}
                size="icon"
                className="flex-shrink-0 h-9 w-9"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {isListening && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                {talkMode
                  ? "Talk Mode active — speak naturally, I'll respond and keep listening"
                  : "Speak now... click the mic button again when done"}
              </p>
            )}

            {talkMode && !isListening && !isSpeaking && !isProcessing && (
              <p className="text-xs text-center text-green-500 mt-2">
                Talk Mode ready — click mic to start conversation
              </p>
            )}

            {talkMode && isSpeaking && (
              <p className="text-xs text-center text-blue-500 mt-2 animate-pulse">
                Speaking... will listen again when finished
              </p>
            )}

            <AnimatePresence>
              {speechError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center"
                >
                  {speechError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
