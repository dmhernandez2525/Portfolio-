import type { ProjectTimelineMilestone } from "@/types/project-detail"

interface ProjectTimelineProps {
  milestones: ProjectTimelineMilestone[]
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ProjectTimeline({ milestones }: ProjectTimelineProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Project Timeline</h2>
      <ol className="relative space-y-4 border-l border-border pl-6">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="relative">
            <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-primary" />
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <div className="mb-1 flex items-center justify-between gap-3">
                <h3 className="font-medium">{milestone.label}</h3>
                <span className="text-xs text-muted-foreground">{formatDate(milestone.date)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{milestone.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
