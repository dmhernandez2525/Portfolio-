import { GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ManagedProjectRecord } from "@/types/admin-project"

interface ProjectListProps {
  projects: ManagedProjectRecord[]
  selectedIds: Set<string>
  activeProjectId: string | null
  onSelectProject: (id: string) => void
  onToggleSelected: (id: string) => void
  onSelectAll: (checked: boolean) => void
  onReorder: (draggedId: string, targetId: string) => void
}

const STATUS_VARIANT: Record<ManagedProjectRecord["status"], "secondary" | "default" | "outline"> = {
  draft: "secondary",
  published: "default",
  archived: "outline",
}

export function ProjectList({
  projects,
  selectedIds,
  activeProjectId,
  onSelectProject,
  onToggleSelected,
  onSelectAll,
  onReorder,
}: ProjectListProps) {
  const allSelected = projects.length > 0 && selectedIds.size === projects.length

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <table className="min-w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-3 py-2 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                aria-label="Select all projects"
                onChange={(event) => onSelectAll(event.target.checked)}
              />
            </th>
            <th className="px-3 py-2 text-left">Order</th>
            <th className="px-3 py-2 text-left">Project</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Analytics</th>
            <th className="px-3 py-2 text-left">Version Count</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const isActive = project.id === activeProjectId
            const isSelected = selectedIds.has(project.id)
            return (
              <tr
                key={project.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/project-id", project.id)
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  const draggedId = event.dataTransfer.getData("text/project-id")
                  if (draggedId) onReorder(draggedId, project.id)
                }}
                className={`border-b border-border/60 ${isActive ? "bg-primary/5" : "hover:bg-muted/20"}`}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    aria-label={`Select ${project.title}`}
                    onChange={() => onToggleSelected(project.id)}
                  />
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <GripVertical className="h-4 w-4" />
                    {project.order + 1}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <p className="font-medium">{project.title}</p>
                  <p className="text-xs text-muted-foreground">{project.slug}</p>
                </td>
                <td className="px-3 py-2">
                  <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  <p>Views: {project.analytics.views}</p>
                  <p>Clicks: {project.analytics.clicks}</p>
                  <p>Avg Time: {project.analytics.avgTimeSeconds}s</p>
                </td>
                <td className="px-3 py-2">{project.versions.length}</td>
                <td className="px-3 py-2">
                  <Button size="sm" variant={isActive ? "secondary" : "outline"} onClick={() => onSelectProject(project.id)}>
                    {isActive ? "Editing" : "Edit"}
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
