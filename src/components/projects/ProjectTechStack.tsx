import { Braces, Database, Globe, Server, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ProjectTechDetail } from "@/types/project-detail"

interface ProjectTechStackProps {
  techDetails: ProjectTechDetail[]
}

function pickIcon(tech: string): LucideIcon {
  const normalized = tech.toLowerCase()

  if (normalized.includes("react") || normalized.includes("next") || normalized.includes("tailwind")) {
    return Globe
  }

  if (normalized.includes("postgre") || normalized.includes("redis") || normalized.includes("sql") || normalized.includes("prisma")) {
    return Database
  }

  if (normalized.includes("api") || normalized.includes("express") || normalized.includes("fastapi") || normalized.includes("node")) {
    return Server
  }

  if (normalized.includes("ai") || normalized.includes("gpt") || normalized.includes("claude") || normalized.includes("gemini")) {
    return Sparkles
  }

  return Braces
}

export function ProjectTechStack({ techDetails }: ProjectTechStackProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Tech Stack Details</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {techDetails.map((entry) => {
          const Icon = pickIcon(entry.name)

          return (
            <div key={entry.name} className="rounded-lg border border-border bg-card/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{entry.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{entry.proficiency}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${entry.proficiency}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
