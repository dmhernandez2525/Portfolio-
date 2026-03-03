import { projectsData, getAllTechnologies, getLiveProjects } from "@/data/projects"
import { experienceData } from "@/data/experience"
import { blogPosts } from "@/data/blog"

interface StatCardProps {
  label: string
  value: string | number
  color: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-[#1a1a24] border border-[#2a2a34] rounded-lg p-4 flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888] mb-1">
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

export function CareerStatsCards() {
  const yearsExp = new Date().getFullYear() - 2018
  const totalProjects = projectsData.length
  const totalTech = getAllTechnologies().length
  const liveProjects = getLiveProjects().length
  const totalCompanies = experienceData.length
  const totalPosts = blogPosts.length

  const stats: StatCardProps[] = [
    { label: "Years Experience", value: `${yearsExp}+`, color: "#00D4FF" },
    { label: "Projects Built", value: totalProjects, color: "#FF4D94" },
    { label: "Technologies", value: totalTech, color: "#7B2DFF" },
    { label: "Live in Production", value: liveProjects, color: "#00CC66" },
    { label: "Companies", value: totalCompanies, color: "#FFB800" },
    { label: "Blog Posts", value: totalPosts, color: "#FF6B35" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  )
}
