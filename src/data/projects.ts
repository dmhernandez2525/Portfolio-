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

export interface ProjectItem {
  id: string
  title: string
  tagline: string
  description: string
  category: ProjectCategory
  tier: ProjectTier
  tech: string[]
  features?: string[]
  link?: string
  github?: string
  image?: string
  featured?: boolean
  easterEgg?: string
  status?: "production" | "active" | "beta" | "development"
}

export const projectsData: ProjectItem[] = [
  // ============================================
  // TIER 1 - FLAGSHIP PROJECTS
  // ============================================
  {
    id: "codereview-ai",
    title: "CodeReview AI",
    tagline: "Enterprise AI-Powered Code Review Platform",
    description: "Self-hosted AI code reviews with zero data retention and multi-provider support. BYOK (Bring Your Own Key) model ensures complete data sovereignty. Supports OpenAI GPT-4, Anthropic Claude, Google Gemini, and local Ollama models.",
    category: "AI/ML Platform",
    tier: "flagship",
    tech: ["Next.js 14", "Strapi 5", "Express 5", "BullMQ", "Redis", "PostgreSQL", "OpenAI", "Claude", "Gemini", "Docker"],
    features: [
      "Multi-provider AI (OpenAI, Claude, Gemini, Ollama)",
      "GitHub, GitLab, Bitbucket, Azure DevOps integration",
      "BYOK security with AES-256-GCM encryption",
      "Zero code retention after review",
      "BullMQ async job processing with Redis",
      "Configurable .codereview.yaml per repo"
    ],
    link: "https://codereview-client.onrender.com",
    github: "https://github.com/dmhernandez2525/codereview-ai",
    featured: true,
    status: "active"
  },
  {
    id: "patent-intelligence",
    title: "Patent Intelligence",
    tagline: "AI-Powered Patent Discovery Platform",
    description: "Discover expiring patents and innovation opportunities with AI-powered semantic search across 200M+ patents. Uses PatentSBERTa embeddings with pgvector for vector similarity search, plus Claude/GPT-4 for idea generation.",
    category: "AI/ML Platform",
    tier: "flagship",
    tech: ["FastAPI", "Python 3.11", "PostgreSQL", "pgvector", "Celery", "Redis", "React 18", "PatentSBERTa", "Claude API"],
    features: [
      "Semantic search across 200M+ USPTO patents",
      "Expiration intelligence tracking",
      "White space discovery for unpatented opportunities",
      "AI-powered idea generation with Claude/GPT-4",
      "Citation network analysis",
      "Watchlist & email alerts"
    ],
    link: "https://patent-intelligence-kq93.onrender.com",
    featured: true,
    status: "production"
  },
  {
    id: "spectree",
    title: "SpecTree",
    tagline: "AI-Powered Software Design Document Builder",
    description: "Transform vague project ideas into structured, actionable software design documents. Hierarchical work items (App → Epic → Feature → Story → Task) with AI-assisted context gathering.",
    category: "AI/ML Platform",
    tier: "flagship",
    tech: ["Next.js 14", "Strapi 5", "Express", "OpenAI GPT-4", "Claude", "Gemini", "Redux Toolkit", "PostgreSQL"],
    features: [
      "Multi-provider AI (OpenAI, Claude, Gemini)",
      "Hierarchical work item management",
      "AI-assisted project breakdown",
      "Export to project management tools",
      "Streaming AI responses",
      "717+ TypeScript files with full test coverage"
    ],
    featured: true,
    status: "active"
  },
  {
    id: "gmail-organizer",
    title: "Gmail Organizer",
    tagline: "AI-Powered Email Management System",
    description: "Comprehensive email management with AI classification, parallel multi-account sync (9 workers), and intelligent prioritization. Includes native macOS menu bar app with system integration.",
    category: "AI/ML Platform",
    tier: "flagship",
    tech: ["Python", "Streamlit", "Gmail API", "Claude API", "Swift", "macOS", "React 18", "SQLite"],
    features: [
      "Parallel 9-worker multi-account sync",
      "Claude-powered email classification",
      "Gmail History API incremental updates",
      "Smart filters with AI suggestions",
      "Bulk unsubscribe manager",
      "Native macOS menu bar app"
    ],
    link: "https://gmail-organizer-site.onrender.com",
    featured: true,
    status: "production"
  },
  {
    id: "voiceforge",
    title: "VoiceForge",
    tagline: "Local Text-to-Speech with Voice Cloning",
    description: "3-second voice cloning with 100% local processing using Qwen3-TTS. Clone any voice from a brief sample, design voices from text descriptions, and synthesize in 10+ languages—all on-device with Metal GPU acceleration.",
    category: "Native App",
    tier: "flagship",
    tech: ["Swift", "macOS", "Python", "Qwen3-TTS", "PyTorch", "Metal GPU", "Flask", "AVFoundation"],
    features: [
      "3-second voice cloning",
      "6 preset voices",
      "Voice design from text descriptions",
      "10+ language support",
      "100% local processing",
      "REST API for integration",
      "Apple Silicon Metal GPU acceleration"
    ],
    link: "https://voiceforge-site.onrender.com",
    featured: true,
    status: "production"
  },
  {
    id: "jarvis",
    title: "Jarvis Voice Assistant",
    tagline: "Fully Local AI Voice Assistant",
    description: "Alexa-like voice assistant running 100% locally on Mac M2 Max with 96GB RAM. Combines OpenAI Whisper for speech recognition with Ollama LLMs (up to Qwen 2.5:72B) and Home Assistant for smart home control.",
    category: "AI/ML Platform",
    tier: "flagship",
    tech: ["Python", "OpenAI Whisper", "Ollama", "Qwen 2.5", "Porcupine", "Flask", "Home Assistant"],
    features: [
      "100% offline voice assistant",
      "Whisper speech-to-text (local)",
      "Ollama LLMs up to 72B parameters",
      "Smart model routing by complexity",
      "10 operational modes",
      "Home Assistant smart home control",
      "Wake word detection (Porcupine)"
    ],
    link: "https://jarvis-site.onrender.com",
    featured: true,
    status: "active"
  },

  // ============================================
  // TIER 2 - STRONG PROJECTS
  // ============================================
  {
    id: "baked-by-chrissy",
    title: "Baked by Chrissy",
    tagline: "Full-Stack Bakery Management Platform",
    description: "Custom cake ordering and bakery business management with Stripe payments, 6-step order wizard, and admin dashboard for scheduling and capacity management.",
    category: "SaaS Platform",
    tier: "strong",
    tech: ["Next.js 14", "React 18", "Prisma", "PostgreSQL", "Stripe", "NextAuth.js", "Resend", "Tailwind CSS"],
    features: [
      "Portfolio gallery for custom cakes",
      "6-step order form wizard",
      "Stripe payment integration",
      "Admin dashboard",
      "Real-time pricing calculator",
      "Email notifications via Resend"
    ],
    link: "https://baked-by-chrissy.onrender.com",
    status: "production"
  },
  {
    id: "rapidbooth",
    title: "RapidBooth",
    tagline: "AI-Powered Website Generation for Small Businesses",
    description: "AI-generated websites for small businesses completed in 30 minutes. Conversational AI intake, live preview during generation, and instant deployment.",
    category: "AI/ML Platform",
    tier: "strong",
    tech: ["Next.js 14", "TurboRepo", "Express", "PostgreSQL", "Stripe Terminal", "AI"],
    features: [
      "Conversational AI business intake",
      "Live preview during generation",
      "Instant production deployment",
      "Appointment scheduling integration",
      "Review aggregation (Google/Yelp)",
      "Stripe Terminal for in-person payments"
    ],
    link: "https://rapidbooth-web.onrender.com",
    status: "production"
  },
  {
    id: "triple-a-lemonade",
    title: "Triple A Lemonade",
    tagline: "POS System for Kid-Run Lemonade Business",
    description: "Menu-based POS with Stripe Terminal, weather-based recommendations, and PWA offline support. Built for a real neighborhood lemonade stand.",
    category: "Web App",
    tier: "strong",
    tech: ["Next.js 16", "React 19", "Zustand", "Stripe Terminal", "PostgreSQL", "Drizzle ORM", "Tailwind CSS 4"],
    features: [
      "Menu-based POS interface",
      "Stripe Terminal card payments",
      "Weather-based product recommendations",
      "Loyalty punch card system",
      "PWA with offline support",
      "Sales analytics dashboard"
    ],
    link: "https://triple-a-lemonade.onrender.com",
    status: "production"
  },
  {
    id: "lifecontext",
    title: "LifeContextCompiler",
    tagline: "Privacy-First AI Life Documentation",
    description: "Your thoughts, encrypted. Your data, yours. Voice-first brain dumps with client-side AES-256-GCM encryption, multi-platform sync, and Shamir's Secret Sharing for emergency access.",
    category: "AI/ML Platform",
    tier: "strong",
    tech: ["React 18", "React Native", "Expo SDK 52", "TurboRepo", "Convex", "Zustand", "Claude", "Whisper"],
    features: [
      "Client-side AES-256-GCM encryption",
      "BYOK AI (bring your own keys)",
      "Voice transcription (Whisper/Web Speech)",
      "Cross-platform (web, mobile, extension)",
      "Shamir's Secret Sharing recovery",
      "Mood tracking with AI insights"
    ],
    link: "https://life-context-web.onrender.com",
    status: "active"
  },
  {
    id: "focusflow",
    title: "FocusFlow",
    tagline: "ERP Platform for Service Businesses",
    description: "Modern ERP for tattoo shops, photographers, and creative service businesses. TurboRepo monorepo with 7 microservices including Next.js 15, Strapi, Fastify, and BullMQ workers.",
    category: "SaaS Platform",
    tier: "strong",
    tech: ["TurboRepo", "Next.js 15", "React 19", "Strapi 5", "Fastify", "PostgreSQL 17", "Redis", "BullMQ", "Stripe"],
    features: [
      "Appointment scheduling with deposits",
      "Client lifecycle management",
      "Gallery delivery with access codes",
      "Multi-tenant Row-Level Security",
      "Background job processing",
      "4-tier subscription pricing"
    ],
    link: "https://focusflow-web-634w.onrender.com",
    status: "development"
  },
  {
    id: "splice3d",
    title: "Splice3D",
    tagline: "Multi-Color 3D Printing System",
    description: "Open-source multi-color 3D printing with 80% less waste than MMU systems. Python post-processor and C++ state machine firmware for filament splicing hardware.",
    category: "Hardware/IoT",
    tier: "strong",
    tech: ["Python", "C++", "PlatformIO", "Arduino", "AccelStepper", "TMCStepper", "PID Control"],
    features: [
      "G-code parsing and recipe generation",
      "13-state firmware state machine",
      "PID temperature control",
      "Firmware simulator for testing",
      "OrcaSlicer/PrusaSlicer support",
      "Material profiles (PLA, PETG, ABS)"
    ],
    link: "https://splice3d-site.onrender.com",
    github: "https://github.com/dmhernandez2525/splice3d",
    status: "active"
  },
  {
    id: "obs-recorder",
    title: "OBS Tutorial Recorder",
    tagline: "macOS Recording Automation",
    description: "One-click tutorial recording with AI transcription and cloud sync. Native Swift menu bar app controlling OBS Studio via WebSocket.",
    category: "Native App",
    tier: "strong",
    tech: ["Swift", "Cocoa", "OBS WebSocket", "whisper-cpp", "ffmpeg", "rclone", "Google Drive"],
    features: [
      "ISO recordings per source",
      "Automatic audio extraction",
      "Local whisper-cpp transcription",
      "Google Drive sync via rclone",
      "Multi-format output (TXT, SRT, VTT)",
      "OBS Source Record plugin support"
    ],
    link: "https://obs-tutorial-site.onrender.com",
    status: "production"
  },
  {
    id: "save-a-stray",
    title: "Save a Stray",
    tagline: "Pet Adoption Platform",
    description: "Unified pet adoption platform connecting shelters with adopters through searchable database with GraphQL API and OAuth authentication.",
    category: "Open Source",
    tier: "strong",
    tech: ["Node.js", "Express", "GraphQL", "MongoDB", "Mongoose", "Passport.js", "React 18", "Apollo Client"],
    features: [
      "Animal listings with photo galleries",
      "Shelter dashboard",
      "Adoption application workflow",
      "Favorites and wishlists",
      "OAuth (Google/Facebook) login",
      "Real-time sync between shelters"
    ],
    link: "https://save-a-stray-site.onrender.com",
    github: "https://github.com/hugginsc10/save-a-stray",
    status: "production"
  },
  {
    id: "novium",
    title: "Novium (Ordering & Tracking)",
    tagline: "Enterprise Purchase Order Management",
    description: "Enterprise PO management with 62+ Odoo ERP modules integration. Magic.link passwordless auth and 97%+ test coverage.",
    category: "SaaS Platform",
    tier: "strong",
    tech: ["React 18", "Redux Toolkit", "Express", "Odoo XMLRPC", "Magic.link", "PostgreSQL", "Vitest"],
    features: [
      "62+ Odoo ERP module integration",
      "Passwordless auth (Magic.link)",
      "Advanced filtering and bulk operations",
      "CSV export functionality",
      "Multi-vendor procurement",
      "97%+ test coverage"
    ],
    link: "https://novium-site.onrender.com",
    status: "active"
  },
  {
    id: "niche-selection",
    title: "Niche Selection App",
    tagline: "Data-Driven Niche Research Platform",
    description: "Data-driven niche research for content creators using Google Trends and YouTube API. Automated competition scoring algorithm with profitability analysis.",
    category: "Web App",
    tier: "strong",
    tech: ["React 19", "TanStack Query", "Express", "Prisma", "PostgreSQL", "YouTube API", "Google Trends"],
    features: [
      "Google Trends integration",
      "YouTube competition analysis",
      "Profitability scoring algorithm",
      "Keyword research with related queries",
      "Niche comparison dashboard",
      "CSV/JSON export"
    ],
    link: "https://niche-selection-site.onrender.com",
    status: "active"
  },
  {
    id: "learning-hall",
    title: "Learning Hall",
    tagline: "Learning Management System",
    description: "Course → Subject → Task hierarchy LMS with Ruby on Rails backend and React frontend. Markdown content rendering and AWS S3 file uploads.",
    category: "Open Source",
    tier: "strong",
    tech: ["Ruby on Rails 7", "React", "Redux", "PostgreSQL", "AWS S3", "markdown-to-jsx"],
    features: [
      "Hierarchical course structure",
      "Markdown content rendering",
      "User authentication with bcrypt",
      "AWS S3 file uploads",
      "Progress tracking"
    ],
    link: "https://learning-hall-site.onrender.com",
    github: "https://github.com/dmhernandez2525/Learning-Hall",
    status: "production"
  },

  // ============================================
  // TIER 3 - SUPPORTING PROJECTS & TOOLS
  // ============================================
  {
    id: "voice-docs",
    title: "Voice Docs App",
    tagline: "Browser-Native Voice Documentation",
    description: "Voice-enabled documentation with Web Speech API. Talk mode for hands-free input with 7 accessible themes.",
    category: "Web App",
    tier: "supporting",
    tech: ["React 19", "TypeScript", "Radix UI", "Tailwind CSS", "Web Speech API"],
    features: [
      "Continuous talk mode",
      "Manual mode for controlled input",
      "7 accessible themes",
      "Voice settings (rate, pitch, volume)",
      "Zero external dependencies"
    ],
    link: "https://voice-docs-site.onrender.com",
    status: "production"
  },
  {
    id: "ink-synthesis",
    title: "Ink Synthesis",
    tagline: "AI Tattoo Design Platform",
    description: "AI tattoo design generator with 7 style presets and canvas-based haptic matrix visualization. Cyberpunk aesthetic with conceptual automated tattooing hardware integration.",
    category: "AI/ML Platform",
    tier: "supporting",
    tech: ["React 19", "TypeScript", "Framer Motion", "Canvas API", "Tailwind CSS 4"],
    features: [
      "AI design generator",
      "7 style presets",
      "Haptic needle matrix visualization",
      "Machine dashboard (conceptual)",
      "Calibration controls"
    ],
    link: "https://ink-synthesis-site.onrender.com",
    status: "beta"
  },
  {
    id: "agent-prompts",
    title: "Agent Prompts Manager",
    tagline: "AI Agent Orchestration System",
    description: "Meta-automation system orchestrating AI agents across 12+ projects. Three-phase development lifecycle with native macOS menu bar app featuring 100+ commands.",
    category: "Developer Tool",
    tier: "supporting",
    tech: ["Swift", "Cocoa", "Bash", "AppleScript", "FSEvents", "Carbon HIToolbox"],
    features: [
      "Three-phase workflow (Research → Build → Dev)",
      "Session tracking in WORK_LOG.md",
      "Lock files prevent conflicts",
      "Native macOS menu bar app",
      "Global hotkey (Cmd+Shift+K)",
      "VS Code/Terminal integration"
    ],
    link: "https://agent-prompts-site.onrender.com",
    status: "active"
  },
  {
    id: "job-harmony",
    title: "Job Harmony",
    tagline: "Bias-Free Job Matching Platform",
    description: "Anonymous job matching with Tinder-style swipe interface. No names or photos until mutual interest, reducing hiring bias.",
    category: "Web App",
    tier: "supporting",
    tech: ["React 18", "Express", "MongoDB", "Passport.js", "JWT", "Tailwind CSS"],
    features: [
      "Anonymous matching",
      "Swipe interface",
      "Resume builder",
      "Job listings management",
      "Messaging system"
    ],
    link: "https://job-harmony-site.onrender.com",
    status: "development"
  },
  {
    id: "rocket-rollout",
    title: "RocketRollout",
    tagline: "Visual Web Page Builder",
    description: "Drag-and-drop visual page builder with Craft.js. 8 comprehensive CSS styling categories with code generation backend.",
    category: "Developer Tool",
    tier: "supporting",
    tech: ["React", "Craft.js", "Material-UI", "Express", "SCSS", "lzutf8"],
    features: [
      "Visual drag-and-drop editor",
      "8 styling categories",
      "State serialization",
      "Code generation API",
      "Component library"
    ],
    link: "https://rocket-rollout-site.onrender.com",
    status: "active"
  },
  {
    id: "portfolio-games",
    title: "Portfolio Games",
    tagline: "7 Playable Games Collection",
    description: "7 fully playable games including Chess with minimax AI, Tetris, Snake, Cookie Clicker, and Agar.io clone. Easter eggs and gamification throughout.",
    category: "Game",
    tier: "supporting",
    tech: ["React 19", "TypeScript", "Canvas API", "Three.js", "GSAP", "Framer Motion"],
    features: [
      "Chess with minimax AI",
      "Tetris, Snake, Pong",
      "Cookie Clicker",
      "Agar.io clone",
      "16+ Easter eggs",
      "7 theme options"
    ],
    link: "/games",
    status: "production"
  }
]

// Helper function to filter by tier
export const getProjectsByTier = (tier: ProjectTier) =>
  projectsData.filter(p => p.tier === tier)

// Helper function to filter by category
export const getProjectsByCategory = (category: ProjectCategory) =>
  projectsData.filter(p => p.category === category)

// Get featured projects
export const getFeaturedProjects = () =>
  projectsData.filter(p => p.featured)

// Get production projects with live URLs
export const getLiveProjects = () =>
  projectsData.filter(p => p.link && p.status === "production")
