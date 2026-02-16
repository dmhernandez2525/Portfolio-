import { motion } from "framer-motion"

interface LoadingSpinnerProps {
  label?: string
  size?: "sm" | "md" | "lg"
}

const sizes = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
}

export function LoadingSpinner({ label = "Loading...", size = "md" }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-label={label}>
      <motion.div
        className={`${sizes[size]} border-2 border-primary/30 border-t-primary rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
