/**
 * Voice Command Router (Portfolio-specific)
 *
 * Uses AI-based intent detection from voice-docs-app submodule for intelligent
 * command classification. Extends with Portfolio-specific route navigation.
 */

import type { CommandContext, CommandResult, VoiceCommand, CommandHandler } from '../../types/voiceStocks';
import { getVoiceStocksDOMNavigator } from './domNavigator';
import { scrollAndHighlight, clearHighlights } from './highlightSystem';
import { guidedTour, startAutoTour, endTour, nextTourStep, previousTourStep } from './guidedTour';
import { navigationService } from './navigationService';
import {
  browserAI,
  detectIntent,
  generateActionResponse,
  type IntentType,
} from '../../../lib/voice-docs-app/src/services/browserAI';

export class VoiceCommandRouter {
  private static instance: VoiceCommandRouter;
  private customCommands: VoiceCommand[] = [];

  private constructor() {
    // Initialize browser AI in the background
    browserAI.initialize().catch(() => {});
  }

  static getInstance(): VoiceCommandRouter {
    if (!VoiceCommandRouter.instance) {
      VoiceCommandRouter.instance = new VoiceCommandRouter();
    }
    return VoiceCommandRouter.instance;
  }

  async process(transcript: string, context: Partial<CommandContext> = {}): Promise<CommandResult> {
    let fullContext: CommandContext;
    try {
      fullContext = {
        transcript: transcript.toLowerCase().trim(),
        conversationHistory: context.conversationHistory || [],
        currentPage: context.currentPage || getVoiceStocksDOMNavigator().getVSPageMap(),
        tourState: context.tourState || guidedTour.getState(),
      };
    } catch {
      fullContext = {
        transcript: transcript.toLowerCase().trim(),
        conversationHistory: context.conversationHistory || [],
        currentPage: { sections: [], navigation: [], buttons: [], forms: [], media: [], landmarks: [], lastUpdated: Date.now() },
        tourState: { isActive: false, currentStepIndex: -1, tourConfig: null, completedSteps: [] },
      };
    }

    const speedCommand = this.detectSpeedCommand(fullContext.transcript);
    if (speedCommand) {
      return this.handleSpeedCommand(speedCommand);
    }

    // Use AI-based intent detection
    const intentResult = await detectIntent(transcript);

    // Route based on detected intent (confidence threshold of 0.6)
    if (intentResult.confidence >= 0.6) {
      const result = await this.handleIntent(intentResult.intent, intentResult.target, fullContext);
      if (result.handled || result.passToAI) {
        return result;
      }
    }

    // No confident match - pass to AI for conversation
    return { handled: false, passToAI: true };
  }

  private async handleIntent(
    intent: IntentType,
    target: string | undefined,
    context: CommandContext
  ): Promise<CommandResult> {
    switch (intent) {
      case 'navigation':
        return this.handleNavigate(target || '');

      case 'tour_start':
        return this.handleStartTour();

      case 'tour_next':
        return this.handleTourNext();

      case 'tour_previous':
        return this.handleTourPrevious();

      case 'tour_end':
        return this.handleEndTour();

      case 'tour_skip':
        return this.handleTourSkip(target || '');

      case 'system_stop':
        return this.handleStop();

      case 'system_help':
        return this.handleHelp();

      case 'system_repeat':
        return this.handleRepeat(context);

      case 'system_clear':
        return this.handleClear();

      case 'conversation':
      default:
        return { handled: false, passToAI: true };
    }
  }

  private detectSpeedCommand(transcript: string): 'faster' | 'slower' | 'normal' | null {
    if (!transcript) return null;
    const isTourActive = guidedTour.getState().isActive;
    const hasSpeedContext = this.containsAny(transcript, ['speed', 'tour', 'talk']);
    if (!isTourActive && !hasSpeedContext) return null;
    if (this.containsAny(transcript, ['faster', 'speed up', 'quicker', 'talk faster'])) return 'faster';
    if (this.containsAny(transcript, ['slower', 'slow down', 'too fast', 'talk slower'])) return 'slower';
    if (this.containsAny(transcript, ['normal speed', 'default speed', 'reset speed'])) return 'normal';
    return null;
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private async handleSpeedCommand(action: 'faster' | 'slower' | 'normal'): Promise<CommandResult> {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tour-speed', { detail: { action } }));
    }
    const isTourActive = guidedTour.getState().isActive;
    const response = action === 'normal'
      ? (isTourActive ? 'Back to normal speed.' : 'Okay, I’ll use normal speed for the tour.')
      : action === 'faster'
        ? (isTourActive ? 'Speeding it up.' : 'Got it. I’ll use a faster speed for the tour.')
        : (isTourActive ? 'Slowing it down.' : 'Got it. I’ll use a slower speed for the tour.');
    return { handled: true, response, shouldSpeak: true };
  }

  getHelpText(): string {
    return `I can help you with:

**Navigation:**
- "Go to projects" - Navigate to a page
- "Go to games" - Open the games section
- "Show me skills" - Jump to skills section
- "Scroll down/up" - Scroll the page

**Tour:**
- "Give me a tour" - Start a guided tour
- "Next" / "Previous" - Navigate tour steps
- "Faster" / "Slower" / "Normal speed" - Adjust tour speed
- "End tour" - Stop the tour

**System:**
- "Stop" - Stop speaking
- "Repeat" - Hear the last response again
- "Help" - Show this help

Or just ask me anything about Daniel!`;
  }

