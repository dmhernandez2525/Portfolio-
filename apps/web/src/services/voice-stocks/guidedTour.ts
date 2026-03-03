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
  private isTransitioning: boolean = false;
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
          voiceScript: 'Let\'s start at the top! Here\'s the navigation bar. Click any link to jump straight to that section, or just follow along with me.',
        });
      }
    }

    // Sort sections by their CURRENT vertical position (top to bottom)
    // Get fresh bounding rects since cached values may be stale
    const sortedSections = [...pageMap.sections].sort((a, b) => {
      const rectA = a.element.getBoundingClientRect();
      const rectB = b.element.getBoundingClientRect();
      // Add scroll position to get absolute position on page
      const topA = rectA.top + window.scrollY;
      const topB = rectB.top + window.scrollY;
      return topA - topB;
    });

    // Track seen content types to avoid duplicates (e.g., two "hero" sections)
    const seenDescriptions = new Set<string>();

    // Section steps (now in proper top-to-bottom order)
    for (const section of sortedSections) {
      if (steps.length >= maxSteps) break;

      // Skip very small sections
      if (section.boundingRect.height < 150) continue;

      const stepInfo = this.createStepFromSection(section);
      if (stepInfo) {
        // Skip if we've already seen this type of content
        if (seenDescriptions.has(stepInfo.description)) {
          continue;
        }
        seenDescriptions.add(stepInfo.description);
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

    this.isTransitioning = false;
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

    // Prevent rapid transitions - debounce
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Clear any pending timeout
    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }

    const nextIndex = this.state.currentStepIndex + 1;

    if (nextIndex >= this.state.tourConfig.steps.length) {
      this.isTransitioning = false;
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

    try {
      // Execute step
      await this.executeStep(step);

      // Notify callbacks
      this.notifyStepChange(step, nextIndex);
    } finally {
      // Allow next transition after a short delay
      setTimeout(() => {
        this.isTransitioning = false;
      }, 600);
    }
  }

  /**
   * Move to the previous step
   */
  async previousStep(): Promise<void> {
    if (!this.state.tourConfig || !this.state.isActive) return;

    // Prevent rapid transitions - debounce
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }

    const prevIndex = this.state.currentStepIndex - 1;

    if (prevIndex < 0) {
      this.isTransitioning = false;
      return;
    }

    this.state.currentStepIndex = prevIndex;
    const step = this.state.tourConfig.steps[prevIndex];

    try {
      await this.executeStep(step);
      this.notifyStepChange(step, prevIndex);
    } finally {
      // Allow next transition after a short delay
      setTimeout(() => {
        this.isTransitioning = false;
      }, 600);
    }
  }

  /**
   * Skip to a specific step by ID or index
   */
  async skipToStep(stepIdOrIndex: string | number): Promise<void> {
    if (!this.state.tourConfig || !this.state.isActive) return;

    // Prevent rapid transitions - debounce
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }

    let index: number;

    if (typeof stepIdOrIndex === 'string') {
      index = this.state.tourConfig.steps.findIndex(s => s.id === stepIdOrIndex);
      if (index === -1) {
        this.isTransitioning = false;
        return;
      }
    } else {
      index = stepIdOrIndex;
      if (index < 0 || index >= this.state.tourConfig.steps.length) {
        this.isTransitioning = false;
        return;
      }
    }

    this.state.currentStepIndex = index;
    const step = this.state.tourConfig.steps[index];

    try {
      await this.executeStep(step);
      this.notifyStepChange(step, index);
    } finally {
      // Allow next transition after a short delay
      setTimeout(() => {
        this.isTransitioning = false;
      }, 600);
    }
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
    this.isTransitioning = false;

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

    // Clear previous highlights first
    clearHighlights();

    // Wait for previous highlights to fully clear
    await this.sleep(200);

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
        await this.sleep(100); // Wait for scroll to settle
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
    // Also check element ID and data attributes for more accurate matching
    const elementId = section.element.id?.toLowerCase() || '';
    const dataSection = section.element.getAttribute('data-section')?.toLowerCase() || '';
    const combinedText = `${titleLower} ${elementId} ${dataSection}`;

    let description = '';
    let voiceScript = '';

    // Generate engaging, conversational descriptions
    // Order matters! More specific matches first, then general ones

    // Check for globe/3D elements first (very specific)
    if (combinedText.includes('globe') || combinedText.includes('3d') || combinedText.includes('three')) {
      description = 'Interactive 3D globe - because why not?';
      voiceScript = `Cool, right? This globe is built with Three.js. Daniel's based in the US but has worked with teams globally. Sometimes you just gotta add a spinning 3D globe to your portfolio.`;
    } else if (combinedText.includes('hero') || combinedText.includes('intro') || combinedText.includes('welcome') || combinedText.includes('landing')) {
      // Only match hero by explicit naming, not by level
      description = 'The main introduction - first impressions matter!';
      voiceScript = `Alright, here we go! This is the hero section - think of it as Daniel's digital handshake. Senior Software Engineer, self-taught, and obsessed with building cool stuff. See those buttons? They're your fast-pass to anything you want to explore.`;
    } else if (combinedText.includes('unconventional') || (combinedText.includes('path') && !combinedText.includes('career'))) {
      description = 'From GED to Senior Engineer - the real story.';
      voiceScript = `Okay, this is the good stuff. Daniel didn't follow the typical path - no CS degree, started as a waiter. But here's the thing: he taught himself to code, hustled like crazy, and now builds software for the Department of Defense. Pretty wild, right?`;
    } else if (combinedText.includes('about') && !combinedText.includes('experience')) {
      description = 'The backstory - who is this guy anyway?';
      voiceScript = `So who's Daniel? Started mowing lawns as a teenager, discovered coding, and fell in love with it. Now he's a Principal Engineer building serious applications. No fancy degree - just pure determination and a lot of late nights.`;
    } else if (combinedText.includes('journey') || combinedText.includes('photo') || combinedText.includes('gallery')) {
      description = 'Photos from the grind - the real moments.';
      voiceScript = `Check out these photos - this is the journey in pictures. Late-night coding sessions, building weird experiments, leveling up year after year. It's not glamorous, but it's real.`;
    } else if (combinedText.includes('project') || combinedText.includes('work') || combinedText.includes('portfolio')) {
      description = 'The actual work - click around and explore.';
      voiceScript = `Now we're talking! These are the projects - the actual stuff Daniel has built. Enterprise apps, AI experiments, creative side projects. Click any card to dive deeper.`;
    } else if (combinedText.includes('skill') || combinedText.includes('tech') || combinedText.includes('expertise') || combinedText.includes('stack')) {
      description = 'The technical toolkit - what he actually knows.';
      voiceScript = `Here's the tech breakdown. React, TypeScript, Python, Node - the usual suspects. But also DevOps, AI, databases, the whole stack. These aren't just buzzwords - each one has real project hours behind it.`;
    } else if (combinedText.includes('experience') || combinedText.includes('career') || combinedText.includes('professional') || combinedText.includes('employment')) {
      description = 'Work history - from startups to defense contracts.';
      voiceScript = `The career timeline! Most recent: BrainGu, building software for Space Force and Navy. Before that, co-founded his own consultancy. Started with freelance gigs and kept leveling up.`;
    } else if (combinedText.includes('contact') || combinedText.includes('reach') || combinedText.includes('connect')) {
      description = 'Get in touch - he actually responds.';
      voiceScript = `Want to connect? Here's how. Drop a message, hit him up on LinkedIn, or check out the GitHub. Daniel's always down to chat about interesting projects or opportunities.`;
    } else if (combinedText.includes('invention') || combinedText.includes('maker') || combinedText.includes('hardware') || combinedText.includes('build')) {
      description = 'Hardware projects - the maker side.';
      voiceScript = `Not just software! Daniel builds physical things too - 3D printing, Arduino projects, random inventions. Same problem-solving mindset, different medium.`;
    } else if (combinedText.includes('game')) {
      description = 'Games - playable right now.';
      voiceScript = `Games! Tetris, Snake, even multiplayer stuff. Each one was a learning project, but they're actually fun too. Go ahead, take a break and play one.`;
    } else {
      description = `The ${title} section.`;
      voiceScript = `Here's ${title}. Take a look around - if anything catches your eye, just ask and I'll tell you more.`;
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
