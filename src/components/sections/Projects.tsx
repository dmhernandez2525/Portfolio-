import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Github, ExternalLink, Box, Sparkles, Zap, Code2, Cpu, Globe, Gamepad2, Wrench, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { projectsData, getProjectsByTier } from "@/data/projects"
import type { ProjectItem, ProjectTier, ProjectCategory } from "@/data/projects"

// Category icons mapping
const categoryIcons: Record<ProjectCategory, typeof Sparkles> = {
  "AI/ML Platform": Sparkles,
  "Web App": Globe,
  "SaaS Platform": Zap,
  "Hardware/IoT": Cpu,
  "Native App": Package,
  "Developer Tool": Wrench,
  "Open Source": Code2,
  "Game": Gamepad2,
}

// Tier styles
const tierStyles: Record<ProjectTier, { bg: string; label: string }> = {
  flagship: { bg: "bg-gradient-to-r from-yellow-500 to-amber-500", label: "Flagship" },
  strong: { bg: "bg-gradient-to-r from-blue-500 to-cyan-500", label: "Strong" },
  supporting: { bg: "bg-gradient-to-r from-gray-500 to-slate-500", label: "Supporting" },
}

// Status styles
const statusStyles: Record<string, { bg: string; text: string }> = {
  production: { bg: "bg-green-500/20", text: "text-green-400" },
  active: { bg: "bg-blue-500/20", text: "text-blue-400" },
  beta: { bg: "bg-purple-500/20", text: "text-purple-400" },
  development: { bg: "bg-orange-500/20", text: "text-orange-400" },
}

function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  const CategoryIcon = categoryIcons[project.category] || Box
  const tierStyle = tierStyles[project.tier]
  const statusStyle = project.status ? statusStyles[project.status] : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="flex-shrink-0 w-full"
    >
      <Dialog>
        <div className="h-full flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-md hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
          <div className="h-40 bg-muted w-full relative group overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 text-secondary-foreground group-hover:scale-110 transition-transform duration-500">
              <CategoryIcon className="w-12 h-12 opacity-50" />
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <DialogTrigger asChild>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  View Details
                </Button>
              </DialogTrigger>
            </div>
            {/* Tier Badge */}
            <Badge className={`absolute top-3 left-3 ${tierStyle.bg} text-white border-0`}>
              {tierStyle.label}
            </Badge>
            {/* Status Badge */}
            {statusStyle && (
              <Badge className={`absolute top-3 right-3 ${statusStyle.bg} ${statusStyle.text} border-0 capitalize`}>
                {project.status}
              </Badge>
            )}
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-bold">{project.title}</h3>
            </div>
            <p className="text-sm text-primary mb-2">{project.tagline}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
              {project.description}
            </p>

            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-3">
              <CategoryIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{project.category}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {project.tech.slice(0, 3).map(t => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
              {project.tech.length > 3 && (
                <span className="text-xs text-muted-foreground self-center">+{project.tech.length - 3}</span>
              )}
            </div>

            <div className="flex gap-2">
              {project.link && (
                <Button size="sm" asChild className="flex-1">
                  <a href={project.link} target={project.link.startsWith('/') ? "_self" : "_blank"} rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    {project.category === "Game" ? "Play" : "Demo"}
                  </a>
                </Button>
              )}
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className={project.link ? "" : "flex-1"}>
                  Details
                </Button>
              </DialogTrigger>
            </div>
          </div>
        </div>

        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${tierStyle.bg} text-white border-0`}>{tierStyle.label}</Badge>
              {statusStyle && (
                <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 capitalize`}>
                  {project.status}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {project.title}
            </DialogTitle>
            <DialogDescription className="text-lg text-primary">{project.tagline}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CategoryIcon className="w-4 h-4" />
                {project.category}
              </h4>
              <p className="text-muted-foreground">{project.description}</p>
            </div>

            {project.features && project.features.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Key Features</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {project.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tech.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {project.link && (
                <Button asChild>
                  <a href={project.link} target={project.link.startsWith('/') ? "_self" : "_blank"} rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {project.category === "Game" ? "Play Game" : "View Live"}
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

type FilterType = "all" | ProjectTier

export function Projects() {
  const [filter, setFilter] = useState<FilterType>("all")

  const filteredProjects = filter === "all"
    ? projectsData
    : getProjectsByTier(filter)

  const flagshipCount = getProjectsByTier("flagship").length
  const strongCount = getProjectsByTier("strong").length
  const supportingCount = getProjectsByTier("supporting").length

  return (
    <section id="projects" className="py-20 bg-muted/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Project Portfolio</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {projectsData.length} projects spanning AI/ML platforms, SaaS applications, native apps, hardware, and more.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Projects ({projectsData.length})
          </Button>
          <Button
            variant={filter === "flagship" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("flagship")}
            className={filter === "flagship" ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600" : ""}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Flagship ({flagshipCount})
          </Button>
          <Button
            variant={filter === "strong" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("strong")}
            className={filter === "strong" ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" : ""}
          >
            <Zap className="w-4 h-4 mr-1" />
            Strong ({strongCount})
          </Button>
          <Button
            variant={filter === "supporting" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("supporting")}
          >
            <Code2 className="w-4 h-4 mr-1" />
            Supporting ({supportingCount})
          </Button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>{projectsData.filter(p => p.category === "AI/ML Platform").length} AI/ML</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span>{projectsData.filter(p => p.category === "SaaS Platform").length} SaaS</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-500" />
            <span>{projectsData.filter(p => p.category === "Native App").length} Native Apps</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-green-500" />
            <span>{projectsData.filter(p => p.category === "Hardware/IoT").length} Hardware</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{projectsData.filter(p => p.status === "production").length} Production</span>
          </div>
        </motion.div>

        {/* Project Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View More Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-muted-foreground text-sm">
            Interested in a specific project? Click any card to view full details, live demos, and source code.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
