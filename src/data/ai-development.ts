// ============================================
// AI Development - Complete Content Data
// ============================================

export interface AIStat {
  label: string
  value: string
  description: string
}

export interface TimelineEntry {
  year: string
  title: string
  description: string
  milestone?: boolean
}

export interface PromptPattern {
  id: string
  number: number
  name: string
  source: string
  problem: string
  solution: string
  keyInsight: string
  template?: string
}

export interface AIProject {
  id: string
  name: string
  status: string
  purpose: string
  innovation: string
  aiFeatures: string[]
  stack: string[]
}

export interface LLMProvider {
  tier: string
  provider: string
  models: string
  useCase: string
}

export interface VoiceProject {
  project: string
  technology: string
  latency: string
  keyFeature: string
}

export interface PrivacyProject {
  project: string
  approach: string
}

export interface QualityMetric {
  metric: string
  minimum: string
}

export interface AITool {
  name: string
  stats: string
  purpose: string
}

export interface UseCase {
  id: string
  title: string
  description: string
  codeSnippet?: string
}

export interface Lesson {
  number: number
  title: string
  insight: string
}

export interface EnterprisePattern {
  title: string
  description: string
  details: string[]
}

// ============================================
// KEY STATS (for homepage section + page hero)
// ============================================

export const aiStats: AIStat[] = [
  { label: "Projects with AI Prompts", value: "77+", description: "Each with structured agent prompt infrastructure" },
  { label: "Production AI Products", value: "11", description: "Shipped, working AI-powered applications" },
  { label: "Reusable Prompt Patterns", value: "10", description: "Battle-tested across dozens of projects" },
  { label: "Total AI Sessions", value: "560+", description: "Across Claude, Gemini, Codex, Cursor, and ChatGPT" },
  { label: "Enterprise Prompts", value: "36", description: "Production prompts from client work (836KB)" },
  { label: "Conversation Data", value: "19.7 GB", description: "Raw AI interaction data across all tools" },
  { label: "Git Commits", value: "4,442", description: "Across 53 repositories spanning 2019-2026" },
  { label: "Market Research Reports", value: "11", description: "Full competitive intelligence with validated unit economics" },
  { label: "Test Coverage", value: "97.7%", description: "Research Agent branch coverage" },
]

// ============================================
// JOURNEY TIMELINE
// ============================================

export const journeyTimeline: TimelineEntry[] = [
  {
    year: "2019",
    title: "Comfort Order - The Vision",
    description: "Thanksgiving 2019. The core insight: large businesses spend $1-10M on software for competitive advantage. Small businesses have passion and quality but lack automation. The solution: build reusable, customizable components that democratize technology for small businesses.",
    milestone: true,
  },
  {
    year: "2020-2021",
    title: "CAD Consulting - First Pivot",
    description: "Pivoted to consulting services, building custom software for local businesses. Learned firsthand what small business owners actually need versus what technologists assume they need.",
  },
  {
    year: "2021-2023",
    title: "Tailored Technologies - Enterprise Client Work",
    description: "Golf industry focus with a 50/50 partnership. Built booking systems, membership management, payment processing (Stripe + QuickBooks), coach scheduling, 15 Strapi plugins, and 36 production prompts (836KB). This is where the AI-augmented development patterns were forged under real production pressure.",
    milestone: true,
  },
  {
    year: "Oct 2024",
    title: "Pattern Extraction Begins",
    description: "Partnership dissolved. Instead of losing the work, systematically extracted every pattern, template, and workflow into reusable open-source systems. Enterprise Template System, Component Library, and the Agent Prompt System were born from production battle scars.",
    milestone: true,
  },
  {
    year: "2024-2025",
    title: "The Ecosystem Takes Shape",
    description: "Built the _@agent-prompts system, the Project Generator meta-prompt (95KB), 4 meta-prompts that generate other prompts, cross-machine agent sync, and standardized the 5-phase workflow across all projects. Started shipping AI-powered products: Patent Intelligence, CodeReview AI, SpecTree.",
    milestone: true,
  },
  {
    year: "2025-2026",
    title: "77+ Projects, Full Production Pipeline",
    description: "The ecosystem hit full stride. 77+ projects managed through structured AI agent workflows. Voice-first AI with full duplex conversation at <500ms latency. Privacy-first architecture across all projects. 273 Claude Code sessions tracked and recoverable. Research Agent shipped with 97.7% test coverage.",
    milestone: true,
  },
]

// ============================================
// THE ECOSYSTEM - "Apps That Build Apps"
// ============================================

export const ecosystemDescription = `The entire system is designed as a recursive, self-improving pipeline for building applications at any scale using AI agents, production-tested templates, and human-in-the-loop orchestration. It transforms the software development lifecycle from a manual, time-intensive process into an AI-augmented pipeline where ideas become specifications, specifications become prompts, prompts guide AI agents through research and development, templates accelerate scaffolding, and quality gates ensure production readiness.`

export const ecosystemLayers = [
  { layer: "Layer 0", name: "Context Capture", tool: "LifeContextCompiler", flow: "Ideas from life into structured context" },
  { layer: "Layer 1", name: "Specification", tool: "SpecTree / Blueprint Builder", flow: "Context into actionable specifications" },
  { layer: "Layer 2", name: "Orchestration", tool: "_@agent-prompts", flow: "Specifications into AI agent workflows" },
  { layer: "Layer 3", name: "Foundation", tool: "Enterprise Templates + Component Library", flow: "Scaffolding into accelerated project setup" },
  { layer: "Layer 4+", name: "Production Applications", tool: "Working Software", flow: "Deployed to real users" },
]

export const qualityTriangle = `You can only pick TWO: Price, Speed/Convenience, Quality. Large businesses optimize for price and speed at the expense of quality. This ecosystem enables small businesses to compete by automating what previously required expensive custom software.`

export const nonprofitStrategy = `For every for-profit location signed up, fund a nonprofit location's software for free. Sign up 1 pizzeria, fund 1 dog shelter. Sign up 3 pizzerias, fund a local food bank. This creates ethical differentiation, valuable feedback loops, and a competitive advantage that extractive companies cannot match.`

// ============================================
// AGENT PROMPT SYSTEM
// ============================================

export const agentPromptSystemDescription = `A centralized, version-controlled repository of AI agent prompts stored SEPARATELY from project code. This prevents agents from modifying their own instructions while providing structured, reproducible workflows for every project.`

export const agentPromptWorkflow = `RESEARCH PHASE              COMPILE PHASE          BUILD PHASE         DEVELOP PHASE

Session 1 ──────┐
Session 2 ──────┼──> COMPILER_PROMPT ──> COMPILED_RESEARCH ──> BUILD_PROMPT ──> AGENT_PROMPT
Session N ──────┘                           + Gap Analysis

AI Agent: Claude.ai          Claude.ai or CLI   Claude Code (CLI)   Claude Code (CLI)
Can Do:   Web search          Gap analysis       File creation       Code implementation`

