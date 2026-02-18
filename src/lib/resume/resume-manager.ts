/**
 * Resume version management with storage and export capabilities.
 */

export interface ResumeVersion {
  id: string
  name: string
  targetRole: string
  createdAt: number
  updatedAt: number
  sections: ResumeSection[]
  atsScore: number
  jobPostingUrl: string
}

export interface ResumeSection {
  type: ResumeSectionType
  title: string
  content: string
}

export type ResumeSectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"

export type ExportFormat = "json" | "text" | "html"

const STORAGE_KEY = "portfolio:resumes"

function generateId(): string {
  return `resume_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createResumeVersion(
  name: string,
  targetRole: string,
  sections: ResumeSection[],
  atsScore: number,
  jobPostingUrl: string
): ResumeVersion {
  const now = Date.now()
  return {
    id: generateId(),
    name,
    targetRole,
    createdAt: now,
    updatedAt: now,
    sections,
    atsScore,
    jobPostingUrl,
  }
}

export function saveResume(resume: ResumeVersion): void {
  const resumes = loadAllResumes()
  const existingIdx = resumes.findIndex((r) => r.id === resume.id)
  if (existingIdx >= 0) {
    resumes[existingIdx] = { ...resume, updatedAt: Date.now() }
  } else {
    resumes.push(resume)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes))
}

export function loadAllResumes(): ResumeVersion[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    return JSON.parse(data) as ResumeVersion[]
  } catch {
    return []
  }
}

export function deleteResume(id: string): boolean {
  const resumes = loadAllResumes()
  const filtered = resumes.filter((r) => r.id !== id)
  if (filtered.length === resumes.length) return false
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function exportResume(resume: ResumeVersion, format: ExportFormat): string {
  const exporters: Record<ExportFormat, (r: ResumeVersion) => string> = {
    json: exportToJSON,
    text: exportToText,
    html: exportToHTML,
  }
  return exporters[format](resume)
}

function exportToJSON(resume: ResumeVersion): string {
  return JSON.stringify(
    {
      basics: { name: resume.name, label: resume.targetRole },
      sections: resume.sections.map((s) => ({
        type: s.type,
        title: s.title,
        content: s.content,
      })),
      meta: {
        atsScore: resume.atsScore,
        createdAt: new Date(resume.createdAt).toISOString(),
      },
    },
    null,
    2
  )
}

function exportToText(resume: ResumeVersion): string {
  const lines = [resume.name, `Target: ${resume.targetRole}`, ""]
  for (const section of resume.sections) {
    lines.push(section.title.toUpperCase(), "-".repeat(section.title.length))
    lines.push(section.content, "")
  }
  return lines.join("\n")
}

function exportToHTML(resume: ResumeVersion): string {
  const sectionHTML = resume.sections
    .map(
      (s) =>
        `<section><h2>${escapeHTML(s.title)}</h2><p>${escapeHTML(s.content)}</p></section>`
    )
    .join("\n")

  return [
    "<!DOCTYPE html><html><head><meta charset='utf-8'>",
    `<title>${escapeHTML(resume.name)}</title></head><body>`,
    `<h1>${escapeHTML(resume.name)}</h1>`,
    `<p>${escapeHTML(resume.targetRole)}</p>`,
    sectionHTML,
    "</body></html>",
  ].join("\n")
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
