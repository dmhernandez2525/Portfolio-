import type { ManagedProjectTemplate } from "@/types/admin-project"

export const PROJECT_TEMPLATES: ManagedProjectTemplate[] = [
  {
    id: "saas-launch",
    label: "SaaS Launch",
    summary: "Product-focused template for web SaaS case studies",
    defaultTags: ["saas", "web-app", "product"],
    defaultCaseStudy: {
      problem: "Define the product problem this SaaS project solved.",
      approach: "Document architecture and implementation strategy.",
      solution: "Explain what you shipped and why decisions were made.",
      results: "Capture measurable outcomes and customer impact.",
    },
  },
  {
    id: "game-project",
    label: "Game Build",
    summary: "Template for browser or indie game projects",
    defaultTags: ["game", "interactive", "typescript"],
    defaultCaseStudy: {
      problem: "Describe core gameplay and technical constraints.",
      approach: "Explain engine choices, loop design, and systems planning.",
      solution: "Outline mechanics, controls, and performance optimizations.",
      results: "Share retention, user feedback, and gameplay metrics.",
    },
  },
  {
    id: "ai-platform",
    label: "AI Platform",
    summary: "Template for AI/ML systems and automation tools",
    defaultTags: ["ai", "automation", "platform"],
    defaultCaseStudy: {
      problem: "Describe model, workflow, or decision-making problem.",
      approach: "Detail data strategy, prompts/models, and evaluation.",
      solution: "Summarize delivery architecture and operational safeguards.",
      results: "Quantify quality, speed, cost, and user outcomes.",
    },
  },
]