export const metaPrompts = [
  { name: "PROJECT_GENERATOR_PROMPT", size: "95 KB, 3,227 lines", description: "Master meta-prompt that creates all sub-prompts for new projects. Input: project idea. Output: RESEARCH_PROMPT, BUILD_PROMPT, AGENT_PROMPT template." },
  { name: "ENHANCEMENT_RESEARCH_GENERATOR", size: "For active projects", description: "For existing projects in active development (3-6 months post-launch). Generates enhancement research prompts focused on feature gaps." },
  { name: "RESEARCH_COMPILER_PROMPT", size: "Multi-session", description: "Combines multiple research sessions into a single compiled document with gap analysis for topics needing more research." },
  { name: "NONPROFIT_GENERATOR_PROMPT", size: "33 KB", description: "Specialized variant for nonprofit-serving projects. Includes ecosystem research and nonprofit-specific constraints." },
]

export const projectStructure = `project-name/
├── README.md              # Status tracker with checklist
├── WORK_LOG.md            # Session tracking with handoff notes
├── AGENT_PROMPT.md        # Development template (ongoing work)
├── BUILD_PROMPT.md        # Build phase instructions
├── START_HERE.md          # Onboarding for new agents
└── research/
    ├── RESEARCH_PROMPT.md           # Initial competitor research
    ├── sessions/                     # Research session outputs
    │   ├── session-1.md
    │   ├── session-2.md
    │   └── session-N.md
    └── COMPILED_RESEARCH.md          # Final combined document`

// ============================================
// 10 BATTLE-TESTED PROMPT PATTERNS
// ============================================

export const promptPatterns: PromptPattern[] = [
  {
    id: "project-generator",
    number: 1,
    name: "Project Generator Meta-Prompt",
    source: "triple-a-lemonade (PROJECT_GENERATOR_PROMPT v2.0.0)",
    problem: "Starting new projects from scratch is slow and inconsistent. Different projects get different quality levels of planning.",
    solution: "A master prompt that generates all sub-prompts needed for a new project: RESEARCH_PROMPT, BUILD_PROMPT, and AGENT_PROMPT template.",
    keyInsight: "Store prompts in a SEPARATE private repo to prevent agents from modifying their own instructions.",
  },
  {
    id: "two-phase-init",
    number: 2,
    name: "Two-Phase Initialization",
    source: "save-a-stray and triple-a-lemonade sessions",
    problem: "Agents dive straight into building without verifying they understand the requirements, often building the wrong thing entirely.",
    solution: "Force the agent to verify understanding before doing any work. The agent must describe the product, list components, identify differentiators, and ask questions. Then WAIT for confirmation before proceeding.",
    keyInsight: "Research is injected separately (not all at once) to prevent context overload. The AGENT_PROMPT becomes the single source of truth for future sessions.",
  },
  {
    id: "iterative-multi-phase",
    number: 3,
    name: "Iterative Multi-Phase Development",
    source: "save-a-stray session (Prompt 11)",
    problem: "Manually managing CI pipelines and branching between development phases is tedious and error-prone.",
    solution: "Tell the agent to work through multiple development phases autonomously: monitor pipelines, fix failures, create new branches, implement features, push, create PRs, repeat.",
    keyInsight: "One prompt can drive hours of autonomous development across multiple phases. The agent self-corrects on CI failures without human intervention.",
    template: `Monitor the pipelines and if anything is broken, fix it. Then check out to a new branch from the one you're on and work on the next phase. Keep doing that for the next N phases.`,
  },
  {
    id: "mass-feature-build",
    number: 4,
    name: "Mass Feature Build (N Features, N PRs)",
    source: "gmail-organizer session (Prompt 22/31)",
    problem: "Building many features manually is slow. Each needs its own branch, PR, tests, documentation, and website updates.",
    solution: "Instruct the agent to build all N features autonomously, each on its own branch/PR, with full quality standards: no placeholders, no bugs, all pipelines passing, docs updated, website updated.",
    keyInsight: "Setting explicit quality gates in the prompt (portfolio-ready, zero bugs, all pipelines pass) produces dramatically better results than vague instructions.",
    template: `Build out all N features. Each in its own PR on its own branch. Full functionality, no placeholder code. Presentable for a portfolio project with no bugs or security issues. All pipelines must pass. Documentation, roadmaps, READMEs, architecture diagrams, and website all updated per MR.`,
  },
  {
    id: "three-pass-review",
    number: 5,
    name: "3-Pass Code Review via PR Comments",
    source: "gmail-organizer session (Prompt 34)",
    problem: "Single-pass code reviews miss issues. Reviewers develop blind spots to code they just wrote.",
    solution: "Three independent review passes: Pass 1 catches critical bugs (security, logic, crashes). Pass 2 finds secondary issues (async, edge cases). Pass 3 verifies integration (automated tests, cross-module, regression).",
    keyInsight: "Telling the agent to review 'as if you didn't write it' produces genuinely different perspectives on each pass. Fresh eyes, even simulated ones, catch real bugs.",
    template: `Do a thorough code review as if you didn't write it. Go MR by MR, posting comments, then fixing them. Audit at least three times independently. Take your time.`,
  },
  {
    id: "docs-per-mr",
    number: 6,
    name: "Documentation-Per-MR Requirements",
    source: "gmail-organizer session",
    problem: "Documentation falls behind code. By the time features ship, nobody remembers what to document.",
    solution: "Every PR must update: README.md, ARCHITECTURE.md, ROADMAP.md, Software Design Documents, website/landing page, and code comments for non-obvious logic.",
    keyInsight: "Making documentation a PR requirement (not a separate task) ensures it stays current. Agents are surprisingly good at writing technical documentation when explicitly asked.",
  },
  {
    id: "continuation-first",
    number: 7,
    name: "Continuation-First Research",
    source: "triple-a-lemonade Project Generator (Part 2)",
    problem: "When agents generate continuation prompts AFTER researching, they forget context or produce incomplete handoffs.",
    solution: "Create the continuation prompt FIRST, before researching. Structure the handoff upfront because you already know what you'll cover and what you'll defer. Then do the research. Then fill in the continuation prompt.",
    keyInsight: "This single pattern solved the most frustrating problem in multi-session AI work: context loss across rate limits and session boundaries.",
  },
  {
    id: "branch-chaining",
    number: 8,
    name: "Branch Chaining Strategy",
    source: "gmail-organizer session (Features 1-20)",
    problem: "Building 20 features sequentially means each branch needs the previous features, but branching from main means constant merge conflicts.",
    solution: "Each feature branch is based on the PREVIOUS feature branch, creating a chain. Merge one at a time into main starting from the first; each subsequent PR automatically gets a smaller diff.",
    keyInsight: "This turns a 20-feature build into a clean linear pipeline instead of a merge conflict nightmare.",
  },
  {
    id: "quality-gate",
    number: 9,
    name: "Quality Gate Prompt",
    source: "Cross-cutting from all production sessions",
    problem: "Without explicit quality criteria, agents produce inconsistent output quality.",
    solution: "Combine all quality requirements into a single reusable gate: no placeholder code, portfolio-presentable, no bugs/security issues, all pipelines pass, works end-to-end, documentation complete.",
    keyInsight: "Measurable criteria ('80% test coverage') produce better results than subjective criteria ('make it good'). Agents treat explicit standards as hard requirements.",
    template: `NEVER use: any, @ts-ignore, eslint-disable, console.log, alert(), // TODO
ALWAYS use: Proper TypeScript interfaces, error handling (try/catch), cn() for classnames, Zod for validation`,
  },
  {
    id: "context-recovery",
    number: 10,
    name: "Context Recovery / Session Continuation",
    source: "save-a-stray and gmail-organizer (auto-generated)",
    problem: "Sessions run out of context, and resuming loses all prior state, decisions, and progress.",
    solution: "Generate structured summaries including: chronological analysis, key decisions, files modified, primary intent, technical concepts, errors and fixes, all user messages, pending tasks, current work state, and recommended next step.",
    keyInsight: "Structured recovery prompts let agents resume with 90%+ context fidelity. The key is including ALL user messages (quoted) so the new session understands not just what happened, but why.",
  },
]

