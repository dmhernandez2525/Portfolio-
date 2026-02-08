import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { getProjectCountByCategory } from "@/data/projects"
import { DashboardCard } from "./DashboardCard"

const CHART_COLORS = ["#00D4FF", "#FF4D94", "#7B2DFF", "#00CC66", "#FFB800", "#FF6B35", "#00AAFF", "#FF3366"]

export function ProjectsByCategoryChart() {
  const counts = getProjectCountByCategory()
  const data = Object.entries(counts)
    .map(([category, count]) => ({ category: category.replace(/\//g, "/ "), count }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <DashboardCard title="Projects by Category" subtitle={`${data.length} categories`}>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" tick={{ fill: "#888", fontSize: 10 }} />
            <YAxis
              dataKey="category"
              type="category"
              width={100}
              tick={{ fill: "#888", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a24", border: "1px solid #2a2a34", fontSize: 12 }}
              labelStyle={{ color: "#ccc" }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <rect key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  )
}
