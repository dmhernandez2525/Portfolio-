import { describe, expect, it } from "vitest"
import {
  buildDependencyGraph,
  buildGrowthTimeline,
  buildRadarData,
  calculateCodeFrequency,
  filterTimelineByCategory,
  filterTimelineByRange,
  interpolateGrowth,
  normalizeRadarData,
  sortTimeline,
} from "@/lib/visualization/chart-data"
import type { TimelineEntry, GrowthPoint } from "@/lib/visualization/chart-data"

describe("buildRadarData", () => {
  it("builds axes from skill map", () => {
    const data = buildRadarData({ React: 90, Node: 75 })
    expect(data).toHaveLength(2)
    expect(data[0].label).toBe("React")
    expect(data[0].value).toBe(90)
  })

  it("clamps values to maxValue", () => {
    const data = buildRadarData({ React: 150 }, 100)
    expect(data[0].value).toBe(100)
  })

  it("returns empty for empty input", () => {
    expect(buildRadarData({})).toEqual([])
  })
})

describe("normalizeRadarData", () => {
  it("normalizes values to 0-100 scale", () => {
    const axes = [
      { label: "A", value: 5, maxValue: 10 },
      { label: "B", value: 8, maxValue: 10 },
    ]
    const normalized = normalizeRadarData(axes)
    expect(normalized[0].value).toBe(50)
    expect(normalized[1].value).toBe(80)
    expect(normalized[0].maxValue).toBe(100)
  })

  it("handles empty array", () => {
    expect(normalizeRadarData([])).toEqual([])
  })
})

describe("sortTimeline", () => {
  it("sorts entries chronologically", () => {
    const entries: TimelineEntry[] = [
      { id: "2", date: "2025-06-01", title: "B", description: "", category: "work" },
      { id: "1", date: "2024-01-01", title: "A", description: "", category: "work" },
    ]
    const sorted = sortTimeline(entries)
    expect(sorted[0].id).toBe("1")
  })
})

describe("filterTimelineByRange", () => {
  const entries: TimelineEntry[] = [
    { id: "1", date: "2024-01-01", title: "A", description: "", category: "work" },
    { id: "2", date: "2024-06-01", title: "B", description: "", category: "edu" },
    { id: "3", date: "2025-01-01", title: "C", description: "", category: "work" },
  ]

  it("filters within date range", () => {
    const filtered = filterTimelineByRange(entries, "2024-03-01", "2024-12-31")
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe("2")
  })

  it("includes boundary dates", () => {
    const filtered = filterTimelineByRange(entries, "2024-01-01", "2025-01-01")
    expect(filtered).toHaveLength(3)
  })
})

describe("filterTimelineByCategory", () => {
  it("filters by category", () => {
    const entries: TimelineEntry[] = [
      { id: "1", date: "2024-01-01", title: "A", description: "", category: "work" },
      { id: "2", date: "2024-06-01", title: "B", description: "", category: "edu" },
    ]
    expect(filterTimelineByCategory(entries, "work")).toHaveLength(1)
  })
})

describe("buildDependencyGraph", () => {
  it("builds nodes and edges from projects", () => {
    const projects = [
      { name: "app", group: "frontend", dependencies: ["react", "typescript"] },
      { name: "api", group: "backend", dependencies: ["express"] },
    ]
    const graph = buildDependencyGraph(projects)
    expect(graph.nodes.length).toBe(5)
    expect(graph.edges.length).toBe(3)
  })

  it("deduplicates shared dependencies", () => {
    const projects = [
      { name: "a", group: "app", dependencies: ["react"] },
      { name: "b", group: "app", dependencies: ["react"] },
    ]
    const graph = buildDependencyGraph(projects)
    const reactNodes = graph.nodes.filter((n) => n.id === "react")
    expect(reactNodes).toHaveLength(1)
  })

  it("handles empty input", () => {
    const graph = buildDependencyGraph([])
    expect(graph.nodes).toEqual([])
    expect(graph.edges).toEqual([])
  })
})

describe("calculateCodeFrequency", () => {
  it("calculates percentages and sorts by lines", () => {
    const result = calculateCodeFrequency({ TypeScript: 800, Python: 200 })
    expect(result).toHaveLength(2)
    expect(result[0].language).toBe("TypeScript")
    expect(result[0].percentage).toBe(80)
    expect(result[1].percentage).toBe(20)
  })

  it("assigns known colors", () => {
    const result = calculateCodeFrequency({ TypeScript: 100 })
    expect(result[0].color).toBe("#3178c6")
  })

  it("uses fallback color for unknown languages", () => {
    const result = calculateCodeFrequency({ Haskell: 100 })
    expect(result[0].color).toBe("#999999")
  })

  it("returns empty for zero total", () => {
    expect(calculateCodeFrequency({})).toEqual([])
  })
})

describe("buildGrowthTimeline", () => {
  it("sorts growth points chronologically", () => {
    const points = [
      { date: "2025-06-01", skill: "React", level: 8 },
      { date: "2024-01-01", skill: "React", level: 3 },
    ]
    const sorted = buildGrowthTimeline(points)
    expect(sorted[0].level).toBe(3)
  })
})

describe("interpolateGrowth", () => {
  it("adds midpoints for large jumps", () => {
    const points: GrowthPoint[] = [
      { date: "2024-01-01", skill: "React", level: 2 },
      { date: "2025-01-01", skill: "React", level: 8 },
    ]
    const interpolated = interpolateGrowth(points, "React")
    expect(interpolated.length).toBeGreaterThan(2)
    expect(interpolated[1].level).toBe(5)
  })

  it("filters by skill name", () => {
    const points: GrowthPoint[] = [
      { date: "2024-01-01", skill: "React", level: 3 },
      { date: "2024-06-01", skill: "Python", level: 5 },
    ]
    const result = interpolateGrowth(points, "React")
    expect(result).toHaveLength(1)
  })

  it("returns single point as-is", () => {
    const points: GrowthPoint[] = [
      { date: "2024-01-01", skill: "Go", level: 1 },
    ]
    expect(interpolateGrowth(points, "Go")).toHaveLength(1)
  })
})