// ============================================
// WORKFLOW COMBINATIONS
// ============================================

export const workflowCombinations = [
  {
    name: "New Project (Full Pipeline)",
    steps: ["Project Generator Meta-Prompt", "Research Prompt (continuation-first)", "Build Prompt (two-phase init)", "Iterative Multi-Phase Development", "Mass Feature Build", "3-Pass Code Review", "Merge to main"],
  },
  {
    name: "Existing Project (Add Features)",
    steps: ["Define feature list", "Mass Feature Build", "Documentation-Per-MR", "3-Pass Code Review", "Quality Gate", "Merge"],
  },
  {
    name: "Code Review Only",
    steps: ["3-Pass Code Review prompt", "Agent posts comments on PRs", "Agent fixes issues, creates fix PR", "Final merge"],
  },
]

// ============================================
// PRODUCTION AI PROJECTS
// ============================================

export const aiProjects: AIProject[] = [
  {
    id: "research-agent",
    name: "Research Agent",
    status: "Production (65 PRs, 97.7% coverage)",
    purpose: "Crash-resilient deep research automation replacing manual browser-based research",
    innovation: "Autonomous multi-node orchestration with atomic checkpoint resumption. Prompt caching reduces tokens by 83.9%.",
    aiFeatures: ["Plan, Search, Scrape, Summarize, Synthesize pipeline", "Atomic checkpoint resumption on failures", "83.9% token reduction via prompt caching", "3-tier model routing (Fast/Smart/Strategic)", "4-level provider fallback chain"],
    stack: ["LangGraph 1.0", "FastAPI", "ChromaDB", "nomic-embed-text", "Tavily API", "SQLAlchemy 2.0"],
  },
  {
    id: "codereview-ai",
    name: "CodeReview AI",
    status: "MVP (Phase 1)",
    purpose: "Self-hostable AI code reviews with zero data retention",
    innovation: "BYOK (Bring Your Own Key) model. Users provide their own API keys; code is never retained after review.",
    aiFeatures: ["Multi-provider: OpenAI GPT-4, Claude, Gemini, Ollama", "Webhook-triggered on PR creation", "Structured JSON review comments", "Per-repo .codereview.yaml config", "AES-256-GCM key encryption"],
    stack: ["Next.js 14", "Strapi 5", "Express 5", "BullMQ", "Redis", "PostgreSQL"],
  },
  {
    id: "patent-intelligence",
    name: "Patent Intelligence",
    status: "Production (Phase 10/10)",
    purpose: "AI-powered patent research across 200M+ global patents",
    innovation: "Vector semantic search with PatentSBERTa embeddings (768-dim) stored in pgvector. White space discovery for unpatented technology gaps.",
    aiFeatures: ["PatentSBERTa embeddings + pgvector search", "AI idea generation via Claude/GPT-4", "White space analysis", "Citation network visualization", "Expiration intelligence"],
    stack: ["Python 3.11+", "FastAPI", "PostgreSQL 16", "pgvector", "Redis", "React 18", "Celery"],
  },
  {
    id: "spectree",
    name: "SpecTree (Blueprint Builder)",
    status: "Active Development",
    purpose: "Transform ideas into structured, actionable work items using AI",
    innovation: "AI generates tailored questions to refine requirements. Context propagates hierarchically from Epics to Features to User Stories to Tasks.",
    aiFeatures: ["AI-generated clarifying questions", "Hierarchical context propagation", "Multi-provider: GPT-4, Claude, Gemini", "Progressive requirement refinement", "Granularity guidelines (stories ~1 week, tasks ~1 day)"],
    stack: ["Next.js 14", "Strapi 5", "Express.js", "PostgreSQL"],
  },
  {
    id: "jarvis",
    name: "Jarvis Voice Assistant",
    status: "Advanced Development (Full Duplex)",
    purpose: "Production-grade offline voice assistant with <500ms latency",
    innovation: "Full duplex conversation via PersonaPlex AI. Simultaneous talking and listening with natural interruption support, not turn-based.",
    aiFeatures: ["Full duplex conversation (<500ms)", "Natural interruption support", "Back-channeling ('mm-hmm', 'yeah')", "3 modes: Full Duplex, Hybrid, Legacy", "Smart Home integration via Home Assistant"],
    stack: ["Swift (macOS menu bar)", "Python orchestrator", "PersonaPlex-7b-v1", "Qwen 2.5 (7b/32b/72b)", "Whisper Large", "Docker"],
  },
  {
    id: "gmail-organizer",
    name: "Gmail Organizer",
    status: "Active Development",
    purpose: "AI-powered email classification and organization",
    innovation: "9-worker parallel multi-account sync with Claude-powered classification and semantic search by meaning.",
    aiFeatures: ["Claude-powered email classification", "Semantic search by meaning", "Smart filter creation with AI", "Gmail History API for incremental updates", "9-worker parallel sync"],
    stack: ["Swift (macOS menu bar)", "Python", "Claude API", "Gmail API"],
  },
  {
    id: "voiceforge",
    name: "VoiceForge",
    status: "Production",
    purpose: "Voice cloning from 3-second audio samples",
    innovation: "100% local processing with zero cloud dependency. Voice design from text descriptions.",
    aiFeatures: ["Qwen3-TTS with PyTorch Metal GPU", "Voice cloning from 3-second samples", "Voice design from text descriptions", "6 preset voices + custom design", "10+ language support"],
    stack: ["Python", "PyTorch", "Qwen3-TTS", "Metal GPU"],
  },
  {
    id: "readforge",
    name: "ReadForge",
    status: "Production",
    purpose: "Cross-platform privacy-first text-to-speech with AI voice quality",
    innovation: "Kokoro-82M (ranked #1 on TTS Arena). Voice cloning from 10-second samples. 8 platforms, 0 cloud dependency.",
    aiFeatures: ["Kokoro-82M (#1 TTS Arena)", "Voice cloning via F5-TTS (10s samples)", "Voice design via Qwen3-TTS", "ONNX Runtime on-device", "Metal GPU acceleration"],
    stack: ["Swift", "C#", "Rust/GTK4", "ONNX Runtime", "Kokoro-82M"],
  },
  {
    id: "writeforge",
    name: "WriteForge",
    status: "Active Development",
    purpose: "Privacy-first AI-powered grammar checking",
    innovation: "Local Qwen2.5 models: 0.5B in browser via WebLLM, 1.5B on desktop via llama.cpp. No data ever leaves the device.",
    aiFeatures: ["Local Qwen2.5 (0.5B browser, 1.5B desktop)", "LanguageTool (30+ languages)", "Tone detection (formal/casual/confident)", "Cross-platform: browser + desktop"],
    stack: ["WebLLM", "llama.cpp", "Swift", "C#", "Rust/GTK4", "LanguageTool"],
  },
  {
    id: "genomeforge",
    name: "GenomeForge",
    status: "Development",
    purpose: "Privacy-first genetic analysis",
    innovation: "DNA never leaves the device. ClinVar database (341K+ variants), PharmGKB (715+ drug-gene interactions), AI genetic counselor via BYOK or Ollama.",
    aiFeatures: ["Local processing (DNA on-device only)", "ClinVar (341K+ clinical variants)", "PharmGKB (715+ drug-gene interactions)", "AI genetic counselor (BYOK/Ollama)", "AES-256-GCM encryption with PBKDF2"],
    stack: ["React", "Python", "Ollama", "ClinVar", "PharmGKB"],
  },
  {
    id: "videovault",
    name: "VideoVault",
    status: "Production",
    purpose: "Cross-platform video transcription and summarization",
    innovation: "Native macOS app combining yt-dlp, ffmpeg, whisper-cpp, and LLM summarization in a single pipeline. Downloads, transcribes, and summarizes YouTube videos locally.",
    aiFeatures: ["Whisper-cpp transcription (Metal GPU)", "LLM-powered video summarization", "Combined download/transcribe/summarize pipeline", "15-second transcription for 12-minute videos"],
    stack: ["Swift (macOS)", "Python (Windows)", "whisper-cpp", "yt-dlp", "ffmpeg"],
  },
]

