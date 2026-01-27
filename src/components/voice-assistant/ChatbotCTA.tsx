import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic, MicOff, Send, Bot, User, MessageCircle,
  Volume2, VolumeX, Loader2, Sparkles, Navigation, Map
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getFallbackResponse, generateSystemPrompt } from "./danielContext"
import { processVoiceCommand } from "@/services/voice-stocks"
import { guidedTour, getTourProgress, nextTourStep, previousTourStep, endTour } from "@/services/voice-stocks/guidedTour"
import type { CommandContext } from "@/types/voiceStocks"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isNavigation?: boolean // Flag for navigation/tour responses
}

// Get Speech Recognition constructor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

// Generate unique message ID
function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const speechRecognitionSupported = typeof window !== "undefined" && getSpeechRecognition() !== null

export function ChatbotCTA() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! I'm Daniel's AI assistant. Ask me anything — skills, projects, random fun facts. Or say \"give me a tour\" to explore the site! 🤖",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [tourActive, setTourActive] = useState(false)
  const [tourProgress, setTourProgress] = useState({ current: 0, total: 0, percent: 0 })
  const [speechError, setSpeechError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<Message[]>(messages)
  const speechEnabledRef = useRef(speechEnabled)

  // Keep refs in sync with state
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    speechEnabledRef.current = speechEnabled
  }, [speechEnabled])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Cleanup recognition and speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch { /* ignore */ }
      }
      // Cancel any ongoing speech
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Direct speak function (used by tour callbacks) - defined early for use in effects
  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 0.8

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [])

  // Connect to guided tour for TTS and state updates (runs once on mount)
  useEffect(() => {
    // Register speak callback for tour voice scripts
    const unsubscribeSpeak = guidedTour.onSpeak((text) => {
      if (speechEnabledRef.current) {
        speakText(text)
      }
    })

    // Track tour state changes
    const unsubscribeStep = guidedTour.onStepChange((step) => {
      setTourActive(guidedTour.getState().isActive)
      if (step) {
        setTourProgress(getTourProgress())
      }
    })

    // Track tour end
    const unsubscribeEnd = guidedTour.onTourEnd(() => {
      setTourActive(false)
      setTourProgress({ current: 0, total: 0, percent: 0 })
    })

    return () => {
      unsubscribeSpeak()
      unsubscribeStep()
      unsubscribeEnd()
    }
  }, [speakText])

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognition()
    if (!SpeechRecognitionCtor) {
      setSpeechError("Speech recognition is not supported in your browser.")
      setTimeout(() => setSpeechError(null), 4000)
      return
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { /* ignore */ }
    }

    // Create fresh instance each time
    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = ""
      let final = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }

      setInterimTranscript(interim)

      if (final) {
        setInput(prev => prev + final)
        setInterimTranscript("")
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error)
      if (event.error !== "aborted") {
        setIsListening(false)
        setInterimTranscript("")
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript("")
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      setIsListening(true)
    } catch (e) {
      console.error("Failed to start recognition:", e)
      setIsListening(false)
    }
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

  const speakResponse = useCallback((text: string) => {
    if (!speechEnabled) return
    speakText(text)
  }, [speechEnabled, speakText])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  // Helper to fully end tour and reset state
  const handleEndTour = useCallback(() => {
    endTour()
    setTourActive(false)
    setTourProgress({ current: 0, total: 0, percent: 0 })
  }, [])

  const sendMessage = useCallback(async (directMessage?: string) => {
    const trimmedInput = (directMessage ?? input).trim()
    if (!trimmedInput || isProcessing) return

    // Stop listening if active
    if (isListening) stopListening()

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // Build command context with conversation history (including current message)
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

      // First, try the voice command router for navigation/tour commands
      let commandResult
      try {
        console.log('[ChatbotCTA] Processing command:', trimmedInput)
        commandResult = await processVoiceCommand(trimmedInput, context)
        console.log('[ChatbotCTA] Command result:', commandResult)
      } catch (commandError) {
        console.error('[ChatbotCTA] Command processing error:', commandError)
        // Show error message to user and fall through to AI
        commandResult = { handled: false, passToAI: true }
      }

      if (commandResult.handled) {
        // Command was handled by the router (navigation, tour, etc.)
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
            speakResponse(commandResult.response)
          }
        }

        // Execute any associated action (may be async)
        if (commandResult.action) {
          await Promise.resolve(commandResult.action())
        }

        // Update tour state after action completes
        setTourActive(guidedTour.getState().isActive)
        setTourProgress(getTourProgress())
        return
      }

      // Command not handled or passed to AI - use Gemini/fallback
      let response: string

      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
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

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      speakResponse(response)
    } finally {
      setIsProcessing(false)
    }
  }, [input, isProcessing, isListening, stopListening, speakResponse])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickQuestions = [
    "Give me a tour",
    "Go to projects",
    "What are Daniel's skills?",
    "Tell me something fun"
  ]

  // Combined display text for input
  const displayText = input + (interimTranscript ? (input ? " " : "") + interimTranscript : "")

  return (
    <>
      {/* Subtle CTA Banner */}
      <div className="py-4">
        <div className="container">
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onClick={() => setIsOpen(true)}
            className="w-full group"
          >
            <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 transition-all duration-300 max-w-md mx-auto">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                TL;DR? <span className="text-primary font-medium">Ask my AI instead</span>
              </span>
              <MessageCircle className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Chat Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        // End tour if modal is closed while tour is active
        if (!open && tourActive) {
          handleEndTour()
        }
      }}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b bg-gradient-to-r from-primary/10 to-transparent">
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                {tourActive ? (
                  <Map className="w-4 h-4 text-primary" />
                ) : (
                  <Sparkles className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1">
                {tourActive ? "Guided Tour" : "Ask About Daniel"}
              </div>
              {tourActive && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{tourProgress.current}/{tourProgress.total}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${tourProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Messages Area */}
          <div className="h-[350px] overflow-y-auto p-4 space-y-3">
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

          {/* Tour Controls */}
          {tourActive && (
            <div className="px-4 pb-2 border-t pt-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Tour controls:</span>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => { previousTourStep().catch(console.error) }}
                    aria-label="Go to previous tour step"
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => { nextTourStep().catch(console.error) }}
                    aria-label="Go to next tour step"
                  >
                    Next →
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 text-red-500 hover:text-red-600"
                    onClick={handleEndTour}
                    aria-label="End the guided tour"
                  >
                    End
                  </Button>
                </div>
              </div>
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
                      ? "Listening... speak now"
                      : tourActive
                      ? "Say 'next', 'previous', or 'end tour'..."
                      : "Ask anything or say 'give me a tour'..."
                  }
                  className="w-full h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isProcessing}
                />
                {interimTranscript && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    ...
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isSpeaking) stopSpeaking()
                  else setSpeechEnabled(!speechEnabled)
                }}
                className="flex-shrink-0 h-9 w-9"
                title={isSpeaking ? "Stop speaking" : speechEnabled ? "Disable speech" : "Enable speech"}
              >
                {isSpeaking ? (
                  <Volume2 className="h-4 w-4 animate-pulse text-primary" />
                ) : speechEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>

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
                🎤 Speak now... click mic or press Enter when done
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
