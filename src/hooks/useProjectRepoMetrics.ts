import { useEffect, useMemo, useState } from "react"
import type { ProjectItem } from "@/data/projects"
import type { ProjectRepoMetrics } from "@/types/project-detail"

interface UseProjectRepoMetricsResult {
  metrics: ProjectRepoMetrics
  isLoading: boolean
  error: string | null
}

interface GitHubRepoMetadata {
  stargazers_count: number
  forks_count: number
}

type GitHubLanguages = Record<string, number>

const APPROX_BYTES_PER_LINE = 35

function fallbackMetrics(project: ProjectItem): ProjectRepoMetrics {
  const featureCount = project.features?.length ?? 0
  const highlightCount = project.highlights?.length ?? 0
  const derivedLines = (project.description.length + project.tech.join("").length * 8 + featureCount * 600 + highlightCount * 220)

  return {
    stars: featureCount + highlightCount,
    forks: Math.max(1, Math.round(featureCount * 0.65)),
    linesOfCodeApprox: Math.max(1200, Math.round(derivedLines)),
  }
}

function extractGitHubRepo(url?: string): { owner: string; repo: string } | null {
  if (!url) return null

  try {
    const parsed = new URL(url)
    if (parsed.hostname !== "github.com") return null

    const segments = parsed.pathname.split("/").filter(Boolean)
    if (segments.length < 2) return null

    return {
      owner: segments[0],
      repo: segments[1].replace(/\.git$/, ""),
    }
  } catch {
    return null
  }
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

export function useProjectRepoMetrics(project: ProjectItem): UseProjectRepoMetricsResult {
  const fallback = useMemo(() => fallbackMetrics(project), [project])
  const [metrics, setMetrics] = useState<ProjectRepoMetrics>(fallback)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(project.github))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const repo = extractGitHubRepo(project.github)
    if (!repo) {
      setMetrics(fallback)
      setIsLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    let active = true

    const run = async (): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        const repoApi = `https://api.github.com/repos/${repo.owner}/${repo.repo}`
        const languagesApi = `${repoApi}/languages`

        const [repoData, languages] = await Promise.all([
          fetchJson<GitHubRepoMetadata>(repoApi, controller.signal),
          fetchJson<GitHubLanguages>(languagesApi, controller.signal),
        ])

        const byteTotal = Object.values(languages).reduce((sum, value) => sum + value, 0)
        const approxLines = Math.max(500, Math.round(byteTotal / APPROX_BYTES_PER_LINE))

        if (!active) return

        setMetrics({
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          linesOfCodeApprox: approxLines,
        })
      } catch (unknownError) {
        if (!active || controller.signal.aborted) return

        const message = unknownError instanceof Error ? unknownError.message : "Failed to load repository metrics"
        setMetrics(fallback)
        setError(message)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    run().catch((unknownError: unknown) => {
      if (!active || controller.signal.aborted) return

      const message = unknownError instanceof Error ? unknownError.message : "Failed to load repository metrics"
      setMetrics(fallback)
      setError(message)
      setIsLoading(false)
    })

    return () => {
      active = false
      controller.abort()
    }
  }, [fallback, project.github])

  return { metrics, isLoading, error }
}
