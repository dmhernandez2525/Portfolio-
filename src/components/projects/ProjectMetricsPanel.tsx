import { BarChart3, GitFork, Star } from "lucide-react"
import type { ProjectRepoMetrics } from "@/types/project-detail"

interface ProjectMetricsPanelProps {
  metrics: ProjectRepoMetrics
  isLoading: boolean
  error: string | null
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US")
}

export function ProjectMetricsPanel({ metrics, isLoading, error }: ProjectMetricsPanelProps) {
  const label = isLoading ? "Syncing metrics" : error ? "Fallback metrics" : "Live repo metrics"

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Metrics</h2>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Stars</span>
          </div>
          <p className="text-2xl font-semibold">{formatNumber(metrics.stars)}</p>
        </div>

        <div className="rounded-lg border border-border bg-card/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <GitFork className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Forks</span>
          </div>
          <p className="text-2xl font-semibold">{formatNumber(metrics.forks)}</p>
        </div>

        <div className="rounded-lg border border-border bg-card/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Approx LOC</span>
          </div>
          <p className="text-2xl font-semibold">{formatNumber(metrics.linesOfCodeApprox)}</p>
        </div>
      </div>

      {error ? <p className="text-xs text-muted-foreground">GitHub API unavailable, showing computed local metrics.</p> : null}
    </section>
  )
}
