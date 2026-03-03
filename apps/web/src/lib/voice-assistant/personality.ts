import type { AssistantPersonality } from "@/types/assistant-enhancements"

export const ASSISTANT_PERSONALITIES: Record<AssistantPersonality, { label: string; prompt: string }> = {
  professional: {
    label: "Professional",
    prompt: "Use a professional tone: concise, structured, and clear. Avoid slang.",
  },
  casual: {
    label: "Casual",
    prompt: "Use a conversational and approachable tone. Keep it relaxed but still informative.",
  },
  playful: {
    label: "Playful",
    prompt: "Use a playful and energetic tone while keeping factual accuracy and technical clarity.",
  },
}

export const ASSISTANT_PERSONALITY_STORAGE_KEY = "assistant:personality:v1"

export function getPersonalityInstruction(personality: AssistantPersonality): string {
  return ASSISTANT_PERSONALITIES[personality].prompt
}

export function parsePersonality(value: string | null | undefined): AssistantPersonality {
  if (value === "professional" || value === "playful" || value === "casual") {
    return value
  }
  return "professional"
}
