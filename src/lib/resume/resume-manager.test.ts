import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  createResumeVersion,
  deleteResume,
  exportResume,
  loadAllResumes,
  saveResume,
} from "@/lib/resume/resume-manager"
import type { ResumeSection } from "@/lib/resume/resume-manager"

const storageMock = new Map<string, string>()

beforeEach(() => {
  storageMock.clear()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storageMock.get(key) ?? null,
    setItem: (key: string, value: string) => storageMock.set(key, value),
    removeItem: (key: string) => storageMock.delete(key),
  })
})

const sampleSections: ResumeSection[] = [
  { type: "summary", title: "Summary", content: "Experienced developer" },
  { type: "skills", title: "Skills", content: "React, TypeScript" },
]

describe("createResumeVersion", () => {
  it("creates a resume with all fields", () => {
    const resume = createResumeVersion(
      "My Resume",
      "Frontend Developer",
      sampleSections,
      85,
      "https://example.com/job"
    )
    expect(resume.name).toBe("My Resume")
    expect(resume.targetRole).toBe("Frontend Developer")
    expect(resume.sections).toHaveLength(2)
    expect(resume.atsScore).toBe(85)
    expect(resume.id).toMatch(/^resume_/)
  })

  it("generates unique IDs", () => {
    const a = createResumeVersion("A", "Dev", [], 0, "")
    const b = createResumeVersion("B", "Dev", [], 0, "")
    expect(a.id).not.toBe(b.id)
  })
})

describe("saveResume / loadAllResumes", () => {
  it("saves and loads resumes", () => {
    const resume = createResumeVersion("Test", "Dev", sampleSections, 90, "")
    saveResume(resume)
    const loaded = loadAllResumes()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].name).toBe("Test")
  })

  it("updates existing resume by id", () => {
    const resume = createResumeVersion("Test", "Dev", sampleSections, 90, "")
    saveResume(resume)
    saveResume({ ...resume, name: "Updated" })
    const loaded = loadAllResumes()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].name).toBe("Updated")
  })

  it("returns empty array when storage is empty", () => {
    expect(loadAllResumes()).toEqual([])
  })

  it("handles corrupt storage gracefully", () => {
    storageMock.set("portfolio:resumes", "not-json")
    expect(loadAllResumes()).toEqual([])
  })
})

describe("deleteResume", () => {
  it("deletes an existing resume", () => {
    const resume = createResumeVersion("Test", "Dev", [], 0, "")
    saveResume(resume)
    expect(deleteResume(resume.id)).toBe(true)
    expect(loadAllResumes()).toHaveLength(0)
  })

  it("returns false for non-existent id", () => {
    expect(deleteResume("fake_id")).toBe(false)
  })
})

describe("exportResume", () => {
  const resume = createResumeVersion(
    "Jane Doe",
    "Engineer",
    [{ type: "summary", title: "Summary", content: "Great engineer" }],
    95,
    ""
  )

  it("exports to JSON format", () => {
    const json = exportResume(resume, "json")
    const parsed = JSON.parse(json)
    expect(parsed.basics.name).toBe("Jane Doe")
    expect(parsed.sections).toHaveLength(1)
  })

  it("exports to text format", () => {
    const text = exportResume(resume, "text")
    expect(text).toContain("Jane Doe")
    expect(text).toContain("SUMMARY")
    expect(text).toContain("Great engineer")
  })

  it("exports to HTML format", () => {
    const html = exportResume(resume, "html")
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain("Jane Doe")
    expect(html).toContain("<h2>Summary</h2>")
  })

  it("escapes HTML in content", () => {
    const xssResume = createResumeVersion(
      "<script>alert(1)</script>",
      "Dev",
      [],
      0,
      ""
    )
    const html = exportResume(xssResume, "html")
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })
})
