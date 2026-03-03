import { experienceData } from "@/data/experience"
import { projectsData, type ProjectItem } from "@/data/projects"
import { RESUME_KEYWORDS, RESUME_PRESETS, RESUME_PROFILE, RESUME_VERSIONS } from "@/data/resume-data"
import { skillsData, type SkillCategory, type SkillItem } from "@/data/skills"
import type { ResumePreset, ResumePresetId, ResumeSnapshot, ResumeVersion, ResumeVersionId } from "@/types/resume"

interface ResumeComparison {
  leftVersion: ResumeVersion
  rightVersion: ResumeVersion
  addedKeywords: string[]
  removedKeywords: string[]
}

function bySkillOrder(categories: SkillCategory[]): (a: SkillItem, b: SkillItem) => number {
  return (a, b) => categories.indexOf(a.category) - categories.indexOf(b.category)
}

function scoreProject(project: ProjectItem, keywordOrder: string[]): number {
  const searchable = [project.title, project.tagline, project.description, project.tech.join(" ")]
    .join(" ")
    .toLowerCase()

  return keywordOrder.reduce((score, keyword, index) => {
    const weight = keywordOrder.length - index
    return searchable.includes(keyword.toLowerCase()) ? score + weight : score
  }, 0)
}

function rankProjects(keywordOrder: string[]): ProjectItem[] {
  return projectsData
    .slice()
    .sort((a, b) => {
      const scoreDiff = scoreProject(b, keywordOrder) - scoreProject(a, keywordOrder)
      if (scoreDiff !== 0) return scoreDiff
      return b.tier.localeCompare(a.tier)
    })
}

function normalizeKeywords(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length >= 3)
}

export function getResumePreset(presetId: ResumePresetId): ResumePreset {
  return RESUME_PRESETS.find((preset) => preset.id === presetId) ?? RESUME_PRESETS[0]
}

export function getResumeVersion(versionId: ResumeVersionId): ResumeVersion {
  return RESUME_VERSIONS.find((version) => version.id === versionId) ?? RESUME_VERSIONS[0]
}

export function buildResumeSnapshot(params: {
  presetId: ResumePresetId
  versionId: ResumeVersionId
  atsMode: boolean
}): ResumeSnapshot {
  const preset = getResumePreset(params.presetId)
  const version = getResumeVersion(params.versionId)

  const orderedSkills = skillsData.slice().sort(bySkillOrder(preset.preferredSkillOrder))
  const groupedSkills = preset.preferredSkillOrder
    .map((category) => ({
      category,
      skills: orderedSkills.filter((skill) => skill.category === category),
    }))
    .filter((entry) => entry.skills.length > 0)

  const summary = params.atsMode ? version.atsSummary : version.summary

  return {
    profile: RESUME_PROFILE,
    summary,
    skillGroups: groupedSkills,
    experiences: experienceData.filter((experience) => !experience.isCollapsed),
    projects: rankProjects(preset.projectKeywordOrder).slice(0, 6),
    keywords: RESUME_KEYWORDS,
  }
}

export function buildResumeComparison(leftId: ResumeVersionId, rightId: ResumeVersionId): ResumeComparison {
  const leftVersion = getResumeVersion(leftId)
  const rightVersion = getResumeVersion(rightId)

  const leftKeywords = new Set(normalizeKeywords(leftVersion.atsSummary))
  const rightKeywords = new Set(normalizeKeywords(rightVersion.atsSummary))

  const addedKeywords = Array.from(rightKeywords).filter((keyword) => !leftKeywords.has(keyword)).sort()
  const removedKeywords = Array.from(leftKeywords).filter((keyword) => !rightKeywords.has(keyword)).sort()

  return {
    leftVersion,
    rightVersion,
    addedKeywords,
    removedKeywords,
  }
}
