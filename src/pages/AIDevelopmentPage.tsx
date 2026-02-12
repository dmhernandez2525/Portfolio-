import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import {
  ArrowLeft, Brain, Bot, Shield, Mic, Terminal, Layers, Sparkles,
  ChevronDown, ChevronRight, Code2, Zap, BookOpen, Wrench,
  GitBranch, CheckCircle, Monitor, Lightbulb, ArrowRight, Lock,
  Server, RotateCw, TrendingUp, Users, Ban, Briefcase,
  FileText, HardDrive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  aiStats,
  journeyTimeline,
  ecosystemDescription,
  ecosystemLayers,
  qualityTriangle,
  nonprofitStrategy,
  agentPromptSystemDescription,
  agentPromptWorkflow,
  metaPrompts,
  projectStructure,
  promptPatterns,
  workflowCombinations,
  aiProjects,
  llmProviders,
  modelRoutingTiers,
  tokenOptimizations,
  llmPipelineDiagram,
  voiceProjects,
  jarvisArchitectureDiagram,
  jarvisOperatingModes,
  privacyProjects,
  byokDescription,
  machines,
  agentSyncProtocol,
  syncWorkflow,
  qualityMetrics,
  codeStandards,
  gitWorkflow,
  aiTools,
  claudeCodeConfig,
  useCases,
  enterprisePatterns,
  advancedPatterns,
  lessonsLearned,
  forbiddenPatterns,
  forbiddenPatternsDescription,
  developmentLifecycle,
  multiAgentSystem,
  multiAgentWorkSlots,
  marketResearchReports,
  careerTimeline,
  sddFirstDescription,
  sddTriggers,
  sddNoPLaceholders,
  qualityChecklists,
  documentHierarchy,
  googleDriveStats,
  toolDiversificationStrategy,
  crossAgentVerification,
} from "@/data/ai-development"

// ============================================
// Reusable Sub-Components
// ============================================

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  id,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  defaultOpen?: boolean
  id: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="mb-8"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all text-left group"
      >
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold flex-1">{title}</h2>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 md:p-8 border border-t-0 border-border/50 rounded-b-xl bg-card/30 backdrop-blur-sm">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-border/50 my-4">
      {title && (
        <div className="px-4 py-2 bg-muted/50 border-b border-border/50 text-xs font-mono text-muted-foreground">
          {title}
        </div>
      )}
      <pre className="p-4 bg-background/80 overflow-x-auto text-sm font-mono leading-relaxed text-muted-foreground">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 my-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-foreground border-b border-border/50">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
      <div className="text-2xl md:text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm font-medium text-foreground mt-1">{label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
    </div>
  )
}

// ============================================
// Table of Contents
// ============================================

const tocSections = [
  { id: "journey", label: "The Journey", icon: BookOpen },
  { id: "career", label: "Career Context", icon: Briefcase },
  { id: "ecosystem", label: "The Ecosystem", icon: Layers },
  { id: "agent-prompts", label: "Agent Prompt System", icon: Terminal },
  { id: "lifecycle", label: "Development Lifecycle", icon: RotateCw },
  { id: "prompt-patterns", label: "10 Prompt Patterns", icon: Code2 },
  { id: "ai-projects", label: "11 AI Products", icon: Sparkles },
  { id: "market-research", label: "Market Research", icon: TrendingUp },
  { id: "multi-llm", label: "Multi-LLM Strategy", icon: Bot },
  { id: "voice-first", label: "Voice-First AI", icon: Mic },
  { id: "privacy-first", label: "Privacy-First", icon: Shield },
  { id: "cross-machine", label: "Cross-Machine Workflow", icon: Monitor },
  { id: "multi-agent", label: "Multi-Agent Orchestration", icon: Users },
  { id: "quality", label: "Quality Engineering", icon: CheckCircle },
  { id: "forbidden", label: "Forbidden Patterns", icon: Ban },
  { id: "doc-hierarchy", label: "Document Hierarchy", icon: FileText },
  { id: "tools", label: "AI Coding Tools", icon: Wrench },
  { id: "use-cases", label: "Practical Use Cases", icon: Zap },
  { id: "enterprise", label: "Enterprise Patterns", icon: Server },
  { id: "lessons", label: "Lessons Learned", icon: Lightbulb },
]

