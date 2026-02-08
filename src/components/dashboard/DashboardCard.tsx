import type { ReactNode } from "react"

interface DashboardCardProps {
  title: string
  subtitle?: string
  className?: string
  children: ReactNode
}

export function DashboardCard({ title, subtitle, className = "", children }: DashboardCardProps) {
  return (
    <div className={`bg-[#1a1a24] border border-[#2a2a34] rounded-lg p-4 ${className}`}>
      <div className="mb-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#888]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[10px] text-[#555] mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}
