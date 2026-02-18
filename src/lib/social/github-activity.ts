export interface GitHubEvent {
  id: string
  type: string
  repo: string
  createdAt: string
  description: string
}

export interface GitHubContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

const GITHUB_API_BASE = "https://api.github.com"
const GITHUB_USERNAME = "dmhernandez2525"

export async function fetchGitHubEvents(username: string = GITHUB_USERNAME): Promise<GitHubEvent[]> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}/events/public?per_page=10`)
    if (!response.ok) return []

    const raw = await response.json() as Array<{ id: string; type: string; repo: { name: string }; created_at: string; payload: Record<string, unknown> }>
    return raw.map((event) => ({
      id: event.id,
      type: event.type,
      repo: event.repo.name,
      createdAt: event.created_at,
      description: formatEventDescription(event.type, event.payload),
    }))
  } catch {
    return []
  }
}

function formatEventDescription(type: string, payload: Record<string, unknown>): string {
  const descriptions: Record<string, string> = {
    PushEvent: `Pushed ${(payload.commits as Array<unknown>)?.length ?? 0} commit(s)`,
    PullRequestEvent: `${payload.action ?? "opened"} a pull request`,
    CreateEvent: `Created ${payload.ref_type ?? "repository"}`,
    IssuesEvent: `${payload.action ?? "opened"} an issue`,
    WatchEvent: "Starred a repository",
    ForkEvent: "Forked a repository",
  }
  return descriptions[type] ?? type.replace("Event", "")
}

export function buildContributionHeatmap(events: GitHubEvent[]): GitHubContributionDay[] {
  const counts = new Map<string, number>()

  for (const event of events) {
    const date = event.createdAt.split("T")[0]
    counts.set(date, (counts.get(date) ?? 0) + 1)
  }

  return Array.from(counts.entries()).map(([date, count]) => ({
    date,
    count,
    level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4,
  }))
}
