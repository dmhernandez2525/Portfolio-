import { Download, FileText, Printer, ScanSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ResumeExportFormat, ResumePreset, ResumePresetId, ResumeSectionKey, ResumeVersion, ResumeVersionId } from "@/types/resume"

interface ResumeControlPanelProps {
  presets: ResumePreset[]
  versions: ResumeVersion[]
  selectedPreset: ResumePresetId
  selectedVersion: ResumeVersionId
  atsMode: boolean
  sectionVisibility: Record<ResumeSectionKey, boolean>
  onPresetChange: (value: ResumePresetId) => void
  onVersionChange: (value: ResumeVersionId) => void
  onAtsModeChange: (value: boolean) => void
  onSectionToggle: (section: ResumeSectionKey, visible: boolean) => void
  onExport: (format: ResumeExportFormat) => void
  exportCounts: Record<ResumeExportFormat, number>
}

const SECTION_LABELS: Record<ResumeSectionKey, string> = {
  contact: "Contact",
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  qr: "QR",
}

export function ResumeControlPanel({
  presets,
  versions,
  selectedPreset,
  selectedVersion,
  atsMode,
  sectionVisibility,
  onPresetChange,
  onVersionChange,
  onAtsModeChange,
  onSectionToggle,
  onExport,
  exportCounts,
}: ResumeControlPanelProps) {
  return (
    <aside className="resume-controls space-y-4 rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm print:hidden">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resume Controls</h2>

        <label className="block text-xs text-muted-foreground">
          Preset
          <select
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
            value={selectedPreset}
            onChange={(event) => onPresetChange(event.target.value as ResumePresetId)}
            aria-label="Resume preset"
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-muted-foreground">
          Version
          <select
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
            value={selectedVersion}
            onChange={(event) => onVersionChange(event.target.value as ResumeVersionId)}
            aria-label="Resume version"
          >
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <span className="text-xs text-muted-foreground">ATS mode</span>
          <input
            type="checkbox"
            checked={atsMode}
            onChange={(event) => onAtsModeChange(event.target.checked)}
            aria-label="ATS mode"
          />
        </label>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visible Sections</h3>
        {Object.entries(SECTION_LABELS).map(([section, label]) => {
          const key = section as ResumeSectionKey

          return (
            <label key={section} className="flex items-center justify-between text-sm">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={sectionVisibility[key]}
                onChange={(event) => onSectionToggle(key, event.target.checked)}
                aria-label={`Toggle ${label} visibility`}
              />
            </label>
          )
        })}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Export</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport("pdf")} className="justify-start">
            <FileText className="mr-2 h-3.5 w-3.5" /> PDF ({exportCounts.pdf})
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("docx")} className="justify-start">
            <Download className="mr-2 h-3.5 w-3.5" /> DOCX ({exportCounts.docx})
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("txt")} className="justify-start">
            <ScanSearch className="mr-2 h-3.5 w-3.5" /> Text ({exportCounts.txt})
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="justify-start">
            <Printer className="mr-2 h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>
    </aside>
  )
}
