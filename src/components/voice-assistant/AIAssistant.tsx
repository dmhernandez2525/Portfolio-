/**
 * AIAssistant - Core AI assistant component
 *
 * Features:
 * - TourPlayer: Speechify-style floating player (always visible as mini FAB or expanded)
 * - Chat Dialog: Full chat interface opened via FAB or custom events
 * - Speech Recognition: Voice input via Web Speech API
 * - Text-to-Speech: Voice output via Web Speech API (NEEDS FIXING - see requirements doc)
 * - Voice Commands: Navigation and tour control via voiceCommandRouter
 *
 * Place this component in RootLayout so it persists across all pages.
 */

import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic, MicOff, Send, Bot, User,
  Volume2, VolumeX, Loader2, Sparkles, Navigation
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getFallbackResponse, generateSystemPrompt } from "./danielContext"
import { processVoiceCommand, navigationService } from "@/services/voice-stocks"
import { guidedTour } from "@/services/voice-stocks/guidedTour"
import { TourPlayer } from "./TourPlayer"
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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [tourActive, setTourActive] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)

  // Refs
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

  // Cleanup speech resources on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch { /* ignore */ }
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Connect to guided tour state
  useEffect(() => {
    const unsubscribeStep = guidedTour.onStepChange(() => {
      setTourActive(guidedTour.getState().isActive)
    })

    const unsubscribeEnd = guidedTour.onTourEnd(() => {
      setTourActive(false)
    })

    setTourActive(guidedTour.getState().isActive)

    return () => {
      unsubscribeStep()
      unsubscribeEnd()
    }
  }, [])

  /**
   * Text-to-Speech function
   * NOTE: TTS is currently not working properly. See requirements document for details.
   * The issue is that speechSynthesis.speak() is called but onstart never fires.
   */
  const speakText = useCallback((text: string, rate?: number) => {
    if (!speechEnabledRef.current) return
    if (typeof window === "undefined" || !window.speechSynthesis) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate ?? 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [])

  // Callback for TourPlayer to trigger speech with custom rate
  const handleTourSpeak = useCallback((text: string, rate?: number) => {
    speakText(text, rate)
  }, [speakText])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const toggleSpeechEnabled = useCallback(() => {
    setSpeechEnabled(prev => {
      const newValue = !prev
      if (!newValue && typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
      return newValue
    })
  }, [])

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let interim = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interim += transcript
            }
          }
          setInterimTranscript(interim)
          if (finalTranscript) {
            setInput(prev => prev + finalTranscript)
            finalTranscript = ""
            setInterimTranscript("")
          }
        }

        recognition.onstart = () => {
          setIsListening(true)
          setSpeechError(null)
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
          setIsListening(false)
          setInterimTranscript("")
          recognitionRef.current = null
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

  // Send message to AI
  const sendMessage = useCallback(async (directMessage?: string) => {
    const trimmedInput = (directMessage ?? input).trim()
    if (!trimmedInput || isProcessing) return

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
            speakText(commandResult.response)
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
      speakText(response)
    } finally {
      setIsProcessing(false)
    }
  }, [input, isProcessing, isListening, stopListening, speakText])

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
      />

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
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
                Speak now... click the mic button again when done
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
