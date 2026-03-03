import { experienceData } from "@/data/experience"
import { DashboardCard } from "./DashboardCard"

const BAR_COLORS = ["#00D4FF", "#FF4D94", "#7B2DFF", "#00CC66", "#FFB800", "#FF6B35"]

interface TimeRange {
  start: Date
  end: Date
}

function parseDuration(duration: string): TimeRange {
  const parts = duration.split(" - ")
  const start = new Date(parts[0])
  const endStr = parts[1]
  const currentYear = new Date().getFullYear().toString()
  const end = !endStr || endStr === "Present" || endStr.includes(currentYear)
    ? new Date()
    : new Date(endStr)
  return { start, end }
}

export function ExperienceTimeline() {
  const entries = experienceData
    .filter((e) => !e.isCollapsed)
    .map((e) => ({
      ...e,
      ...parseDuration(e.duration),
    }))

  const allDates = entries.flatMap((e) => [e.start.getTime(), e.end.getTime()])
  const minDate = Math.min(...allDates)
  const maxDate = Math.max(...allDates)
  const totalRange = maxDate - minDate || 1

  const minYear = new Date(minDate).getFullYear()
  const maxYear = new Date(maxDate).getFullYear()
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)

  return (
    <DashboardCard title="Experience Timeline" subtitle={`${experienceData.length} roles`}>
      <div className="space-y-2.5">
        {/* Year markers */}
        <div className="relative h-4 ml-[100px]">
          {years.map((year) => {
            const pos = ((new Date(year, 0, 1).getTime() - minDate) / totalRange) * 100
            return (
              <span
                key={year}
                className="absolute text-[9px] text-[#555] -translate-x-1/2"
                style={{ left: `${pos}%` }}
              >
                {year}
              </span>
            )
          })}
        </div>

        {/* Bars */}
        {entries.map((entry, i) => {
          const left = ((entry.start.getTime() - minDate) / totalRange) * 100
          const width = ((entry.end.getTime() - entry.start.getTime()) / totalRange) * 100

          return (
            <div key={entry.id} className="flex items-center gap-2">
              <div className="w-[100px] text-right shrink-0">
                <span className="text-[10px] text-[#888] truncate block">{entry.company}</span>
              </div>
              <div className="flex-1 relative h-5">
                <div
                  className="absolute top-0 h-full rounded"
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(width, 1)}%`,
                    backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                    opacity: 0.8,
                  }}
                  title={`${entry.company} — ${entry.title} (${entry.duration})`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}
