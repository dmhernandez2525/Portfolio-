import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, Github, ExternalLink, Sparkles, Zap, Code2, Cpu, Globe, Gamepad2, Wrench, Package, CheckCircle, Clock, Beaker, Construction, LayoutGrid, List, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { projectsData, getProjectsByTier } from "@/data/projects"
import type { ProjectItem, ProjectTier, ProjectCategory, ProjectStatus } from "@/data/projects"

// Category icons and colors
const categoryConfig: Record<ProjectCategory, { icon: typeof Sparkles; color: string }> = {
  "AI/ML Platform": { icon: Sparkles, color: "text-yellow-500" },
  "Web App": { icon: Globe, color: "text-blue-500" },
  "SaaS Platform": { icon: Zap, color: "text-purple-500" },
  "Hardware/IoT": { icon: Cpu, color: "text-green-500" },
  "Native App": { icon: Package, color: "text-orange-500" },
  "Developer Tool": { icon: Wrench, color: "text-slate-500" },
  "Open Source": { icon: Code2, color: "text-teal-500" },
  "Game": { icon: Gamepad2, color: "text-pink-500" },
}

// Tier styles
const tierStyles: Record<ProjectTier, { bg: string; label: string; border: string }> = {
  flagship: {
    bg: "bg-gradient-to-r from-yellow-500 to-amber-500",
    label: "Flagship",
    border: "border-yellow-500/30"
  },
  strong: {
    bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
    label: "Strong",
    border: "border-blue-500/30"
  },
  supporting: {
    bg: "bg-gradient-to-r from-slate-500 to-slate-600",
    label: "Supporting",
    border: "border-slate-500/30"
  },
}

// Status configuration
const statusConfig: Record<ProjectStatus, { icon: typeof CheckCircle; bg: string; text: string; label: string }> = {
  production: { icon: CheckCircle, bg: "bg-green-500/20", text: "text-green-400", label: "Live" },
  active: { icon: Clock, bg: "bg-blue-500/20", text: "text-blue-400", label: "Active" },
  beta: { icon: Beaker, bg: "bg-purple-500/20", text: "text-purple-400", label: "Beta" },
  development: { icon: Construction, bg: "bg-orange-500/20", text: "text-orange-400", label: "Dev" },
  "local-only": { icon: Package, bg: "bg-slate-500/20", text: "text-slate-400", label: "Local" },
}