// ============================================
// Main Page Component
// ============================================

export function AIDevelopmentPage() {
  const [tocOpen, setTocOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-20">
        <div className="container max-w-5xl">
          {/* Back Button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </motion.div>

          {/* Page Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1">
              <Brain className="h-3.5 w-3.5" />
              Comprehensive Deep Dive
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI & LLM Development
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              20+ months of building a production-grade, AI-augmented development pipeline.
              77+ projects, 11 shipped AI products, 10 reusable prompt patterns,
              and the complete system behind it all.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12"
          >
            {aiStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </motion.div>

          {/* Table of Contents (collapsible on mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="md:hidden w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <span className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Table of Contents
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${tocOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`${tocOpen ? "block" : "hidden"} md:block`}>
              <div className="p-4 md:p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm md:mt-0 mt-1">
                <h3 className="hidden md:block font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Contents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {tocSections.map((section) => {
                    const Icon = section.icon
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                        onClick={() => setTocOpen(false)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {section.label}
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* SECTION: Journey Timeline */}
          {/* ============================================ */}
          <CollapsibleSection title="The Journey" icon={BookOpen} id="journey" defaultOpen={true}>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              From a Thanksgiving 2019 vision to democratize technology for small businesses,
              through enterprise client work that forged production patterns,
              to a complete AI-augmented development ecosystem managing 77+ projects.
            </p>
            <div className="relative">
              <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-border/50" />
              {journeyTimeline.map((entry, i) => (
                <div key={i} className="relative pl-12 md:pl-16 pb-8 last:pb-0">
                  <div className={`absolute left-2 md:left-4 w-4 h-4 rounded-full border-2 ${
                    entry.milestone
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                  }`} />
                  <div className="text-sm font-mono text-primary mb-1">{entry.year}</div>
                  <h3 className="text-lg font-bold mb-1">{entry.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{entry.description}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Career Context */}
          {/* ============================================ */}
          <CollapsibleSection title="Career Context" icon={Briefcase} id="career">
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The AI development expertise didn't emerge in isolation. It was built on a foundation of
              entrepreneurship, enterprise engineering, and production-pressure client work.
            </p>

            <div className="space-y-4">
              {careerTimeline.map((entry, i) => (
                <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="font-mono text-xs shrink-0">{entry.period}</Badge>
                    <div>
                      <span className="font-bold">{entry.role}</span>
                      <span className="text-muted-foreground"> at {entry.company}</span>
                    </div>
                  </div>
                  <ul className="space-y-1 ml-1">
                    {entry.highlights.map((highlight, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: The Ecosystem */}
          {/* ============================================ */}
          <CollapsibleSection title="The 'Apps That Build Apps' Ecosystem" icon={Layers} id="ecosystem" defaultOpen={true}>
            <p className="text-muted-foreground mb-6 leading-relaxed">{ecosystemDescription}</p>

            <h3 className="text-lg font-bold mb-4">5-Layer Architecture</h3>
            <div className="space-y-3 mb-8">
              {ecosystemLayers.map((layer, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <Badge variant="outline" className="shrink-0 font-mono text-xs">
                    {layer.layer}
                  </Badge>
                  <div className="flex-1">
                    <span className="font-semibold">{layer.name}</span>
                    <span className="text-muted-foreground"> ({layer.tool})</span>
                    <div className="text-sm text-muted-foreground mt-0.5">{layer.flow}</div>
                  </div>
                  {i < ecosystemLayers.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 hidden md:block" />
                  )}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <h4 className="font-semibold mb-2">The Quality Triangle</h4>
                <p className="text-sm text-muted-foreground">{qualityTriangle}</p>
              </div>
              <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                <h4 className="font-semibold mb-2">Nonprofit Pairing Strategy</h4>
                <p className="text-sm text-muted-foreground">{nonprofitStrategy}</p>
              </div>
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Agent Prompt System */}
          {/* ============================================ */}
          <CollapsibleSection title="The Agent Prompt System" icon={Terminal} id="agent-prompts">
            <p className="text-muted-foreground mb-6 leading-relaxed">{agentPromptSystemDescription}</p>

            <h3 className="text-lg font-bold mb-3">Workflow Architecture</h3>
            <CodeBlock code={agentPromptWorkflow} title="Research → Compile → Build → Develop" />

            <h3 className="text-lg font-bold mb-3 mt-8">4 Meta-Prompts (Prompts That Generate Other Prompts)</h3>
            <div className="space-y-3 mb-8">
              {metaPrompts.map((mp, i) => (
                <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-primary">{mp.name}</span>
                    <Badge variant="outline" className="text-xs">{mp.size}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{mp.description}</p>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold mb-3">Per-Project Structure</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Every one of the 77+ projects gets this consistent, version-controlled structure:
            </p>
            <CodeBlock code={projectStructure} title="Standard Project Prompt Directory" />

            <div className="mt-6 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
              <h4 className="font-semibold mb-2">Key Innovation: Self-Continuing Research</h4>
              <p className="text-sm text-muted-foreground">
                Research prompts include EXECUTION MODE headers forcing agents to execute without asking questions.
                Each session generates a NEXT SESSION PROMPT for automatic continuation across rate limits and context windows.
                This eliminates the most common failure mode in multi-session AI work: context loss.
              </p>
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: 8-Step Development Lifecycle */}
          {/* ============================================ */}
          <CollapsibleSection title="8-Step Development Lifecycle" icon={RotateCw} id="lifecycle">
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Every project follows this standardized pipeline from idea to deployment.
              Each step has a dedicated tool, a defined output, and a clear handoff to the next step.
            </p>

            <div className="space-y-3">
              {developmentLifecycle.map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-muted/10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold">{step.name}</span>
                      <Badge variant="outline" className="text-xs">{step.tool}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    <div className="text-xs text-muted-foreground/70 mt-1 font-mono">Output: {step.output}</div>
                  </div>
                  {i < developmentLifecycle.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-3 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: 10 Prompt Patterns */}
          {/* ============================================ */}
          <CollapsibleSection title="10 Battle-Tested Prompt Patterns" icon={Code2} id="prompt-patterns">
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Extracted from production sessions across save-a-stray, gmail-organizer, and triple-a-lemonade.
              Each pattern has been refined through real-world use and failure.
            </p>

            <div className="space-y-4">
              {promptPatterns.map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>

            <h3 className="text-lg font-bold mt-10 mb-4">Workflow Combinations</h3>
            <div className="space-y-4">
              {workflowCombinations.map((wf, i) => (
                <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <h4 className="font-semibold mb-2">{wf.name}</h4>
                  <div className="flex flex-wrap items-center gap-1">
                    {wf.steps.map((step, j) => (
                      <span key={j} className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">{step}</Badge>
                        {j < wf.steps.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: 11 AI Products */}
          {/* ============================================ */}
          <CollapsibleSection title="11 Production AI Products" icon={Sparkles} id="ai-projects">
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Not experiments or demos. These are shipped, working applications with real users, real test coverage, and real engineering standards.
            </p>

            <div className="space-y-4">
              {aiProjects.map((project) => (
                <AIProjectCard key={project.id} project={project} />
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Market Research & Validation */}
          {/* ============================================ */}
          <CollapsibleSection title="Market Research & Validation" icon={TrendingUp} id="market-research">
            <p className="text-muted-foreground mb-6 leading-relaxed">
              11 full competitive intelligence reports with validated unit economics, pricing models,
              and market gap analysis. Each project is backed by real research, not assumptions.
            </p>

            <div className="space-y-3">
              {marketResearchReports.map((report, i) => (
                <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold">{report.project}</span>
                    <Badge variant="outline" className="text-xs">{report.market}</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">Key Insight</span>
                      <p className="text-muted-foreground mt-0.5">{report.keyInsight}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Pricing</span>
                      <p className="text-muted-foreground mt-0.5">{report.pricing}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Differentiator</span>
                      <p className="text-muted-foreground mt-0.5">{report.differentiator}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Multi-LLM Strategy */}
          {/* ============================================ */}
          <CollapsibleSection title="Multi-LLM Strategy & Architecture" icon={Bot} id="multi-llm">
            <h3 className="text-lg font-bold mb-3">Provider Hierarchy</h3>
            <DataTable
              headers={["Tier", "Provider", "Models", "Use Case"]}
              rows={llmProviders.map(p => [p.tier, p.provider, p.models, p.useCase])}
            />

            <h3 className="text-lg font-bold mt-8 mb-3">Smart Model Routing</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Three-tier routing with graceful degradation across 4 fallback levels.
              If the primary provider fails, the system automatically falls through to the next tier.
            </p>
            <DataTable
              headers={["Tier", "Description", "Models Used"]}
              rows={modelRoutingTiers.map(t => [t.tier, t.description, t.models])}
            />

            <h3 className="text-lg font-bold mt-8 mb-3">Token Optimization</h3>
            <DataTable
              headers={["Technique", "Result"]}
              rows={tokenOptimizations.map(t => [t.technique, t.result])}
            />

            <h3 className="text-lg font-bold mt-8 mb-3">Integration Pipeline</h3>
            <CodeBlock code={llmPipelineDiagram} title="LLM Integration Architecture" />
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Voice-First AI */}
          {/* ============================================ */}
          <CollapsibleSection title="Voice-First AI Development" icon={Mic} id="voice-first">
            <p className="text-muted-foreground mb-6 leading-relaxed">
              A consistent theme across the portfolio: voice as a primary interface.
              Full duplex conversation at under 500ms latency is a fundamentally different experience from turn-based chat.
            </p>

            <DataTable
              headers={["Project", "Technology", "Latency", "Key Feature"]}
              rows={voiceProjects.map(v => [v.project, v.technology, v.latency, v.keyFeature])}
            />

            <h3 className="text-lg font-bold mt-8 mb-3">Jarvis Full Duplex Architecture</h3>
            <CodeBlock code={jarvisArchitectureDiagram} title="Jarvis Voice Assistant Architecture" />

            <h3 className="text-lg font-bold mt-6 mb-3">Three Operating Modes</h3>
            <DataTable
              headers={["Mode", "Engine", "Latency", "Description"]}
              rows={jarvisOperatingModes.map(m => [m.mode, m.engine, m.latency, m.description])}
            />

            <div className="mt-6 p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
              <h4 className="font-semibold mb-2">Full Duplex: What Makes It Different</h4>
              <p className="text-sm text-muted-foreground">
                PersonaPlex AI enables simultaneous talking and listening. This means natural interruption support
                (you can cut in mid-sentence), back-channeling ("mm-hmm", "yeah" while the other is talking),
                and conversation that feels like talking to another person rather than issuing commands to a machine.
              </p>
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Privacy-First */}
          {/* ============================================ */}
          <CollapsibleSection title="Privacy-First Architecture" icon={Shield} id="privacy-first">
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Where possible, processing stays local. No data leaves the user's device.
              This is a consistent architectural principle, not a feature toggle.
            </p>

            <DataTable
              headers={["Project", "Privacy Approach"]}
              rows={privacyProjects.map(p => [p.project, p.approach])}
            />

            <div className="mt-6 p-4 rounded-lg border border-green-500/30 bg-green-500/5">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-green-400" />
                BYOK (Bring Your Own Key) Pattern
              </h4>
              <p className="text-sm text-muted-foreground">{byokDescription}</p>
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Cross-Machine Workflow */}
          {/* ============================================ */}
          <CollapsibleSection title="Cross-Machine Agent Workflow" icon={Monitor} id="cross-machine">
            <h3 className="text-lg font-bold mb-3">Two-Machine Setup</h3>
            <DataTable
              headers={["Machine", "Hardware", "Best For"]}
              rows={machines.map(m => [m.name, m.hardware, m.bestFor])}
            />

            <h3 className="text-lg font-bold mt-8 mb-3">agent-sync Repository</h3>
            <p className="text-sm text-muted-foreground mb-3">
              A git-based communication channel between AI agents on different machines.
              Agents read context at session start, update during work, and push at session end.
            </p>
            <DataTable
              headers={["File", "Purpose"]}
              rows={agentSyncProtocol.map(a => [a.file, a.purpose])}
            />

            <h3 className="text-lg font-bold mt-8 mb-3">Sync Protocol</h3>
            <CodeBlock code={syncWorkflow} title="Multi-Machine Session Workflow" />
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Multi-Agent Orchestration */}
          {/* ============================================ */}
          <CollapsibleSection title="Multi-Agent Orchestration" icon={Users} id="multi-agent">
            <p className="text-muted-foreground mb-6 leading-relaxed whitespace-pre-line">{multiAgentSystem}</p>

            <h3 className="text-lg font-bold mb-3">4 Concurrent Work Slots</h3>
            <DataTable
              headers={["Slot", "Status", "Description"]}
              rows={multiAgentWorkSlots.map(s => [s.slot, s.status, s.description])}
            />

            <div className="mt-6 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
              <h4 className="font-semibold mb-2">Cross-Agent Verification</h4>
              <p className="text-sm text-muted-foreground">{crossAgentVerification}</p>
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Quality Engineering */}
          {/* ============================================ */}
          <CollapsibleSection title="Quality Engineering Standards" icon={CheckCircle} id="quality">
            <h3 className="text-lg font-bold mb-3">Mandatory Coverage Thresholds</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Non-negotiable. CI pipeline blocks merging if any metric falls below threshold.
            </p>
            <DataTable
              headers={["Metric", "Minimum Required"]}
              rows={qualityMetrics.map(q => [q.metric, q.minimum])}
            />

            <h3 className="text-lg font-bold mt-8 mb-3">Code Standards</h3>
            <ul className="space-y-2 mb-8">
              {codeStandards.map((standard, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  {standard}
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-bold mt-8 mb-3">Git Workflow</h3>
            <ul className="space-y-2 mb-8">
              {gitWorkflow.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <GitBranch className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  {rule}
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-bold mt-8 mb-3">6 Quality Checklists</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {qualityChecklists.map((checklist, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/30 bg-muted/10">
                  <span className="font-mono text-sm font-bold text-primary">{checklist.name}</span>
                  <p className="text-xs text-muted-foreground mt-1">{checklist.purpose}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Forbidden Patterns */}
          {/* ============================================ */}
          <CollapsibleSection title="Forbidden Patterns & Zero-Tolerance Standards" icon={Ban} id="forbidden">
            <p className="text-muted-foreground mb-6 leading-relaxed">{forbiddenPatternsDescription}</p>

            <div className="space-y-4">
              {forbiddenPatterns.map((fp, i) => (
                <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">{fp.category}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        fp.severity === "CRITICAL" ? "border-red-500/50 text-red-400" :
                        fp.severity === "HIGH" ? "border-orange-500/50 text-orange-400" :
                        "border-yellow-500/50 text-yellow-400"
                      }`}
                    >
                      {fp.severity}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {fp.patterns.map((pattern, j) => (
                      <code key={j} className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-300 font-mono">{pattern}</code>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">Detection: {fp.detection}</div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Document Hierarchy */}
          {/* ============================================ */}
          <CollapsibleSection title="Document Hierarchy & Configuration" icon={FileText} id="doc-hierarchy">
            <p className="text-muted-foreground mb-6 leading-relaxed">
              A 7-layer documentation system ensures consistent rules, from global standards
              down to per-project specifics. Higher layers override lower ones.
            </p>

            <div className="space-y-3 mb-8">
              {documentHierarchy.map((doc, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <Badge variant="outline" className="shrink-0 font-mono text-xs">L{doc.level}</Badge>
                  <div>
                    <span className="font-mono text-sm font-semibold">{doc.name}</span>
                    <p className="text-sm text-muted-foreground mt-0.5">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold mb-3">SDD-First Development</h3>
            <p className="text-muted-foreground mb-4 text-sm">{sddFirstDescription}</p>
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              {sddTriggers.map((trigger, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  {trigger}
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
              <h4 className="font-semibold text-sm mb-1">No Placeholders Allowed</h4>
              <p className="text-xs text-muted-foreground">{sddNoPLaceholders}</p>
            </div>

            <h3 className="text-lg font-bold mt-8 mb-3">Google Drive Archive</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(googleDriveStats).map(([key, value]) => (
                <div key={key} className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
                  <HardDrive className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-sm font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: AI Coding Tools */}
          {/* ============================================ */}
          <CollapsibleSection title="AI Coding Tools & Configuration" icon={Wrench} id="tools">
            <div className="space-y-4 mb-8">
              {aiTools.map((tool, i) => (
                <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{tool.name}</span>
                    <Badge variant="outline" className="text-xs">{tool.stats}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tool.purpose}</p>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold mb-3">Tool Diversification Strategy</h3>
            <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">{toolDiversificationStrategy}</p>

            <h3 className="text-lg font-bold mb-3">Claude Code Configuration</h3>
            <CodeBlock code={claudeCodeConfig} title="Configuration Infrastructure" />
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Practical Use Cases */}
          {/* ============================================ */}
          <CollapsibleSection title="Practical Day-to-Day Use Cases" icon={Zap} id="use-cases">
            <div className="space-y-6">
              {useCases.map((uc) => (
                <div key={uc.id} className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <h4 className="font-bold mb-2">{uc.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{uc.description}</p>
                  {uc.codeSnippet && (
                    <CodeBlock code={uc.codeSnippet} />
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Enterprise Patterns */}
          {/* ============================================ */}
          <CollapsibleSection title="Enterprise Patterns from Production" icon={Server} id="enterprise">
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Patterns extracted from enterprise client work at Tailored Technologies (2021-2023)
              and refined across the portfolio ecosystem.
            </p>

            <div className="space-y-6 mb-8">
              {enterprisePatterns.map((pattern, i) => (
                <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <h4 className="font-bold mb-2">{pattern.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                  <ul className="space-y-1.5">
                    {pattern.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold mt-8 mb-3">Advanced Prompt Engineering Patterns</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {advancedPatterns.map((pattern, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/30 bg-muted/10">
                  <h5 className="font-semibold text-sm mb-1">{pattern.name}</h5>
                  <p className="text-xs text-muted-foreground">{pattern.description}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ============================================ */}
          {/* SECTION: Lessons Learned */}
          {/* ============================================ */}
          <CollapsibleSection title="10 Lessons Learned" icon={Lightbulb} id="lessons" defaultOpen={true}>
            <div className="space-y-4">
              {lessonsLearned.map((lesson) => (
                <div key={lesson.number} className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {lesson.number}
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{lesson.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{lesson.insight}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Back to Portfolio */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-16"
          >
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

// ============================================
// Sub-Components for Complex Sections
// ============================================

function PatternCard({ pattern }: { pattern: typeof promptPatterns[number] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-border/50 bg-muted/10 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
          {pattern.number}
        </div>
        <div className="flex-1">
          <h4 className="font-bold">{pattern.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Source: {pattern.source}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Problem</span>
                <p className="text-sm text-muted-foreground mt-1">{pattern.problem}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Solution</span>
                <p className="text-sm text-muted-foreground mt-1">{pattern.solution}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Key Insight</span>
                <p className="text-sm text-muted-foreground mt-1">{pattern.keyInsight}</p>
              </div>
              {pattern.template && (
                <CodeBlock code={pattern.template} title="Prompt Template" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AIProjectCard({ project }: { project: typeof aiProjects[number] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-border/50 bg-muted/10 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold">{project.name}</h4>
            <Badge variant="outline" className="text-xs">{project.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{project.purpose}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Core Innovation</span>
                <p className="text-sm text-muted-foreground mt-1">{project.innovation}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Features</span>
                <ul className="mt-1 space-y-1">
                  {project.aiFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Zap className="h-3.5 w-3.5 text-yellow-400 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
