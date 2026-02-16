import { describe, expect, it } from "vitest"
import {
  createMessage,
  detectIntent,
  exportConversation,
  generateResponse,
  getTourStep,
  GUIDED_TOUR,
} from "@/lib/chatbot/conversation"
import type { PersonalityConfig, ChatMessage } from "@/lib/chatbot/conversation"

const neutral: PersonalityConfig = { formality: "neutral", humor: "none", verbosity: "balanced" }
const casual: PersonalityConfig = { formality: "casual", humor: "playful", verbosity: "balanced" }
const formal: PersonalityConfig = { formality: "formal", humor: "none", verbosity: "concise" }

describe("createMessage", () => {
  it("creates a message with all fields", () => {
    const msg = createMessage("user", "Hello", "/home")
    expect(msg.role).toBe("user")
    expect(msg.text).toBe("Hello")
    expect(msg.context).toBe("/home")
    expect(msg.id).toMatch(/^msg_/)
    expect(msg.timestamp).toBeGreaterThan(0)
  })

  it("generates unique IDs", () => {
    const a = createMessage("bot", "Hi")
    const b = createMessage("bot", "Hi")
    expect(a.id).not.toBe(b.id)
  })
})

describe("detectIntent", () => {
  it("detects greetings", () => {
    expect(detectIntent("Hello there")).toBe("greeting")
    expect(detectIntent("hey")).toBe("greeting")
  })

  it("detects skill inquiries", () => {
    expect(detectIntent("What is your tech stack?")).toBe("skills")
  })

  it("detects project inquiries", () => {
    expect(detectIntent("Show me your projects")).toBe("projects")
  })

  it("detects contact intent", () => {
    expect(detectIntent("How can I reach you?")).toBe("contact")
  })

  it("returns unknown for unrecognized input", () => {
    expect(detectIntent("asdfghjkl")).toBe("unknown")
  })
})

describe("generateResponse", () => {
  it("responds to greetings", () => {
    const response = generateResponse("Hello!", "/", neutral)
    expect(response).toContain("Welcome")
  })

  it("responds with knowledge base content", () => {
    const response = generateResponse("Tell me about your skills", "/", neutral)
    expect(response).toContain("React")
  })

  it("adds context note on matching page", () => {
    const response = generateResponse("Show projects", "/projects", neutral)
    expect(response).toContain("already on the projects page")
  })

  it("applies casual personality", () => {
    const response = generateResponse("Hello", "/", casual)
    expect(response).toContain("Hey there")
    expect(response).toContain(":)")
  })

  it("applies formal personality", () => {
    const response = generateResponse("What skills do you have?", "/", formal)
    expect(response.length).toBeLessThan(200)
  })

  it("returns fallback for unknown input", () => {
    const response = generateResponse("xyzzy", "/", neutral)
    expect(response).toContain("not sure")
  })
})

describe("guided tour", () => {
  it("has valid tour steps", () => {
    expect(GUIDED_TOUR.length).toBeGreaterThanOrEqual(4)
    for (const step of GUIDED_TOUR) {
      expect(step.id).toBeTruthy()
      expect(step.route).toBeTruthy()
      expect(step.nextOptions.length).toBeGreaterThan(0)
    }
  })

  it("finds step by id", () => {
    const step = getTourStep("welcome")
    expect(step?.title).toBe("Welcome")
    expect(step?.route).toBe("/")
  })

  it("returns undefined for missing step", () => {
    expect(getTourStep("nonexistent")).toBeUndefined()
  })

  it("all nextOptions reference valid steps", () => {
    const ids = new Set(GUIDED_TOUR.map((s) => s.id))
    for (const step of GUIDED_TOUR) {
      for (const next of step.nextOptions) {
        expect(ids.has(next)).toBe(true)
      }
    }
  })
})

describe("exportConversation", () => {
  const messages: ChatMessage[] = [
    { id: "1", role: "user", text: "Hello", timestamp: 1000000, context: "/" },
    { id: "2", role: "bot", text: "Welcome!", timestamp: 1000001 },
  ]

  it("exports to text format", () => {
    const text = exportConversation(messages, "text")
    expect(text).toContain("You: Hello")
    expect(text).toContain("Bot: Welcome!")
  })

  it("exports to JSON format", () => {
    const json = exportConversation(messages, "json")
    const parsed = JSON.parse(json)
    expect(parsed).toHaveLength(2)
    expect(parsed[0].role).toBe("user")
  })

  it("handles empty conversation", () => {
    expect(exportConversation([], "text")).toBe("")
    expect(JSON.parse(exportConversation([], "json"))).toEqual([])
  })
})
