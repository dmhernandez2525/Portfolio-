import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { type ProjectItem } from "@/data/projects"

interface ProjectRelatedProps {
  projects: ProjectItem[]
}

export function ProjectRelated({ projects }: ProjectRelatedProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Related Projects</h2>
      {projects.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="rounded-lg border border-border bg-card/40 p-4 transition hover:border-primary/60"
            >
              <h3 className="mb-1 font-medium">{project.title}</h3>
              <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{project.tagline}</p>
              <div className="flex flex-wrap gap-1">
                {project.tech.slice(0, 3).map((tech) => (
                  <Badge key={`${project.id}-${tech}`} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No related projects available for this entry.</p>
      )}
    </section>
  )
}
