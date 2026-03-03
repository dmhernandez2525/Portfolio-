import { ArrowDown, ArrowUp, Check, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TESTIMONIAL_CATEGORIES } from "@/data/testimonials"
import type { TestimonialRecord, TestimonialSource } from "@/types/testimonials"

interface TestimonialEditorCardProps {
  testimonial: TestimonialRecord
  total: number
  isSaving: boolean
  onChange: (id: string, field: keyof TestimonialRecord, value: string | number | boolean | string[]) => void
  onSave: (id: string) => void
  onDelete: (id: string) => void
  onApproveToggle: (id: string, nextApproved: boolean) => void
  onMove: (id: string, direction: "up" | "down") => void
}

const SOURCE_OPTIONS: TestimonialSource[] = ["linkedin", "github", "direct"]

export function TestimonialEditorCard({
  testimonial,
  total,
  isSaving,
  onChange,
  onSave,
  onDelete,
  onApproveToggle,
  onMove,
}: TestimonialEditorCardProps) {
  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold">
          {testimonial.name} · {testimonial.role}
        </h4>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            aria-label={`Move testimonial ${testimonial.name} up`}
            disabled={testimonial.order === 0}
            onClick={() => onMove(testimonial.id, "up")}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label={`Move testimonial ${testimonial.name} down`}
            disabled={testimonial.order === total - 1}
            onClick={() => onMove(testimonial.id, "down")}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor={`${testimonial.id}-name`}>Name</Label>
          <Input id={`${testimonial.id}-name`} value={testimonial.name} onChange={(event) => onChange(testimonial.id, "name", event.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${testimonial.id}-company`}>Company</Label>
          <Input
            id={`${testimonial.id}-company`}
            value={testimonial.company}
            onChange={(event) => onChange(testimonial.id, "company", event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${testimonial.id}-role`}>Role</Label>
          <Input id={`${testimonial.id}-role`} value={testimonial.role} onChange={(event) => onChange(testimonial.id, "role", event.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${testimonial.id}-rating`}>Rating (1-5)</Label>
          <Input
            id={`${testimonial.id}-rating`}
            type="number"
            min={1}
            max={5}
            value={testimonial.rating}
            onChange={(event) => onChange(testimonial.id, "rating", Number(event.target.value))}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor={`${testimonial.id}-source`}>Source</Label>
          <select
            id={`${testimonial.id}-source`}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={testimonial.source}
            onChange={(event) => onChange(testimonial.id, "source", event.target.value as TestimonialSource)}
          >
            {SOURCE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={`${testimonial.id}-category`}>Category</Label>
          <select
            id={`${testimonial.id}-category`}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={testimonial.category}
            onChange={(event) => onChange(testimonial.id, "category", event.target.value)}
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
        <Label htmlFor={`${testimonial.id}-content`}>Testimonial</Label>
        <Textarea
          id={`${testimonial.id}-content`}
          value={testimonial.content}
          onChange={(event) => onChange(testimonial.id, "content", event.target.value)}
          className="min-h-24"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" variant={testimonial.approved ? "secondary" : "outline"} onClick={() => onApproveToggle(testimonial.id, !testimonial.approved)}>
          <Check className="mr-1.5 h-4 w-4" />
          {testimonial.approved ? "Approved" : "Approve"}
        </Button>
        <Button size="sm" variant={testimonial.featured ? "secondary" : "outline"} onClick={() => onChange(testimonial.id, "featured", !testimonial.featured)}>
          {testimonial.featured ? "Featured" : "Set Featured"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onChange(testimonial.id, "verified", !testimonial.verified)}>
          {testimonial.verified ? "Verified" : "Mark Verified"}
        </Button>
        <Button size="sm" onClick={() => onSave(testimonial.id)} disabled={isSaving}>
          <Save className="mr-1.5 h-4 w-4" />
          Save
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(testimonial.id)}>
          <Trash2 className="mr-1.5 h-4 w-4" />
          Delete
        </Button>
      </div>
    </article>
  )
}
