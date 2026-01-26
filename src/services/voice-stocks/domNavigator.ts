/**
 * Voice Stocks DOM Navigator for Portfolio
 *
 * Simplified DOM navigation for the portfolio site.
 */

import type {
  PageMap,
  Section,
  NavItem,
  ButtonInfo,
  FormInfo,
  FormFieldInfo,
  MediaInfo,
  LandmarkInfo,
  ElementContext,
} from '../../types/voiceStocks';

/**
 * Voice Stocks DOM Navigator
 */
export class VoiceStocksDOMNavigator {
  private static instance: VoiceStocksDOMNavigator;
  private pageMap: PageMap | null = null;
  private idCounter = 0;

  private constructor() {}

  static getInstance(): VoiceStocksDOMNavigator {
    if (!VoiceStocksDOMNavigator.instance) {
      VoiceStocksDOMNavigator.instance = new VoiceStocksDOMNavigator();
    }
    return VoiceStocksDOMNavigator.instance;
  }

  private generateId(prefix: string): string {
    return `${prefix}-${++this.idCounter}`;
  }

  /**
   * Generate a PageMap with comprehensive element mapping
   */
  generatePageMap(root: HTMLElement = document.body): PageMap {
    this.pageMap = {
      sections: this.scanSections(root),
      navigation: this.scanNavigation(root),
      buttons: this.scanButtons(root),
      forms: this.scanForms(root),
      media: this.scanMedia(root),
      landmarks: this.scanLandmarks(root),
      lastUpdated: Date.now(),
    };
    return this.pageMap;
  }

  /**
   * Get the current PageMap, regenerating if stale
   */
  getVSPageMap(): PageMap {
    if (!this.pageMap || Date.now() - this.pageMap.lastUpdated > 5000) {
      return this.generatePageMap();
    }
    return this.pageMap;
  }

  /**
   * Find element by semantic description
   */
  findElementByDescription(description: string): HTMLElement | null {
    const map = this.getVSPageMap();
    const descLower = description.toLowerCase();

    // Search sections
    for (const section of map.sections) {
      if (
        section.title.toLowerCase().includes(descLower) ||
        section.id.toLowerCase().includes(descLower)
      ) {
        return section.element;
      }
    }

    // Search navigation
    for (const nav of map.navigation) {
      if (nav.text.toLowerCase().includes(descLower)) {
        return nav.element;
      }
    }

    // Search buttons
    for (const button of map.buttons) {
      if (
        button.text.toLowerCase().includes(descLower) ||
        button.ariaLabel?.toLowerCase().includes(descLower)
      ) {
        return button.element;
      }
    }

    // Try CSS selector
    try {
      const el = document.querySelector(description);
      if (el instanceof HTMLElement) return el;
    } catch {
      // Invalid selector
    }

    // Try ID
    const byId = document.getElementById(description);
    if (byId) return byId;

    return null;
  }

  /**
   * Find elements matching a capability
   */
  findElementsForCapability(capability: string): HTMLElement[] {
    const map = this.getVSPageMap();
    const capLower = capability.toLowerCase();

    const keywords: Record<string, string[]> = {
      contact: ['contact', 'email', 'reach', 'message'],
      projects: ['project', 'portfolio', 'work', 'built'],
      about: ['about', 'bio', 'introduction', 'who'],
      skills: ['skill', 'technology', 'tech', 'stack'],
      experience: ['experience', 'career', 'work history'],
    };

    const results: HTMLElement[] = [];

    for (const [key, terms] of Object.entries(keywords)) {
      if (terms.some((t) => capLower.includes(t))) {
        const section = map.sections.find((s) =>
          s.title.toLowerCase().includes(key) || s.id.toLowerCase().includes(key)
        );
        if (section) results.push(section.element);
      }
    }

    return results;
  }

  /**
   * Get detailed context about an element
   */
  getElementContext(element: HTMLElement): ElementContext {
    const tagName = element.tagName.toLowerCase();
    const ariaLabel = element.getAttribute('aria-label');
    const text = element.textContent?.trim().substring(0, 100) || '';

    let purpose = ariaLabel || '';
    let interactionHint = '';

    switch (tagName) {
      case 'a':
        purpose = purpose || `Link to ${(element as HTMLAnchorElement).href || 'another page'}`;
        interactionHint = 'Click to navigate';
        break;
      case 'button':
        purpose = purpose || text || 'Interactive button';
        interactionHint = 'Click to activate';
        break;
      case 'section':
      case 'article':
        purpose = purpose || this.inferSectionPurpose(element);
        interactionHint = 'Read content';
        break;
      default:
        purpose = purpose || `${tagName} element`;
        interactionHint = 'Interact with element';
    }

    return {
      element,
      purpose,
      interactionHint,
      relatedElements: [],
      path: this.buildCssPath(element),
    };
  }

  // Private scanning methods

  private scanSections(root: HTMLElement): Section[] {
    const sections: Section[] = [];
    const selectors = 'section, article, [role="region"], main, [data-section]';

    root.querySelectorAll(selectors).forEach((el) => {
      if (!(el instanceof HTMLElement)) return;

      const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
      const title = heading?.textContent?.trim() ||
        el.getAttribute('aria-label') ||
        el.id ||
        'Untitled Section';

      sections.push({
        id: el.id || this.generateId('section'),
        element: el,
        title,
        description: el.getAttribute('data-description') || undefined,
        boundingRect: el.getBoundingClientRect(),
        children: [],
        level: heading ? parseInt(heading.tagName.charAt(1)) : 0,
      });
    });

    return sections;
  }

