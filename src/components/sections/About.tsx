import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Timeline } from "@/components/ui/Timeline"
import { SketchToBlueprint } from "@/components/ui/SketchToBlueprint"
import { Button } from "@/components/ui/button"
import { timelineData } from "@/data/timeline"

// Photo data for the carousel
const journeyPhotos = [
  {
    src: "/photos/coding-2am.png",
    alt: "Daniel coding at 2am",
    year: "2018 · The Grind",
    caption: "Coding session at 2am. This is where it all started."
  },
  {
    src: "/photos/daniel-slack-hq.png",
    alt: "Daniel at Slack HQ Denver",
    year: "2019 · Denver",
    caption: "Job hunting and manifesting. Walked past Slack HQ."
  },
  {
    src: "/photos/daniel-bootcamp.png",
    alt: "Daniel during coding bootcamp",
    year: "2020",
    caption: "The year I bet on myself. 60-hour weeks learning to code."
  },
  {
    src: "/photos/daniel-ar-coding.png",
    alt: "Daniel coding with AR glasses",
    year: "Now",
    caption: "Testing AR dev tools at 1am. Yes, this is normal."
  },
  {
    src: "/photos/daniel-comedy.png",
    alt: "Daniel at comedy show",
    year: "Life",
    caption: "Work hard, laugh harder. Catching Josh Johnson live."
  }
]

function PhotoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(0)

  const nextSlide = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % journeyPhotos.length)
  }, [])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + journeyPhotos.length) % journeyPhotos.length)
  }, [])

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }, [currentIndex])

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [isPaused, nextSlide])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  const currentPhoto = journeyPhotos[currentIndex]

  return (
    <div 
      className="relative max-w-2xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main carousel container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card/50 border border-border">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            <img 
              src={currentPhoto.src} 
              alt={currentPhoto.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-6">
              <div>
                <p className="text-primary text-sm font-semibold mb-1">{currentPhoto.year}</p>
                <p className="text-white text-lg font-medium">
                  "{currentPhoto.caption}"
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
          style={{ opacity: isPaused ? 1 : 0 }}
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
          style={{ opacity: isPaused ? 1 : 0 }}
          aria-label="Next photo"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {journeyPhotos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-primary w-6' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to photo ${index + 1}`}
          />
        ))}
      </div>

      {/* Photo count */}
      <p className="text-center text-muted-foreground/60 text-xs mt-2">
        {currentIndex + 1} / {journeyPhotos.length}
      </p>
    </div>
  )
}

export function About() {
  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">The Unconventional Path</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          {/* Opener line - first thing they read */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-xl md:text-2xl text-muted-foreground italic max-w-2xl mx-auto"
          >
            "The hands that write this code have also welded steel and changed diapers."
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted">
                  <img 
                    src="/photos/daniel-headshot.png" 
                    alt="Daniel Hernandez" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-background" title="Available for hire" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">From GED to Senior Engineer</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                My journey didn't start in a computer science classroom. It started with a lawn mower, a notebook of customers, and the realization that I could solve problems for money.
                <br /><br />
                With no degree and a family to support, I learned early that <strong>I had to work harder than anyone else in the room</strong>. That drive took me from self-taught freelancer to Principal Software Engineer, building applications for Fortune 500 companies and Department of Defense clients along the way.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Drives Me</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm obsessed with <span className="font-semibold text-foreground">systems thinking</span>. Whether it's architecting a scalable microservice, designing modular furniture, or engineering 3D-printed solutions, I see the world as interconnected systems waiting to be optimized.
                <br /><br />
                I don't just write code—I build solutions that solve real problems.
              </p>
              <Link
                to="/philosophy"
                className="inline-flex items-center gap-2 text-primary hover:underline transition-colors"
              >
                Read more about my philosophy <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Sketch to Blueprint Animation */}
            <div className="space-y-3">
              <p className="text-center text-lg font-medium text-foreground/80 italic">
                "Notebooks full of ideas. A career full of building them."
              </p>
              <SketchToBlueprint />
              <p className="text-center text-[10px] text-muted-foreground/40 leading-relaxed max-w-sm mx-auto">
                This animation synchronizes a custom pencil cursor with SVG path rendering,
                coordinates eraser passes, and manages multi-phase state transitions—all in pure React.
              </p>
            </div>

             <div className="p-6 bg-muted/30 rounded-lg border border-border backdrop-blur-sm hover:border-primary/50 transition-colors">
                <h4 className="font-bold mb-2">Why I'm Different</h4>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span> Serial entrepreneur with 15+ ventures
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span> Zero safety net = Extreme attention to detail
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span> I build solutions, not just features
                    </li>
                </ul>
            </div>

            {/* Resume CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="gap-2"
                onClick={() => window.open('/resume.pdf', '_blank')}
              >
                <Download className="h-4 w-4" />
                Download Resume
              </Button>
            </motion.div>
          </motion.div>

          {/* Timeline to the right */}
          <div className="relative">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm text-muted-foreground mb-6 text-center lg:text-left"
            >
              The unconventional path to Senior Engineer.
            </motion.p>
            <Timeline items={timelineData} />
          </div>
        </div>

        {/* Photo Gallery - The Journey */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold text-center mb-2 text-primary">The Journey</h3>
          <p className="text-center text-muted-foreground mb-8">From bootcamp grind to senior engineer</p>
          
          {/* Photo Carousel */}
          <PhotoCarousel />
        </motion.div>
      </div>
    </section>
  )
}