function ProjectCard({ project, index, viewMode }: { project: ProjectItem; index: number; viewMode: "grid" | "list" }) {
  const categoryInfo = categoryConfig[project.category]
  const CategoryIcon = categoryInfo?.icon || Globe
  const categoryColor = categoryInfo?.color || "text-muted-foreground"
  const tierStyle = tierStyles[project.tier]
  const statusInfo = statusConfig[project.status]
  const StatusIcon = statusInfo?.icon || Clock

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.02, duration: 0.3 }}
      >
        <Dialog>
          <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border ${tierStyle.border} bg-card/50 backdrop-blur-md hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group`}>
            {/* Icon */}
            <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-muted/50 flex items-center justify-center">
              <CategoryIcon className={`w-6 h-6 ${categoryColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold">{project.title}</h3>
                <Badge className={`${tierStyle.bg} text-white border-0 text-xs`}>{tierStyle.label}</Badge>
                <Badge className={`${statusInfo.bg} ${statusInfo.text} border-0 text-xs flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{project.tagline}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {project.tech.slice(0, 5).map(t => (
                  <Badge key={t} variant="secondary" className="text-xs py-0">{t}</Badge>
                ))}
                {project.tech.length > 5 && (
                  <span className="text-xs text-muted-foreground self-center">+{project.tech.length - 5}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              {project.link && (
                <Button size="sm" asChild>
                  <a href={project.link} target={project.link.startsWith('/') ? "_self" : "_blank"} rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">Details</Button>
              </DialogTrigger>
            </div>
          </div>

          {/* Dialog Content - same as grid view */}
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${tierStyle.bg} text-white border-0`}>{tierStyle.label}</Badge>
                <Badge className={`${statusInfo.bg} ${statusInfo.text} border-0 flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </Badge>
                <Badge variant="outline" className={`${categoryColor} border-current`}>
                  <CategoryIcon className="w-3 h-3 mr-1" />
                  {project.category}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold">{project.title}</DialogTitle>
              <DialogDescription className="text-lg text-primary">{project.tagline}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5 mt-2">
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>

              {project.metrics && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{project.metrics}</span>
                </div>
              )}

              {project.highlights && project.highlights.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.highlights.map((h, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{h}</span>
                    ))}
                  </div>
                </div>
              )}

              {project.features && project.features.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Key Features</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {project.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map(t => (
                    <Badge key={t} variant="secondary" className="text-sm">{t}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {project.link && (
                  <Button asChild>
                    <a href={project.link} target={project.link.startsWith('/') ? "_self" : "_blank"} rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {project.category === "Game" ? "Play Game" : "View Live Demo"}
                    </a>
                  </Button>
                )}
                {project.github && (
                  <Button variant="outline" asChild>
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" /> View Source
                    </a>
                  </Button>
                )}
                {!project.link && !project.github && (
                  <p className="text-sm text-muted-foreground">This project is currently in development or runs locally.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    )
  }

  // Grid view (same as original ProjectCard)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="flex-shrink-0 w-full"
    >
      <Dialog>
        <div className={`h-full flex flex-col overflow-hidden rounded-xl border ${tierStyle.border} bg-card/50 backdrop-blur-md hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group`}>
          <div className="h-32 bg-gradient-to-br from-muted/50 to-muted w-full relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <CategoryIcon className={`w-16 h-16 ${categoryColor} opacity-20 group-hover:opacity-30 transition-opacity`} />
            </div>
            <Badge className={`absolute top-3 left-3 ${tierStyle.bg} text-white border-0 text-xs font-medium`}>{tierStyle.label}</Badge>
            <Badge className={`absolute top-3 right-3 ${statusInfo.bg} ${statusInfo.text} border-0 text-xs font-medium flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </Badge>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-white border-white/50 hover:bg-white hover:text-black">View Details</Button>
              </DialogTrigger>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-bold leading-tight mb-1">{project.title}</h3>
            <p className="text-sm text-primary/80 mb-2 line-clamp-1">{project.tagline}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{project.description}</p>

            {project.highlights && project.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.highlights.slice(0, 3).map((h, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{h}</span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1 mb-3">
              {project.tech.slice(0, 4).map(t => (
                <Badge key={t} variant="secondary" className="text-xs py-0">{t}</Badge>
              ))}
              {project.tech.length > 4 && (
                <span className="text-xs text-muted-foreground self-center">+{project.tech.length - 4}</span>
              )}
            </div>

            <div className="flex gap-2 mt-auto">
              {project.link && (
                <Button size="sm" asChild className="flex-1">
                  <a href={project.link} target={project.link.startsWith('/') ? "_self" : "_blank"} rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    {project.category === "Game" ? "Play" : "View Live"}
                  </a>
                </Button>
              )}
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className={project.link ? "" : "flex-1"}>Details</Button>
              </DialogTrigger>
            </div>
          </div>
        </div>

        {/* Dialog Content */}
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${tierStyle.bg} text-white border-0`}>{tierStyle.label}</Badge>
              <Badge className={`${statusInfo.bg} ${statusInfo.text} border-0 flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {statusInfo.label}
              </Badge>
              <Badge variant="outline" className={`${categoryColor} border-current`}>
                <CategoryIcon className="w-3 h-3 mr-1" />
                {project.category}
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold">{project.title}</DialogTitle>
            <DialogDescription className="text-lg text-primary">{project.tagline}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            <p className="text-muted-foreground leading-relaxed">{project.description}</p>

            {project.metrics && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{project.metrics}</span>
              </div>
            )}

            {project.highlights && project.highlights.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {project.highlights.map((h, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{h}</span>
                  ))}
                </div>
              </div>
            )}

            {project.features && project.features.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Key Features</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {project.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tech.map(t => (
                  <Badge key={t} variant="secondary" className="text-sm">{t}</Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {project.link && (
                <Button asChild>
                  <a href={project.link} target={project.link.startsWith('/') ? "_self" : "_blank"} rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {project.category === "Game" ? "Play Game" : "View Live Demo"}
                  </a>
                </Button>
              )}
              {project.github && (
                <Button variant="outline" asChild>
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" /> View Source
                  </a>
                </Button>
              )}
              {!project.link && !project.github && (
                <p className="text-sm text-muted-foreground">This project is currently in development or runs locally.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

type FilterType = "all" | ProjectTier
type CategoryFilter = "all" | ProjectCategory

export function ProjectsPage() {
  const [tierFilter, setTierFilter] = useState<FilterType>("all")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProjects = projectsData
    .filter(p => tierFilter === "all" || p.tier === tierFilter)
    .filter(p => categoryFilter === "all" || p.category === categoryFilter)

  const flagshipCount = getProjectsByTier("flagship").length
  const strongCount = getProjectsByTier("strong").length
  const supportingCount = getProjectsByTier("supporting").length
  const liveCount = projectsData.filter(p => p.link && p.status === "production").length

  // Get unique categories with counts
  const categories = Object.keys(categoryConfig) as ProjectCategory[]

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-20">
        <div className="container max-w-7xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Code2 className="w-4 h-4" />
              <span className="text-sm font-medium">Full Portfolio</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary">
                All Projects
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {projectsData.length} projects spanning AI/ML, SaaS platforms, native apps, and hardware.
              <span className="text-primary font-medium"> {liveCount} live demos available.</span>
            </p>
          </motion.div>

          {/* Controls Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row justify-between gap-4 mb-6"
          >
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Result count */}
            <div className="text-sm text-muted-foreground self-center">
              Showing {filteredProjects.length} of {projectsData.length} projects
            </div>
          </motion.div>

          {/* Tier Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-2 mb-4"
          >
            <Button
              variant={tierFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTierFilter("all")}
            >
              All Tiers ({projectsData.length})
            </Button>
            <Button
              variant={tierFilter === "flagship" ? "default" : "outline"}
              size="sm"
              onClick={() => setTierFilter("flagship")}
              className={tierFilter === "flagship" ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 border-0" : ""}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Flagship ({flagshipCount})
            </Button>
            <Button
              variant={tierFilter === "strong" ? "default" : "outline"}
              size="sm"
              onClick={() => setTierFilter("strong")}
              className={tierFilter === "strong" ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0" : ""}
            >
              <Zap className="w-4 h-4 mr-1" />
              Strong ({strongCount})
            </Button>
            <Button
              variant={tierFilter === "supporting" ? "default" : "outline"}
              size="sm"
              onClick={() => setTierFilter("supporting")}
            >
              <Code2 className="w-4 h-4 mr-1" />
              Supporting ({supportingCount})
            </Button>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            <Button
              variant={categoryFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCategoryFilter("all")}
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              All Categories
            </Button>
            {categories.map(category => {
              const count = projectsData.filter(p => p.category === category).length
              if (count === 0) return null
              const Icon = categoryConfig[category].icon
              const color = categoryConfig[category].color
              return (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                  className="text-xs"
                >
                  <Icon className={`w-3 h-3 mr-1 ${categoryFilter === category ? "" : color}`} />
                  {category.replace("AI/ML Platform", "AI/ML").replace(" Platform", "")} ({count})
                </Button>
              )
            })}
          </motion.div>

          {/* Projects */}
          {viewMode === "grid" ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} viewMode="grid" />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div layout className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} viewMode="list" />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty state */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground mb-4">No projects match the selected filters.</p>
              <Button variant="outline" onClick={() => { setTierFilter("all"); setCategoryFilter("all") }}>
                Reset Filters
              </Button>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
