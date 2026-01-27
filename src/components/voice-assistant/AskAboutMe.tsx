import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Send, Bot, User, Sparkles, Volume2, VolumeX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getFallbackResponse, generateSystemPrompt } from "./danielContext"
import { useSpeechController } from "@/context/speech-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Get Speech Recognition constructor (browser-specific)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

// Check if speech recognition is supported
const speechRecognitionSupported = typeof window !== "undefined" && getSpeechRecognition() !== null

export function AskAboutMe() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm Daniel's AI assistant. Ask me anything about his skills, projects, or experience!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Text-to-Speech via shared speech controller
  const {
    speakText: speakResponse,
    stopSpeaking,
    isSpeaking,
    speechEnabled,
    setSpeechEnabled,
  } = useSpeechController()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Cleanup recognition on unmount (TTS cleanup handled by hook)
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch { /* ignore */ }
      }
    }
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognition()
    if (!SpeechRecognitionCtor) {
      alert("Speech recognition is not supported in your browser.")
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
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          if (event.error !== "aborted" && event.error !== "no-speech") {
            setIsListening(false)
            setInterimTranscript("")
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
        setIsListening(false)
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

  const sendMessage = useCallback(async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isProcessing) return

    // Stop listening if active
    if (isListening) stopListening()

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // Try to use Gemini API if available (via environment variable)
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
                contents: [
                  {
                    role: "user",
                    parts: [{ text: generateSystemPrompt() + "\n\nUser question: " + trimmedInput }]
                  }
                ],
                generationConfig: {
                  maxOutputTokens: 500,
                  temperature: 0.7
                }
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
        // Use fallback responses
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
        response = getFallbackResponse(trimmedInput)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

      speakResponse(response, undefined, { source: "ask" })
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

  const suggestedQuestions = [
    "What are Daniel's top skills?",
    "Tell me about his projects",
    "What's his experience with AI?",
    "How can I contact him?"
  ]

  // Combined display text for input
  const displayText = input + (interimTranscript ? (input ? " " : "") + interimTranscript : "")

  return (
    <section id="ask-me" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Ask About Me</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Have questions? Chat with my AI assistant! Ask about my skills, projects, or experience.
            You can type or use voice input.
          </p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 shadow-lg shadow-primary/5">
            <CardContent className="p-0">
              {/* Messages Area */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              {messages.length === 1 && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((q) => (
                      <Button
                        key={q}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => {
                          setInput(q)
                          inputRef.current?.focus()
                        }}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  {/* Voice Toggle */}
                  <Button
                    variant={isListening ? "default" : "outline"}
                    size="icon"
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`flex-shrink-0 ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>

                  {/* Text Input */}
                  <textarea
                    ref={inputRef}
                    value={displayText}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening... speak now" : "Ask me anything about Daniel..."}
                    className="flex-1 min-h-[44px] max-h-[120px] px-4 py-2 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={isProcessing}
                    rows={1}
                  />

                  {/* Speech Toggle */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking()
                      } else {
                        setSpeechEnabled(!speechEnabled)
                      }
                    }}
                    className="flex-shrink-0"
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

                  {/* Send Button */}
                  <Button
                    onClick={sendMessage}
                    disabled={!displayText.trim() || isProcessing}
                    className="flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {isListening ? (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    🎤 Speak now... click mic or press Enter when done
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {speechRecognitionSupported
                      ? "Click the mic to use voice input, or just type your question"
                      : "Type your question and press Enter or click Send"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