// ============================================
// MULTI-LLM STRATEGY
// ============================================

export const llmProviders: LLMProvider[] = [
  { tier: "Primary", provider: "Anthropic Claude", models: "Opus, Sonnet, Haiku", useCase: "Complex reasoning, code generation, architecture" },
  { tier: "Fallback 1", provider: "OpenAI", models: "GPT-4o, GPT-4-turbo", useCase: "Cost optimization, broad compatibility" },
  { tier: "Fallback 2", provider: "Google Gemini", models: "Gemini 2.0, 1.5 Pro", useCase: "Budget tier, research assistance" },
  { tier: "Offline", provider: "Ollama (Local)", models: "Qwen 2.5 (7b-72b)", useCase: "Privacy, cost, no internet required" },
]

export const modelRoutingTiers = [
  { tier: "FAST", description: "Quick, straightforward tasks", models: "Smaller models (Haiku, GPT-4o-mini, Flash)" },
  { tier: "SMART", description: "Moderate complexity", models: "Mid-range models (Sonnet, GPT-4o)" },
  { tier: "STRATEGIC", description: "Complex reasoning", models: "Largest models (Opus, GPT-4-turbo)" },
]

export const tokenOptimizations = [
  { technique: "Prompt Caching", result: "83.9% token reduction in Research Agent" },
  { technique: "Structured Output", result: "Pydantic models prevent wasted tokens on malformed responses" },
  { technique: "Token Counting", result: "TikToken for real-time cost tracking and estimation" },
  { technique: "Context Compression", result: "Long conversations compressed to preserve key information" },
]

export const llmPipelineDiagram = `User Input
    |
API Gateway / Express Middleware
    |
Rate Limiting + Key Rotation
    |
Provider Selection (primary -> fallback chain)
    |
Prompt Template + Context Injection
    |
LLM API Call (retry + exponential backoff)
    |
Response Parsing (JSON schema validation)
    |
Result Caching + Cost Logging
    |
User Output`

// ============================================
// VOICE-FIRST AI
// ============================================

export const voiceProjects: VoiceProject[] = [
  { project: "Jarvis", technology: "PersonaPlex + Ollama + Whisper", latency: "<500ms", keyFeature: "Full duplex conversation" },
  { project: "VoiceForge", technology: "Qwen3-TTS + PyTorch Metal", latency: "Real-time", keyFeature: "Voice cloning from 3s sample" },
  { project: "ReadForge", technology: "Kokoro-82M + ONNX Runtime", latency: "Real-time", keyFeature: "#1 TTS Arena quality" },
  { project: "VideoVault", technology: "Whisper-cpp + Metal GPU", latency: "15s/12min", keyFeature: "Video transcription pipeline" },
  { project: "Voice Docs", technology: "Browser Speech API", latency: "Native", keyFeature: "Zero external dependencies" },
]

export const jarvisArchitectureDiagram = `Swift macOS Menu Bar App (Option+Space hotkey)
           |
Python Orchestrator Server (port 5001)
    |         |         |         |
PersonaPlex VoiceForge Ollama  Home Assistant
 (8998)      (8765)    (11434)  Integration`

export const jarvisOperatingModes = [
  { mode: "Full Duplex", engine: "PersonaPlex", latency: "<500ms", description: "Natural conversation with interruption support" },
  { mode: "Hybrid", engine: "PersonaPlex + Ollama", latency: "500ms-3s", description: "PersonaPlex for simple, Ollama for complex queries" },
  { mode: "Legacy", engine: "Ollama only", latency: "2-5s", description: "STT then LLM then TTS sequential pipeline" },
]

// ============================================
// PRIVACY-FIRST PHILOSOPHY
// ============================================

export const privacyProjects: PrivacyProject[] = [
  { project: "Jarvis Voice Assistant", approach: "Ollama runs 100% locally (up to 72B parameters)" },
  { project: "ReadForge", approach: "100% local TTS, text never transmitted to any server" },
  { project: "WriteForge", approach: "Local Qwen2.5 models, LanguageTool runs locally" },
  { project: "VoiceForge", approach: "Zero cloud dependency for voice cloning" },
  { project: "GenomeForge", approach: "DNA never leaves device, AES-256-GCM encryption" },
  { project: "Voice Docs", approach: "Browser Speech API, no external calls" },
  { project: "CodeReview AI", approach: "BYOK model, zero code retention after review" },
]

export const byokDescription = `Users provide their own API keys. The platform never stores, processes, or retains user data beyond the immediate operation. This is a fundamental architectural decision, not a feature toggle. When you combine BYOK with local model support (Ollama), you get a system that works from fully online to completely air-gapped, all from the same codebase.`

