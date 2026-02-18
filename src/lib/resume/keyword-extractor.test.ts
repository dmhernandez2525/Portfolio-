import { describe, expect, it } from "vitest"
import {
  analyzeSkillGaps,
  calculateATSScore,
  extractKeywords,
  getOptimizationSuggestions,
} from "@/lib/resume/keyword-extractor"

describe("extractKeywords", () => {
  it("extracts technical terms from job description", () => {
    const desc = "We need a developer with React, TypeScript, and Node experience"
    const keywords = extractKeywords(desc)
    const terms = keywords.map((k) => k.term)
    expect(terms).toContain("react")
    expect(terms).toContain("typescript")
    expect(terms).toContain("node")
  })

  it("categorizes terms correctly", () => {
    const desc = "React developer with leadership and agile experience"
    const keywords = extractKeywords(desc)
    const reactKw = keywords.find((k) => k.term === "react")
    const leaderKw = keywords.find((k) => k.term === "leadership")
    const agileKw = keywords.find((k) => k.term === "agile")
    expect(reactKw?.category).toBe("technical")
    expect(leaderKw?.category).toBe("soft-skill")
    expect(agileKw?.category).toBe("methodology")
  })

  it("counts frequency correctly", () => {
    const desc = "React React React TypeScript"
    const keywords = extractKeywords(desc)
    const react = keywords.find((k) => k.term === "react")
    expect(react?.frequency).toBe(3)
  })

  it("sorts by frequency descending", () => {
    const desc = "React React TypeScript TypeScript TypeScript Python"
    const keywords = extractKeywords(desc)
    expect(keywords[0].term).toBe("typescript")
    expect(keywords[1].term).toBe("react")
  })

  it("returns empty for text with no known terms", () => {
    expect(extractKeywords("hello world foo bar")).toEqual([])
  })
})

describe("calculateATSScore", () => {
  it("returns 100 when no job keywords", () => {
    expect(calculateATSScore(["React"], [])).toBe(100)
  })

  it("returns 100 when all keywords match", () => {
    const jobKw = [
      { term: "react", category: "technical" as const, frequency: 1 },
      { term: "node", category: "technical" as const, frequency: 1 },
    ]
    expect(calculateATSScore(["React", "Node"], jobKw)).toBe(100)
  })

  it("returns partial score for partial match", () => {
    const jobKw = [
      { term: "react", category: "technical" as const, frequency: 1 },
      { term: "vue", category: "technical" as const, frequency: 1 },
    ]
    expect(calculateATSScore(["React"], jobKw)).toBe(50)
  })

  it("returns 0 when no matches", () => {
    const jobKw = [
      { term: "react", category: "technical" as const, frequency: 1 },
    ]
    expect(calculateATSScore(["Python"], jobKw)).toBe(0)
  })
})

describe("getOptimizationSuggestions", () => {
  it("suggests missing keywords", () => {
    const jobKw = [
      { term: "react", category: "technical" as const, frequency: 2 },
      { term: "docker", category: "technical" as const, frequency: 1 },
    ]
    const suggestions = getOptimizationSuggestions(["React"], jobKw)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]).toContain("docker")
    expect(suggestions[0]).toContain("mentioned 1x")
  })

  it("returns empty when all keywords present", () => {
    const jobKw = [
      { term: "react", category: "technical" as const, frequency: 1 },
    ]
    expect(getOptimizationSuggestions(["React"], jobKw)).toEqual([])
  })
})

describe("analyzeSkillGaps", () => {
  it("identifies missing and matched skills", () => {
    const required = [
      { term: "react", category: "technical" as const, frequency: 1 },
      { term: "docker", category: "technical" as const, frequency: 1 },
      { term: "leadership", category: "soft-skill" as const, frequency: 1 },
    ]
    const result = analyzeSkillGaps(["React", "Leadership"], required)
    expect(result.matched).toHaveLength(2)
    expect(result.missing).toHaveLength(1)
    expect(result.missing[0].term).toBe("docker")
  })

  it("handles empty skills list", () => {
    const required = [
      { term: "react", category: "technical" as const, frequency: 1 },
    ]
    const result = analyzeSkillGaps([], required)
    expect(result.missing).toHaveLength(1)
    expect(result.matched).toHaveLength(0)
  })
})
