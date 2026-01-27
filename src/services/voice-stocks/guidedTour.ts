/**
 * Guided Tour Service
 *
 * Manages guided tours through a webpage, combining DOM Navigator
 * and Highlight System to walk users through content.
 */

import type {
  TourConfig,
  TourStep,
  PageMap,
} from '../../types/voiceStocks';

// Internal tour state type
interface TourState {
  isActive: boolean;
  currentStepIndex: number;
  tourConfig: TourConfig | null;
  completedSteps: string[];
}
import { getVoiceStocksDOMNavigator } from './domNavigator';
import {
  highlightSystem,
  scrollAndHighlight,
  clearHighlights,
} from './highlightSystem';

// Default tour configuration - longer base duration for comprehensive tours
// This can be adjusted by the TourPlayer's speed control
const DEFAULT_STEP_DURATION = 8000;

export class GuidedTourService {
  private static instance: GuidedTourService;
  private state: TourState;
  private stepTimeout: ReturnType<typeof setTimeout> | null = null;
  private onStepChangeCallbacks: Set<(step: TourStep | null, index: number) => void> = new Set();
  private onTourEndCallbacks: Set<() => void> = new Set();
  private onSpeakCallbacks: Set<(text: string) => void> = new Set();

  private constructor() {
    this.state = {
      isActive: false,
      currentStepIndex: -1,
      tourConfig: null,
      completedSteps: [],
    };
  }

  static getInstance(): GuidedTourService {
    if (!GuidedTourService.instance) {
      GuidedTourService.instance = new GuidedTourService();
    }
    return GuidedTourService.instance;
  }

  /**
   * Generate a tour from the current page structure
   */
  generateTourFromPage(options?: {
    includeNav?: boolean;
    maxSteps?: number;
  }): TourConfig {
    const navigator = getVoiceStocksDOMNavigator();
    const pageMap = navigator.generatePageMap();

    const steps: TourStep[] = [];
    const includeNav = options?.includeNav ?? true;
    const maxSteps = options?.maxSteps ?? 10;

    // Navigation step (if present and requested)
    if (includeNav && pageMap.navigation.length > 0) {
      const navElement = pageMap.navigation[0].element.closest('nav') ||
                         pageMap.navigation[0].element.parentElement;
      if (navElement instanceof HTMLElement) {
        steps.push({
          id: 'tour-nav',
          target: this.getSelector(navElement),
          title: 'Navigation',
          description: 'Use the navigation menu to jump to different sections of the page.',
          action: 'highlight',
          voiceScript: 'At the top you\'ll find the navigation menu. You can use these links to quickly jump to any section.',
        });
      }
    }

    // Section steps
    for (const section of pageMap.sections) {
      if (steps.length >= maxSteps) break;

      // Skip very small sections
      if (section.boundingRect.height < 150) continue;

      const stepInfo = this.createStepFromSection(section);
      if (stepInfo) {
        steps.push(stepInfo);
      }
    }

    // Contact/form step (if present)
    const contactForm = pageMap.forms.find(f => {
      // Safety check: ensure name is a string before calling toLowerCase
      const formName = typeof f.name === 'string' ? f.name.toLowerCase() : '';
      const formId = f.element.id?.toLowerCase() || '';
      return formName.includes('contact') || formId.includes('contact');
    });
    if (contactForm && steps.length < maxSteps) {
      steps.push({
        id: 'tour-contact',
        target: this.getSelector(contactForm.element),
        title: 'Contact',
        description: 'Use this form to get in touch.',
        action: 'spotlight',
        voiceScript: 'Here\'s the contact form. You can fill this out to send a message.',
      });
    }

    return {
      id: `auto-tour-${Date.now()}`,
      name: 'Page Tour',
      description: 'A guided tour of this page',
      steps,
    };
  }

  /**
   * Start a tour with given configuration
   */
  async startTour(config: TourConfig): Promise<void> {
    if (this.state.isActive) {
      this.endTour();
    }

    this.state = {
      isActive: true,
      currentStepIndex: -1,
      tourConfig: config,
      completedSteps: [],
    };

    // Start first step
    await this.nextStep();
  }

  /**
   * Start an auto-generated tour of the current page
   */
  async startAutoTour(): Promise<void> {
    const config = this.generateTourFromPage();
    await this.startTour(config);
  }

  /**
   * Move to the next step
   */
  async nextStep(): Promise<void> {
    if (!this.state.tourConfig || !this.state.isActive) return;

    // Clear any pending timeout
    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }

    const nextIndex = this.state.currentStepIndex + 1;

