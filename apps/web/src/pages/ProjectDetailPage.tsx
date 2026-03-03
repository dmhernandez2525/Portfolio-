import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, Github } from "lucide-react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ProjectBreadcrumbs } from "@/components/projects/ProjectBreadcrumbs"
import { ProjectCaseStudy } from "@/components/projects/ProjectCaseStudy"
import { ProjectDemoEmbed } from "@/components/projects/ProjectDemoEmbed"
import { ProjectGallery } from "@/components/projects/ProjectGallery"
import { ProjectMetricsPanel } from "@/components/projects/ProjectMetricsPanel"
import { ProjectNavigation } from "@/components/projects/ProjectNavigation"
import { ProjectRelated } from "@/components/projects/ProjectRelated"
import { ProjectTechStack } from "@/components/projects/ProjectTechStack"
import { ProjectTimeline } from "@/components/projects/ProjectTimeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { projectsData } from "@/data/projects"
import { useProjectRepoMetrics } from "@/hooks/useProjectRepoMetrics"
import { buildProjectDetailModel } from "@/lib/project-detail-utils"

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) {
    return <Navigate to="/projects" replace />
  }

  const detail = buildProjectDetailModel(slug, projectsData)

  if (!detail) {
    return <Navigate to="/404" replace />
  }

  const { metrics, isLoading, error } = useProjectRepoMetrics(detail.project)

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 pt-24">
        <div className="container max-w-6xl">
          <ProjectBreadcrumbs projectTitle={detail.project.title} />

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-8 rounded-xl border border-border bg-card/40 p-6"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{detail.project.category}</Badge>
              <Badge variant="outline" className="capitalize">
                {detail.project.tier}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {detail.project.status}
              </Badge>
            </div>

            <h1 className="mb-2 text-3xl font-bold md:text-4xl">{detail.project.title}</h1>
            <p className="mb-4 text-lg text-primary">{detail.project.tagline}</p>
            <p className="max-w-4xl text-muted-foreground">{detail.project.description}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              {detail.project.link ? (
                <Button asChild>
                  <a href={detail.project.link} target={detail.project.link.startsWith("/") ? "_self" : "_blank"} rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {detail.project.category === "Game" ? "Play Project" : "Open Live Demo"}
                  </a>
                </Button>
              ) : null}

              {detail.project.github ? (
                <Button asChild variant="outline">
                  <a href={detail.project.github} target="_blank" rel="noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    View Source
                  </a>
                </Button>
              ) : null}
            </div>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
            className="space-y-8"
          >
            <ProjectGallery items={detail.gallery} projectTitle={detail.project.title} />
            <ProjectMetricsPanel metrics={metrics} isLoading={isLoading} error={error} />
            <ProjectTechStack techDetails={detail.techDetails} />
            <ProjectCaseStudy caseStudy={detail.caseStudy} />
            <ProjectTimeline milestones={detail.timeline} />
            <ProjectDemoEmbed link={detail.project.link} title={detail.project.title} />
            <ProjectRelated projects={detail.relatedProjects} />
            <ProjectNavigation previousProject={detail.previousProject} nextProject={detail.nextProject} />
          </motion.div>

          <div className="mt-12">
            <Button asChild variant="outline">
              <Link to="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Projects
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
