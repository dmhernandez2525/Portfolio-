/**
 * Data preparation for radar charts, timelines, dependency graphs,
 * and code frequency visualizations.
 */

export interface RadarAxis {
  label: string
  value: number
  maxValue: number
}

export interface TimelineEntry {
  id: string
  date: string
  title: string
  description: string
  category: string
}

export interface DependencyNode {
  id: string
  label: string
  group: string
}

export interface DependencyEdge {
  source: string
  target: string
  weight: number
}

export interface DependencyGraph {
  nodes: DependencyNode[]
  edges: DependencyEdge[]
}

export interface CodeFrequency {
  language: string
  lines: number
  percentage: number
  color: string
}

export interface GrowthPoint {
  date: string
  skill: string
  level: number
}

export function buildRadarData(
  skills: Record<string, number>,
  maxValue = 100
): RadarAxis[] {
  return Object.entries(skills).map(([label, value]) => ({
    label,
    value: Math.min(value, maxValue),
    maxValue,
  }))
}

export function normalizeRadarData(axes: RadarAxis[]): RadarAxis[] {
  if (axes.length === 0) return []
  const max = Math.max(...axes.map((a) => a.maxValue))
  if (max === 0) return axes
  return axes.map((a) => ({
    ...a,
    value: (a.value / a.maxValue) * 100,
    maxValue: 100,
  }))
}

export function sortTimeline(entries: TimelineEntry[]): TimelineEntry[] {
  return [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

export function filterTimelineByRange(
  entries: TimelineEntry[],
  start: string,
  end: string
): TimelineEntry[] {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  return entries.filter((e) => {
    const t = new Date(e.date).getTime()
    return t >= startTime && t <= endTime
  })
}

export function filterTimelineByCategory(
  entries: TimelineEntry[],
  category: string
): TimelineEntry[] {
  return entries.filter((e) => e.category === category)
}

export function buildDependencyGraph(
  projects: Array<{ name: string; group: string; dependencies: string[] }>
): DependencyGraph {
  const nodeSet = new Set<string>()
  const nodes: DependencyNode[] = []
  const edges: DependencyEdge[] = []

  for (const proj of projects) {
    if (!nodeSet.has(proj.name)) {
      nodeSet.add(proj.name)
      nodes.push({ id: proj.name, label: proj.name, group: proj.group })
    }

    for (const dep of proj.dependencies) {
      if (!nodeSet.has(dep)) {
        nodeSet.add(dep)
        nodes.push({ id: dep, label: dep, group: "dependency" })
      }
      edges.push({ source: proj.name, target: dep, weight: 1 })
    }
  }

  return { nodes, edges }
}

export function calculateCodeFrequency(
  languageLines: Record<string, number>
): CodeFrequency[] {
  const total = Object.values(languageLines).reduce((s, v) => s + v, 0)
  if (total === 0) return []

  const colors: Record<string, string> = {
    typescript: "#3178c6",
    javascript: "#f7df1e",
    python: "#3776ab",
    rust: "#dea584",
    go: "#00add8",
    html: "#e34c26",
    css: "#563d7c",
  }

  return Object.entries(languageLines)
    .map(([language, lines]) => ({
      language,
      lines,
      percentage: Math.round((lines / total) * 1000) / 10,
      color: colors[language.toLowerCase()] ?? "#999999",
    }))
    .sort((a, b) => b.lines - a.lines)
}

export function buildGrowthTimeline(
  dataPoints: Array<{ date: string; skill: string; level: number }>
): GrowthPoint[] {
  return [...dataPoints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

export function interpolateGrowth(
  points: GrowthPoint[],
  skill: string
): GrowthPoint[] {
  const filtered = points.filter((p) => p.skill === skill)
  if (filtered.length < 2) return filtered

  const result: GrowthPoint[] = [filtered[0]]
  for (let i = 1; i < filtered.length; i++) {
    const prev = filtered[i - 1]
    const curr = filtered[i]
    if (curr.level - prev.level > 1) {
      const midDate = new Date(
        (new Date(prev.date).getTime() + new Date(curr.date).getTime()) / 2
      )
      result.push({
        date: midDate.toISOString().slice(0, 10),
        skill,
        level: Math.round((prev.level + curr.level) / 2),
      })
    }
    result.push(curr)
  }
  return result
}
