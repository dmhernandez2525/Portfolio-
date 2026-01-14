import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Timeline } from "@/components/ui/Timeline"
import { SketchToBlueprint } from "@/components/ui/SketchToBlueprint"
import { timelineData } from "@/data/timeline"

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
      </div>
    </section>
  )
}