// ============================================
// CROSS-MACHINE WORKFLOW
// ============================================

export const machines = [
  { name: "Mac (Office)", hardware: "Apple M2 Max, 96GB RAM", bestFor: "Large models (72B), primary development" },
  { name: "Windows (Garage)", hardware: "i7-8700K, 32GB RAM, RTX 2070", bestFor: "7B-14B models, CUDA acceleration, secondary dev" },
]

export const agentSyncProtocol = [
  { file: "CONTEXT.md", purpose: "Real-time machine inventory and software status" },
  { file: "QUESTIONS.md", purpose: "Q&A between Mac and Windows agents" },
  { file: "CONVERSATION.md", purpose: "Chronological log of agent communications" },
]

export const syncWorkflow = `SESSION START:
1. git pull origin main (on all project repos)
2. Check agent-sync for cross-machine updates
3. Check global-todo for task priorities

SESSION END:
1. Update agent-sync with session results
2. Update global-todo with completed/new tasks
3. Commit and push all changes`

// ============================================
// QUALITY ENGINEERING
// ============================================

export const qualityMetrics: QualityMetric[] = [
  { metric: "Unit Tests", minimum: "80%" },
  { metric: "Integration Tests", minimum: "80%" },
  { metric: "E2E Tests", minimum: "80% of critical paths" },
  { metric: "Branch Coverage", minimum: "80%" },
  { metric: "Function Coverage", minimum: "80%" },
  { metric: "Line Coverage", minimum: "80%" },
]

export const codeStandards = [
  "No hardcoded user paths (use ~, $HOME, environment variables)",
  "No 'any' types in TypeScript (proper typing or generics)",
  "No placeholder functionality (delete commented code, don't ship stubs)",
  "Cyclomatic complexity limits (max 3 nesting levels, functions under 30-40 lines)",
  "Lookup tables instead of if-else chains",
  "Early returns instead of nested conditions",
  "Every code file has a corresponding test file",
  "CI pipeline blocks merging if any metric falls below threshold",
]

export const gitWorkflow = [
  "Never push directly to main (feature branches only)",
  "Feature branches: feature/descriptive-name or fix/descriptive-name",
  "Create PRs with gh pr create",
  "Wait for CI + code review before merge",
  "Never close PRs due to merge conflicts (resolve them instead)",
  "3-pass code review before final merge",
]

// ============================================
// AI CODING TOOLS
// ============================================

export const aiTools: AITool[] = [
  { name: "Claude Code CLI", stats: "330 sessions, 9.1 GB data, 4,050 history commands", purpose: "Primary development agent. Largest session: 1.53 GB. Peak: 15 simultaneous instances. Autonomous multi-phase builds with --dangerously-skip-permissions." },
  { name: "Gemini CLI", stats: "41 sessions, 613 MB brain data", purpose: "Portfolio-specific work (games, visual features). Built Mafia Wars recreation (245 MB session, 10 phases), portfolio rebuild (111 MB, 17 phases). Identical code standards enforced via GEMINI.md." },
  { name: "OpenAI Codex CLI", stats: "44 sessions, 248 MB, model gpt-5.2-codex", purpose: "Bulk parallel processing. Peak day: 12 sessions in one day across patent-intelligence, TreasureTrail, ChoreChamp, SpecTree, save-a-stray, ink-synthesis." },
  { name: "Cursor IDE", stats: "49 workspace roots, 2.2 GB data, AI tracking DB", purpose: "AI-native VS Code fork with full project context. MCP integration for Render deployment management." },
  { name: "GitHub Copilot Chat", stats: "5 versions installed (VS Code + Cursor)", purpose: "IDE-level code completion, inline suggestions, and chat-based assistance during manual coding." },
  { name: "ChatGPT Desktop", stats: "macOS app with 69 extensions", purpose: "Supplementary research and exploration. Conversation exports backed up to Google Drive." },
  { name: "Ollama", stats: "5 models, 187 GB+, up to 72B parameters", purpose: "Local model server for privacy-first development. Models: qwen2.5 (7B/32B/72B), dolphin-mistral:7b, qwen2.5-coder:32b." },
]

export const toolDiversificationStrategy = `Each AI tool serves a specific role in the workflow:
- Claude Code: Heavy development, orchestration, multi-phase autonomous builds
- Gemini CLI: Portfolio work, games, visual features, image generation
- Codex CLI: Bulk parallel processing of multiple projects simultaneously
- Cursor: IDE-integrated AI for targeted edits with full project context
- ChatGPT: Supplementary research and exploration
- Ollama: Privacy-first local inference, offline development capability`

export const crossAgentVerification = `A recurring methodology: give one AI's output to another AI for independent verification.
"I gave this prompt to another AI, can you go through and double check they did everything."
This creates a multi-model quality assurance loop similar to human code review, catching model-specific blind spots.`

export const claudeCodeConfig = `13 configuration files totaling ~101KB of rules and context:
- Global CLAUDE.md (22KB): Master ruleset for all projects
- Enterprise Template: 8 specialized files (50KB+)
  - Project context, workflow rules, verification rules
  - Prompt/SDD rules, testing/memories, integration
  - Render infrastructure management
- Project-specific: Jarvis (5.5KB), Dev Environment (1.7KB)
- Session hooks: auto-logging via session-logger.sh
- Memory file: Persistent learnings across sessions
- 378 shell snapshots, 915 debug logs, 842 todo directories`

// ============================================
// PRACTICAL USE CASES
// ============================================

export const useCases: UseCase[] = [
  {
    id: "youtube-transcription",
    title: "YouTube Video Transcription",
    description: "Download, convert, and transcribe YouTube videos locally using GPU acceleration. ~15 seconds for a 12-minute video on M2 Max.",
    codeSnippet: `# Download audio
yt-dlp -x --audio-format wav -o "audio.%(ext)s" "URL"
# Convert to 16kHz mono (whisper-cpp requirement)
ffmpeg -y -i audio.wav -ar 16000 -ac 1 -c:a pcm_s16le audio_16k.wav
# Transcribe with Metal GPU acceleration
whisper-cli -m ggml-small.en.bin -f audio_16k.wav -otxt`,
  },
  {
    id: "pdf-conversion",
    title: "PDF to Text for LLM Input",
    description: "Convert large PDFs to text files for uploading to Claude Desktop. Dramatically reduces file size (51MB PDF to 85KB text) while preserving content.",
    codeSnippet: `pdftotext ~/path/to/input.pdf ~/path/to/output.txt
# 51MB PDF -> 85KB text, suitable for Claude Desktop`,
  },
  {
    id: "email-classification",
    title: "AI-Powered Email Classification",
    description: "9-worker parallel system using Claude to classify emails across multiple Gmail accounts with semantic search. Uses Gmail History API for incremental updates.",
  },
  {
    id: "video-archival",
    title: "Video Archival Pipeline",
    description: "Native macOS app combining yt-dlp, ffmpeg, whisper-cpp, and LLM summarization. Downloads, transcribes, and generates summaries in a single automated pipeline.",
  },
  {
    id: "voice-home-control",
    title: "Smart Home Voice Control",
    description: "Voice commands through Jarvis control smart home devices via Home Assistant REST API. Full natural language understanding processed locally through PersonaPlex or Ollama.",
  },
  {
    id: "automated-code-review",
    title: "Automated PR Code Reviews",
    description: "Webhook-triggered code reviews on PR creation. AI analyzes diffs, generates structured comments with line references, and posts them directly to the PR. Supports 4 AI providers and 4 Git platforms.",
  },
  {
    id: "enterprise-prompts",
    title: "Production Prompt Engineering (36 Prompts)",
    description: "836KB of deployment-ready prompts from enterprise client work covering: RBAC integration, media library management, CMS operations, Docker build context, database seeding, environment verification, Sentry monitoring, package dependency verification, and calendar system design (70KB alone).",
  },
]

