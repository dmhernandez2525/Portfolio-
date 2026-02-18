import { useMemo, useState } from "react"
import { Download } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { buildAnalyticsReport, createPresetRange, downloadAnalyticsFile, previousRange, reportToCsv } from "@/lib/analytics-report"
import { getAnalyticsEvents } from "@/lib/analytics-store"
import type { AnalyticsRange } from "@/types/analytics"

type RangePreset = "today" | "7d" | "30d" | "custom"

function toDateInput(iso: string): string {
  return iso.slice(0, 10)
}

function fromDateInput(value: string, mode: "start" | "end"): string {
  const date = new Date(value)
  if (mode === "start") {
    date.setHours(0, 0, 0, 0)
  } else {
    date.setHours(23, 59, 59, 999)
  }
  return date.toISOString()
}

export function AnalyticsPanel() {
  const [preset, setPreset] = useState<RangePreset>("7d")
  const [comparisonEnabled, setComparisonEnabled] = useState<boolean>(false)
  const [range, setRange] = useState<AnalyticsRange>(() => createPresetRange("7d"))

  const currentEvents = useMemo(() => getAnalyticsEvents(range), [range])
  const report = useMemo(() => buildAnalyticsReport(currentEvents), [currentEvents])
  const previousReport = useMemo(() => {
    if (!comparisonEnabled) return null
    return buildAnalyticsReport(getAnalyticsEvents(previousRange(range)))
  }, [comparisonEnabled, range])

  const handlePresetChange = (nextPreset: RangePreset): void => {
    setPreset(nextPreset)
    if (nextPreset !== "custom") {
      setRange(createPresetRange(nextPreset))
    }
  }

  const exportCsv = (): void => {
    downloadAnalyticsFile("analytics-report.csv", reportToCsv(report), "text/csv;charset=utf-8")
  }

  const exportJson = (): void => {
    downloadAnalyticsFile("analytics-report.json", JSON.stringify(report, null, 2), "application/json")
  }

  const pageViewDelta = previousReport ? report.summary.pageViews - previousReport.summary.pageViews : null
  const visitorDelta = previousReport ? report.summary.uniqueVisitors - previousReport.summary.uniqueVisitors : null

  return (
    <section className="mt-8 rounded-xl border border-border bg-card/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
          <p className="text-sm text-muted-foreground">Visitor activity, funnels, goals, and top-performing content.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={exportJson}>
            <Download className="mr-1.5 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" variant={preset === "today" ? "default" : "outline"} onClick={() => handlePresetChange("today")}>
          Today
        </Button>
        <Button size="sm" variant={preset === "7d" ? "default" : "outline"} onClick={() => handlePresetChange("7d")}>
          7 Days
        </Button>
        <Button size="sm" variant={preset === "30d" ? "default" : "outline"} onClick={() => handlePresetChange("30d")}>
          30 Days
        </Button>
        <Button size="sm" variant={preset === "custom" ? "default" : "outline"} onClick={() => handlePresetChange("custom")}>
          Custom
        </Button>
        <label className="ml-3 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={comparisonEnabled} onChange={(event) => setComparisonEnabled(event.target.checked)} />
          Compare previous period
        </label>
      </div>

      {preset === "custom" ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input
            type="date"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={toDateInput(range.start)}
            onChange={(event) => setRange((current) => ({ ...current, start: fromDateInput(event.target.value, "start") }))}
          />
          <input
            type="date"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={toDateInput(range.end)}
            onChange={(event) => setRange((current) => ({ ...current, end: fromDateInput(event.target.value, "end") }))}
          />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Page Views</p>
          <p className="text-xl font-semibold">{report.summary.pageViews}</p>
          {pageViewDelta !== null ? <p className="text-xs text-muted-foreground">Δ {pageViewDelta}</p> : null}
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Unique Visitors</p>
          <p className="text-xl font-semibold">{report.summary.uniqueVisitors}</p>
          {visitorDelta !== null ? <p className="text-xs text-muted-foreground">Δ {visitorDelta}</p> : null}
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Sessions</p>
          <p className="text-xl font-semibold">{report.summary.sessions}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Active Visitors</p>
          <p className="text-xl font-semibold">{report.summary.activeVisitors}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="mb-2 text-sm font-medium">Visitor Funnel</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="mb-2 text-sm font-medium">Engagement</p>
          <p className="text-sm text-muted-foreground">Average Scroll Depth: {report.averageScrollDepth}%</p>
          <p className="text-sm text-muted-foreground">Average Time On Page: {report.averageTimeOnPageSeconds}s</p>
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Goals</p>
            <ul className="mt-2 space-y-1 text-sm">
              {report.goals.length === 0 ? <li className="text-muted-foreground">No goal events yet.</li> : null}
              {report.goals.map((goal) => (
                <li key={goal.goal} className="flex items-center justify-between">
                  <span>{goal.goal}</span>
                  <span className="font-medium">{goal.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium">Top Content</p>
          <ul className="mt-2 space-y-1 text-sm">
            {report.topContent.map((row) => (
              <li key={row.path} className="flex items-center justify-between">
                <span className="truncate pr-2">{row.path}</span>
                <span className="font-medium">{row.views}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium">Most Played Games</p>
          <ul className="mt-2 space-y-1 text-sm">
            {report.topGames.length === 0 ? <li className="text-muted-foreground">No game routes tracked yet.</li> : null}
            {report.topGames.map((row) => (
              <li key={row.path} className="flex items-center justify-between">
                <span>{row.path}</span>
                <span className="font-medium">{row.views}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
