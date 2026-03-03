import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Send, CheckCircle, Loader2, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { trackGoal } from "@/lib/analytics-store"

// Web3Forms API endpoint
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit"
// Get access key from environment or use placeholder
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || ""

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

// Simple confetti effect
const createConfetti = () => {
  const colors = ["#00D4FF", "#0099FF", "#7B2DFF", "#FF00E5", "#FFD700"]
  const confettiCount = 50
  const container = document.createElement("div")
  container.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;"
  document.body.appendChild(container)

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div")
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size = Math.random() * 10 + 5
    const left = Math.random() * 100
    const animDuration = Math.random() * 3 + 2

    confetti.style.cssText = `
      position:absolute;
      width:${size}px;
      height:${size}px;
      background:${color};
      left:${left}%;
      top:-20px;
      border-radius:${Math.random() > 0.5 ? "50%" : "0"};
      animation:confetti-fall ${animDuration}s ease-out forwards;
    `
    container.appendChild(confetti)
  }

  // Add keyframes if not exists
  if (!document.getElementById("confetti-style")) {
    const style = document.createElement("style")
    style.id = "confetti-style"
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  setTimeout(() => container.remove(), 5000)
}

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showHireToast, setShowHireToast] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const checkForHireKeywords = useCallback((message: string) => {
    const hireKeywords = ["hire", "job", "opportunity", "position", "role", "opening", "recruiting"]
    return hireKeywords.some(keyword => message.toLowerCase().includes(keyword))
  }, [])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setErrorMessage(null)

    // Check if access key is configured
    if (!WEB3FORMS_ACCESS_KEY) {
      // Fallback: open mailto link
      const subject = encodeURIComponent(`Website Inbox: Message from ${data.name}`)
      const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`)
      window.location.href = `mailto:Danher2525@Gmail.com?subject=${subject}&body=${body}`
      setIsSubmitting(false)
      setIsSuccess(true)
      trackGoal("/contact", "contact_submission")
      reset()
      setTimeout(() => setIsSuccess(false), 5000)
      return
    }

    try {
      // Send via Web3Forms API
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Website Inbox: Message from ${data.name}`,
          from_name: data.name,
          email: data.email,
          message: data.message,
          // Include reply-to for easy response
          replyto: data.email,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        trackGoal("/contact", "contact_submission")

        // Easter egg: confetti for hire-related messages
        if (checkForHireKeywords(data.message)) {
          createConfetti()
          setShowHireToast(true)
          setTimeout(() => setShowHireToast(false), 5000)
        }

        reset()
        setTimeout(() => setIsSuccess(false), 5000)
      } else {
        throw new Error(result.message || "Failed to send message")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20">
      <div className="container max-w-4xl">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Let's Connect</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          <p className="mt-4 text-lg text-foreground font-medium">
            I'm currently open to new opportunities. Let's talk.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            I promise I reply faster than I ship side projects.
          </p>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
        >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 md:p-10">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in">
                            <div className="h-20 w-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-6">
                                <CheckCircle className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                            <p className="text-muted-foreground">Thanks for reaching out. I'll get back to you soon.</p>
                            <Button variant="outline" className="mt-6" onClick={() => setIsSuccess(false)}>
                                Send Another
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="contact-name">Name</Label>
                                    <Input
                                        id="contact-name"
                                        placeholder="Your name"
                                        {...register("name")}
                                        className={errors.name ? "border-red-500" : ""}
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact-email">Email</Label>
                                    <Input
                                        id="contact-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        {...register("email")}
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact-message">Message</Label>
                                <Textarea
                                    id="contact-message"
                                    placeholder="Tell me about your project, opportunity, or just say hi..."
                                    className={`min-h-[150px] ${errors.message ? "border-red-500" : ""}`}
                                    {...register("message")}
                                />
                                {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
                            </div>

                            {/* Error message */}
                            {errorMessage && (
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{errorMessage}</span>
                              </div>
                            )}

                            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Message <Send className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </motion.div>

        {/* Resume CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Prefer to review my background first?
          </p>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => window.open('/resume.pdf', '_blank')}
          >
            <Download className="h-4 w-4" />
            Download Resume
          </Button>
        </motion.div>

        {/* Hire Easter Egg Toast */}
        {showHireToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-md px-6 py-4 rounded-lg border border-primary/50 shadow-lg"
          >
            <p className="text-sm text-foreground">
              Thanks! I'm actively looking for new opportunities. 🎉
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
