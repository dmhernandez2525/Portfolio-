import { useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Eye, History, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PROJECT_TEMPLATES } from "@/data/admin-project-templates"
import type { ImageProcessOptions } from "@/lib/project-image-tools"
import type { ManagedProjectRecord, ManagedProjectStatus } from "@/types/admin-project"

interface ProjectEditorProps {
  project: ManagedProjectRecord | null
  onSave: (project: ManagedProjectRecord) => void
  onStatusChange: (id: string, status: ManagedProjectStatus) => void
  onRollback: (projectId: string, versionId: string) => void
  onImportGithub: (projectId: string, repoPath: string) => Promise<void>
  onImageUpload: (projectId: string, file: File, options: ImageProcessOptions) => Promise<void>
  onImageRemove: (projectId: string, imageId: string) => void
}

const INITIAL_IMAGE_OPTIONS: ImageProcessOptions = {
  maxWidth: 1280,
  maxHeight: 720,
  quality: 0.82,
  cropPercent: {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  },
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function ProjectEditor({
  project,
  onSave,
  onStatusChange,
  onRollback,
  onImportGithub,
  onImageUpload,
  onImageRemove,
}: ProjectEditorProps) {
  const [repoPath, setRepoPath] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false)
  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [imageOptions, setImageOptions] = useState<ImageProcessOptions>(INITIAL_IMAGE_OPTIONS)

  const templateLabel = useMemo(() => {
    if (!project?.templateId) return "Custom"
    return PROJECT_TEMPLATES.find((template) => template.id === project.templateId)?.label ?? "Custom"
  }, [project?.templateId])

  if (!project) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        Select a project to edit.
      </div>
    )
  }

  const handleFieldChange = <K extends keyof ManagedProjectRecord>(field: K, value: ManagedProjectRecord[K]): void => {
    onSave({ ...project, [field]: value })
  }

  const handleGithubImport = async (): Promise<void> => {
    if (!repoPath.trim()) return
    setIsImporting(true)
    await onImportGithub(project.id, repoPath)
    setIsImporting(false)
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold">Project Editor</h4>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsPreviewOpen((value) => !value)}>
            <Eye className="mr-1.5 h-4 w-4" />
            {isPreviewOpen ? "Hide Preview" : "Preview"}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onStatusChange(project.id, "draft")}>
            Draft
          </Button>
          <Button size="sm" onClick={() => onStatusChange(project.id, "published")}>
            Publish
          </Button>
          <Button size="sm" variant="outline" onClick={() => onStatusChange(project.id, "archived")}>
            Archive
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Template: {templateLabel}</p>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="project-title">Title</Label>
          <Input id="project-title" value={project.title} onChange={(event) => handleFieldChange("title", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-slug">Slug</Label>
          <Input id="project-slug" value={project.slug} onChange={(event) => handleFieldChange("slug", event.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="project-short">Short Description</Label>
        <Textarea
          id="project-short"
          className="min-h-20"
          value={project.shortDescription}
          onChange={(event) => handleFieldChange("shortDescription", event.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="project-markdown">Rich Content (Markdown)</Label>
        <Textarea
          id="project-markdown"
          className="min-h-32 font-mono"
          value={project.detailsMarkdown}
          onChange={(event) => handleFieldChange("detailsMarkdown", event.target.value)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="project-tech">Tech Stack (comma separated)</Label>
          <Input
            id="project-tech"
            value={project.techStack.join(", ")}
            onChange={(event) => handleFieldChange("techStack", parseList(event.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="project-tags">Tags (comma separated)</Label>
          <Input id="project-tags" value={project.tags.join(", ")} onChange={(event) => handleFieldChange("tags", parseList(event.target.value))} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="project-problem">Problem</Label>
          <Textarea id="project-problem" value={project.problem} onChange={(event) => handleFieldChange("problem", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-approach">Approach</Label>
          <Textarea id="project-approach" value={project.approach} onChange={(event) => handleFieldChange("approach", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-solution">Solution</Label>
          <Textarea id="project-solution" value={project.solution} onChange={(event) => handleFieldChange("solution", event.target.value)} />
        </div>
        <div>
          <Label htmlFor="project-results">Results</Label>
          <Textarea id="project-results" value={project.results} onChange={(event) => handleFieldChange("results", event.target.value)} />
        </div>
      </div>

      <div className="rounded-md border border-border bg-background p-3">
        <h5 className="font-medium">GitHub Import</h5>
        <div className="mt-2 flex flex-wrap gap-2">
          <Input placeholder="owner/repo or full GitHub URL" value={repoPath} onChange={(event) => setRepoPath(event.target.value)} />
          <Button size="sm" onClick={handleGithubImport} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Repo"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-background p-3">
        <h5 className="font-medium">Image Management</h5>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <Input
            type="number"
            min={320}
            max={3840}
            value={imageOptions.maxWidth}
            onChange={(event) => setImageOptions((value) => ({ ...value, maxWidth: Number(event.target.value) }))}
          />
          <Input
            type="number"
            min={240}
            max={2160}
            value={imageOptions.maxHeight}
            onChange={(event) => setImageOptions((value) => ({ ...value, maxHeight: Number(event.target.value) }))}
          />
          <Input
            type="number"
            min={0.2}
            max={1}
            step={0.01}
            value={imageOptions.quality}
            onChange={(event) => setImageOptions((value) => ({ ...value, quality: Number(event.target.value) }))}
          />
        </div>
        <div className="mt-2 grid gap-2 md:grid-cols-4">
          <Input
            type="number"
            min={0}
            max={100}
            value={imageOptions.cropPercent.x}
            onChange={(event) => setImageOptions((value) => ({ ...value, cropPercent: { ...value.cropPercent, x: Number(event.target.value) } }))}
          />
          <Input
            type="number"
            min={0}
            max={100}
            value={imageOptions.cropPercent.y}
            onChange={(event) => setImageOptions((value) => ({ ...value, cropPercent: { ...value.cropPercent, y: Number(event.target.value) } }))}
          />
          <Input
            type="number"
            min={1}
            max={100}
            value={imageOptions.cropPercent.width}
            onChange={(event) => setImageOptions((value) => ({ ...value, cropPercent: { ...value.cropPercent, width: Number(event.target.value) } }))}
          />
          <Input
            type="number"
            min={1}
            max={100}
            value={imageOptions.cropPercent.height}
            onChange={(event) => setImageOptions((value) => ({ ...value, cropPercent: { ...value.cropPercent, height: Number(event.target.value) } }))}
          />
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
          <UploadCloud className="h-4 w-4" />
          Upload image
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (file) {
                await onImageUpload(project.id, file, imageOptions)
              }
              event.target.value = ""
            }}
          />
        </label>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {project.images.map((image) => (
            <div key={image.id} className="rounded-md border border-border p-2">
              <img src={image.dataUrl} alt={image.name} className="h-28 w-full rounded object-cover" />
              <p className="mt-1 text-xs text-muted-foreground">
                {image.width}x{image.height} · {image.compressedSizeKb}KB
              </p>
              <Button size="sm" variant="ghost" onClick={() => onImageRemove(project.id, image.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {isPreviewOpen ? (
        <div className="rounded-md border border-border bg-background p-4">
          <h5 className="font-medium">{project.title} Preview</h5>
          <p className="text-sm text-muted-foreground">{project.shortDescription}</p>
          <article className="prose prose-sm mt-3 max-w-none dark:prose-invert">
            <ReactMarkdown>{project.detailsMarkdown}</ReactMarkdown>
          </article>
        </div>
      ) : null}

      <div className="rounded-md border border-border bg-background p-3">
        <h5 className="inline-flex items-center gap-2 font-medium">
          <History className="h-4 w-4" />
          Version History
        </h5>
        <div className="mt-2 space-y-2">
          {project.versions.length === 0 ? <p className="text-xs text-muted-foreground">No previous versions yet.</p> : null}
          {project.versions.map((version) => (
            <div key={version.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-border p-2 text-xs">
              <span>{version.label}</span>
              <Button size="sm" variant="outline" onClick={() => onRollback(project.id, version.id)}>
                Rollback
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
