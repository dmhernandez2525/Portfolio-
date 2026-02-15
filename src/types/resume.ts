import type { ExperienceItem } from "@/data/experience"
import type { ProjectItem } from "@/data/projects"
import type { SkillCategory, SkillItem } from "@/data/skills"

export type ResumeSectionKey = "summary" | "skills" | "experience" | "projects" | "contact" | "qr"

export type ResumePresetId = "full-stack" | "frontend" | "backend"

export type ResumeVersionId = "v1-core" | "v2-impact" | "v3-ats"

export type ResumeExportFormat = "pdf" | "docx" | "txt"

export interface ResumeProfile {
  name: string
  title: string
  email: string
  githubUrl: string
  linkedinUrl: string
  portfolioUrl: string
}

export interface ResumePreset {
  id: ResumePresetId
  label: string
  description: string
  preferredSkillOrder: SkillCategory[]
  projectKeywordOrder: string[]
}

export interface ResumeVersion {
  id: ResumeVersionId
  label: string
  updatedAt: string
  notes: string
  summary: string
  atsSummary: string
}

export interface ResumeSnapshot {
  profile: ResumeProfile
  summary: string
  skillGroups: Array<{ category: SkillCategory; skills: SkillItem[] }>
  experiences: ExperienceItem[]
  projects: ProjectItem[]
  keywords: string[]
}

export interface ResumeDownloadEvent {
  id: string
  format: ResumeExportFormat
  versionId: ResumeVersionId
  presetId: ResumePresetId
  timestamp: string
}
