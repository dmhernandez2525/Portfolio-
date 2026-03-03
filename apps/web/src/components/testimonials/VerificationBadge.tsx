import { CheckCircle2, Github, Linkedin, MessageSquareQuote } from "lucide-react"
import type { TestimonialSource } from "@/types/testimonials"

interface VerificationBadgeProps {
  source: TestimonialSource
  verified: boolean
}

const SOURCE_DETAILS: Record<TestimonialSource, { label: string; icon: typeof Linkedin; className: string }> = {
  linkedin: {
    label: "LinkedIn",
    icon: Linkedin,
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  github: {
    label: "GitHub",
    icon: Github,
    className: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  },
  direct: {
    label: "Direct",
    icon: MessageSquareQuote,
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
}

export function VerificationBadge({ source, verified }: VerificationBadgeProps) {
  const details = SOURCE_DETAILS[source]
  const Icon = details.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${details.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {details.label}
      {verified ? <CheckCircle2 className="h-3.5 w-3.5" aria-label="Verified testimonial source" /> : null}
    </span>
  )
}
