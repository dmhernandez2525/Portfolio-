import { lazy, Suspense } from "react"
import { ModeSwitcher } from "@/components/shared/ModeSwitcher"

const CareerStatsCards = lazy(() =>
  import("@/components/dashboard/CareerStatsCards").then((m) => ({ default: m.CareerStatsCards }))
)
const SkillsRadarChart = lazy(() =>
  import("@/components/dashboard/SkillsRadarChart").then((m) => ({ default: m.SkillsRadarChart }))
)
const ProjectsByCategoryChart = lazy(() =>
  import("@/components/dashboard/ProjectsByCategoryChart").then((m) => ({
    default: m.ProjectsByCategoryChart,
  }))
)
const TechFrequencyChart = lazy(() =>
  import("@/components/dashboard/TechFrequencyChart").then((m) => ({
    default: m.TechFrequencyChart,
  }))
)
const ProjectsStatusChart = lazy(() =>
  import("@/components/dashboard/ProjectsStatusChart").then((m) => ({
    default: m.ProjectsStatusChart,
  }))
)
const ExperienceTimeline = lazy(() =>
  import("@/components/dashboard/ExperienceTimeline").then((m) => ({
    default: m.ExperienceTimeline,
  }))
)
const ContributionHeatmap = lazy(() =>
  import("@/components/dashboard/ContributionHeatmap").then((m) => ({
    default: m.ContributionHeatmap,
  }))
)
const RecentBlogCard = lazy(() =>
  import("@/components/dashboard/RecentBlogCard").then((m) => ({ default: m.RecentBlogCard }))
)

function ChartSkeleton({ height = "h-[200px]" }: { height?: string }) {
  return (
    <div className="bg-[#1a1a24] border border-[#2a2a34] rounded-lg p-4 animate-pulse">
      <div className="h-3 w-24 bg-[#2a2a34] rounded mb-4" />
      <div className={`${height} bg-[#2a2a34]/50 rounded`} />
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#1a1a24] border border-[#2a2a34] rounded-lg p-4 animate-pulse">
          <div className="h-2 w-16 bg-[#2a2a34] rounded mb-2" />
          <div className="h-6 w-10 bg-[#2a2a34] rounded" />
        </div>
      ))}
    </div>
  )
}

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-white p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">Career Dashboard</h1>
        <p className="text-xs text-[#555] mt-1">Analytics and metrics across all projects and skills</p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <CareerStatsCards />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        <Suspense fallback={<ChartSkeleton />}>
          <div className="xl:col-span-2">
            <TechFrequencyChart />
          </div>
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <SkillsRadarChart />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <ProjectsStatusChart />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <div className="xl:col-span-2">
            <ProjectsByCategoryChart />
          </div>
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <div className="xl:col-span-2">
            <ExperienceTimeline />
          </div>
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <div className="xl:col-span-3">
            <ContributionHeatmap />
          </div>
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <RecentBlogCard />
        </Suspense>
      </div>

      <ModeSwitcher />
    </div>
  )
}