// ============================================
// ENTERPRISE PATTERNS
// ============================================

export const enterprisePatterns: EnterprisePattern[] = [
  {
    title: "Multi-Agent Work Tracking",
    description: "Automated epic creation and bug handling with natural language trigger detection.",
    details: [
      "Epic triggers: 'let's create new functionality', 'build [feature name]', 'start new epic'",
      "Bug triggers: 'there's a bug', 'fix this issue', 'something is broken'",
      "5-minute requirements gathering using simplified template",
      "Automated setup script creates folder structure, templates, and tracking files",
      "Token usage target: 500-800 tokens for setup (not 15,000+)",
    ],
  },
  {
    title: "Software Design Document (SDD) Automation",
    description: "AI assistants automatically create versioned SDDs before implementing features with 3+ components.",
    details: [
      "SDDs versioned with major/minor/patch increments",
      "Automatic triggers: architecture mods, DB changes, API changes, business logic updates",
      "Structured directory hierarchy per feature",
      "Includes: system overview, technical architecture, implementation details, testing strategy, deployment considerations",
    ],
  },
  {
    title: "Demo Mode Pattern",
    description: "All portfolio applications with authentication implement demo mode for showcasing without real API keys.",
    details: [
      "Marketing pages identical in both modes",
      "Demo diverges at auth: real auth vs demo role selector",
      "Middleware checks DEMO_MODE before any auth provider logic",
      "Always shows demo banner so users know they're in demo mode",
      "render.yaml sets DEMO_MODE=true for all portfolio deployments",
    ],
  },
  {
    title: "Verification Script System",
    description: "Every new feature gets an automated verification script checking completeness.",
    details: [
      "File structure verification (all required files exist)",
      "Documentation verification (all docs updated)",
      "Integration points (routes, exports, type system)",
      "Code quality (no placeholders, proper error handling, TypeScript compliance)",
      "Run at milestones: after implementation, before completion, during review, before deploy",
    ],
  },
]

// ============================================
// ADVANCED PROMPT ENGINEERING
// ============================================

export const advancedPatterns = [
  { name: "Structured JSON Output", description: "Explicit format specifications in prompts ensure parseable, consistent responses from LLMs. Every prompt specifies the exact JSON schema expected." },
  { name: "Separator Pattern", description: "Uses '=+=' to separate multiple JSON objects in a single response, preventing concatenation issues when asking for multiple structured outputs." },
  { name: "Deduplication Strategy", description: "Existing items included in prompts with instructions to avoid repeating them. Prevents LLMs from regenerating content that already exists." },
  { name: "Context Injection", description: "Dynamic variable substitution into prompt templates. Context flows from parent items (Epic context injected into Feature prompts, Feature context into Story prompts)." },
  { name: "Granularity Guidelines", description: "User Stories scoped to '~1 week of work', Tasks scoped to '~1 day of work'. Consistent sizing produces predictable AI-generated work items." },
  { name: "Multi-Step Prompt Chains", description: "Sequential prompt chains where each level builds on previous outputs: Epic, then Feature, then User Story, then Task. Progressive refinement at each level." },
]

// ============================================
// FORBIDDEN PATTERNS (Zero-Tolerance Code Standards)
// ============================================

export interface ForbiddenPattern {
  category: string
  severity: string
  patterns: string[]
  detection: string
}

export const forbiddenPatterns: ForbiddenPattern[] = [
  {
    category: "TypeScript Violations",
    severity: "CRITICAL",
    patterns: ["any", "as any", "@ts-ignore", "@ts-expect-error", "@ts-nocheck", "Function", "Object", "{} as type", "React.FC<{}>", "Promise<any>", "useState() without type"],
    detection: "grep -rn \":s*any\" --include=\"*.ts\" --include=\"*.tsx\" src/",
  },
  {
    category: "ESLint Violations",
    severity: "CRITICAL",
    patterns: ["eslint-disable", "eslint-disable-next-line", "eslint-disable-line"],
    detection: "grep -rn \"eslint-disable\" --include=\"*.ts\" --include=\"*.tsx\" src/",
  },
  {
    category: "Console Violations",
    severity: "HIGH",
    patterns: ["console.log()", "console.error()", "console.warn()", "console.info()"],
    detection: "grep -rn \"console\\.\" --include=\"*.ts\" --include=\"*.tsx\" src/",
  },
  {
    category: "Empty Implementations",
    severity: "HIGH",
    patterns: ["onClick={() => {}}", "onSubmit={() => {}}", "catch(e) {} (swallowed errors)"],
    detection: "grep -rn \"catch.*{}\" --include=\"*.ts\" --include=\"*.tsx\" src/",
  },
  {
    category: "Comment Violations",
    severity: "MEDIUM",
    patterns: ["TODO: without ticket", "FIXME: without ticket", "HACK:", "PLACEHOLDER", "// AI generated this"],
    detection: "grep -rn \"TODO\\|FIXME\\|HACK\\|PLACEHOLDER\" src/",
  },
  {
    category: "Git Violations",
    severity: "CRITICAL",
    patterns: ["Push to main directly", "--force push", "--amend on pushed commits", "Co-Authored-By: Claude", "Generated with Claude Code"],
    detection: "Branch protection rules + CI pipeline enforcement",
  },
]

export const forbiddenPatternsDescription = `A zero-tolerance enforcement system across all 77+ projects. Automated detection via detect_violations.sh with severity levels (CRITICAL/HIGH/MEDIUM). CI pipeline blocks merging if any CRITICAL violation is detected. 185KB TypeScript Strict Mode Checklist with 1,200+ type safety checkboxes ensures comprehensive coverage.`

// ============================================
// 8-STEP DEVELOPMENT LIFECYCLE
// ============================================

export interface LifecycleStep {
  step: number
  name: string
  tool: string
  output: string
  description: string
}

