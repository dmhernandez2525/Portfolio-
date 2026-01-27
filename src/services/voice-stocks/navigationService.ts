/**
 * Navigation Service
 *
 * Handles both route navigation and section scrolling.
 * Can be configured with React Router's navigate function.
 */

// Route mappings - keywords to routes
const ROUTE_MAPPINGS: Record<string, { route: string; aliases: string[] }> = {
  games: { route: '/games', aliases: ['game', 'play', 'arcade', 'gaming'] },
  projects: { route: '/projects', aliases: ['project', 'work', 'portfolio', 'builds'] },
  philosophy: { route: '/philosophy', aliases: ['beliefs', 'values', 'principles', 'thinking'] },
  inventions: { route: '/inventions', aliases: ['invention', 'create', 'maker', 'hardware'] },
  blog: { route: '/blog', aliases: ['posts', 'articles', 'writing', 'thoughts'] },
  social: { route: '/social', aliases: ['connect', 'links', 'socials', 'contact me'] },
  tetris: { route: '/tetris', aliases: ['tetris game'] },
  snake: { route: '/snake', aliases: ['snake game'] },
  tanks: { route: '/tanks', aliases: ['tank', 'tanks game'] },
  'cookie-clicker': { route: '/cookie-clicker', aliases: ['cookie', 'clicker', 'cookie game'] },
  chess: { route: '/chess', aliases: ['chess game'] },
  agar: { route: '/agar', aliases: ['agar.io', 'agar game', 'agario'] },
  home: { route: '/', aliases: ['main', 'start', 'beginning', 'top'] },
};

// Section mappings - keywords to section IDs or selectors
const SECTION_MAPPINGS: Record<string, { selector: string; aliases: string[] }> = {
  hero: { selector: '#hero, [data-section="hero"], section:first-of-type', aliases: ['intro', 'introduction', 'welcome', 'top'] },
  about: { selector: '#about, [data-section="about"]', aliases: ['about me', 'who', 'background', 'bio'] },
  skills: { selector: '#skills, [data-section="skills"]', aliases: ['skill', 'technologies', 'tech', 'stack', 'expertise'] },
  experience: { selector: '#experience, [data-section="experience"]', aliases: ['work', 'career', 'jobs', 'employment', 'history'] },
  projects: { selector: '#projects, [data-section="projects"]', aliases: ['project', 'work', 'portfolio', 'builds'] },
  contact: { selector: '#contact, [data-section="contact"]', aliases: ['reach', 'email', 'message', 'hire', 'connect'] },
  globe: { selector: '#globe, [data-section="globe"], .globe-section', aliases: ['map', 'world', '3d', 'earth'] },
};

type NavigateFunction = (path: string) => void;

class NavigationService {
  private static instance: NavigationService;
  private navigateFn: NavigateFunction | null = null;

  private constructor() {}

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Configure with React Router's navigate function
   */
  setNavigate(navigate: NavigateFunction): void {
    this.navigateFn = navigate;
  }

  /**
   * Find a route match for the given target text
   */
  findRouteMatch(target: string): { route: string; name: string } | null {
    const targetLower = target.toLowerCase().trim();

    for (const [name, config] of Object.entries(ROUTE_MAPPINGS)) {
      // Direct match
      if (targetLower === name || targetLower === name + 's' || targetLower === name.replace('-', ' ')) {
        return { route: config.route, name };
      }

      // Alias match
      for (const alias of config.aliases) {
        if (targetLower.includes(alias) || alias.includes(targetLower)) {
          return { route: config.route, name };
        }
      }
    }

    return null;
  }

  /**
   * Find a section match for the given target text
   */
  findSectionMatch(target: string): { selector: string; name: string } | null {
    const targetLower = target.toLowerCase().trim();

    for (const [name, config] of Object.entries(SECTION_MAPPINGS)) {
      // Direct match
      if (targetLower === name || targetLower.includes(name)) {
        return { selector: config.selector, name };
      }

      // Alias match
      for (const alias of config.aliases) {
        if (targetLower.includes(alias) || alias.includes(targetLower)) {
          return { selector: config.selector, name };
        }
      }
    }

    return null;
  }

  /**
   * Navigate to a target (route or section)
   * Returns result object with success status and message
   */
  async navigateTo(target: string): Promise<{ success: boolean; message: string; type: 'route' | 'section' | 'none' }> {
    // First, try route match
    const routeMatch = this.findRouteMatch(target);
    if (routeMatch) {
      if (this.navigateFn) {
        this.navigateFn(routeMatch.route);
        return {
          success: true,
          message: `Navigating to ${routeMatch.name} page.`,
          type: 'route'
        };
      } else {
        // Fallback to window.location if no navigate function
        window.location.href = routeMatch.route;
        return {
          success: true,
          message: `Navigating to ${routeMatch.name} page.`,
          type: 'route'
        };
      }
    }

    // Second, try section match (only on home page or if section exists)
    const sectionMatch = this.findSectionMatch(target);
    if (sectionMatch) {
      const element = document.querySelector(sectionMatch.selector);
      if (element instanceof HTMLElement) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return {
          success: true,
          message: `Scrolling to ${sectionMatch.name} section.`,
          type: 'section'
        };
      }
    }

    return {
      success: false,
      message: `I couldn't find "${target}". Try saying "go to games" or "show me projects".`,
      type: 'none'
    };
  }

  /**
   * Get all available navigation targets for help text
   */
  getAvailableTargets(): { routes: string[]; sections: string[] } {
    return {
      routes: Object.keys(ROUTE_MAPPINGS),
      sections: Object.keys(SECTION_MAPPINGS),
    };
  }
}

export const navigationService = NavigationService.getInstance();
export { NavigationService };
