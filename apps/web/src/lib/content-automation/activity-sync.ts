/**
 * GitHub activity sync and automated content updates.
 * Pulls commit activity, derives project status, and tracks skill levels.
 */

export interface CommitActivity {
  repo: string
  message: string
  date: string
  language: string
}

export interface ProjectStatus {
  name: string
  status: "active" | "maintained" | "archived"
  lastActivity: string
  commitCount: number
}

export interface SkillLevel {
  skill: string
  level: "beginner" | "intermediate" | "advanced" | "expert"
  commitCount: number
  lastUsed: string
}

export interface BlogSuggestion {
  title: string
  reason: string
  relatedRepo: string
}

export function deriveProjectStatus(
  commits: CommitActivity[],
  repoName: string,
  now: Date = new Date()
): ProjectStatus {
  const repoCommits = commits.filter((c) => c.repo === repoName)
  const count = repoCommits.length

  if (count === 0) {
    return { name: repoName, status: "archived", lastActivity: "", commitCount: 0 }
  }

  const sorted = [...repoCommits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const lastActivity = sorted[0].date
  const daysSince = Math.floor(
    (now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
  )

  let status: ProjectStatus["status"] = "active"
  if (daysSince > 180) status = "archived"
  else if (daysSince > 60) status = "maintained"

  return { name: repoName, status, lastActivity, commitCount: count }
}

export function calculateSkillLevels(commits: CommitActivity[]): SkillLevel[] {
  const skillMap = new Map<string, { count: number; lastUsed: string }>()

  for (const commit of commits) {
    const lang = commit.language.toLowerCase()
    if (!lang) continue

    const existing = skillMap.get(lang)
    if (!existing) {
      skillMap.set(lang, { count: 1, lastUsed: commit.date })
    } else {
      existing.count++
      if (new Date(commit.date) > new Date(existing.lastUsed)) {
        existing.lastUsed = commit.date
      }
    }
  }

  const results: SkillLevel[] = []
  for (const [skill, data] of skillMap) {
    results.push({
      skill,
      level: commitCountToLevel(data.count),
      commitCount: data.count,
      lastUsed: data.lastUsed,
    })
  }

  return results.sort((a, b) => b.commitCount - a.commitCount)
}

function commitCountToLevel(count: number): SkillLevel["level"] {
  if (count >= 100) return "expert"
  if (count >= 50) return "advanced"
  if (count >= 20) return "intermediate"
  return "beginner"
}

export function suggestBlogPosts(commits: CommitActivity[]): BlogSuggestion[] {
  const repoActivity = new Map<string, number>()
  const repoLanguages = new Map<string, Set<string>>()

  for (const commit of commits) {
    repoActivity.set(commit.repo, (repoActivity.get(commit.repo) ?? 0) + 1)

    const langs = repoLanguages.get(commit.repo) ?? new Set()
    if (commit.language) langs.add(commit.language)
    repoLanguages.set(commit.repo, langs)
  }

  const suggestions: BlogSuggestion[] = []
  const sortedRepos = [...repoActivity.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  for (const [repo, count] of sortedRepos) {
    const langs = repoLanguages.get(repo)
    const langList = langs ? [...langs].join(", ") : "various technologies"

    suggestions.push({
      title: `Building ${repo}: Lessons Learned`,
      reason: `${count} commits recently using ${langList}`,
      relatedRepo: repo,
    })
  }

  return suggestions
}

export function groupCommitsByWeek(commits: CommitActivity[]): Map<string, number> {
  const weeks = new Map<string, number>()

  for (const commit of commits) {
    const date = new Date(commit.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    weeks.set(key, (weeks.get(key) ?? 0) + 1)
  }

  return weeks
}
