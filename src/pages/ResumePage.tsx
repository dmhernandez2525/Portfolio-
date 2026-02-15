import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Github, Linkedin, Mail } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { ResumeComparison } from "@/components/resume/ResumeComparison"
import { ResumeControlPanel } from "@/components/resume/ResumeControlPanel"
import { ResumeSectionBlock } from "@/components/resume/ResumeSectionBlock"
import { RESUME_PRESETS, RESUME_VERSIONS } from "@/data/resume-data"
import { exportResumeAsDocx, exportResumeAsText, getResumePdfUrl } from "@/lib/resume-export"
import { buildResumeComparison, buildResumeSnapshot } from "@/lib/resume-model"
import { getResumeDownloadEvents, trackResumeDownload } from "@/lib/resume-analytics"
import type { ResumeExportFormat, ResumePresetId, ResumeSectionKey, ResumeVersionId } from "@/types/resume"
import "@/styles/resume-print.css"

const INITIAL_SECTION_VISIBILITY: Record<ResumeSectionKey, boolean> = {
  contact: true,
  summary: true,
  skills: true,
  experience: true,
  projects: true,
  qr: true,
}

const INITIAL_COLLAPSED_STATE: Record<ResumeSectionKey, boolean> = {
  contact: false,
  summary: false,
  skills: false,
  experience: false,
  projects: false,
  qr: false,
}

function toExportCounts() {
  const counts: Record<ResumeExportFormat, number> = {
    pdf: 0,
    docx: 0,
    txt: 0,
  }

  for (const event of getResumeDownloadEvents()) {
    counts[event.format] += 1
  }

  return counts
}