export const developmentLifecycle: LifecycleStep[] = [
  { step: 1, name: "Generate Prompts", tool: "Claude Code CLI", output: "RESEARCH_PROMPT.md, BUILD_PROMPT.md", description: "Master meta-prompt generates all sub-prompts needed for the project" },
  { step: 2, name: "Research", tool: "Claude.ai (Web)", output: "Session outputs (multi-session)", description: "Competitive intelligence via web search. Continuation-first approach ensures context preservation." },
  { step: 3, name: "Compile Research", tool: "Claude.ai or CLI", output: "COMPILED_RESEARCH.md", description: "Combine all sessions into single document with gap analysis and deduplication" },
  { step: 4, name: "Build Project", tool: "Claude Code CLI", output: "Project scaffold, ROADMAP.md, SDDs", description: "Two-phase initialization: verify understanding, then scaffold. Creates AGENT_PROMPT.md." },
  { step: 5, name: "Iterative Development", tool: "Claude Code CLI", output: "Feature branches, PRs", description: "Mass feature builds with branch chaining. Each feature on its own branch/PR." },
  { step: 6, name: "3-Pass Code Review", tool: "Claude Code CLI", output: "Review comments, fix PRs", description: "Pass 1: Critical bugs/security. Pass 2: Edge cases/async. Pass 3: Integration/regression." },
  { step: 7, name: "Quality Gate", tool: "Claude Code CLI", output: "Verification report", description: "No placeholders, portfolio-presentable, 80%+ coverage, all pipelines pass, docs complete." },
  { step: 8, name: "Merge & Deploy", tool: "Claude Code CLI", output: "Production deployment", description: "Merge PRs, deploy to Render/Vercel/AWS. Demo mode enabled for portfolio showcase." },
]

// ============================================
// MULTI-AGENT ORCHESTRATION
// ============================================

export const multiAgentSystem = `4 concurrent AI agent work slots (A, B, C, D) with atomic directory-based locking.
Agents claim slots before starting work. Conflict detection prevents overwrites.
Append-only commit logs create an audit trail. Setup automated to ~5 seconds via shell scripts.

Architecture:
- epic-setup.sh: Creates folder structure, templates, tracking files in seconds
- bug-setup.sh: Automated bug handling with coordination templates
- smart-dispatcher.sh: Routes tasks to available agent slots
- agent-helpers.sh: Shared utilities for all agents
- Heartbeat monitoring: Detects stalled agents and reclaims slots`

export const multiAgentWorkSlots = [
  { slot: "A", status: "Primary", description: "Main development work, feature implementation" },
  { slot: "B", status: "Secondary", description: "Parallel feature work, independent tasks" },
  { slot: "C", status: "Support", description: "Documentation, testing, review tasks" },
  { slot: "D", status: "Reserve", description: "Bug fixes, hotfixes, overflow tasks" },
]

// ============================================
// MARKET RESEARCH & VALIDATION
// ============================================

export interface MarketResearch {
  project: string
  market: string
  keyInsight: string
  pricing: string
  differentiator: string
}

export const marketResearchReports: MarketResearch[] = [
  { project: "RapidBooth", market: "SMB Website Builder", keyInsight: "No competitor combines field sales + AI intake + 30-minute delivery", pricing: "$30/month (40-67% gross margin)", differentiator: "In-person sales + conversational AI + instant delivery" },
  { project: "Patent Intelligence", market: "$1-2B Patent Analytics", keyInsight: "EPO released free patent data; incumbents charge $20K-100K+/yr", pricing: "$49-299/month tiered", differentiator: "Semantic search across 200M+ patents at 1/100th the cost" },
  { project: "Baked by Chrissy", market: "$3.2B Home Baker Gap", keyInsight: "Bakers use 4-6 disconnected programs per order; 39.5% unsure if profitable", pricing: "$15-25/month", differentiator: "Image upload in ordering flow (no competitor offers this)" },
  { project: "ChoreChamp", market: "$542M Parenting Apps", keyInsight: "7-day streak = 3.6x retention; kids lose interest in 2-4 weeks with competitors", pricing: "$9.99/month or $59.99/year", differentiator: "First neurodivergent-friendly family chore app" },
  { project: "GenomeForge", market: "Genetic Analysis (23andMe bankruptcy)", keyInsight: "23andMe bankruptcy + 6.9M data breach creating privacy anxiety", pricing: "$29-49 one-time", differentiator: "DNA never leaves user's device (architecturally impossible for competitors)" },
  { project: "ReadForge", market: "$2B+ TTS Market", keyInsight: "Speechify charges $139/yr with 150K word limit; reverts to robotic voices", pricing: "Freemium", differentiator: "Kokoro-82M ranked #1 on TTS Arena, runs 100% locally" },
  { project: "WriteForge", market: "$3B+ Writing Assistant", keyInsight: "Privacy is #1 complaint about Grammarly (described as 'essentially a keylogger')", pricing: "Freemium", differentiator: "100% local processing, BYOK AI, system-wide access" },
  { project: "TreasureTrail", market: "$2-4B Estate/Yard Sales", keyInsight: "EstateSales.NET acquired for $40M (2023); 60-70% of buyers are resellers", pricing: "$49/month B2B", differentiator: "VROOM route optimization (no competitors have this)" },
  { project: "Rave Collective", market: "$2.3B Festival Fashion (8.4% CAGR)", keyInsight: "Etsy exodus: active sellers dropped 27%, fees at 20-25%", pricing: "10% platform fee (50-60% lower than Etsy)", differentiator: "UV/blacklight preview (industry-first in any e-commerce)" },
  { project: "Learning Hall", market: "$28.6B LMS (20% CAGR)", keyInsight: "Teachable stores in 'unique format that can't be opened by any other software'", pricing: "Competitive with Teachable ($29-139/mo)", differentiator: "BYOS (Bring Your Own Storage) is a genuine market gap" },
  { project: "Research Agent", market: "AI Research Tools", keyInsight: "83.9% of context tokens in agent loops come from tool observations", pricing: "$0.06-0.15/session (96-97% cost reduction vs naive)", differentiator: "Crash-resilient, locally-run deep research with checkpoint resumption" },
]

// ============================================
// CAREER CONTEXT
// ============================================

export interface CareerEntry {
  period: string
  role: string
  company: string
  highlights: string[]
}

export const careerTimeline: CareerEntry[] = [
  { period: "Early", role: "Entrepreneur", company: "Various Ventures", highlights: ["Lawn care, snow removal, door-to-door sales", "Real estate: bought first properties before having a driver's license", "Phones For Fast Cash: 500+ device repairs over 4 years", "Flying Colors Paintball: business acquisition and operations"] },
  { period: "2019", role: "Teaching Assistant", company: "Lake Land College", highlights: ["Tutored HTML, CSS, JavaScript, Python", "Comfort Order vision born (Thanksgiving 2019)"] },
  { period: "2020", role: "App Academy Graduate", company: "App Academy", highlights: ["<3% acceptance rate, 60-80 hour weeks", "Full-stack web development intensive"] },
  { period: "2020-2022", role: "Full-Stack Engineer", company: "Charter Communications", highlights: ["Built POC generating production-grade code from user interactions", "Enterprise-scale development experience"] },
  { period: "2021-2024", role: "Co-Founder & Principal Engineer", company: "Tailored Technologies", highlights: ["Golf industry client work (PGA, SMC)", "36 production prompts (836KB) forged under real production pressure", "15 Strapi plugins, 7+ independent contractor agreements", "19 weekly PGA status reports, 421 meeting recordings"] },
  { period: "2022-2023", role: "Enterprise Engineer", company: "First American", highlights: ["Enterprise microservices, AWS serverless"] },
  { period: "2023", role: "Senior Developer", company: "Mesirow Financial", highlights: ["Wealth management modernization", "30% performance improvement"] },
  { period: "2024-2026", role: "Senior Software Engineer", company: "BrainGu", highlights: ["DoD applications for Space Force, Air Force, Navy", "5 DoD applications with secure AI integration"] },
]

