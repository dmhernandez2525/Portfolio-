/**
 * Keyword extraction from job descriptions for resume optimization.
 */

export interface ExtractedKeyword {
  term: string
  category: KeywordCategory
  frequency: number
}

export type KeywordCategory =
  | "technical"
  | "soft-skill"
  | "certification"
  | "tool"
  | "methodology"

const TECHNICAL_TERMS = new Set([
  "react", "typescript", "javascript", "python", "node", "nextjs", "vue",
  "angular", "graphql", "rest", "sql", "nosql", "aws", "docker", "kubernetes",
  "ci/cd", "git", "html", "css", "tailwind", "postgresql", "mongodb",
  "redis", "webpack", "vite", "rust", "go", "java", "c#", "swift",
])

const SOFT_SKILLS = new Set([
  "leadership", "communication", "teamwork", "collaboration", "mentoring",
  "problem-solving", "analytical", "adaptable", "creative", "self-motivated",
  "detail-oriented", "organized", "proactive", "initiative",
])

const CERTIFICATIONS = new Set([
  "aws certified", "google cloud", "azure", "pmp", "scrum master",
  "cissp", "comptia", "itil", "six sigma",
])

const METHODOLOGIES = new Set([
  "agile", "scrum", "kanban", "waterfall", "devops", "tdd", "bdd",
  "microservices", "serverless", "event-driven",
])

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s/\-#.+]/g, " ")
}

function classifyTerm(term: string): KeywordCategory {
  if (TECHNICAL_TERMS.has(term)) return "technical"
  if (SOFT_SKILLS.has(term)) return "soft-skill"
  if (METHODOLOGIES.has(term)) return "methodology"
  for (const cert of CERTIFICATIONS) {
    if (term.includes(cert)) return "certification"
  }
  return "tool"
}

export function extractKeywords(jobDescription: string): ExtractedKeyword[] {
  const normalized = normalizeText(jobDescription)
  const words = normalized.split(/\s+/).filter(Boolean)
  const frequencyMap = new Map<string, number>()

  for (const word of words) {
    const current = frequencyMap.get(word) ?? 0
    frequencyMap.set(word, current + 1)
  }

  // Also check for bigrams
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`
    const current = frequencyMap.get(bigram) ?? 0
    frequencyMap.set(bigram, current + 1)
  }

  const allKnown = new Set([
    ...TECHNICAL_TERMS,
    ...SOFT_SKILLS,
    ...CERTIFICATIONS,
    ...METHODOLOGIES,
  ])

  const results: ExtractedKeyword[] = []
  for (const [term, frequency] of frequencyMap) {
    if (allKnown.has(term)) {
      results.push({ term, category: classifyTerm(term), frequency })
    }
  }

  return results.sort((a, b) => b.frequency - a.frequency)
}

export function calculateATSScore(
  resumeKeywords: string[],
  jobKeywords: ExtractedKeyword[]
): number {
  if (jobKeywords.length === 0) return 100

  const resumeSet = new Set(resumeKeywords.map((k) => k.toLowerCase()))
  let matched = 0

  for (const jk of jobKeywords) {
    if (resumeSet.has(jk.term)) matched++
  }

  return Math.round((matched / jobKeywords.length) * 100)
}

export function getOptimizationSuggestions(
  resumeKeywords: string[],
  jobKeywords: ExtractedKeyword[]
): string[] {
  const resumeSet = new Set(resumeKeywords.map((k) => k.toLowerCase()))
  const missing = jobKeywords.filter((jk) => !resumeSet.has(jk.term))

  return missing.map((m) => {
    const label = m.category === "technical" ? "technical skill" : m.category
    return `Add "${m.term}" (${label}, mentioned ${m.frequency}x)`
  })
}

export function analyzeSkillGaps(
  currentSkills: string[],
  requiredKeywords: ExtractedKeyword[]
): { missing: ExtractedKeyword[]; matched: ExtractedKeyword[] } {
  const skillSet = new Set(currentSkills.map((s) => s.toLowerCase()))
  const missing: ExtractedKeyword[] = []
  const matched: ExtractedKeyword[] = []

  for (const kw of requiredKeywords) {
    if (skillSet.has(kw.term)) {
      matched.push(kw)
    } else {
      missing.push(kw)
    }
  }

  return { missing, matched }
}
