import { beforeEach, describe, expect, it } from "vitest"
import {
  buildContentAudit,
  clearContentManagementStore,
  createPostFromTemplate,
  getContentPosts,
  publishScheduledPosts,
  savePostWithConflictCheck,
  schedulePost,
} from "@/lib/content-management-store"

describe("content-management-store", () => {
  beforeEach(() => {
    clearContentManagementStore()
  })

  it("creates and saves posts with revision conflict checks", () => {
    const created = createPostFromTemplate("tutorial", "session-a")
    expect(created).not.toBeNull()
    if (!created) return

    const saved = savePostWithConflictCheck({
      postId: created.id,
      expectedRevision: created.revision,
      sessionId: "session-a",
      patch: { title: "Tutorial: Updated" },
    })
    expect(saved.post?.title).toBe("Tutorial: Updated")
    expect(saved.conflict).toBeNull()

    const conflict = savePostWithConflictCheck({
      postId: created.id,
      expectedRevision: created.revision,
      sessionId: "session-b",
      patch: { title: "Conflicting Edit" },
    })
    expect(conflict.post).toBeNull()
    expect(conflict.conflict).not.toBeNull()
  })

  it("schedules posts and publishes when due", () => {
    const created = createPostFromTemplate("project-deep-dive", "session-a")
    expect(created).not.toBeNull()
    if (!created) return

    schedulePost(created.id, "2026-02-10T12:00:00.000Z")
    publishScheduledPosts(new Date("2026-02-11T12:00:00.000Z"))

    const updated = getContentPosts().find((post) => post.id === created.id)
    expect(updated?.status).toBe("published")
    expect(updated?.publishedAt).toBeDefined()
  })

  it("builds audit entries for low-performing or stale posts", () => {
    const created = createPostFromTemplate("career-reflection", "session-a")
    expect(created).not.toBeNull()
    if (!created) return

    savePostWithConflictCheck({
      postId: created.id,
      expectedRevision: created.revision,
      sessionId: "session-a",
      patch: {
        analytics: { views: 10, readingCompletionRate: 20, shares: 0 },
        updatedAt: "2025-10-01T00:00:00.000Z",
      },
    })

    const audit = buildContentAudit(getContentPosts())
    expect(audit.length).toBeGreaterThan(0)
    expect(audit[0]?.reasons.join(" ")).toContain("Low views")
  })
})