  private scanNavigation(root: HTMLElement): NavItem[] {
    const items: NavItem[] = [];

    root.querySelectorAll('nav a, header a, [role="navigation"] a').forEach((el) => {
      if (!(el instanceof HTMLAnchorElement)) return;

      items.push({
        id: el.id || this.generateId('nav'),
        element: el,
        text: el.textContent?.trim() || el.getAttribute('aria-label') || '',
        href: el.href,
        isExternal: el.hostname !== window.location.hostname,
        isActive: el.classList.contains('active') || el.getAttribute('aria-current') === 'page',
      });
    });

    return items;
  }

  private scanButtons(root: HTMLElement): ButtonInfo[] {
    const buttons: ButtonInfo[] = [];

    root.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]').forEach((el) => {
      if (!(el instanceof HTMLElement)) return;

      buttons.push({
        id: el.id || this.generateId('btn'),
        element: el,
        text: el.textContent?.trim() || (el as HTMLInputElement).value || '',
        ariaLabel: el.getAttribute('aria-label') || undefined,
        type: (el as HTMLButtonElement).type as 'button' | 'submit' | 'reset' || 'button',
        isDisabled: (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true',
      });
    });

    return buttons;
  }

  private scanForms(root: HTMLElement): FormInfo[] {
    const forms: FormInfo[] = [];

    root.querySelectorAll('form').forEach((el) => {
      if (!(el instanceof HTMLFormElement)) return;

      const fields: FormFieldInfo[] = [];
      el.querySelectorAll('input, textarea, select').forEach((input) => {
        if (!(input instanceof HTMLElement)) return;
        const inputEl = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

        fields.push({
          id: inputEl.id || this.generateId('field'),
          element: inputEl,
          name: inputEl.name || '',
          type: 'type' in inputEl ? inputEl.type : 'text',
          label: this.findLabelForInput(inputEl),
          placeholder: 'placeholder' in inputEl ? inputEl.placeholder : undefined,
          isRequired: inputEl.required || inputEl.getAttribute('aria-required') === 'true',
        });
      });

      forms.push({
        id: el.id || this.generateId('form'),
        element: el,
        name: el.name || undefined,
        action: el.action || undefined,
        fields,
      });
    });

    return forms;
  }

  private scanMedia(root: HTMLElement): MediaInfo[] {
    const media: MediaInfo[] = [];

    root.querySelectorAll('img, video, audio, iframe').forEach((el) => {
      if (!(el instanceof HTMLElement)) return;

      const tagName = el.tagName.toLowerCase();
      const type = tagName === 'img' ? 'image' : tagName as 'video' | 'audio' | 'iframe';

      media.push({
        id: el.id || this.generateId('media'),
        element: el,
        type,
        src: (el as HTMLImageElement | HTMLVideoElement | HTMLAudioElement | HTMLIFrameElement).src,
        alt: (el as HTMLImageElement).alt,
        title: el.title,
      });
    });

    return media;
  }

  private scanLandmarks(root: HTMLElement): LandmarkInfo[] {
    const landmarks: LandmarkInfo[] = [];
    const roles = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'form'];

    roles.forEach((role) => {
      root.querySelectorAll(`[role="${role}"]`).forEach((el) => {
        if (!(el instanceof HTMLElement)) return;

        landmarks.push({
          id: el.id || this.generateId('landmark'),
          element: el,
          role,
          label: el.getAttribute('aria-label') || undefined,
        });
      });
    });

    // Also check semantic elements
    const semanticMap: Record<string, string> = {
      header: 'banner',
      nav: 'navigation',
      main: 'main',
      aside: 'complementary',
      footer: 'contentinfo',
    };

    Object.entries(semanticMap).forEach(([tag, role]) => {
      root.querySelectorAll(tag).forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        if (!landmarks.some((l) => l.element === el)) {
          landmarks.push({
            id: el.id || this.generateId('landmark'),
            element: el,
            role,
            label: el.getAttribute('aria-label') || undefined,
          });
        }
      });
    });

    return landmarks;
  }

  private findLabelForInput(input: HTMLElement): string | undefined {
    const id = input.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent?.trim();
    }
    const parent = input.closest('label');
    if (parent) return parent.textContent?.trim();
    return input.getAttribute('aria-label') || undefined;
  }

  private inferSectionPurpose(element: HTMLElement): string {
    const id = element.id.toLowerCase();
    const className = element.className.toLowerCase();
    const heading = element.querySelector('h1, h2, h3')?.textContent?.trim();

    if (heading) return `Section about ${heading}`;
    if (id.includes('hero') || className.includes('hero')) return 'Hero section';
    if (id.includes('about') || className.includes('about')) return 'About section';
    if (id.includes('contact') || className.includes('contact')) return 'Contact section';
    if (id.includes('project') || className.includes('project')) return 'Projects section';

    return 'Content section';
  }

  private buildCssPath(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;

    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector = `#${CSS.escape(current.id)}`;
        parts.unshift(selector);
        break;
      }
      // Handle SVG elements where className is SVGAnimatedString
      const classAttr = typeof current.className === 'string'
        ? current.className
        : current.getAttribute('class');
      if (classAttr) {
        const className = classAttr.trim().split(/\s+/)[0];
        if (className) selector += `.${CSS.escape(className)}`;
      }
      parts.unshift(selector);
      current = current.parentElement;
    }

    return parts.join(' > ');
  }
}

export function getVoiceStocksDOMNavigator(): VoiceStocksDOMNavigator {
  return VoiceStocksDOMNavigator.getInstance();
}
