import type { ResumePreset, ResumeProfile, ResumeSectionKey, ResumeVersion } from "@/types/resume"

export const RESUME_PROFILE: ResumeProfile = {
  name: "Daniel Hernandez",
  title: "Senior Software Engineer",
  email: "daniel@interestingandbeyond.com",
  githubUrl: "https://github.com/dmhernandez2525",
  linkedinUrl: "https://linkedin.com/in/dh25",
  portfolioUrl: "https://portfolio-site.onrender.com",
}

export const RESUME_SECTION_ORDER: ResumeSectionKey[] = [
  "contact",
  "summary",
  "skills",
  "experience",
  "projects",
  "qr",
]

export const RESUME_PRESETS: ResumePreset[] = [
  {
    id: "full-stack",
    label: "Full Stack",
    description: "Balanced emphasis across frontend, backend, cloud, and delivery outcomes.",
    preferredSkillOrder: ["Frontend", "Backend", "Database", "Cloud", "Beyond Code", "Learning"],
    projectKeywordOrder: ["platform", "ai", "saas", "full-stack"],
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "Highlights UX-heavy systems, design implementation, and interactive products.",
    preferredSkillOrder: ["Frontend", "Cloud", "Backend", "Database", "Beyond Code", "Learning"],
    projectKeywordOrder: ["react", "next", "ui", "web"],
  },
  {
    id: "backend",
    label: "Backend",
    description: "Highlights systems architecture, APIs, data workflows, and infrastructure.",
    preferredSkillOrder: ["Backend", "Database", "Cloud", "Frontend", "Beyond Code", "Learning"],
    projectKeywordOrder: ["api", "python", "data", "infrastructure"],
  },
]

export const RESUME_VERSIONS: ResumeVersion[] = [
  {
    id: "v1-core",
    label: "Core Resume",
    updatedAt: "2026-02-15",
    notes: "Primary portfolio version focused on end-to-end product delivery.",
    summary:
      "Full-stack engineer with 10+ years of experience shipping production systems across React, Node.js, Python, and cloud infrastructure. Built secure DoD software, led consultancy delivery, and consistently turned ambiguous product goals into maintainable, high-impact platforms.",
    atsSummary:
      "Senior software engineer with 10+ years in full-stack development, React, TypeScript, Node.js, Python, PostgreSQL, AWS, API design, microservices, CI/CD, and technical leadership.",
  },
  {
    id: "v2-impact",
    label: "Impact Focus",
    updatedAt: "2026-02-10",
    notes: "Outcome-driven version with measurable delivery metrics and leadership emphasis.",
    summary:
      "Principal-level engineer and co-founder who has led multi-team initiatives across defense, SaaS, and AI products. Delivered critical systems for Space Force and Navy programs, improved platform reliability, and built reusable engineering workflows that accelerated feature delivery across product lines.",
    atsSummary:
      "Principal full-stack engineer with experience in leadership, delivery management, cloud systems, security compliance, React, Next.js, Python, TypeScript, and enterprise integration.",
  },
  {
    id: "v3-ats",
    label: "ATS Optimized",
    updatedAt: "2026-02-12",
    notes: "Keyword-dense variant optimized for resume screening systems.",
    summary:
      "Senior software engineer specializing in full-stack web development, distributed systems, AI integration, and secure application delivery. Core stack includes TypeScript, React, Next.js, Node.js, Python, PostgreSQL, AWS, Docker, and CI/CD automation.",
    atsSummary:
      "Senior software engineer, full-stack development, TypeScript, JavaScript, React, Next.js, Node.js, Python, PostgreSQL, AWS, Docker, Kubernetes, REST API, GraphQL, CI/CD, system design, leadership.",
  },
]

export const RESUME_KEYWORDS: string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "AWS",
  "GraphQL",
  "Docker",
  "Kubernetes",
  "System Design",
  "Leadership",
]