  /**
   * Register a custom command (for backward compatibility)
   */
  registerCommand(
    pattern: RegExp,
    handler: CommandHandler,
    description: string,
    category: VoiceCommand['category'] = 'query'
  ): () => void {
    const command: VoiceCommand = { pattern, handler, description, category };
    this.customCommands.push(command);

    return () => {
      const index = this.customCommands.indexOf(command);
      if (index >= 0) {
        this.customCommands.splice(index, 1);
      }
    };
  }

  getCommands(): ReadonlyArray<VoiceCommand> {
    return [...this.customCommands];
  }

  getCommandsByCategory(category: VoiceCommand['category']): ReadonlyArray<VoiceCommand> {
    return this.customCommands.filter(c => c.category === category);
  }

  // ============================================================================
  // Intent Handlers
  // ============================================================================

  private async handleNavigate(target: string): Promise<CommandResult> {
    if (!target) {
      return { handled: false, passToAI: true };
    }

    // First try Portfolio-specific route navigation (games, projects, etc.)
    const navResult = await navigationService.navigateTo(target);

    if (navResult.success) {
      if (navResult.type === 'section') {
        // For section navigation, also highlight the element
        const navigator = getVoiceStocksDOMNavigator();
        const element = navigator.findElementByDescription(target);
        if (element) {
          await scrollAndHighlight(element, { position: 'center' }, { dimBackground: false, duration: 3000 });
        }
      }

      const response = await generateActionResponse('navigate', { target });
      return { handled: true, response, shouldSpeak: true };
    }

    // Fall back to DOM-based navigation
    const navigator = getVoiceStocksDOMNavigator();
    const element = navigator.findElementByDescription(target);

    if (element) {
      await scrollAndHighlight(element, { position: 'center' }, { dimBackground: false, duration: 3000 });
      const response = await generateActionResponse('navigate', { target });
      return { handled: true, response, shouldSpeak: true };
    }

    // Try capability-based search
    const elements = navigator.findElementsForCapability(target);
    if (elements.length > 0) {
      await scrollAndHighlight(elements[0], { position: 'center' }, { dimBackground: false, duration: 3000 });
      const response = await generateActionResponse('navigate', { target });
      return { handled: true, response, shouldSpeak: true };
    }

    // Not found - let AI handle
    return { handled: false, passToAI: true };
  }

  private async handleStartTour(): Promise<CommandResult> {
    if (guidedTour.getState().isActive) {
      const response = await generateActionResponse('tour_start', { alreadyActive: true });
      return { handled: true, response, shouldSpeak: true };
    }

    try {
      await startAutoTour();
      // Tour handles its own speaking via TourPlayer
      return { handled: true, shouldSpeak: false };
    } catch {
      const response = await generateActionResponse('error', { error: 'Could not start tour' });
      return { handled: true, response, shouldSpeak: true };
    }
  }

  private async handleTourNext(): Promise<CommandResult> {
    if (!guidedTour.getState().isActive) {
      return { handled: false, passToAI: true };
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assistant-cancel-tour-speech'));
    }
    await nextTourStep();
    return { handled: true, shouldSpeak: false };
  }

  private async handleTourPrevious(): Promise<CommandResult> {
    if (!guidedTour.getState().isActive) {
      return { handled: false, passToAI: true };
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assistant-cancel-tour-speech'));
    }
    await previousTourStep();
    return { handled: true, shouldSpeak: false };
  }

  private async handleTourSkip(section: string): Promise<CommandResult> {
    if (!guidedTour.getState().isActive) {
      await startAutoTour();
    }

    const found = await guidedTour.skipToSection(section);

    if (found) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('assistant-cancel-tour-speech'));
      }
      return { handled: true, shouldSpeak: false };
    }

    const response = await generateActionResponse('error', { error: `Section "${section}" not found` });
    return { handled: true, response, shouldSpeak: true };
  }

  private async handleEndTour(): Promise<CommandResult> {
    if (!guidedTour.getState().isActive) {
      return { handled: false, passToAI: true };
    }
    endTour();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assistant-cancel-tour-speech'));
    }
    const response = await generateActionResponse('tour_end', {});
    return { handled: true, response, shouldSpeak: true };
  }

  private async handleStop(): Promise<CommandResult> {
    clearHighlights();
    if (guidedTour.getState().isActive) {
      endTour();
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assistant-stop-speech'));
    }
    return { handled: true, shouldSpeak: false };
  }

  private async handleHelp(): Promise<CommandResult> {
    const response = await generateActionResponse('help', {});
    return { handled: true, response, shouldSpeak: true };
  }

  private handleRepeat(context: CommandContext): CommandResult {
    const lastAssistantMessage = [...context.conversationHistory]
      .reverse()
      .find(m => m.role === 'assistant');

    if (lastAssistantMessage) {
      return { handled: true, response: lastAssistantMessage.content, shouldSpeak: true };
    }

    return { handled: false, passToAI: true };
  }

  private async handleClear(): Promise<CommandResult> {
    clearHighlights();
    return { handled: true, shouldSpeak: false };
  }
}

export const voiceCommandRouter = VoiceCommandRouter.getInstance();

export function processVoiceCommand(
  transcript: string,
  context?: Partial<CommandContext>
): Promise<CommandResult> {
  return voiceCommandRouter.process(transcript, context);
}
