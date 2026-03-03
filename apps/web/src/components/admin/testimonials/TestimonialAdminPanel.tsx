import { useMemo, useState } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TestimonialEditorCard } from "@/components/admin/testimonials/TestimonialEditorCard"
import { TESTIMONIAL_CATEGORIES } from "@/data/testimonials"
import { createTestimonial, deleteTestimonial, getAllTestimonials, moveTestimonial, updateTestimonial } from "@/lib/testimonials-store"
import type { NewTestimonialInput, TestimonialRecord, TestimonialSource, UpdateTestimonialInput } from "@/types/testimonials"

const INITIAL_NEW_TESTIMONIAL: NewTestimonialInput = {
  name: "",
  role: "",
  company: "",
  content: "",
  rating: 5,
  source: "direct",
  category: "colleague",
  verified: false,
  approved: false,
  featured: false,
  tags: [],
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function toUpdatePayload(testimonial: TestimonialRecord): UpdateTestimonialInput {
  return {
    id: testimonial.id,
    name: testimonial.name,
    role: testimonial.role,
    company: testimonial.company,
    content: testimonial.content,
    rating: testimonial.rating,
    source: testimonial.source,
    sourceUrl: testimonial.sourceUrl,
    category: testimonial.category,
    verified: testimonial.verified,
    approved: testimonial.approved,
    featured: testimonial.featured,
    tags: testimonial.tags,
    videoUrl: testimonial.videoUrl,
  }
}

export function TestimonialAdminPanel() {
  const [records, setRecords] = useState<TestimonialRecord[]>(() => getAllTestimonials())
  const [newEntry, setNewEntry] = useState<NewTestimonialInput>(INITIAL_NEW_TESTIMONIAL)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const sortedRecords = useMemo(() => [...records].sort((a, b) => a.order - b.order), [records])

  const handleLocalChange = (
    id: string,
    field: keyof TestimonialRecord,
    value: string | number | boolean | string[],
  ): void => {
    setRecords((current) =>
      current.map((record) => (record.id === id ? { ...record, [field]: value } : record)),
    )
  }

  const handleSave = (id: string): void => {
    const draft = records.find((record) => record.id === id)
    if (!draft) return

    setIsSaving(true)
    const result = updateTestimonial(toUpdatePayload(draft))
    setRecords(getAllTestimonials())
    if (!result) {
      setRecords(getAllTestimonials())
    }
    setIsSaving(false)
  }

  const handleDelete = (id: string): void => {
    deleteTestimonial(id)
    setRecords(getAllTestimonials())
  }

  const handleMove = (id: string, direction: "up" | "down"): void => {
    setRecords(moveTestimonial(id, direction))
  }

  const handleCreate = (): void => {
    if (!newEntry.name.trim() || !newEntry.content.trim() || !newEntry.role.trim()) return
    createTestimonial({
      ...newEntry,
      rating: Math.max(1, Math.min(5, Math.round(newEntry.rating))),
      tags: newEntry.tags.filter(Boolean),
    })
    setRecords(getAllTestimonials())
    setNewEntry(INITIAL_NEW_TESTIMONIAL)
  }

  const handleNewEntryChange = <K extends keyof NewTestimonialInput>(field: K, value: NewTestimonialInput[K]): void => {
    setNewEntry((current) => ({ ...current, [field]: value }))
  }

  return (
    <section className="mt-8 rounded-xl border border-border bg-card/40 p-5">
      <h3 className="text-lg font-semibold">Testimonials Manager</h3>
      <p className="mt-1 text-sm text-muted-foreground">Approve, edit, delete, and reorder testimonial cards.</p>

      <div className="mt-5 rounded-lg border border-border bg-background p-4">
        <h4 className="font-medium">Add Testimonial</h4>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="new-testimonial-name">Name</Label>
            <Input id="new-testimonial-name" value={newEntry.name} onChange={(event) => handleNewEntryChange("name", event.target.value)} />
          </div>
          <div>
            <Label htmlFor="new-testimonial-company">Company</Label>
            <Input id="new-testimonial-company" value={newEntry.company} onChange={(event) => handleNewEntryChange("company", event.target.value)} />
          </div>
          <div>
            <Label htmlFor="new-testimonial-role">Role</Label>
            <Input id="new-testimonial-role" value={newEntry.role} onChange={(event) => handleNewEntryChange("role", event.target.value)} />
          </div>
          <div>
            <Label htmlFor="new-testimonial-rating">Rating</Label>
            <Input
              id="new-testimonial-rating"
              type="number"
              min={1}
              max={5}
              value={newEntry.rating}
              onChange={(event) => handleNewEntryChange("rating", Number(event.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="new-testimonial-source">Source</Label>
            <select
              id="new-testimonial-source"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newEntry.source}
              onChange={(event) => handleNewEntryChange("source", event.target.value as TestimonialSource)}
            >
              <option value="direct">Direct</option>
              <option value="linkedin">LinkedIn</option>
              <option value="github">GitHub</option>
            </select>
          </div>
          <div>
            <Label htmlFor="new-testimonial-category">Category</Label>
            <select
              id="new-testimonial-category"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newEntry.category}
              onChange={(event) => handleNewEntryChange("category", event.target.value as NewTestimonialInput["category"])}
            >
              {TESTIMONIAL_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <Label htmlFor="new-testimonial-content">Content</Label>
          <Textarea
            id="new-testimonial-content"
            className="min-h-24"
            value={newEntry.content}
            onChange={(event) => handleNewEntryChange("content", event.target.value)}
          />
        </div>
        <div className="mt-3">
          <Label htmlFor="new-testimonial-tags">Tags (comma separated)</Label>
          <Input
            id="new-testimonial-tags"
            value={newEntry.tags.join(", ")}
            onChange={(event) => handleNewEntryChange("tags", parseTags(event.target.value))}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant={newEntry.approved ? "secondary" : "outline"} onClick={() => handleNewEntryChange("approved", !newEntry.approved)}>
            {newEntry.approved ? "Approved" : "Approve"}
          </Button>
          <Button size="sm" variant={newEntry.verified ? "secondary" : "outline"} onClick={() => handleNewEntryChange("verified", !newEntry.verified)}>
            {newEntry.verified ? "Verified" : "Mark Verified"}
          </Button>
          <Button size="sm" variant={newEntry.featured ? "secondary" : "outline"} onClick={() => handleNewEntryChange("featured", !newEntry.featured)}>
            {newEntry.featured ? "Featured" : "Set Featured"}
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {sortedRecords.map((testimonial) => (
          <TestimonialEditorCard
            key={testimonial.id}
            testimonial={testimonial}
            total={sortedRecords.length}
            isSaving={isSaving}
            onChange={handleLocalChange}
            onSave={handleSave}
            onDelete={handleDelete}
            onApproveToggle={(id, nextApproved) => handleLocalChange(id, "approved", nextApproved)}
            onMove={handleMove}
          />
        ))}
      </div>
    </section>
  )
}
