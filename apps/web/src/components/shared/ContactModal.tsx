import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Send, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

interface ContactModalProps {
  trigger?: React.ReactNode
  children?: React.ReactNode
}

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

export function ContactModal({ trigger, children }: ContactModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log(data)
    setIsSubmitting(false)
    setIsSuccess(true)

    // Easter egg: confetti for hire-related messages
    if (checkForHireKeywords(data.message)) {
      createConfetti()
    }

    reset()

    // Close modal after showing success
    setTimeout(() => {
      setIsSuccess(false)
      setOpen(false)
    }, 3000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Let's Connect</DialogTitle>
          <DialogDescription>
            I'm currently open to new opportunities. Send me a message!
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="h-16 w-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
            <p className="text-muted-foreground text-sm">Thanks for reaching out. I'll get back to you soon.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-name">Name</Label>
                <Input
                  id="modal-name"
                  placeholder="Your name"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-email">Email</Label>
                <Input
                  id="modal-email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-message">Message</Label>
              <Textarea
                id="modal-message"
                placeholder="Tell me about your project, opportunity, or just say hi..."
                className={`min-h-[120px] ${errors.message ? "border-red-500" : ""}`}
                {...register("message")}
              />
              {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
            </div>

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
      </DialogContent>
    </Dialog>
  )
}
