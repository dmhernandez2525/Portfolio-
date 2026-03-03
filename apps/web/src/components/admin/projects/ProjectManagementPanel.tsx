import { useMemo, useState } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectBulkActions } from "@/components/admin/projects/ProjectBulkActions"
import { ProjectEditor } from "@/components/admin/projects/ProjectEditor"
import { ProjectList } from "@/components/admin/projects/ProjectList"
import { PROJECT_TEMPLATES } from "@/data/admin-project-templates"
import { processProjectImage, type ImageProcessOptions } from "@/lib/project-image-tools"
import {
  bulkUpdateProjectStatus,
  createProjectFromTemplate,
  getManagedProjects,
  importProjectFromGithub,
  reorderManagedProjects,
  rollbackManagedProjectVersion,
  updateManagedProject,
} from "@/lib/project-management-store"
import type { ManagedProjectRecord, ManagedProjectStatus } from "@/types/admin-project"

function cloneSelection(source: Set<string>): Set<string> {
  return new Set(source)
}

export function ProjectManagementPanel() {
  const [projects, setProjects] = useState<ManagedProjectRecord[]>(() => getManagedProjects())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeProjectId, setActiveProjectId] = useState<string | null>(projects[0]?.id ?? null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PROJECT_TEMPLATES[0]?.id ?? "saas-launch")
  const [githubImportError, setGithubImportError] = useState<string | null>(null)

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [activeProjectId, projects],
  )

  const refreshProjects = (): void => {
    setProjects(getManagedProjects())
  }

  const handleToggleSelected = (id: string): void => {
    setSelectedIds((current) => {
      const next = cloneSelection(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = (checked: boolean): void => {
    if (!checked) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(projects.map((project) => project.id)))
  }

  const handleBulkStatus = (status: ManagedProjectStatus): void => {
    setProjects(bulkUpdateProjectStatus([...selectedIds], status))
    setSelectedIds(new Set())
  }

  const handleCreateFromTemplate = (): void => {
    const created = createProjectFromTemplate(selectedTemplateId)
    if (!created) return
    refreshProjects()
    setActiveProjectId(created.id)
  }

  const handleSaveProject = (project: ManagedProjectRecord): void => {
    updateManagedProject(project.id, {
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      detailsMarkdown: project.detailsMarkdown,
      problem: project.problem,
      approach: project.approach,
      solution: project.solution,
      results: project.results,
      techStack: [...project.techStack],
      tags: [...project.tags],
      status: project.status,
      githubRepo: project.githubRepo,
      liveDemoUrl: project.liveDemoUrl,
      images: [...project.images],
      analytics: { ...project.analytics },
      templateId: project.templateId,
    })
    refreshProjects()
  }

  const handleStatusChange = (projectId: string, status: ManagedProjectStatus): void => {
    updateManagedProject(projectId, { status })
    refreshProjects()
  }

  const handleRollback = (projectId: string, versionId: string): void => {
    rollbackManagedProjectVersion(projectId, versionId)
    refreshProjects()
  }

  const handleReorder = (draggedId: string, targetId: string): void => {
    setProjects(reorderManagedProjects(draggedId, targetId))
  }

  const handleImportGithub = async (projectId: string, repoPath: string): Promise<void> => {
    setGithubImportError(null)
    const imported = await importProjectFromGithub(repoPath)
    if (!imported) {
      setGithubImportError("GitHub import failed. Check repo path and availability.")
      return
    }
    updateManagedProject(projectId, imported)
    refreshProjects()
  }

  const handleImageUpload = async (projectId: string, file: File, options: ImageProcessOptions): Promise<void> => {
    const processed = await processProjectImage(file, options)
    if (!processed) return
    const current = projects.find((project) => project.id === projectId)
    if (!current) return
    updateManagedProject(projectId, {
      images: [...current.images, processed],
    })
    refreshProjects()
  }

  const handleImageRemove = (projectId: string, imageId: string): void => {
    const current = projects.find((project) => project.id === projectId)
    if (!current) return
    updateManagedProject(projectId, {
      images: current.images.filter((image) => image.id !== imageId),
    })
    refreshProjects()
  }

  return (
    <section className="mt-8 rounded-xl border border-border bg-card/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Project Management</h3>
          <p className="text-sm text-muted-foreground">
            Rich project editor, template-based creation, ordering, bulk workflow, and version rollback.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedTemplateId}
            onChange={(event) => setSelectedTemplateId(event.target.value)}
          >
            {PROJECT_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
          <Button onClick={handleCreateFromTemplate}>
            <PlusCircle className="mr-1.5 h-4 w-4" />
            New From Template
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <ProjectBulkActions
          selectedCount={selectedIds.size}
          onPublish={() => handleBulkStatus("published")}
          onArchive={() => handleBulkStatus("archived")}
          onClear={() => setSelectedIds(new Set())}
        />

        <ProjectList
          projects={projects}
          selectedIds={selectedIds}
          activeProjectId={activeProjectId}
          onSelectProject={setActiveProjectId}
          onToggleSelected={handleToggleSelected}
          onSelectAll={handleSelectAll}
          onReorder={handleReorder}
        />

        {githubImportError ? <p className="text-sm text-amber-500">{githubImportError}</p> : null}

        <ProjectEditor
          project={activeProject}
          onSave={handleSaveProject}
          onStatusChange={handleStatusChange}
          onRollback={handleRollback}
          onImportGithub={handleImportGithub}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
        />
      </div>
    </section>
  )
}
