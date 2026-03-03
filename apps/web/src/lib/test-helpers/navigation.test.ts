import { describe, expect, it } from "vitest"

function resolveRoute(path: string, mode: string | null): string {
  if (!mode) return "/"
  if (mode !== "creative") return "/"
  return path
}

function buildBreadcrumbs(path: string): Array<{ label: string; path: string }> {
  const segments = path.split("/").filter(Boolean)
  const crumbs = [{ label: "Home", path: "/" }]

  let current = ""
  for (const segment of segments) {
    current += `/${segment}`
    crumbs.push({ label: segment.charAt(0).toUpperCase() + segment.slice(1), path: current })
  }

  return crumbs
}

describe("route resolution", () => {
  it("resolves to gateway when no mode is set", () => {
    expect(resolveRoute("/projects", null)).toBe("/")
  })

  it("resolves path in creative mode", () => {
    expect(resolveRoute("/projects", "creative")).toBe("/projects")
  })

  it("resolves to home in non-creative modes", () => {
    expect(resolveRoute("/projects", "resume")).toBe("/")
  })
})

describe("breadcrumb building", () => {
  it("builds breadcrumbs from path", () => {
    const crumbs = buildBreadcrumbs("/projects/my-app")
    expect(crumbs).toHaveLength(3)
    expect(crumbs[0]).toEqual({ label: "Home", path: "/" })
    expect(crumbs[1]).toEqual({ label: "Projects", path: "/projects" })
    expect(crumbs[2]).toEqual({ label: "My-app", path: "/projects/my-app" })
  })

  it("handles root path", () => {
    const crumbs = buildBreadcrumbs("/")
    expect(crumbs).toHaveLength(1)
  })
})
