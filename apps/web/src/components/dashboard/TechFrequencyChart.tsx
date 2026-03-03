import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { projectsData } from "@/data/projects"
import { DashboardCard } from "./DashboardCard"

function normalizeTech(name: string): string {
  return name.replace(/\s*[\d.]+$/, "").replace(/\s+v\d+.*$/, "")
}

function getTechFrequency() {
  const counts: Record<string, number> = {}
  for (const p of projectsData) {
    for (const t of p.tech) {
      const normalized = normalizeTech(t)
      counts[normalized] = (counts[normalized] || 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([tech, count]) => ({ tech, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
}

export function TechFrequencyChart() {
  const data = getTechFrequency()

  return (
    <DashboardCard title="Most Used Technologies" subtitle="Across all projects">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" tick={{ fill: "#888", fontSize: 10 }} />
            <YAxis
              dataKey="tech"
              type="category"
              width={90}
              tick={{ fill: "#888", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a24", border: "1px solid #2a2a34", fontSize: 12 }}
              labelStyle={{ color: "#ccc" }}
            />
            <Bar dataKey="count" fill="#7B2DFF" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  )
}
