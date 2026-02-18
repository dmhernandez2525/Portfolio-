import { describe, expect, it } from "vitest"
import { buildContributionHeatmap, type GitHubEvent } from "@/lib/social/github-activity"

describe("buildContributionHeatmap", () => {
  it("groups events by date", () => {
    const events: GitHubEvent[] = [
      { id: "1", type: "PushEvent", repo: "test/repo", createdAt: "2026-02-15T10:00:00Z", description: "Pushed 1 commit(s)" },
      { id: "2", type: "PushEvent", repo: "test/repo", createdAt: "2026-02-15T14:00:00Z", description: "Pushed 1 commit(s)" },
      { id: "3", type: "PushEvent", repo: "test/repo", createdAt: "2026-02-14T10:00:00Z", description: "Pushed 1 commit(s)" },
    ]

    const heatmap = buildContributionHeatmap(events)
    expect(heatmap).toHaveLength(2)

    const feb15 = heatmap.find((d) => d.date === "2026-02-15")
    expect(feb15?.count).toBe(2)
    expect(feb15?.level).toBe(1)

    const feb14 = heatmap.find((d) => d.date === "2026-02-14")
    expect(feb14?.count).toBe(1)
    expect(feb14?.level).toBe(1)
  })

  it("returns empty array for no events", () => {
    expect(buildContributionHeatmap([])).toEqual([])
  })

  it("assigns correct levels based on count", () => {
    const events: GitHubEvent[] = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      type: "PushEvent",
      repo: "test/repo",
      createdAt: "2026-02-15T10:00:00Z",
      description: "Pushed 1 commit(s)",
    }))

    const heatmap = buildContributionHeatmap(events)
    expect(heatmap[0].level).toBe(3)
  })
})