export function ResumePage() {
  const [selectedPreset, setSelectedPreset] = useState<ResumePresetId>("full-stack")
  const [selectedVersion, setSelectedVersion] = useState<ResumeVersionId>("v1-core")
  const [atsMode, setAtsMode] = useState<boolean>(false)
  const [sectionVisibility, setSectionVisibility] = useState<Record<ResumeSectionKey, boolean>>(INITIAL_SECTION_VISIBILITY)
  const [collapsedSections, setCollapsedSections] = useState<Record<ResumeSectionKey, boolean>>(INITIAL_COLLAPSED_STATE)
  const [leftCompareVersion, setLeftCompareVersion] = useState<ResumeVersionId>("v1-core")
  const [rightCompareVersion, setRightCompareVersion] = useState<ResumeVersionId>("v3-ats")
  const [exportCounts, setExportCounts] = useState<Record<ResumeExportFormat, number>>(toExportCounts)

  const snapshot = useMemo(
    () =>
      buildResumeSnapshot({
        presetId: selectedPreset,
        versionId: selectedVersion,
        atsMode,
      }),
    [atsMode, selectedPreset, selectedVersion],
  )

  const comparison = useMemo(
    () => buildResumeComparison(leftCompareVersion, rightCompareVersion),
    [leftCompareVersion, rightCompareVersion],
  )

  const handleSectionToggle = (section: ResumeSectionKey, visible: boolean): void => {
    setSectionVisibility((current) => ({
      ...current,
      [section]: visible,
    }))
  }

  const handleCollapseToggle = (section: ResumeSectionKey): void => {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section],
    }))
  }

  const handleExport = (format: ResumeExportFormat): void => {
    trackResumeDownload({
      format,
      versionId: selectedVersion,
      presetId: selectedPreset,
    })

    if (format === "pdf") {
      window.open(getResumePdfUrl(), "_blank", "noopener,noreferrer")
    }

    if (format === "docx") {
      exportResumeAsDocx(snapshot)
    }

    if (format === "txt") {
      exportResumeAsText(snapshot)
    }

    setExportCounts(toExportCounts())
  }

  return (
    <div className="min-h-screen bg-background pb-12 pt-24">
      <div className="container resume-shell max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ResumeControlPanel
            presets={RESUME_PRESETS}
            versions={RESUME_VERSIONS}
            selectedPreset={selectedPreset}
            selectedVersion={selectedVersion}
            atsMode={atsMode}
            sectionVisibility={sectionVisibility}
            onPresetChange={setSelectedPreset}
            onVersionChange={setSelectedVersion}
            onAtsModeChange={setAtsMode}
            onSectionToggle={handleSectionToggle}
            onExport={handleExport}
            exportCounts={exportCounts}
          />

          <div className="space-y-5">
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="resume-main space-y-4 rounded-xl border border-border bg-background/90 p-6"
            >
              <header className="mb-2">
                <h1 className="text-3xl font-bold">{snapshot.profile.name}</h1>
                <p className="text-lg text-muted-foreground">{snapshot.profile.title}</p>
              </header>

              <ResumeSectionBlock
                sectionKey="contact"
                title="Contact"
                isVisible={sectionVisibility.contact}
                isCollapsed={collapsedSections.contact}
                onToggleCollapse={handleCollapseToggle}
              >
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <a href={`mailto:${snapshot.profile.email}`} className="resume-link inline-flex items-center gap-2 hover:text-foreground">
                    <Mail className="h-4 w-4" /> {snapshot.profile.email}
                  </a>
                  <a href={snapshot.profile.githubUrl} className="resume-link inline-flex items-center gap-2 hover:text-foreground" target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                  <a href={snapshot.profile.linkedinUrl} className="resume-link inline-flex items-center gap-2 hover:text-foreground" target="_blank" rel="noreferrer">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                </div>
              </ResumeSectionBlock>

              <ResumeSectionBlock
                sectionKey="summary"
                title="Summary"
                isVisible={sectionVisibility.summary}
                isCollapsed={collapsedSections.summary}
                onToggleCollapse={handleCollapseToggle}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">{snapshot.summary}</p>
                {atsMode ? <p className="mt-3 text-xs text-primary">ATS keywords: {snapshot.keywords.join(", ")}</p> : null}
              </ResumeSectionBlock>

              <ResumeSectionBlock
                sectionKey="skills"
                title="Skills"
                isVisible={sectionVisibility.skills}
                isCollapsed={collapsedSections.skills}
                onToggleCollapse={handleCollapseToggle}
              >
                <div className="space-y-2 text-sm">
                  {snapshot.skillGroups.map((group) => (
                    <div key={group.category}>
                      <span className="font-medium">{group.category}:</span>{" "}
                      <span className="text-muted-foreground">{group.skills.map((skill) => skill.name).join(", ")}</span>
                    </div>
                  ))}
                </div>
              </ResumeSectionBlock>

              <ResumeSectionBlock
                sectionKey="experience"
                title="Experience"
                isVisible={sectionVisibility.experience}
                isCollapsed={collapsedSections.experience}
                onToggleCollapse={handleCollapseToggle}
              >
                <div className="space-y-4">
                  {snapshot.experiences.map((experience) => (
                    <article key={experience.id} className="space-y-1 text-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                        <h3 className="font-semibold">{experience.title} • {experience.company}</h3>
                        <span className="text-xs text-muted-foreground">{experience.duration}</span>
                      </div>
                      <p className="text-muted-foreground">{experience.description}</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {experience.achievements.map((achievement) => (
                          <li key={`${experience.id}-${achievement}`}>• {achievement}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </ResumeSectionBlock>

              <ResumeSectionBlock
                sectionKey="projects"
                title="Selected Projects"
                isVisible={sectionVisibility.projects}
                isCollapsed={collapsedSections.projects}
                onToggleCollapse={handleCollapseToggle}
              >
                <div className="space-y-2 text-sm">
                  {snapshot.projects.map((project) => (
                    <div key={project.id} className="rounded-md border border-border bg-card/40 p-3">
                      <p className="font-medium">{project.title}</p>
                      <p className="text-muted-foreground">{project.tagline}</p>
                    </div>
                  ))}
                </div>
              </ResumeSectionBlock>

              <ResumeSectionBlock
                sectionKey="qr"
                title="Portfolio QR"
                isVisible={sectionVisibility.qr}
                isCollapsed={collapsedSections.qr}
                onToggleCollapse={handleCollapseToggle}
              >
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <QRCodeSVG value={snapshot.profile.portfolioUrl} size={84} level="M" />
                  <div>
                    <p className="font-medium text-foreground">Scan to open live portfolio</p>
                    <p>{snapshot.profile.portfolioUrl}</p>
                  </div>
                </div>
              </ResumeSectionBlock>
            </motion.article>

            <div className="space-y-3 rounded-xl border border-border bg-card/40 p-4 print:hidden">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Version History</h2>
              {RESUME_VERSIONS.map((version) => (
                <article key={version.id} className="rounded-md border border-border bg-background/60 p-3 text-sm">
                  <p className="font-medium">{version.label}</p>
                  <p className="text-xs text-muted-foreground">Updated {version.updatedAt}</p>
                  <p className="mt-1 text-muted-foreground">{version.notes}</p>
                </article>
              ))}
            </div>

            <div className="resume-comparison">
              <ResumeComparison
                versions={RESUME_VERSIONS}
                leftVersionId={leftCompareVersion}
                rightVersionId={rightCompareVersion}
                leftSummary={comparison.leftVersion.summary}
                rightSummary={comparison.rightVersion.summary}
                addedKeywords={comparison.addedKeywords}
                removedKeywords={comparison.removedKeywords}
                onLeftChange={setLeftCompareVersion}
                onRightChange={setRightCompareVersion}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
