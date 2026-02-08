import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { projectsData } from "@/data/projects"
import { DashboardCard } from "./DashboardCard"

const STATUS_COLORS: Record<string, string> = {
  production: "#00CC66",
  active: "#00D4FF",
  beta: "#FFB800",
  development: "#7B2DFF",
  "local-only": "#FF6B35",
}

function getStatusData() {
  const counts: Record<string, number> = {}
  for (const p of projectsData) {
    counts[p.status] = (counts[p.status] || 0) + 1
  }
  return Object.entries(counts).map(([status, count]) => ({
    name: status,
    value: count,
    color: STATUS_COLORS[status] ?? "#888",
  }))
}

export function ProjectsStatusChart() {
  const data = getStatusData()

  return (
    <DashboardCard title="Project Status" subtitle="Current state breakdown">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a24", border: "1px solid #2a2a34", fontSize: 12 }}
              labelStyle={{ color: "#ccc" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-[#888]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
