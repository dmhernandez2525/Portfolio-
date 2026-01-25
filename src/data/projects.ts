export type ProjectCategory =
  | "AI/ML Platform"
  | "Web App"
  | "SaaS Platform"
  | "Hardware/IoT"
  | "Native App"
  | "Developer Tool"
  | "Open Source"
  | "Game"

export type ProjectTier = "flagship" | "strong" | "supporting"

export type ProjectStatus = "production" | "active" | "beta" | "development" | "local-only"

export interface ProjectItem {
  id: string
  title: string
  tagline: string
  description: string
  category: ProjectCategory
  tier: ProjectTier
  tech: string[]
  features?: string[]
  highlights?: string[] // Key selling points for quick scanning
  link?: string
  github?: string
  image?: string
  featured?: boolean
  easterEgg?: string
  status: ProjectStatus
  metrics?: string // e.g., "200M+ patents", "97% test coverage"
}

export const projectsData: ProjectItem[] = [
  // ============================================
  // TIER 1 - FLAGSHIP PROJECTS (6)
  // Enterprise-grade, production-ready systems
  // ============================================
  {
    id: "codereview-ai",
    title: "CodeReview AI",
    tagline: "Enterprise AI-Powered Code Review Platform",
    description: "Self-hosted AI code reviews with zero data retention and multi-provider support. BYOK (Bring Your Own Key) model ensures complete data sovereignty—your code never leaves your infrastructure. Supports OpenAI GPT-4, Anthropic Claude, Google Gemini, and local Ollama models for air-gapped deployments.",
    category: "AI/ML Platform",
    tier: "flagship",
    tech: ["Next.js 14", "Strapi 5", "Express 5", "BullMQ", "Redis", "PostgreSQL", "OpenAI", "Claude", "Gemini", "Ollama", "Docker"],
    features: [
      "Multi-provider AI: OpenAI GPT-4, Claude, Gemini, Ollama",
      "Git platform integration: GitHub, GitLab, Bitbucket, Azure DevOps",
      "BYOK security with AES-256-GCM key encryption",
      "Zero code retention—data deleted after review",
      "Async job processing with BullMQ + Redis",
      "Per-repo config via .codereview.yaml",
      "Webhook-driven with HMAC-SHA256 verification",
      "Structured JSON review output"
    ],
    highlights: ["Zero Data Retention", "Self-Hostable", "Multi-Provider AI"],
    link: "https://codereview-client.onrender.com",
    github: "https://github.com/dmhernandez2525/codereview-ai",
    featured: true,
    status: "production",
    metrics: "4 AI providers, 4 Git platforms"
  },
  {
    id: "patent-intelligence",
    title: "Patent Intelligence",
    tagline: "AI-Powered Patent Discovery Platform",
    description: "Discover expiring patents and innovation opportunities with AI-powered semantic search across the USPTO patent corpus. Uses PatentSBERTa embeddings stored in pgvector for lightning-fast vector similarity search, plus Claude and GPT-4 for idea generation and opportunity analysis.",
    category: "AI/ML Platform",
    tier: "flagship",
    tech: ["FastAPI", "Python 3.11", "PostgreSQL", "pgvector", "Celery", "Redis", "React 18", "TanStack Query", "PatentSBERTa", "Claude API", "Recharts"],
    features: [
      "Semantic vector search across USPTO patents",
      "Expiration intelligence—find patents entering public domain",
      "White space analysis for unpatented opportunities",
      "AI idea generation with Claude/GPT-4",
      "Citation network visualization",
      "Watchlist with email alerts",
      "Search history and saved queries",
      "CSV/JSON export for analysis"
    ],
    highlights: ["Vector Search", "Patent Expiration Tracking", "AI Idea Generation"],
    link: "https://patent-intelligence-kq93.onrender.com",
    featured: true,
    status: "production",
    metrics: "200M+ patents searchable"
  },
  {
    id: "spectree",
    title: "SpecTree",
    tagline: "AI-Powered Software Design Document Builder",
    description: "Transform vague project ideas into structured, actionable software design documents. Build hierarchical work items (App → Epic → Feature → Story → Task) with AI-assisted context gathering that exports directly to your project management tools or AI coding assistants.",
    category: "AI/ML Platform",
    tier: "flagship",
    tech: ["Next.js 14", "Strapi 5", "Express", "OpenAI GPT-4", "Claude", "Gemini", "Redux Toolkit", "PostgreSQL", "Tailwind CSS"],
    features: [
      "Multi-provider AI: OpenAI o1, Claude Opus, Gemini 2.5 Pro",
      "Hierarchical work item tree visualization",
      "AI-assisted requirements gathering",
      "Real-time streaming AI responses",
      "Export to Jira, Linear, GitHub Issues",
      "Sharable specification documents",
      "Version history and branching",
      "717+ TypeScript files with test coverage"
    ],
    highlights: ["Multi-Provider AI", "Hierarchical Specs", "PM Tool Export"],
    featured: true,
    status: "active",
    metrics: "717+ TypeScript files"
  },
  {
    id: "gmail-organizer",
    title: "Gmail Organizer",
    tagline: "AI-Powered Email Management System",
    description: "Comprehensive email management with AI classification across multiple Gmail accounts. Features parallel sync with 9 worker threads, incremental updates via Gmail History API, and intelligent priority scoring. Includes both a Streamlit web interface and native macOS menu bar app.",
    category: "AI/ML Platform",
    tier: "flagship",
    tech: ["Python", "Streamlit", "Gmail API", "Claude API", "Swift", "macOS", "React 18", "SQLite", "OAuth 2.0"],
    features: [
      "Parallel 9-worker multi-account sync",
      "Claude-powered email classification & priority scoring",
      "Gmail History API for incremental updates",
      "Smart filter creation with AI suggestions",
      "One-click bulk unsubscribe manager",
      "Semantic search by meaning, not keywords",
      "Native macOS menu bar app (Swift)",
      "Background sync with notifications"
    ],
    highlights: ["9-Worker Parallel Sync", "AI Classification", "Native macOS App"],
    link: "https://gmail-organizer-site.onrender.com",
    featured: true,
    status: "production",
    metrics: "9 parallel workers"
  },
  {
    id: "voiceforge",
    title: "VoiceForge",
    tagline: "Local Text-to-Speech with Voice Cloning",
    description: "Clone any voice from a 3-second audio sample with 100% local processing. Uses Qwen3-TTS with PyTorch Metal GPU acceleration on Apple Silicon. Design custom voices from text descriptions, synthesize in 10+ languages, and integrate via REST API—all without sending data to the cloud.",
    category: "Native App",
    tier: "flagship",
    tech: ["Swift", "macOS", "Python", "Qwen3-TTS", "PyTorch", "Metal GPU", "Flask", "AVFoundation", "transformers"],
    features: [
      "3-second voice cloning from audio sample",
      "Voice design from natural language descriptions",
      "6 high-quality preset voices",
      "10+ language support (EN, ES, FR, DE, ZH, JA...)",
      "100% local processing—zero cloud dependency",
      "Apple Silicon Metal GPU acceleration (<2s latency)",
      "REST API at localhost:5000",
      "Export as WAV, MP3, or FLAC"
    ],
    highlights: ["3-Second Cloning", "100% Local", "Metal GPU Accelerated"],
    link: "https://voiceforge-site.onrender.com",
    featured: true,
    status: "production",
    metrics: "10+ languages, <2s latency"
  },
  {
    id: "jarvis",
    title: "Jarvis Voice Assistant",
    tagline: "Fully Local AI Voice Assistant",
    description: "An Alexa-like voice assistant running 100% locally on Mac M2 Max with 96GB RAM. Combines OpenAI Whisper for speech recognition, Ollama-hosted LLMs (up to Qwen 2.5:72B with 671B parameters), and Home Assistant for smart home control. Smart model routing selects the optimal LLM based on query complexity.",
    category: "AI/ML Platform",
    tier: "flagship",
    tech: ["Python", "OpenAI Whisper", "Ollama", "Qwen 2.5 72B", "Porcupine", "Flask", "Home Assistant", "sounddevice"],
    features: [
      "100% offline—no internet required",
      "Whisper speech-to-text (local, 99 languages)",
      "Ollama LLMs: 7B to 72B parameters",
      "Smart model routing by query complexity",
      "10 operational modes (push-to-talk, wake word, API...)",
      "Home Assistant smart home integration",
      "Porcupine wake word detection",
      "Conversation branching like Git"
    ],
    highlights: ["100% Offline", "Up to 72B Parameters", "Smart Home Control"],
    link: "https://jarvis-site.onrender.com",
    featured: true,
    status: "active",
    metrics: "72B parameters, 96GB RAM"
  },

  // ============================================
  // TIER 2 - STRONG PROJECTS (11)
  // Production-ready with significant functionality
  // ============================================
  {
    id: "baked-by-chrissy",
    title: "Baked by Chrissy",
    tagline: "Full-Stack Bakery Management Platform",
    description: "Custom cake ordering and bakery business management for a real home bakery. Features a beautiful portfolio gallery, 6-step order wizard with Stripe payments, admin dashboard for scheduling, and automatic email notifications for order updates.",
    category: "SaaS Platform",
    tier: "strong",
    tech: ["Next.js 14", "React 18", "Prisma", "PostgreSQL", "Stripe", "NextAuth.js", "Resend", "Tailwind CSS", "Zod"],
    features: [
      "Portfolio gallery showcasing custom cakes",
      "6-step guided order form wizard",
      "Stripe payment processing",
      "Real-time pricing calculator",
      "Admin dashboard with calendar view",
      "Capacity management for scheduling",
      "Transactional emails via Resend",
      "Mobile-responsive design"
    ],
    highlights: ["Stripe Payments", "Order Wizard", "Admin Dashboard"],
    link: "https://baked-by-chrissy.onrender.com",
    status: "production",
    metrics: "6-step order wizard"
  },
  {
    id: "rapidbooth",
    title: "RapidBooth",
    tagline: "AI-Powered Website Generation for Small Businesses",
    description: "Generate complete small business websites in 30 minutes through conversational AI intake. Answer questions about your business and watch the site build in real-time with live preview. Includes Stripe Terminal integration for accepting payments at client locations.",
    category: "AI/ML Platform",
    tier: "strong",
    tech: ["Next.js 14", "TurboRepo", "Express", "PostgreSQL", "Stripe Terminal", "OpenAI", "Tailwind CSS"],
    features: [
      "Conversational AI business intake",
      "Real-time live preview during generation",
      "One-click production deployment",
      "Appointment scheduling integration",
      "Review aggregation (Google/Yelp)",
      "Stripe Terminal for in-person payments",
      "SEO optimization included",
      "Content self-service portal"
    ],
    highlights: ["30-Minute Websites", "Live Preview", "Stripe Terminal"],
    link: "https://rapidbooth-web.onrender.com",
    status: "production",
    metrics: "30-minute website generation"
  },
  {
    id: "lifecontext",
    title: "LifeContextCompiler",
    tagline: "Privacy-First AI Life Documentation",
    description: "Your thoughts, encrypted. Your data, yours. A privacy-first platform for documenting your life through voice-first brain dumps and mood tracking. All data is encrypted client-side with AES-256-GCM before storage. Shamir's Secret Sharing enables emergency access for legacy planning.",
    category: "AI/ML Platform",
    tier: "strong",
    tech: ["React 18", "React Native", "Expo SDK 52", "TurboRepo", "Convex", "Zustand", "Claude", "Whisper", "Dexie.js"],
    features: [
      "Client-side AES-256-GCM encryption",
      "PBKDF2 key derivation (100K iterations)",
      "BYOK AI—use your own API keys",
      "Voice transcription (Whisper + Web Speech)",
      "Cross-platform: web, iOS, Android, Chrome extension",
      "Shamir's 3-of-5 Secret Sharing recovery",
      "Mood tracking with AI pattern insights",
      "Offline-first with IndexedDB/MMKV"
    ],
    highlights: ["Zero-Knowledge Encryption", "Cross-Platform", "Legacy Planning"],
    link: "https://life-context-web.onrender.com",
    status: "active",
    metrics: "9 shared packages in TurboRepo"
  },
  {
    id: "splice3d",
    title: "Splice3D",
    tagline: "Multi-Color 3D Printing System",
    description: "Open-source multi-color 3D printing with 80% less waste than traditional MMU systems. Includes a Python post-processor for G-code parsing and a C++ state machine firmware for the splicing hardware. Supports all major slicers.",
    category: "Hardware/IoT",
    tier: "strong",
    tech: ["Python", "C++", "PlatformIO", "Arduino", "AccelStepper", "TMCStepper", "PID Control", "pytest"],
    features: [
      "G-code parsing and recipe generation",
      "13-state firmware state machine",
      "PID temperature control for hotend",
      "Firmware simulator for testing without hardware",
      "OrcaSlicer, PrusaSlicer, BambuStudio support",
      "Material profiles: PLA, PETG, ABS, ASA",
      "30+ unit tests for post-processor",
      "10,000+ segments per recipe"
    ],
    highlights: ["80% Less Waste", "Open Source", "Firmware Simulator"],
    link: "https://splice3d-site.onrender.com",
    github: "https://github.com/dmhernandez2525/splice3d",
    status: "active",
    metrics: "80% waste reduction"
  },
  {
    id: "obs-recorder",
    title: "OBS Tutorial Recorder",
    tagline: "macOS Recording Automation",
    description: "One-click tutorial recording with AI transcription and cloud sync. Native Swift menu bar app controls OBS Studio via WebSocket, automatically extracts audio, transcribes with whisper-cpp, and syncs to Google Drive.",
    category: "Native App",
    tier: "strong",
    tech: ["Swift", "Cocoa", "OBS WebSocket", "whisper-cpp", "ffmpeg", "rclone", "Google Drive API"],
    features: [
      "ISO recordings per source (screen, camera, mic)",
      "Automatic audio extraction with ffmpeg",
      "Local AI transcription via whisper-cpp",
      "Multi-format output: TXT, SRT, VTT",
      "Google Drive sync with rclone",
      "Progress tracking in sync panel",
      "OBS Source Record plugin support",
      "Configurable model sizes (tiny→large)"
    ],
    highlights: ["One-Click Recording", "AI Transcription", "Cloud Sync"],
    link: "https://obs-tutorial-site.onrender.com",
    status: "production",
    metrics: "whisper-cpp local transcription"
  },
  {
    id: "save-a-stray",
    title: "Save a Stray",
    tagline: "Pet Adoption Platform",
    description: "Unified pet adoption platform connecting shelters with adopters through a searchable database. Features GraphQL API with Apollo Client, OAuth authentication, and real-time sync between shelter locations.",
    category: "Open Source",
    tier: "strong",
    tech: ["Node.js", "Express", "GraphQL", "MongoDB", "Mongoose", "Passport.js", "React 18", "Apollo Client", "Tailwind CSS"],
    features: [
      "Searchable animal database with filters",
      "Photo galleries for each animal",
      "Shelter management dashboard",
      "Multi-step adoption application",
      "Favorites and wishlists",
      "OAuth login: Google, Facebook",
      "Success stories showcase",
      "Real-time sync between shelters"
    ],
    highlights: ["GraphQL API", "OAuth Login", "Shelter Dashboard"],
    link: "https://save-a-stray-site.onrender.com",
    github: "https://github.com/hugginsc10/save-a-stray",
    status: "production"
  },
  {
    id: "learning-hall",
    title: "Learning Hall",
    tagline: "Learning Management System",
    description: "Hierarchical LMS with Course → Subject → Task structure. Ruby on Rails backend with React frontend, Markdown content rendering, and AWS S3 for file uploads. Progress tracking across all enrolled courses.",
    category: "Open Source",
    tier: "strong",
    tech: ["Ruby on Rails 7", "Ruby 3.3", "React", "Redux", "PostgreSQL", "AWS S3", "markdown-to-jsx", "bcrypt"],
    features: [
      "Hierarchical: Course → Subject → Task",
      "Markdown lesson content rendering",
      "User authentication with bcrypt",
      "AWS S3 Active Storage uploads",
      "Progress tracking per course",
      "Responsive design",
      "API-first architecture"
    ],
    highlights: ["Rails 7 Backend", "Markdown Content", "S3 Uploads"],
    link: "https://learning-hall-site.onrender.com",
    github: "https://github.com/dmhernandez2525/Learning-Hall",
    status: "production"
  },
  {
    id: "focusflow",
    title: "FocusFlow",
    tagline: "ERP Platform for Service Businesses",
    description: "Modern ERP for tattoo shops, photographers, and creative service businesses. TurboRepo monorepo with 7 microservices: Next.js 15 frontend, Strapi CMS, Fastify payment service, and BullMQ background workers.",
    category: "SaaS Platform",
    tier: "strong",
    tech: ["TurboRepo", "Next.js 15", "React 19", "Strapi 5", "Fastify", "PostgreSQL 17", "Redis", "BullMQ", "Stripe", "Sharp"],
    features: [
      "Appointment scheduling with deposits",
      "Client lifecycle: prospect → repeat customer",
      "Inventory management with alerts",
      "Gallery delivery with access codes",
      "Image processing with Sharp",
      "Multi-tenant Row-Level Security",
      "4-tier subscription pricing",
      "Background jobs via BullMQ"
    ],
    highlights: ["7 Microservices", "Multi-Tenant", "Stripe Integration"],
    status: "development",
    metrics: "7 microservices in TurboRepo"
  },
  {
    id: "triple-a-lemonade",
    title: "Triple A Lemonade",
    tagline: "POS System for Kid-Run Lemonade Business",
    description: "Real point-of-sale system built for an actual neighborhood lemonade stand. Features Stripe Terminal for card payments, weather-based product recommendations, loyalty punch cards, and PWA offline support for outdoor sales.",
    category: "Web App",
    tier: "strong",
    tech: ["Next.js 16", "React 19", "Zustand", "Stripe Terminal", "PostgreSQL", "Drizzle ORM", "Tailwind CSS 4"],
    features: [
      "Touch-friendly menu-based POS",
      "Stripe Terminal card reader integration",
      "Weather API product recommendations",
      "Digital loyalty punch cards",
      "PWA with full offline support",
      "Sales analytics dashboard",
      "Receipt printing",
      "Multi-user support"
    ],
    highlights: ["Stripe Terminal", "Weather Recommendations", "PWA Offline"],
    link: "https://triple-a-lemonade.onrender.com",
    status: "production",
    metrics: "Real lemonade stand POS"
  },
  {
    id: "novium",
    title: "Novium",
    tagline: "Enterprise Purchase Order Management",
    description: "Enterprise PO management integrating with 62+ Odoo ERP modules via XMLRPC. Features Magic.link passwordless authentication, advanced filtering, bulk operations, and 97%+ test coverage with Vitest.",
    category: "SaaS Platform",
    tier: "strong",
    tech: ["React 18", "Redux Toolkit", "Express", "Odoo XMLRPC", "Magic.link", "PostgreSQL", "Vitest", "React Testing Library"],
    features: [
      "62+ Odoo ERP module integration",
      "Magic.link passwordless authentication",
      "Advanced filtering and search",
      "Bulk operations on POs",
      "CSV export functionality",
      "Multi-vendor procurement tracking",
      "Real-time status updates",
      "97%+ test coverage"
    ],
    highlights: ["Odoo ERP Integration", "Passwordless Auth", "97% Test Coverage"],
    status: "development",
    metrics: "62+ Odoo modules, 97% coverage"
  },
  {
    id: "niche-selection",
    title: "Niche Selection App",
    tagline: "Data-Driven Niche Research Platform",
    description: "Research platform for content creators to find profitable niches. Integrates Google Trends for historical data and YouTube API for competition analysis. Proprietary scoring algorithm evaluates profitability potential.",
    category: "Web App",
    tier: "strong",
    tech: ["React 19", "TanStack Query", "Express", "Prisma", "PostgreSQL", "YouTube API", "Google Trends", "Recharts"],
    features: [
      "Google Trends integration with history",
      "YouTube API competition analysis",
      "Proprietary profitability scoring",
      "Keyword research with related queries",
      "Side-by-side niche comparison",
      "Visual trend charts with Recharts",
      "CSV/JSON export",
      "85% test coverage threshold"
    ],
    highlights: ["Trends + YouTube API", "Profitability Scoring", "Competition Analysis"],
    status: "development",
    metrics: "85% test coverage"
  },

  // ============================================
  // TIER 3 - SUPPORTING PROJECTS (6)
  // Useful tools and experiments
  // ============================================
  {
    id: "voice-docs",
    title: "Voice Docs App",
    tagline: "Browser-Native Voice Documentation",
    description: "Voice-enabled documentation using only browser-native Web Speech API. Talk mode for continuous hands-free input, 7 accessible themes, and zero external dependencies.",
    category: "Web App",
    tier: "supporting",
    tech: ["React 19", "TypeScript", "Radix UI", "Tailwind CSS", "Web Speech API"],
    features: [
      "Continuous talk mode (hands-free)",
      "Manual mode for controlled input",
      "7 accessible color themes",
      "Adjustable rate, pitch, volume",
      "Zero external API dependencies",
      "Real-time transcription display"
    ],
    highlights: ["Web Speech API", "7 Themes", "Zero Dependencies"],
    link: "https://voice-docs-site.onrender.com",
    status: "production"
  },
  {
    id: "ink-synthesis",
    title: "Ink Synthesis",
    tagline: "AI Tattoo Design Platform",
    description: "Conceptual AI tattoo design generator with 7 style presets and canvas-based haptic needle matrix visualization. Cyberpunk aesthetic with machine calibration controls.",
    category: "AI/ML Platform",
    tier: "supporting",
    tech: ["React 19", "TypeScript", "Framer Motion", "Canvas API", "Tailwind CSS 4"],
    features: [
      "AI tattoo design generation",
      "7 style presets (traditional, geometric, watercolor...)",
      "Canvas haptic matrix visualization",
      "Machine calibration controls",
      "Cyberpunk UI aesthetic"
    ],
    highlights: ["AI Design", "Style Presets", "Canvas Visualization"],
    status: "beta"
  },
  {
    id: "agent-prompts",
    title: "Agent Prompts Manager",
    tagline: "AI Agent Orchestration System",
    description: "Meta-automation system orchestrating AI agents across 12+ software projects. Three-phase development lifecycle (Research → Build → Development) with native macOS menu bar app featuring 100+ commands and global hotkey.",
    category: "Developer Tool",
    tier: "supporting",
    tech: ["Swift", "Cocoa", "Bash", "AppleScript", "FSEvents", "Carbon HIToolbox", "Markdown"],
    features: [
      "Three-phase workflow: Research → Build → Dev",
      "Session tracking in WORK_LOG.md",
      "Lock files prevent concurrent conflicts",
      "Native macOS menu bar app",
      "Global hotkey: Cmd+Shift+K",
      "VS Code and Terminal integration",
      "File system watching (FSEvents)"
    ],
    highlights: ["12+ Projects", "Native macOS", "Global Hotkey"],
    link: "https://agent-prompts-site.onrender.com",
    status: "active",
    metrics: "12+ projects orchestrated"
  },
  {
    id: "job-harmony",
    title: "Job Harmony",
    tagline: "Bias-Free Job Matching Platform",
    description: "Anonymous job matching with Tinder-style swipe interface. No names or photos shown until mutual interest, reducing unconscious hiring bias. Includes resume builder and messaging.",
    category: "Web App",
    tier: "supporting",
    tech: ["React 18", "Express", "MongoDB", "Passport.js", "JWT", "Tailwind CSS"],
    features: [
      "Anonymous matching (no photos/names)",
      "Tinder-style swipe interface",
      "Reveal only on mutual interest",
      "Built-in resume builder",
      "Job listings management",
      "In-app messaging system"
    ],
    highlights: ["Bias-Free Matching", "Swipe Interface", "Resume Builder"],
    status: "development"
  },
  {
    id: "rocket-rollout",
    title: "RocketRollout",
    tagline: "Visual Web Page Builder",
    description: "Drag-and-drop visual page builder using Craft.js. 8 comprehensive CSS styling categories with state serialization and code generation backend.",
    category: "Developer Tool",
    tier: "supporting",
    tech: ["React", "Craft.js", "Material-UI", "Express", "SCSS", "lzutf8"],
    features: [
      "Visual drag-and-drop editor",
      "8 CSS styling categories",
      "Component library (Button, Card, Container...)",
      "State serialization to Base64",
      "Code generation API",
      "Live preview"
    ],
    highlights: ["Craft.js", "8 Style Categories", "Code Generation"],
    status: "development"
  },
  {
    id: "portfolio-games",
    title: "Portfolio Games",
    tagline: "7 Playable Games Collection",
    description: "7 fully playable games built with React and Canvas. Includes Chess with minimax AI and alpha-beta pruning, Tetris, Snake, Cookie Clicker, and Agar.io clone. 16+ Easter eggs hidden throughout.",
    category: "Game",
    tier: "supporting",
    tech: ["React 19", "TypeScript", "Canvas API", "Three.js", "GSAP", "Framer Motion"],
    features: [
      "Chess with minimax AI + alpha-beta pruning",
      "Tetris with ghost pieces and hold",
      "Snake with speed progression",
      "Cookie Clicker with upgrades",
      "Agar.io clone (multiplayer coming)",
      "Pong with AI opponent",
      "Memory match game",
      "16+ Easter eggs"
    ],
    highlights: ["7 Games", "Chess AI", "16+ Easter Eggs"],
    link: "/games",
    status: "production",
    metrics: "7 games, 16+ Easter eggs"
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

// Filter by tier
export const getProjectsByTier = (tier: ProjectTier): ProjectItem[] =>
  projectsData.filter(p => p.tier === tier)

// Filter by category
export const getProjectsByCategory = (category: ProjectCategory): ProjectItem[] =>
  projectsData.filter(p => p.category === category)

// Get featured projects (Tier 1 flagship)
export const getFeaturedProjects = (): ProjectItem[] =>
  projectsData.filter(p => p.featured)

// Get production projects with live URLs
export const getLiveProjects = (): ProjectItem[] =>
  projectsData.filter(p => p.link && p.status === "production")

// Get projects by status
export const getProjectsByStatus = (status: ProjectStatus): ProjectItem[] =>
  projectsData.filter(p => p.status === status)

// Get all unique technologies across projects
export const getAllTechnologies = (): string[] => {
  const techSet = new Set<string>()
  projectsData.forEach(p => p.tech.forEach(t => techSet.add(t)))
  return Array.from(techSet).sort()
}

// Get project count by category
export const getProjectCountByCategory = (): Record<ProjectCategory, number> => {
  const counts = {} as Record<ProjectCategory, number>
  projectsData.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1
  })
  return counts
}
