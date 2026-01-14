import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Github, ExternalLink, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { projectsData } from "@/data/projects"
import type { ProjectItem } from "@/data/projects"

function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-full md:w-[450px]"
    >
      <Dialog>
        <div className="h-full flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-md hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
          <div className="h-48 bg-muted w-full relative group overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 text-secondary-foreground group-hover:scale-110 transition-transform duration-500">
              <Box className="w-12 h-12 opacity-50" />
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <DialogTrigger asChild>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  View Details
                </Button>
              </DialogTrigger>
            </div>
            {/* Category Badge */}
            <Badge className="absolute top-3 left-3 bg-primary/90">{project.category}</Badge>
            {project.featured && (
              <Badge className="absolute top-3 right-3 bg-yellow-500/90">Featured</Badge>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold mb-1">{project.title}</h3>
            <p className="text-sm text-primary mb-2">{project.tagline}</p>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
              {project.description}
            </p>

            {/* Easter Egg Text */}
            {project.easterEgg && (
              <p className="text-xs text-muted-foreground/60 italic mb-4">
                {project.easterEgg}
              </p>
            )}

            <div className="flex flex-wrap gap-1 mb-4">
              {project.tech.slice(0, 4).map(t => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
              {project.tech.length > 4 && (
                <span className="text-xs text-muted-foreground self-center">+{project.tech.length - 4}</span>
              )}
            </div>

            <DialogTrigger asChild>
              <Button variant="default" className="w-full">View Project</Button>
            </DialogTrigger>
          </div>
        </div>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {project.title}
              {project.featured && <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>}
            </DialogTitle>
            <DialogDescription className="text-lg text-primary">{project.tagline}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-muted-foreground">{project.description}</p>
            </div>

            {project.features && (
              <div>
                <h4 className="font-semibold mb-2">Key Features</h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {project.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tech.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {project.link && (
                <Button asChild>
                  <a href={project.link} target={project.link.startsWith('/') ? "_self" : "_blank"} rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {project.category === "Game" ? "Play Game" : "Live Demo"}
                  </a>
                </Button>
              )}
              {project.github && (
                <Button variant="outline" asChild>
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" /> View Code
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export function Projects() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollWidth, setScrollWidth] = useState(0)

  useEffect(() => {
    if (scrollRef.current) {
      setScrollWidth(scrollRef.current.scrollWidth - window.innerWidth + 100)
    }
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollWidth])

  return (
    <section id="projects" className="py-20 bg-muted/20">
      {/* Header - always visible */}
      <div className="container mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Projects</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          <p className="mt-4 text-muted-foreground">
            From web applications to hardware engineering and game development.
          </p>
        </motion.div>
      </div>

      {/* Horizontal Scroll Container - Desktop */}
      <div
        ref={containerRef}
        className="relative hidden md:block"
        style={{ height: `${Math.max(100, scrollWidth / 3)}px`, position: 'relative' }}
      >
        <div className="sticky top-20 overflow-hidden">
          <motion.div
            ref={scrollRef}
            style={{ x }}
            className="flex gap-6 px-8 py-4"
          >
            {projectsData.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mobile Grid Layout */}
      <div className="md:hidden container">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projectsData.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>

      {/* Scroll hint - Desktop only */}
      <div className="container hidden md:block">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          ↓ Scroll to explore more projects
        </motion.p>
      </div>
    </section>
  )
}
