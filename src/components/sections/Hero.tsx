import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Download } from "lucide-react"
import { HeroBackground } from "./HeroBackground"
import { ParticleBackground } from "@/components/ui/ParticleBackground"
import { MagneticButton } from "@/components/ui/MagneticButton"

const heroTaglines = [
  "Jack of all trades. Master of... okay fine, like four of them.",
  "Too stubborn to fail. Too caffeinated to stop.",
  "Plan A was 'figure it out.' There was no Plan B.",
  "If it can be built, I've probably tried. If it can't, I've definitely tried.",
  "Give me a problem and a weekend. One of us won't survive.",
  "Not the smartest in the room — just the one who won't quit.",
]

// Animated gradient title component
function AnimatedTitle({ text }: { text: string }) {
  const chars = text.split("")

  return (
    <span className="inline-block">
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.5,
            delay: i * 0.03,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 to-pink-500 animate-gradient-shift"
          style={{
            backgroundSize: '300% 300%',
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}

export function Hero() {
  const [index, setIndex] = useState(0)
  const [showResumeToast, setShowResumeToast] = useState(false)
  const [easterEggToast, setEasterEggToast] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroTaglines.length)
    }, 4500) // 4.5 seconds per tagline
    return () => clearInterval(timer)
  }, [isPaused])

  const handleResumeDownload = () => {
    window.open('/resume.pdf', '_blank')
    setShowResumeToast(true)
    setTimeout(() => setShowResumeToast(false), 4000)
  }

  const showEasterEggToast = (message: string) => {
    setEasterEggToast(message)
    setTimeout(() => setEasterEggToast(null), 4000)
  }

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden py-20">
      <ParticleBackground />
      <HeroBackground />
      
      <div className="container relative z-10 flex flex-col items-center text-center">
        <div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
            <AnimatedTitle text="Daniel Hernandez" />
          </h1>
        </div>

        <div
          className="h-10 md:h-14 mb-6 w-full max-w-2xl cursor-default"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={heroTaglines[index]}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-lg md:text-2xl lg:text-3xl font-medium text-muted-foreground italic"
            >
              "{heroTaglines[index]}"
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-xl text-base md:text-lg text-muted-foreground/80 mb-10"
        >
          Senior Software Engineer • Full-Stack • 10+ Years Building Things That Ship
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <MagneticButton
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth'})}
            className="h-11 px-8 gap-2 text-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
          >
            View My Work <ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton
            onClick={handleResumeDownload}
            className="h-11 px-8 gap-2 text-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            Download Resume <Download className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth'})}
            className="h-11 px-8 gap-2 text-md bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
          >
            Let's Talk ✉
          </MagneticButton>
        </motion.div>

        {/* Easter Egg Icons */}
        <div className="mt-20 flex gap-6">
          <motion.div
            whileHover={{ scale: 1.2, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            className="opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => showEasterEggToast("⚡ I've shipped production code at 3am more times than I'd like to admit.")}
          >
            <div className="text-4xl">⚡</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            className="opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => showEasterEggToast("I've been 3D printing for over a decade. It's one of my favorite ways to turn ideas into reality. 🖨️")}
          >
            <div className="text-4xl">🖨️</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            className="opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => showEasterEggToast("Fun fact: I once debugged a production issue from a beach in Hawaii. 🏝️")}
          >
            <div className="text-4xl">🐛</div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-50"
      >
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center p-1">
          <div className="w-1 h-3 bg-primary rounded-full" />
        </div>
      </motion.div>

      {/* Resume Download Toast */}
      <AnimatePresence>
        {showResumeToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-md px-6 py-4 rounded-lg border border-primary/50 shadow-lg"
          >
            <p className="text-sm text-foreground">
              Resume downloaded! Pro tip: The best stuff isn't on paper. 📄
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Easter Egg Toast */}
      <AnimatePresence>
        {easterEggToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-sm"
          >
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-md px-6 py-4 rounded-xl border border-primary/30 shadow-xl shadow-primary/10">
              <p className="text-sm text-foreground text-center">{easterEggToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
