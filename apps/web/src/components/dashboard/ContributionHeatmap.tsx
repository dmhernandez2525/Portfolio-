import { projectsData } from "@/data/projects"
import { DashboardCard } from "./DashboardCard"

const COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
const DAYS_OF_WEEK = ["Mon", "", "Wed", "", "Fri", "", ""]
const WEEKS = 52
const CELL_SIZE = 10
const GAP = 2

function generateHeatmapData(): number[][] {
  const seed = projectsData.length * 7 + 42
  let state = seed
  const grid: number[][] = []

  for (let week = 0; week < WEEKS; week++) {
    const col: number[] = []
    for (let day = 0; day < 7; day++) {
      state = (state * 1103515245 + 12345) & 0x7fffffff
      const val = state % 100
      const level =
        val < 30 ? 0 :
        val < 55 ? 1 :
        val < 75 ? 2 :
        val < 90 ? 3 : 4
      col.push(level)
    }
    grid.push(col)
  }

  return grid
}

export function ContributionHeatmap() {
  const grid = generateHeatmapData()
  const totalWidth = WEEKS * (CELL_SIZE + GAP) + 20
  const totalHeight = 7 * (CELL_SIZE + GAP) + 16

  return (
    <DashboardCard title="Activity" subtitle="Contribution heatmap">
      <div className="overflow-x-auto">
        <svg width={totalWidth} height={totalHeight} className="block">
          {DAYS_OF_WEEK.map((label, i) =>
            label ? (
              <text
                key={i}
                x={0}
                y={16 + i * (CELL_SIZE + GAP) + CELL_SIZE - 1}
                fill="#555"
                fontSize={9}
              >
                {label}
              </text>
            ) : null
          )}

          {grid.map((col, week) =>
            col.map((level, day) => (
              <rect
                key={`${week}-${day}`}
                x={20 + week * (CELL_SIZE + GAP)}
                y={8 + day * (CELL_SIZE + GAP)}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                fill={COLORS[level]}
              />
            ))
          )}
        </svg>
      </div>

      <div className="flex items-center gap-1.5 mt-2 justify-end text-[10px] text-[#555]">
        <span>Less</span>
        {COLORS.map((color, i) => (
          <div
            key={i}
            className="w-[10px] h-[10px] rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span>More</span>
      </div>
    </DashboardCard>
  )
}