    if (nextIndex >= this.state.tourConfig.steps.length) {
      this.endTour();
      return;
    }

    // Mark current step as completed
    if (this.state.currentStepIndex >= 0) {
      const currentStep = this.state.tourConfig.steps[this.state.currentStepIndex];
      this.state.completedSteps.push(currentStep.id);
    }

    this.state.currentStepIndex = nextIndex;
    const step = this.state.tourConfig.steps[nextIndex];

    // Execute step
    await this.executeStep(step);

    // Notify callbacks
    this.notifyStepChange(step, nextIndex);
  }

  /**
   * Move to the previous step
   */
  async previousStep(): Promise<void> {
    if (!this.state.tourConfig || !this.state.isActive) return;

    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }

    const prevIndex = this.state.currentStepIndex - 1;

    if (prevIndex < 0) return;

    this.state.currentStepIndex = prevIndex;
    const step = this.state.tourConfig.steps[prevIndex];

    await this.executeStep(step);
    this.notifyStepChange(step, prevIndex);
  }

  /**
   * Skip to a specific step by ID or index
   */
  async skipToStep(stepIdOrIndex: string | number): Promise<void> {
    if (!this.state.tourConfig || !this.state.isActive) return;

    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }

    let index: number;

    if (typeof stepIdOrIndex === 'string') {
      index = this.state.tourConfig.steps.findIndex(s => s.id === stepIdOrIndex);
      if (index === -1) return;
    } else {
      index = stepIdOrIndex;
      if (index < 0 || index >= this.state.tourConfig.steps.length) return;
    }

    this.state.currentStepIndex = index;
    const step = this.state.tourConfig.steps[index];

    await this.executeStep(step);
    this.notifyStepChange(step, index);
  }

  /**
   * Skip to a section by name (fuzzy match)
   */
  async skipToSection(sectionName: string): Promise<boolean> {
    if (!this.state.tourConfig) return false;

    const nameLower = sectionName.toLowerCase();

    // Find matching step
    const matchIndex = this.state.tourConfig.steps.findIndex(step =>
      step.title.toLowerCase().includes(nameLower) ||
      step.id.toLowerCase().includes(nameLower)
    );

    if (matchIndex >= 0) {
      await this.skipToStep(matchIndex);
      return true;
    }

    return false;
  }

  /**
   * End the current tour
   */
  endTour(): void {
    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }

    clearHighlights();

    this.state = {
      isActive: false,
      currentStepIndex: -1,
      tourConfig: null,
      completedSteps: [],
    };

    // Notify callbacks
    for (const callback of this.onTourEndCallbacks) {
      try {
        callback();
      } catch (error) {
        console.error('[GuidedTour] Tour end callback error:', error);
      }
    }
    this.notifyStepChange(null, -1);
  }

  /**
   * Pause the tour (stop auto-advance)
   */
  pause(): void {
    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }
  }

  /**
   * Resume the tour (restart auto-advance timer)
   */
  resume(duration?: number): void {
    if (!this.state.isActive || !this.state.tourConfig) return;

    const effectiveDuration = duration ?? DEFAULT_STEP_DURATION;
    this.stepTimeout = setTimeout(() => this.nextStep(), effectiveDuration);
  }

  /**
   * Get current tour state
   */
  getState(): Readonly<TourState> {
    return this.state;
  }

  /**
   * Get current step
   */
  getCurrentStep(): TourStep | null {
    if (!this.state.tourConfig || this.state.currentStepIndex < 0) {
      return null;
    }
    return this.state.tourConfig.steps[this.state.currentStepIndex] || null;
  }

  /**
   * Get tour progress
   */
  getProgress(): { current: number; total: number; percent: number } {
    if (!this.state.tourConfig) {
      return { current: 0, total: 0, percent: 0 };
    }

    const current = this.state.currentStepIndex + 1;
    const total = this.state.tourConfig.steps.length;
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;

    return { current, total, percent };
  }

  /**
   * Register callback for step changes
   */
  onStepChange(callback: (step: TourStep | null, index: number) => void): () => void {
    this.onStepChangeCallbacks.add(callback);
    return () => this.onStepChangeCallbacks.delete(callback);
  }

  /**
   * Register callback for tour end
   */
  onTourEnd(callback: () => void): () => void {
    this.onTourEndCallbacks.add(callback);
    return () => this.onTourEndCallbacks.delete(callback);
  }

  /**
   * Register callback for voice scripts (TTS integration)
   */
  onSpeak(callback: (text: string) => void): () => void {
    this.onSpeakCallbacks.add(callback);
    return () => this.onSpeakCallbacks.delete(callback);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async executeStep(step: TourStep): Promise<void> {
    // Find target element
    const element = document.querySelector(step.target);
    if (!(element instanceof HTMLElement)) {
      console.warn(`[GuidedTour] Target not found: ${step.target}`);
      return;
    }

    // Clear previous highlights
    clearHighlights();

    // Wait a moment for visual transition
    await this.sleep(100);

    // Execute highlight action
    switch (step.action) {
      case 'spotlight':
        await scrollAndHighlight(element, { position: 'center' }, { dimBackground: true });
        break;
      case 'scroll':
        await highlightSystem.scrollTo(element, { position: 'center' });
        break;
      case 'point':
        await highlightSystem.scrollTo(element, { position: 'center' });
        highlightSystem.pointTo(element);
        break;
      case 'highlight':
      default:
        await scrollAndHighlight(element, { position: 'center' }, { dimBackground: false });
        break;
    }

    // Speak voice script
    if (step.voiceScript) {
      for (const callback of this.onSpeakCallbacks) {
        try {
          callback(step.voiceScript);
        } catch (error) {
          console.error('[GuidedTour] Speak callback error:', error);
        }
      }
    }

    // Set auto-advance timer (if not waiting for interaction)
    if (!step.waitForInteraction) {
      this.stepTimeout = setTimeout(() => this.nextStep(), DEFAULT_STEP_DURATION);
    }
  }

  private createStepFromSection(
    section: PageMap['sections'][0]
  ): TourStep | null {
    const title = section.title;
    if (!title || title === 'Untitled Section') return null;

    const titleLower = title.toLowerCase();
    let description = '';
    let voiceScript = '';

    // Generate rich, contextual descriptions with more detail
    if (titleLower.includes('hero') || section.level === 1) {
      description = 'The main introduction showcasing who Daniel is and what he does. This is where visitors get their first impression.';
      voiceScript = `Welcome! This is Daniel's portfolio homepage. Here you'll see a brief introduction and can get a quick sense of his work as a Senior Software Engineer. Notice the call-to-action buttons that let you explore projects, learn more about his background, or get in touch directly. You can say "tell me more" to dive deeper into any topic.`;
    } else if (titleLower.includes('unconventional') || titleLower.includes('path')) {
      description = 'The unique journey from GED to Senior Engineer - a story of determination and self-teaching.';
      voiceScript = `This is Daniel's story - "The Unconventional Path." He went from working as a waiter and getting his GED to becoming a Principal Software Engineer. This section highlights his journey through self-teaching, hustle, and determination. It's a testament to what's possible when you bet on yourself. Want to know more about his philosophy? Just ask!`;
    } else if (titleLower.includes('about')) {
      description = 'Learn about Daniel\'s background, journey from self-taught developer to Senior Engineer, and what drives him.';
      voiceScript = `Here's the About section. Daniel's journey is unique - from starting a lawn care business as a teenager to becoming a Principal Engineer working on Department of Defense applications. He's self-taught, with no traditional CS degree, proving that passion and persistence can overcome any obstacle. Notice the photo carousel showing his journey - from coding at 2 AM to speaking at tech events. Feel free to ask me anything about his background!`;
    } else if (titleLower.includes('journey')) {
      description = 'A visual timeline showing the path from bootcamp grind to senior engineer through photos and milestones.';
      voiceScript = `This is "The Journey" - a photo gallery documenting Daniel's evolution as a developer. From late-night coding sessions studying Python at Steak n Shake, to building mind-controlled VR applications, to his current role as a Senior Engineer. Each photo tells part of the story. You can click through to see more, or ask me about any specific moment!`;
    } else if (titleLower.includes('project') || titleLower.includes('work') || titleLower.includes('portfolio')) {
      description = 'A curated collection of projects showcasing full-stack development, AI integration, and creative problem-solving.';
      voiceScript = `Welcome to the Projects section! Here you'll find Daniel's most impactful work - from enterprise applications to creative experiments. Each project demonstrates different skills: React and TypeScript for frontend, Node and Python for backend, and integration with AI services. Click any project card to see details, live demos, and the technology stack used. Want to hear about a specific project? Just ask!`;
    } else if (titleLower.includes('skill') || titleLower.includes('technolog') || titleLower.includes('expertise')) {
      description = 'A comprehensive overview of technical expertise including frontend, backend, DevOps, and emerging technologies.';
      voiceScript = `This section breaks down Daniel's technical toolkit. On the frontend: React, TypeScript, Next.js, and modern CSS frameworks. Backend: Node.js, Python, Django, and various databases. Plus DevOps experience with Docker, AWS, and CI/CD pipelines. He's also been diving deep into AI and machine learning. The skill bars show proficiency levels based on years of experience and project complexity. Curious about his experience with any specific technology? Feel free to ask!`;
    } else if (titleLower.includes('experience') || titleLower.includes('career') || titleLower.includes('professional')) {
      description = 'Professional experience spanning startups, enterprise companies, and Department of Defense contractors.';
      voiceScript = `Here's Daniel's professional timeline. Most recently at BrainGu, building software for Space Force, Air Force, and Navy applications. Before that, he co-founded Tailored Technologies, a custom software consultancy. He's also worked at enterprise companies like Mesirow Financial and First American. Each role expanded his skills - from early freelance work to leading engineering teams. Click any entry to see more details about technologies used and accomplishments!`;
    } else if (titleLower.includes('contact')) {
      description = 'Multiple ways to get in touch - whether for job opportunities, collaborations, or just to say hello.';
      voiceScript = `Ready to connect? This is the contact section. You can send a direct message through the form, or reach out via LinkedIn, GitHub, or email. Daniel is currently open to new opportunities and always happy to discuss interesting projects. Whether you're hiring, want to collaborate, or just want to chat about tech - don't hesitate to reach out!`;
    } else if (titleLower.includes('globe') || titleLower.includes('location')) {
      description = 'An interactive 3D globe showing Daniel\'s location and reach.';
      voiceScript = `This interactive globe shows Daniel's current location and the global reach of his work. He's based in the United States but has worked with clients and teams worldwide. The visualization is built with Three.js - one of the many creative technologies he enjoys working with!`;
    } else if (titleLower.includes('invention') || titleLower.includes('maker') || titleLower.includes('hardware')) {
      description = 'Hardware projects and inventions showcasing the maker side of engineering.';
      voiceScript = `Beyond software, Daniel loves building physical things. This section showcases his inventions and hardware projects - from 3D printed solutions to Arduino-based gadgets. He applies the same systems thinking to hardware as he does to software. Want to hear about a specific project? Just ask!`;
    } else if (titleLower.includes('game')) {
      description = 'A collection of games built as learning projects and creative experiments.';
      voiceScript = `Welcome to the games section! These aren't just for fun - each game was a learning opportunity to explore different programming concepts. From classic games like Tetris and Snake to more complex multiplayer experiences. You can actually play them right in your browser! Which one would you like to try?`;
    } else {
      description = `The ${title} section - click or ask to learn more about what's here.`;
      voiceScript = `Here's the ${title} section. Take a moment to explore what's here. If you have questions about anything you see, just ask me and I'll explain!`;
    }

    return {
      id: `tour-${section.id}`,
      target: this.getSelector(section.element),
      title,
      description,
      action: 'spotlight',
      voiceScript,
      waitForInteraction: false, // TourPlayer manages timing now
    };
  }

  private getSelector(element: HTMLElement): string {
    // Use CSS.escape for IDs with special characters
    if (element.id) return `#${CSS.escape(element.id)}`;

    // Try data attributes (escape for special characters)
    const dataSection = element.getAttribute('data-section');
    if (dataSection) return `[data-section="${CSS.escape(dataSection)}"]`;

    // Build a selector based on tag and class
    const tag = element.tagName.toLowerCase();
    // Handle SVG elements where className is SVGAnimatedString
    const className = typeof element.className === 'string' ? element.className : '';
    const firstClass = className.trim().split(/\s+/)[0];

    if (firstClass) {
      return `${tag}.${CSS.escape(firstClass)}`;
    }

    // Fallback to nth-child
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element) + 1;
      return `${tag}:nth-child(${index})`;
    }

    return tag;
  }

  private notifyStepChange(step: TourStep | null, index: number): void {
    for (const callback of this.onStepChangeCallbacks) {
      try {
        callback(step, index);
      } catch (error) {
        console.error('[GuidedTour] Step change callback error:', error);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const guidedTour = GuidedTourService.getInstance();

// Convenience functions
export function startTour(config: TourConfig): Promise<void> {
  return guidedTour.startTour(config);
}

export function startAutoTour(): Promise<void> {
  return guidedTour.startAutoTour();
}

export function nextTourStep(): Promise<void> {
  return guidedTour.nextStep();
}

export function previousTourStep(): Promise<void> {
  return guidedTour.previousStep();
}

export function endTour(): void {
  guidedTour.endTour();
}

export function getTourState(): Readonly<TourState> {
  return guidedTour.getState();
}

export function getTourProgress(): { current: number; total: number; percent: number } {
  return guidedTour.getProgress();
}