// ============================================
// SDD-FIRST DEVELOPMENT
// ============================================

export const sddFirstDescription = `Software Design Documents (SDDs) are created BEFORE writing any code. This is enforced through automatic triggers.`

export const sddTriggers = [
  "New features with 3+ components or files",
  "Complex functionality requiring database changes",
  "API integrations or new endpoints",
  "Multi-step workflows or business processes",
  "Reusable systems or shared libraries",
  "User interfaces with multiple views or states",
]

export const sddNoPLaceholders = `"TBD", "See implementation for details", empty sections, "Details to follow", and incomplete tables are NEVER acceptable in SDDs. Every section must be filled with actionable, specific content before implementation begins.`

// ============================================
// QUALITY CHECKLISTS
// ============================================

export const qualityChecklists = [
  { name: "PRE_COMMIT", purpose: "Run before every commit. Checks file size (<300 lines), forbidden patterns, type safety." },
  { name: "PRE_MR", purpose: "Run before creating a merge/pull request. Validates documentation, test coverage, code standards." },
  { name: "CODE_REVIEW", purpose: "3-pass review checklist. Critical bugs, edge cases, then integration verification." },
  { name: "DOCUMENTATION", purpose: "Ensures README, ARCHITECTURE, ROADMAP, and SDDs are all current." },
  { name: "AI_WORK_VALIDATION", purpose: "Validates AI-generated code meets all human-authored standards." },
  { name: "MIGRATION", purpose: "Checklist for database migrations, API changes, and breaking changes." },
]

// ============================================
// DOCUMENT HIERARCHY
// ============================================

export const documentHierarchy = [
  { level: 1, name: "~/.claude/CLAUDE.md", description: "Global rules: git workflow, forbidden patterns, testing requirements, service naming, demo mode" },
  { level: 2, name: "AI_DEV_DOCS_MASTER/", description: "Consolidated reference library. 159 source files compressed to 23 outputs (92% compression ratio)" },
  { level: 3, name: "_@agent-prompts/", description: "Meta-prompt system: PROJECT_GENERATOR, PROMPTS_REFERENCE, WORKFLOW_GUIDE, START_HERE_TEMPLATE, 8 knowledge base docs" },
  { level: 4, name: "Project-Workflow-Prompts/", description: "Individual step files (Step 1 through Step 8 of the development lifecycle)" },
  { level: 5, name: "Per-project .claude/", description: "Project-specific rules (enterprise-template-system has 8 specialized files)" },
  { level: 6, name: "Per-project CLAUDE.md", description: "Project-level overrides (Jarvis, dev-environment-setup)" },
  { level: 7, name: "Per-project docs/", description: "ARCHITECTURE.md, ROADMAP.md, sdd/ directories found across 35+ projects" },
]

// ============================================
// GOOGLE DRIVE ARCHIVE
// ============================================

export const googleDriveStats = {
  totalItems: "702,165",
  totalSize: "626.71 GB",
  emailsExported: "63,316 RFC822 files (~4.68 GB) from 10+ accounts",
  meetingRecordings: "421 recordings (91.01 GB)",
  transcriptions: "46 VTT transcription files",
  backupArchives: "ran.zip (156.81 GB), Personal projects.zip (22.19 GB)",
  allAiWork: "40,408 items, 836 MB of AI development artifacts",
}

// ============================================
// LESSONS LEARNED
// ============================================

export const lessonsLearned: Lesson[] = [
  {
    number: 1,
    title: "Separation of Concerns is Critical",
    insight: "Prompts stored separately from project code prevents agents from modifying their own instructions. This was discovered through painful experience and is now a foundational principle of the entire system.",
  },
  {
    number: 2,
    title: "Continuation-First Approach Solves Context Loss",
    insight: "Creating handoff prompts BEFORE doing research ensures context is preserved across rate limits and session boundaries. Doing it afterward consistently leads to incomplete handoffs and lost knowledge.",
  },
  {
    number: 3,
    title: "Multi-LLM Fallback is Essential for Production",
    insight: "No single LLM provider has 100% uptime or handles all tasks optimally. Primary/fallback chains with graceful degradation ensure your system keeps working regardless of any single provider's status.",
  },
  {
    number: 4,
    title: "Quality Gates Must Be Automated and Non-Negotiable",
    insight: "80% coverage thresholds, mandatory test files, CI pipeline blocks, and 3-pass code reviews prevent technical debt from accumulating. When quality is optional, it disappears under deadline pressure.",
  },
  {
    number: 5,
    title: "Voice is the Next Interface Paradigm",
    insight: "Full duplex conversation with <500ms latency fundamentally changes how humans interact with AI. Turn-based chat is useful but limiting. Natural conversation with interruption support feels like a completely different technology.",
  },
  {
    number: 6,
    title: "Privacy is a Feature, Not a Constraint",
    insight: "Local-first, BYOK architectures are competitive advantages, not compromises. Users increasingly want tools that keep their data on their devices. Building for privacy from day one is easier than retrofitting it later.",
  },
  {
    number: 7,
    title: "Agents Work Best with Explicit, Measurable Criteria",
    insight: "Vague instructions produce vague results. 'Make it good' fails; '80% test coverage, all pipelines passing, documentation updated, portfolio-presentable' succeeds. The more specific the prompt, the better the output.",
  },
  {
    number: 8,
    title: "Knowledge Preservation is a System, Not an Afterthought",
    insight: "273 sessions consolidated, 738 todos tracked, structured WORK_LOG files, and auto-generated context recovery prompts. Knowledge preservation must be built into the workflow, not bolted on after the fact.",
  },
  {
    number: 9,
    title: "Meta-Prompts Compound Value Exponentially",
    insight: "A prompt that generates other prompts (meta-prompt) pays dividends across every project it touches. The 95KB PROJECT_GENERATOR_PROMPT has been used to bootstrap 77+ projects, each with consistent quality and structure.",
  },
  {
    number: 10,
    title: "Human-in-the-Loop is the Sweet Spot",
    insight: "Fully autonomous AI development isn't the goal. Human judgment at key decision points (architecture, feature prioritization, design trade-offs) combined with AI execution of well-defined tasks produces the best results. The ecosystem is designed for augmentation, not replacement.",
  },
]
