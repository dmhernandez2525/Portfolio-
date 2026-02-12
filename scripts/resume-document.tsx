import { Document, Page, View, Text, Link, Image } from "@react-pdf/renderer"
import { experienceData } from "@/data/experience"
import type { ExperienceItem } from "@/data/experience"
import { skillsData } from "@/data/skills"
import type { SkillCategory } from "@/data/skills"
import { projectsData } from "@/data/projects"
import { styles } from "./resume-styles"

export const QR_LINKS = [
  { label: "GitHub", url: "https://github.com/dmhernandez2525" },
  { label: "LinkedIn", url: "https://linkedin.com/in/dh25" },
  { label: "Portfolio", url: "https://interestingandbeyond.com" },
] as const

// Intentionally excludes "Learning" category — only show proficient skills on resume
const SKILL_CATEGORIES: SkillCategory[] = [
  "Frontend",
  "Backend",
  "Database",
  "Cloud",
  "Beyond Code",
]

const SUMMARY =
  "Full-stack engineer with 10+ years of experience building production-grade applications across React, Node.js, Python, and cloud platforms. From co-founding a software consultancy to developing secure DoD applications for Space Force and Navy, I bring a builder\u2019s mindset to every project. Passionate about shipping high-quality software, mentoring teams, and making complex systems accessible."

function Header() {
  return (
    <View style={styles.section}>
      <Text style={styles.headerName}>Daniel Hernandez</Text>
      <Text style={styles.headerTitle}>Senior Software Engineer</Text>
      <View style={styles.headerLinks}>
        <Link style={styles.headerLink} src="mailto:daniel@interestingandbeyond.com">
          daniel@interestingandbeyond.com
        </Link>
        <Link style={styles.headerLink} src="https://github.com/dmhernandez2525">
          GitHub
        </Link>
        <Link style={styles.headerLink} src="https://linkedin.com/in/dh25">
          LinkedIn
        </Link>
      </View>
    </View>
  )
}

function Summary() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Summary</Text>
      <Text style={styles.summaryText}>{SUMMARY}</Text>
    </View>
  )
}

function Skills() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      {SKILL_CATEGORIES.map((category) => {
        const skills = skillsData.filter((s) => s.category === category)
        return (
          <View key={category} style={styles.skillRow}>
            <Text style={styles.skillCategory}>{category}:</Text>
            <Text style={styles.skillList}>
              {skills.map((s) => s.name).join(", ")}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

function ExperienceEntry({ exp }: { exp: ExperienceItem }) {
  return (
    <View style={styles.experienceEntry}>
      <View style={styles.experienceHeader}>
        <View>
          <Text style={styles.experienceTitle}>{exp.title}</Text>
          <Text style={styles.experienceCompany}>{exp.company}</Text>
        </View>
        <Text style={styles.experienceDuration}>{exp.duration}</Text>
      </View>
      <Text style={styles.experienceDescription}>{exp.description}</Text>
      {exp.achievements.map((achievement, i) => (
        <View key={i} style={styles.achievementRow}>
          <Text style={styles.bulletPoint}>{"\u2022 "}</Text>
          <Text style={styles.achievementText}>{achievement}</Text>
        </View>
      ))}
    </View>
  )
}

function Experience() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {experienceData
        .filter((exp) => !exp.isCollapsed)
        .map((exp) => (
          <ExperienceEntry key={exp.id} exp={exp} />
        ))}
    </View>
  )
}

function SelectedProjects() {
  const topProjects = projectsData
    .filter((p) => p.tier === "flagship")
    .slice(0, 6)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Selected Projects</Text>
      {topProjects.map((p) => (
        <View key={p.id} style={styles.projectEntry}>
          <Text style={styles.projectTitle}>{p.title}</Text>
          <Text style={styles.projectDash}>{"\u2014"}</Text>
          <Text style={styles.projectTagline}>{p.tagline}</Text>
        </View>
      ))}
    </View>
  )
}

function QRCodes({ qrDataUrls }: { qrDataUrls: Map<string, string> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Scan to Connect</Text>
      <View style={styles.qrSection}>
        {QR_LINKS.map((link) => {
          const dataUrl = qrDataUrls.get(link.url)
          if (!dataUrl) return null
          return (
            <View key={link.label} style={styles.qrItem}>
              <Image style={styles.qrImage} src={dataUrl} />
              <Text style={styles.qrLabel}>{link.label}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

interface ResumeDocumentProps {
  qrDataUrls: Map<string, string>
}

export function ResumeDocument({ qrDataUrls }: ResumeDocumentProps) {
  return (
    <Document
      title="Daniel Hernandez - Senior Software Engineer"
      author="Daniel Hernandez"
      subject="Resume"
      keywords="software engineer, react, typescript, full-stack"
    >
      <Page size="LETTER" style={styles.page}>
        <Header />
        <Summary />
        <Skills />
        <Experience />
        <SelectedProjects />
        <QRCodes qrDataUrls={qrDataUrls} />
      </Page>
    </Document>
  )
}
