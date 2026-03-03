import { describe, expect, it } from "vitest"
import {
  calculateSkillLevels,
  deriveProjectStatus,
  groupCommitsByWeek,
  suggestBlogPosts,
} from "@/lib/content-automation/activity-sync"
import type { CommitActivity } from "@/lib/content-automation/activity-sync"

function makeCommit(overrides: Partial<CommitActivity> = {}): CommitActivity {
  return {
    repo: "my-app",
    message: "fix: resolve issue",
    date: new Date().toISOString(),
    language: "TypeScript",
    ...overrides,
  }
}

describe("deriveProjectStatus", () => {
  it("marks active projects correctly", () => {
    const commits = [makeCommit({ repo: "app", date: new Date().toISOString() })]
    const status = deriveProjectStatus(commits, "app")
    expect(status.status).toBe("active")
    expect(status.commitCount).toBe(1)
  })

  it("marks old projects as archived", () => {
    const oldDate = new Date()
    oldDate.setFullYear(oldDate.getFullYear() - 1)
    const commits = [makeCommit({ repo: "app", date: oldDate.toISOString() })]
    const status = deriveProjectStatus(commits, "app")
    expect(status.status).toBe("archived")
  })

  it("marks moderately old projects as maintained", () => {
    const threeMonths = new Date()
    threeMonths.setMonth(threeMonths.getMonth() - 3)
    const commits = [makeCommit({ repo: "app", date: threeMonths.toISOString() })]
    const status = deriveProjectStatus(commits, "app")
    expect(status.status).toBe("maintained")
  })

  it("returns archived for no commits", () => {
    const status = deriveProjectStatus([], "missing-repo")
    expect(status.status).toBe("archived")
    expect(status.commitCount).toBe(0)
  })

  it("filters commits by repo name", () => {
    const commits = [
      makeCommit({ repo: "app-a" }),
      makeCommit({ repo: "app-b" }),
      makeCommit({ repo: "app-a" }),
    ]
    const status = deriveProjectStatus(commits, "app-a")
    expect(status.commitCount).toBe(2)
  })
})

describe("calculateSkillLevels", () => {
  it("calculates beginner level for few commits", () => {
    const commits = Array.from({ length: 5 }, () => makeCommit({ language: "Rust" }))
    const skills = calculateSkillLevels(commits)
    const rust = skills.find((s) => s.skill === "rust")
    expect(rust?.level).toBe("beginner")
    expect(rust?.commitCount).toBe(5)
  })

  it("calculates intermediate level", () => {
    const commits = Array.from({ length: 25 }, () => makeCommit({ language: "Python" }))
    const skills = calculateSkillLevels(commits)
    expect(skills.find((s) => s.skill === "python")?.level).toBe("intermediate")
  })

  it("calculates advanced level", () => {
    const commits = Array.from({ length: 55 }, () => makeCommit({ language: "Go" }))
    const skills = calculateSkillLevels(commits)
    expect(skills.find((s) => s.skill === "go")?.level).toBe("advanced")
  })

  it("calculates expert level", () => {
    const commits = Array.from({ length: 120 }, () => makeCommit({ language: "TypeScript" }))
    const skills = calculateSkillLevels(commits)
    expect(skills.find((s) => s.skill === "typescript")?.level).toBe("expert")
  })

  it("sorts by commit count descending", () => {
    const commits = [
      ...Array.from({ length: 10 }, () => makeCommit({ language: "A" })),
      ...Array.from({ length: 30 }, () => makeCommit({ language: "B" })),
    ]
    const skills = calculateSkillLevels(commits)
    expect(skills[0].skill).toBe("b")
  })

  it("tracks latest usage date", () => {
    const old = new Date("2024-01-01").toISOString()
    const recent = new Date("2025-06-01").toISOString()
    const commits = [
      makeCommit({ language: "Rust", date: old }),
      makeCommit({ language: "Rust", date: recent }),
    ]
    const skills = calculateSkillLevels(commits)
    expect(skills[0].lastUsed).toBe(recent)
  })
})

describe("suggestBlogPosts", () => {
  it("suggests posts for most active repos", () => {
    const commits = [
      ...Array.from({ length: 10 }, () => makeCommit({ repo: "popular", language: "TypeScript" })),
      ...Array.from({ length: 3 }, () => makeCommit({ repo: "quiet", language: "Python" })),
    ]
    const suggestions = suggestBlogPosts(commits)
    expect(suggestions.length).toBeGreaterThanOrEqual(1)
    expect(suggestions[0].relatedRepo).toBe("popular")
    expect(suggestions[0].title).toContain("popular")
  })

  it("returns at most 3 suggestions", () => {
    const repos = ["a", "b", "c", "d", "e"]
    const commits = repos.flatMap((repo) =>
      Array.from({ length: 5 }, () => makeCommit({ repo }))
    )
    expect(suggestBlogPosts(commits).length).toBeLessThanOrEqual(3)
  })

  it("returns empty for no commits", () => {
    expect(suggestBlogPosts([])).toEqual([])
  })
})

describe("groupCommitsByWeek", () => {
  it("groups commits into weekly buckets", () => {
    const commits = [
      makeCommit({ date: "2025-01-06T10:00:00Z" }),
      makeCommit({ date: "2025-01-07T10:00:00Z" }),
      makeCommit({ date: "2025-01-13T10:00:00Z" }),
    ]
    const weeks = groupCommitsByWeek(commits)
    expect(weeks.size).toBe(2)
  })

  it("returns empty map for no commits", () => {
    expect(groupCommitsByWeek([]).size).toBe(0)
  })
})
