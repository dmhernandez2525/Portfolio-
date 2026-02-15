import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

interface ProjectBreadcrumbsProps {
  projectTitle: string
}

export function ProjectBreadcrumbs({ projectTitle }: ProjectBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="transition-colors hover:text-primary">
            Home
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </li>
        <li>
          <Link to="/projects" className="transition-colors hover:text-primary">
            Projects
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </li>
        <li className="font-medium text-foreground">{projectTitle}</li>
      </ol>
    </nav>
  )
}
