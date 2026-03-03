import { useEffect, useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ContentToolbar } from "@/components/admin/content/ContentToolbar"
import { CONTENT_TEMPLATES } from "@/data/content-templates"
import { fileToMediaAsset, optimizeImageToWebp } from "@/lib/media-optimizer"
import {
  addMediaAsset,
  buildContentAudit,
  createPostFromTemplate,
  getContentPosts,
  getDraftAuto,
  getMediaAssets,
  publishScheduledPosts,
  removeMediaAsset,
  saveDraftAuto,
  savePostWithConflictCheck,
  schedulePost,
} from "@/lib/content-management-store"
import type { ContentPostRecord } from "@/types/content-management"

function nextDays(count: number): Array<{ key: string; label: string; iso: string }> {
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      iso: date.toISOString(),
    }
  })
}

export function ContentManagementPanel() {
  const [sessionId] = useState<string>(() => `editor-${Date.now()}`)
  const [posts, setPosts] = useState<ContentPostRecord[]>(() => getContentPosts())
  const [mediaAssets, setMediaAssets] = useState(() => getMediaAssets())
  const [activePostId, setActivePostId] = useState<string | null>(posts[0]?.id ?? null)
  const [templateId, setTemplateId] = useState<string>(CONTENT_TEMPLATES[0]?.id ?? "project-deep-dive")
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)

  const activePost = useMemo(() => posts.find((post) => post.id === activePostId) ?? null, [activePostId, posts])
  const auditItems = useMemo(() => buildContentAudit(posts), [posts])

  useEffect(() => {
    if (!activePost) return
    const draft = getDraftAuto(activePost.id)
    if (draft && draft.sessionId !== sessionId) {
      setConflictMessage(`Recovered autosave from another session (${draft.savedAt}).`)
    }
  }, [activePost, sessionId])

  useEffect(() => {
    if (!activePost) return
    const timeout = window.setTimeout(() => {
      saveDraftAuto(activePost.id, activePost.markdown, sessionId)
    }, 1000)
    return () => window.clearTimeout(timeout)
  }, [activePost?.id, activePost?.markdown, sessionId])

  const refresh = (): void => {
    setPosts(getContentPosts())
    setMediaAssets(getMediaAssets())
  }

  const handleCreatePost = (): void => {
    const created = createPostFromTemplate(templateId, sessionId)
    if (!created) return
    refresh()
    setActivePostId(created.id)
  }

  const handlePostPatch = (patch: Partial<ContentPostRecord>): void => {
    if (!activePost) return
    setPosts((current) => current.map((post) => (post.id === activePost.id ? { ...post, ...patch } : post)))
  }

  const handleSavePost = (): void => {
    if (!activePost) return
    const { post, conflict } = savePostWithConflictCheck({
      postId: activePost.id,
      expectedRevision: activePost.revision,
      sessionId,
      patch: activePost,
    })

    if (conflict) {
      setConflictMessage("Conflict detected: another session saved this post. Reloaded latest version.")
      setPosts((current) => current.map((item) => (item.id === conflict.id ? conflict : item)))
      return
    }

    if (post) {
      setConflictMessage(null)
      refresh()
    }
  }

  const handleSchedule = (postId: string, isoDate: string): void => {
    schedulePost(postId, isoDate)
    refresh()
  }

  const handlePublishDue = (): void => {
    publishScheduledPosts()
    refresh()
  }

  const handleMediaUpload = async (files: FileList | null): Promise<void> => {
    if (!files) return
    for (const file of Array.from(files)) {
      const asset = file.type.startsWith("image/") ? await optimizeImageToWebp(file) : await fileToMediaAsset(file)
      if (asset) addMediaAsset(asset)
    }
    refresh()
  }

  return (
    <section className="mt-8 rounded-xl border border-border bg-card/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Content Management</h3>
          <p className="text-sm text-muted-foreground">Editor, scheduling, media library, SEO preview, and content audit.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
            {CONTENT_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
          <Button onClick={handleCreatePost}>New From Template</Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3 rounded-lg border border-border bg-background p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Posts</p>
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              className={`w-full rounded border px-3 py-2 text-left text-sm ${activePostId === post.id ? "border-primary bg-primary/5" : "border-border"}`}
              onClick={() => setActivePostId(post.id)}
            >
              <p className="font-medium">{post.title}</p>
              <p className="text-xs text-muted-foreground">{post.status}</p>
            </button>
          ))}
          <Button variant="outline" onClick={handlePublishDue}>
            Publish Due Scheduled Posts
          </Button>
        </div>

        {activePost ? (
          <div className="space-y-4 rounded-lg border border-border bg-background p-4">
            {conflictMessage ? <p className="text-xs text-amber-500">{conflictMessage}</p> : null}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="content-title">Title</Label>
                <Input id="content-title" value={activePost.title} onChange={(event) => handlePostPatch({ title: event.target.value })} />
              </div>
              <div>
                <Label htmlFor="content-slug">Slug</Label>
                <Input id="content-slug" value={activePost.slug} onChange={(event) => handlePostPatch({ slug: event.target.value })} />
              </div>
            </div>

            <Label htmlFor="content-excerpt">Excerpt</Label>
            <Textarea id="content-excerpt" value={activePost.excerpt} onChange={(event) => handlePostPatch({ excerpt: event.target.value })} />
            <ContentToolbar onInsert={(snippet) => handlePostPatch({ markdown: `${activePost.markdown}\n${snippet}` })} />
            <Textarea className="min-h-48 font-mono" value={activePost.markdown} onChange={(event) => handlePostPatch({ markdown: event.target.value })} />

            <div className="rounded-md border border-border bg-card/40 p-3">
              <p className="text-sm font-medium">Preview</p>
              <article className="prose prose-sm mt-2 max-w-none dark:prose-invert">
                <ReactMarkdown>{activePost.markdown}</ReactMarkdown>
              </article>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="schedule-date">Schedule Publication</Label>
                <Input
                  id="schedule-date"
                  type="datetime-local"
                  value={activePost.scheduledFor ? activePost.scheduledFor.slice(0, 16) : ""}
                  onChange={(event) => handleSchedule(activePost.id, new Date(event.target.value).toISOString())}
                />
              </div>
              <div>
                <Label htmlFor="seo-title">SEO Meta Title</Label>
                <Input
                  id="seo-title"
                  value={activePost.seo.metaTitle}
                  onChange={(event) => handlePostPatch({ seo: { ...activePost.seo, metaTitle: event.target.value, ogTitle: event.target.value } })}
                />
              </div>
            </div>

            <Label htmlFor="seo-description">SEO Description</Label>
            <Textarea
              id="seo-description"
              value={activePost.seo.metaDescription}
              onChange={(event) => handlePostPatch({ seo: { ...activePost.seo, metaDescription: event.target.value, ogDescription: event.target.value } })}
            />

            <div className="rounded-md border border-border bg-card/40 p-3 text-sm">
              <p className="font-medium">{activePost.seo.ogTitle}</p>
              <p className="text-muted-foreground">{activePost.seo.ogDescription}</p>
              <p className="mt-2 text-xs text-muted-foreground">Open Graph Preview · portfolio-site.onrender.com/{activePost.slug}</p>
            </div>

            <div className="rounded-md border border-border bg-card/40 p-3">
              <p className="text-sm font-medium">Per-post Analytics</p>
              <p className="text-xs text-muted-foreground">Views: {activePost.analytics.views}</p>
              <p className="text-xs text-muted-foreground">Completion: {activePost.analytics.readingCompletionRate}%</p>
              <p className="text-xs text-muted-foreground">Shares: {activePost.analytics.shares}</p>
            </div>

            <Button onClick={handleSavePost}>Save Post</Button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium">Media Library</p>
          <input className="mt-2" type="file" multiple onChange={(event) => void handleMediaUpload(event.target.files)} />
          <div className="mt-3 space-y-2 text-sm">
            {mediaAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between rounded border border-border p-2">
                <span>{asset.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{asset.type} · {asset.sizeKb}KB</span>
                  <Button size="sm" variant="ghost" onClick={() => setMediaAssets(removeMediaAsset(asset.id))}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium">Content Calendar & Audit</p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {nextDays(3).map((day) => (
              <div key={day.key} className="rounded border border-border p-2 text-xs">
                <p className="font-medium">{day.label}</p>
                {posts.filter((post) => post.scheduledFor?.startsWith(day.key)).map((post) => (
                  <button key={post.id} className="mt-1 w-full rounded border border-border px-2 py-1 text-left" onClick={() => handleSchedule(post.id, day.iso)}>
                    {post.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 text-sm">
            {auditItems.length === 0 ? <p className="text-muted-foreground">No audit issues detected.</p> : null}
            {auditItems.map((item) => (
              <p key={item.postId} className="text-amber-500">{item.title}: {item.reasons.join(", ")}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
