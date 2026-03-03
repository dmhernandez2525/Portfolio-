import { Button } from "@/components/ui/button"

interface ProjectBulkActionsProps {
  selectedCount: number
  onPublish: () => void
  onArchive: () => void
  onClear: () => void
}

export function ProjectBulkActions({ selectedCount, onPublish, onArchive, onClear }: ProjectBulkActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-3">
      <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
      <Button size="sm" variant="secondary" onClick={onPublish} disabled={selectedCount === 0}>
        Batch Publish
      </Button>
      <Button size="sm" variant="outline" onClick={onArchive} disabled={selectedCount === 0}>
        Batch Archive
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear} disabled={selectedCount === 0}>
        Clear Selection
      </Button>
    </div>
  )
}
