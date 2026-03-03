import { describe, expect, it } from "vitest"
import { buildResumePlainText, createResumeDocxBlob, createResumeDocxBytes, getResumePdfUrl } from "@/lib/resume-export"
import type { ResumeSnapshot } from "@/types/resume"

const TEST_SNAPSHOT: ResumeSnapshot = {
  profile: {
    name: "Daniel Hernandez",
    title: "Full-Stack Engineer",
    email: "daniel@example.com",
    githubUrl: "https://github.com/dmhernandez2525",
    linkedinUrl: "https://linkedin.com/in/dmhernandez2525",
    portfolioUrl: "https://portfolio-site.onrender.com",
  },
  summary: "Full-stack engineer with 10+ years building production systems.",
  keywords: ["React", "TypeScript", "Node.js"],
  skillGroups: [
    {
      category: "Frontend",
      skills: [
        { name: "React", level: 95 },
        { name: "TypeScript", level: 92 },
      ],
    },
  ],
  experiences: [
    {
      id: "exp-1",
      company: "Portfolio Labs",
      title: "Senior Engineer",
      duration: "2020 - Present",
      description: "Built and maintained a large interactive portfolio platform.",
      achievements: ["Shipped 10 browser games", "Led architecture improvements"],
    },
  ],
  projects: [
    {
      id: "project-1",
      title: "Portfolio",
      tagline: "Interactive personal site",
      description: "A feature-rich React portfolio platform.",
      tech: ["React", "TypeScript", "Vite"],
    },
  ],
}

describe("resume-export", () => {
  it("builds plain text export content", () => {
    const plainText = buildResumePlainText(TEST_SNAPSHOT)

    expect(plainText).toContain("Daniel Hernandez")
    expect(plainText).toContain("SUMMARY")
    expect(plainText).toContain("EXPERIENCE")
  })

  it("creates valid docx zip structure", () => {
    const bytes = createResumeDocxBytes(TEST_SNAPSHOT)
    const blob = createResumeDocxBlob(TEST_SNAPSHOT)

    expect(bytes.length).toBeGreaterThan(200)
    expect(bytes[0]).toBe(0x50)
    expect(bytes[1]).toBe(0x4b)
    expect(blob.size).toBe(bytes.length)
    expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
  })

  it("returns static pdf url", () => {
    expect(getResumePdfUrl()).toBe("/resume.pdf")
  })
})
