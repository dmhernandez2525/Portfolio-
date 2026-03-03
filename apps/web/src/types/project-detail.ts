import type { ProjectItem } from "@/data/projects"

export interface ProjectGalleryItem {
  id: string
  title: string
  caption: string
  imageUrl: string
  alt: string
}

export interface ProjectCaseStudy {
  problem: string
  approach: string[]
  solution: string[]
  results: string[]
}

export interface ProjectTimelineMilestone {
  id: string
  label: string
  date: string
  detail: string
}

export interface ProjectTechDetail {
  name: string
  proficiency: number
}

export interface ProjectRepoMetrics {
  stars: number
  forks: number
  linesOfCodeApprox: number
}

export interface ProjectDetailModel {
  project: ProjectItem
  gallery: ProjectGalleryItem[]
  caseStudy: ProjectCaseStudy
  timeline: ProjectTimelineMilestone[]
  techDetails: ProjectTechDetail[]
  relatedProjects: ProjectItem[]
  previousProject: ProjectItem | null
  nextProject: ProjectItem | null
}
