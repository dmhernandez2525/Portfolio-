import { ArrowLeft, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { ProjectItem } from "@/data/projects"

interface ProjectNavigationProps {
  previousProject: ProjectItem | null
  nextProject: ProjectItem | null
}

export function ProjectNavigation({ previousProject, nextProject }: ProjectNavigationProps) {
  return (
    <section className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
      {previousProject ? (
        <Button asChild variant="outline">
          <Link to={`/projects/${previousProject.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous: {previousProject.title}
          </Link>
        </Button>
      ) : (
        <div />
      )}

      {nextProject ? (
        <Button asChild>
          <Link to={`/projects/${nextProject.id}`}>
            Next: {nextProject.title}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      ) : null}
    </section>
  )
}
