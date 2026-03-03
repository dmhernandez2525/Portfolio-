/**
 * Chatbot conversation engine with context-aware responses,
 * personality customization, guided tours, and export.
 */

export interface ChatMessage {
  id: string
  role: "user" | "bot"
  text: string
  timestamp: number
  context?: string
}

export interface PersonalityConfig {
  formality: "casual" | "neutral" | "formal"
  humor: "none" | "light" | "playful"
  verbosity: "concise" | "balanced" | "detailed"
}

export interface TourStep {
  id: string
  title: string
  route: string
  description: string
  nextOptions: string[]
}

const KNOWLEDGE_BASE: Record<string, string> = {
  skills: "I specialize in React, TypeScript, Node.js, and Python with experience in full-stack development.",
  experience: "I have built production applications, open-source projects, and interactive portfolio experiences.",
  contact: "You can reach me through the contact form on this site or connect via GitHub and LinkedIn.",
  projects: "Check out my projects section to see full-stack apps, games, and developer tools I have built.",
  about: "I am a software developer passionate about building elegant, performant web applications.",
  games: "This portfolio features interactive games including Snake, Chess, Tetris, and more.",
  education: "I have a strong foundation in computer science with continuous learning through projects and certifications.",
}

const GREETING_PATTERNS = [
  { pattern: /^(hi|hello|hey|howdy|greetings)/i, key: "greeting" },
  { pattern: /(skill|tech|stack|language)/i, key: "skills" },
  { pattern: /(experience|work|job|career)/i, key: "experience" },
  { pattern: /(contact|reach|email|hire)/i, key: "contact" },
  { pattern: /(project|portfolio|build|app)/i, key: "projects" },
  { pattern: /(about|who|tell me)/i, key: "about" },
  { pattern: /(game|play|fun|snake|chess)/i, key: "games" },
  { pattern: /(education|learn|school|degree)/i, key: "education" },
]

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function createMessage(role: "user" | "bot", text: string, context?: string): ChatMessage {
  return { id: generateId(), role, text, timestamp: Date.now(), context }
}

export function detectIntent(input: string): string {
  for (const { pattern, key } of GREETING_PATTERNS) {
    if (pattern.test(input)) return key
  }
  return "unknown"
}

export function generateResponse(
  input: string,
  currentPage: string,
  personality: PersonalityConfig
): string {
  const intent = detectIntent(input)

  if (intent === "greeting") {
    return applyPersonality("Welcome to my portfolio! How can I help you today?", personality)
  }

  const knowledge = KNOWLEDGE_BASE[intent]
  if (knowledge) {
    const contextNote = getContextNote(currentPage, intent)
    const response = contextNote ? `${knowledge} ${contextNote}` : knowledge
    return applyPersonality(response, personality)
  }

  return applyPersonality(
    "I am not sure I understand that. Try asking about my skills, projects, experience, or how to contact me.",
    personality
  )
}

function getContextNote(page: string, intent: string): string {
  if (page.includes("project") && intent === "projects") {
    return "You are already on the projects page, so feel free to browse around!"
  }
  if (page.includes("contact") && intent === "contact") {
    return "The contact form is right here on this page."
  }
  if (page.includes("game") && intent === "games") {
    return "You are in the games section. Pick a game and enjoy!"
  }
  return ""
}

function applyPersonality(text: string, config: PersonalityConfig): string {
  let result = text

  if (config.formality === "casual") {
    result = result.replace(/^Welcome/, "Hey there! Welcome")
    result = result.replace(/I am not sure/, "Hmm, not sure")
  } else if (config.formality === "formal") {
    result = result.replace(/^Hey there!/, "Greetings.")
    result = result.replace(/feel free/, "please feel free")
  }

  if (config.humor === "playful") {
    result += " :)"
  }

  if (config.verbosity === "concise" && result.length > 100) {
    const firstSentence = result.split(/[.!]/).filter(Boolean)[0]
    result = firstSentence ? `${firstSentence.trim()}.` : result
  }

  return result
}

export const GUIDED_TOUR: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome",
    route: "/",
    description: "Start here to get an overview of my portfolio.",
    nextOptions: ["projects", "games", "about"],
  },
  {
    id: "projects",
    title: "Projects",
    route: "/projects",
    description: "Explore the applications and tools I have built.",
    nextOptions: ["games", "contact"],
  },
  {
    id: "games",
    title: "Games",
    route: "/games",
    description: "Try out interactive games built with React.",
    nextOptions: ["projects", "contact"],
  },
  {
    id: "about",
    title: "About Me",
    route: "/about",
    description: "Learn more about my background and interests.",
    nextOptions: ["projects", "contact"],
  },
  {
    id: "contact",
    title: "Contact",
    route: "/contact",
    description: "Get in touch or connect on social platforms.",
    nextOptions: ["welcome"],
  },
]

export function getTourStep(stepId: string): TourStep | undefined {
  return GUIDED_TOUR.find((s) => s.id === stepId)
}

export function exportConversation(messages: ChatMessage[], format: "text" | "json"): string {
  if (format === "json") {
    return JSON.stringify(messages, null, 2)
  }

  return messages
    .map((m) => {
      const time = new Date(m.timestamp).toLocaleTimeString()
      const sender = m.role === "user" ? "You" : "Bot"
      return `[${time}] ${sender}: ${m.text}`
    })
    .join("\n")
}
