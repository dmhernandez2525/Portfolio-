import type { ResumeVersion, ResumeVersionId } from "@/types/resume"

interface ResumeComparisonProps {
  versions: ResumeVersion[]
  leftVersionId: ResumeVersionId
  rightVersionId: ResumeVersionId
  leftSummary: string
  rightSummary: string
  addedKeywords: string[]
  removedKeywords: string[]
  onLeftChange: (value: ResumeVersionId) => void
  onRightChange: (value: ResumeVersionId) => void
}

export function ResumeComparison({
  versions,
  leftVersionId,
  rightVersionId,
  leftSummary,
  rightSummary,
  addedKeywords,
  removedKeywords,
  onLeftChange,
  onRightChange,
}: ResumeComparisonProps) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card/40 p-4 print:hidden">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Version Comparison</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs text-muted-foreground">
          Left version
          <select
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
            value={leftVersionId}
            onChange={(event) => onLeftChange(event.target.value as ResumeVersionId)}
            aria-label="Left comparison version"
          >
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-muted-foreground">
          Right version
          <select
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
            value={rightVersionId}
            onChange={(event) => onRightChange(event.target.value as ResumeVersionId)}
            aria-label="Right comparison version"
          >
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border border-border bg-background/60 p-3">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Left Summary</h3>
          <p className="text-sm text-muted-foreground">{leftSummary}</p>
        </article>

        <article className="rounded-lg border border-border bg-background/60 p-3">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Right Summary</h3>
          <p className="text-sm text-muted-foreground">{rightSummary}</p>
        </article>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-green-500">Added ATS Keywords</h3>
          <p className="text-sm text-muted-foreground">{addedKeywords.length > 0 ? addedKeywords.join(", ") : "None"}</p>
        </div>

        <div className="rounded-lg border border-border bg-background/60 p-3">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-orange-500">Removed ATS Keywords</h3>
          <p className="text-sm text-muted-foreground">{removedKeywords.length > 0 ? removedKeywords.join(", ") : "None"}</p>
        </div>
      </div>
    </section>
  )
}
