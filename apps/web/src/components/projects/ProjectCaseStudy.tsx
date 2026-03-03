import type { ProjectCaseStudy } from "@/types/project-detail"

interface ProjectCaseStudyProps {
  caseStudy: ProjectCaseStudy
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={`${title}-${item}`}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}

export function ProjectCaseStudy({ caseStudy }: ProjectCaseStudyProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Case Study</h2>

      <div className="rounded-lg border border-border bg-card/40 p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Problem</h3>
        <p className="text-sm text-muted-foreground">{caseStudy.problem}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ListSection title="Approach" items={caseStudy.approach} />
        <ListSection title="Solution" items={caseStudy.solution} />
        <ListSection title="Results" items={caseStudy.results} />
      </div>
    </section>
  )
}
