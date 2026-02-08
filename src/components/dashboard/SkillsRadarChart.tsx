import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"
import { skillsData, type SkillCategory } from "@/data/skills"
import { DashboardCard } from "./DashboardCard"

const LEVEL_VALUES: Record<string, number> = {
  Expert: 4,
  Advanced: 3,
  Intermediate: 2,
  Learning: 1,
}

const CATEGORIES: SkillCategory[] = ["Frontend", "Backend", "Database", "Cloud", "Beyond Code"]

function getRadarData() {
  return CATEGORIES.map((cat) => {
    const skills = skillsData.filter((s) => s.category === cat)
    const avgLevel =
      skills.reduce((sum, s) => sum + (LEVEL_VALUES[s.level] ?? 0), 0) / skills.length
    return {
      category: cat,
      level: Math.round(avgLevel * 25),
      count: skills.length,
    }
  })
}

export function SkillsRadarChart() {
  const data = getRadarData()

  return (
    <DashboardCard title="Skills by Category" subtitle="Average proficiency level">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#2a2a34" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "#888", fontSize: 11 }}
            />
            <Radar
              dataKey="level"
              stroke="#00D4FF"
              fill="#00D4FF"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  )
}
