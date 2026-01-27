/**
 * Browser AI Service
 *
 * Uses Chrome's built-in Prompt API (Gemini Nano) for intelligent intent detection.
 * Falls back to cloud API or basic matching when browser AI is unavailable.
 */

export type IntentType =
  | 'navigation'
  | 'tour_start'
  | 'tour_next'
  | 'tour_previous'
  | 'tour_end'
  | 'tour_skip'
  | 'system_stop'
  | 'system_help'
  | 'system_repeat'
  | 'system_clear'
  | 'conversation'
  | 'unknown';

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  target?: string;
  originalText: string;
}

interface LanguageModelSession {
  prompt: (text: string, options?: { responseConstraint?: object; signal?: AbortSignal }) => Promise<string>;
  promptStreaming: (text: string, options?: { signal?: AbortSignal }) => AsyncIterable<string>;
  destroy: () => void;
}

interface LanguageModelAPI {
  availability: (options?: object) => Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
  create: (options?: { temperature?: number; topK?: number; systemPrompt?: string }) => Promise<LanguageModelSession>;
}

declare global {
  interface Window {
    LanguageModel?: LanguageModelAPI;
    ai?: {
      languageModel?: LanguageModelAPI;
    };
  }
}

class BrowserAIService {
  private static instance: BrowserAIService;
  private session: LanguageModelSession | null = null;
  private isAvailable: boolean | null = null;
  private initPromise: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): BrowserAIService {
    if (!BrowserAIService.instance) {
      BrowserAIService.instance = new BrowserAIService();
    }
    return BrowserAIService.instance;
  }

  private getAPI(): LanguageModelAPI | null {
    if (typeof window === 'undefined') return null;
    return window.LanguageModel || window.ai?.languageModel || null;
  }

  async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) return this.isAvailable;

    const api = this.getAPI();
    if (!api) {
      this.isAvailable = false;
      return false;
    }

    try {
      const status = await api.availability();
      this.isAvailable = status === 'available';
      return this.isAvailable;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  async initialize(): Promise<boolean> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const available = await this.checkAvailability();
      if (!available) return false;

      const api = this.getAPI();
      if (!api) return false;

      try {
        this.session = await api.create({
          temperature: 0.1,
          topK: 1,
          systemPrompt: this.getSystemPrompt(),
        });
        return true;
      } catch {
        this.isAvailable = false;
        return false;
      }
    })();

    return this.initPromise;
  }

  private getSystemPrompt(): string {
    return `You are an intent classifier for a voice-controlled portfolio website.
Classify user input into one of these intents:

INTENTS:
- navigation: User wants to go to a section or page (projects, about, skills, contact, games, etc.)
- tour_start: User wants to start a guided tour
- tour_next: User wants to go to the next step in a tour
- tour_previous: User wants to go back in the tour
- tour_end: User wants to stop/end the tour
- tour_skip: User wants to skip to a specific section in the tour
- system_stop: User wants to stop listening/speaking
- system_help: User wants help or to know what commands are available
- system_repeat: User wants to hear the last response again
- system_clear: User wants to clear highlights or reset
- conversation: User is asking a question or making conversation (not a command)

Respond with ONLY a JSON object in this exact format:
{"intent": "intent_name", "confidence": 0.95, "target": "optional_target"}

The target field should contain the destination for navigation or tour_skip intents.`;
  }

  async detectIntent(text: string): Promise<IntentResult> {
    const trimmed = text.trim().toLowerCase();

    if (this.session) {
      try {
        const response = await this.session.prompt(
          `Classify this user input: "${text}"`,
          {
            responseConstraint: {
              type: 'object',
              properties: {
                intent: { type: 'string' },
                confidence: { type: 'number' },
                target: { type: 'string' },
              },
              required: ['intent', 'confidence'],
            },
          }
        );

        const parsed = JSON.parse(response);
        return {
          intent: parsed.intent as IntentType,
          confidence: parsed.confidence,
          target: parsed.target,
          originalText: text,
        };
      } catch {
        // Fall back to basic detection
      }
    }

    // Fallback: Use basic keyword matching (not regex patterns, just simple checks)
    return this.basicIntentDetection(trimmed, text);
  }

  private basicIntentDetection(normalized: string, original: string): IntentResult {
    // Tour intents
    if (this.containsAny(normalized, ['tour', 'show me around', 'walk me through', 'guide me'])) {
      if (this.containsAny(normalized, ['start', 'begin', 'give', 'take me', 'want'])) {
        return { intent: 'tour_start', confidence: 0.8, originalText: original };
      }
      if (this.containsAny(normalized, ['end', 'stop', 'finish', 'quit', 'exit'])) {
        return { intent: 'tour_end', confidence: 0.8, originalText: original };
      }
    }

    if (this.containsAny(normalized, ['next', 'continue', 'go on', 'forward'])) {
      return { intent: 'tour_next', confidence: 0.7, originalText: original };
    }

    if (this.containsAny(normalized, ['previous', 'back', 'go back', 'before'])) {
      return { intent: 'tour_previous', confidence: 0.7, originalText: original };
    }

    if (this.containsAny(normalized, ['skip to', 'jump to', 'go to section'])) {
      const target = this.extractTarget(normalized);
      return { intent: 'tour_skip', confidence: 0.7, target, originalText: original };
    }

    // Navigation intents
    if (this.containsAny(normalized, ['go to', 'navigate', 'show me', 'take me to', 'open'])) {
      const target = this.extractTarget(normalized);
      return { intent: 'navigation', confidence: 0.7, target, originalText: original };
    }

    // System intents
    if (this.containsAny(normalized, ['stop', 'pause', 'quiet', 'shut up', 'silence'])) {
      return { intent: 'system_stop', confidence: 0.8, originalText: original };
    }

    if (this.containsAny(normalized, ['help', 'what can you', 'commands', 'what do you'])) {
      return { intent: 'system_help', confidence: 0.8, originalText: original };
    }

    if (this.containsAny(normalized, ['repeat', 'say again', 'what did you say', 'pardon'])) {
      return { intent: 'system_repeat', confidence: 0.8, originalText: original };
    }

    if (this.containsAny(normalized, ['clear', 'dismiss', 'hide'])) {
      return { intent: 'system_clear', confidence: 0.7, originalText: original };
    }

    // Default to conversation
    return { intent: 'conversation', confidence: 0.5, originalText: original };
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private extractTarget(text: string): string {
    const patterns = [
      /(?:go to|navigate to|show me|take me to|skip to|jump to|open)\s+(?:the\s+)?(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  async generateResponse(prompt: string, context?: string): Promise<string | null> {
    if (!this.session) {
      await this.initialize();
    }

    if (!this.session) return null;

    try {
      const fullPrompt = context
        ? `Context: ${context}\n\nUser: ${prompt}`
        : prompt;

      return await this.session.prompt(fullPrompt);
    } catch {
      return null;
    }
  }

  async streamResponse(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
    if (!this.session) {
      await this.initialize();
    }

    if (!this.session) return;

    try {
      const stream = this.session.promptStreaming(prompt);
      for await (const chunk of stream) {
        onChunk(chunk);
      }
    } catch {
      // Streaming failed
    }
  }

  destroy(): void {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
    this.initPromise = null;
  }
}

export const browserAI = BrowserAIService.getInstance();

export async function detectIntent(text: string): Promise<IntentResult> {
  return browserAI.detectIntent(text);
}

export async function isBrowserAIAvailable(): Promise<boolean> {
  return browserAI.checkAvailability();
}
