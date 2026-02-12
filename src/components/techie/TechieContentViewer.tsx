import { lazy, Suspense } from "react"
import { experienceData } from "@/data/experience"
import { skillsData } from "@/data/skills"
import { projectsData } from "@/data/projects"
import { blogPosts } from "@/data/blog"
import type { TechieTab } from "./TechieLayout"
import { CodeMirrorEditor } from "./CodeMirrorEditor"
import type { EditorSettings, CursorPosition } from "./editor-settings"

const SnakeGame = lazy(() => import("@/components/game/SnakeGame").then(m => ({ default: m.SnakeGame })))
const TetrisGame = lazy(() => import("@/components/game/TetrisGame").then(m => ({ default: m.TetrisGame })))
const ChessGame = lazy(() => import("@/components/game/ChessGame").then(m => ({ default: m.ChessGame })))
const FallingBlocksGame = lazy(() => import("@/components/game/FallingBlocksGame").then(m => ({ default: m.FallingBlocksGame })))
const CookieClickerGame = lazy(() => import("@/components/game/cookie-clicker").then(m => ({ default: m.CookieClickerGame })))
const AgarGame = lazy(() => import("@/components/game/agar").then(m => ({ default: m.AgarGame })))
const MafiaWars = lazy(() => import("@/components/game/mafia-wars"))
const PokemonGame = lazy(() => import("@/components/game/pokemon").then(m => ({ default: m.PokemonGame })))
const ShoppingCartHeroGame = lazy(() => import("@/components/game/shopping-cart-hero").then(m => ({ default: m.ShoppingCartHeroGame })))

interface TechieContentViewerProps {
  tab: TechieTab | null
  onEditorChange: (tabId: string, content: string) => void
  onRunCode: (code: string, lang: string) => void
  editorSettings?: EditorSettings
  onCursorChange?: (pos: CursorPosition) => void
}

function TerminalLine({ prefix, children }: { prefix?: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      {prefix && <span className="text-[#569cd6] shrink-0">{prefix}</span>}
      <span>{children}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[#569cd6] font-bold mb-2 border-b border-[#3c3c3c] pb-1">{title}</div>
      {children}
    </div>
  )
}

function ReadmeContent() {
  return (
    <div className="space-y-4">
      <div className="text-[#608b4e]">{`# Daniel Hernandez`}</div>
      <div className="text-[#608b4e]">{`## Senior Software Engineer`}</div>
      <div className="text-[#ce9178] mt-4">
        Full-stack engineer with 10+ years building production-grade applications.
        From co-founding a software consultancy to developing secure DoD applications
        for Space Force and Navy.
      </div>
      <div className="mt-4 space-y-1">
        <TerminalLine prefix=">">{`React | Next.js | TypeScript | Node.js | Python | Django`}</TerminalLine>
        <TerminalLine prefix=">">{`AWS | Docker | Kubernetes | PostgreSQL | MongoDB`}</TerminalLine>
        <TerminalLine prefix=">">{`Three.js | Cesium | Framer Motion | GSAP`}</TerminalLine>
      </div>
      <div className="mt-6 text-[#608b4e]">{`## Quick Start`}</div>
      <div className="bg-[#1a1a1a] p-3 rounded text-[#d4d4d4] text-xs space-y-1">
        <div><span className="text-[#569cd6]">$</span> open ABOUT.md        <span className="text-[#608b4e]"># Learn about me</span></div>
        <div><span className="text-[#569cd6]">$</span> cat SKILLS.txt       <span className="text-[#608b4e]"># View my skills</span></div>
        <div><span className="text-[#569cd6]">$</span> less EXPERIENCE.log  <span className="text-[#608b4e]"># Career history</span></div>
        <div><span className="text-[#569cd6]">$</span> ls PROJECTS/         <span className="text-[#608b4e]"># Browse projects</span></div>
        <div><span className="text-[#569cd6]">$</span> ./GAMES/snake.exe    <span className="text-[#608b4e]"># Play a game</span></div>
      </div>
    </div>
  )
}

function AboutContent() {
  return (
    <div className="space-y-4">
      <div className="text-[#608b4e]">{`# About Me`}</div>
      <div className="text-[#ce9178]">
        I'm a self-taught engineer who went from a GED to building DoD applications
        for Space Force. I co-founded a software consultancy, built 28+ projects,
        and never stopped learning.
      </div>
      <div className="mt-4 text-[#ce9178]">
        Beyond code, I weld (MIG, TIG, stick), solder PCBs, run a 3D print farm,
        build VR games, and design CAD prototypes. I believe the best engineers
        are the ones who build things with their hands.
      </div>
      <Section title="Timeline">
        <div className="space-y-1 text-sm">
          <TerminalLine prefix="2015">{`Started learning to code (PHP, HTML/CSS)`}</TerminalLine>
          <TerminalLine prefix="2017">{`Teaching Assistant at Lake Land College`}</TerminalLine>
          <TerminalLine prefix="2018">{`Freelance web development (Brainy Developer)`}</TerminalLine>
          <TerminalLine prefix="2020">{`Full-Stack Engineer at Charter Communications`}</TerminalLine>
          <TerminalLine prefix="2021">{`Co-founded Tailored Technologies`}</TerminalLine>
          <TerminalLine prefix="2022">{`Senior Engineer at First American`}</TerminalLine>
          <TerminalLine prefix="2023">{`Senior Engineer at Mesirow Financial`}</TerminalLine>
          <TerminalLine prefix="2024">{`Senior Engineer at BrainGu (DoD)`}</TerminalLine>
        </div>
      </Section>
    </div>
  )
}

function SkillsContent() {
  const categories = [...new Set(skillsData.map(s => s.category))]
  return (
    <div className="space-y-4">
      <div className="text-[#608b4e]">{`# Skills`}</div>
      {categories.map(cat => {
        const skills = skillsData.filter(s => s.category === cat)
        return (
          <Section key={cat} title={cat}>
            <div className="space-y-1 text-sm">
              {skills.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-[#4ec9b0] w-24 shrink-0">{s.name}</span>
                  <span className="text-[#858585] w-20 shrink-0">{s.level}</span>
                  {s.years && <span className="text-[#d7ba7d]">{s.years}y</span>}
                </div>
              ))}
            </div>
          </Section>
        )
      })}
    </div>
  )
}

function ExperienceContent() {
  return (
    <div className="space-y-4">
      <div className="text-[#608b4e]">{`# Experience`}</div>
      {experienceData.map(exp => (
        <Section key={exp.id} title={`${exp.company} — ${exp.title}`}>
          <div className="text-[#858585] text-xs mb-2">{exp.duration}</div>
          <div className="text-[#ce9178] text-sm mb-2">{exp.description}</div>
          <div className="space-y-0.5">
            {exp.achievements.map((a, i) => (
              <div key={i} className="text-sm flex gap-2">
                <span className="text-[#608b4e] shrink-0">+</span>
                <span className="text-[#d4d4d4]">{a}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {exp.tech.map(t => (
              <span key={t} className="px-1.5 py-0.5 text-[10px] bg-[#1a1a1a] text-[#4ec9b0] border border-[#3c3c3c]">
                {t}
              </span>
            ))}
          </div>
        </Section>
      ))}
    </div>
  )
}

function ProjectsContent() {
  return (
    <div className="space-y-4">
      <div className="text-[#608b4e]">{`# Projects`}</div>
      <div className="text-[#858585] text-xs mb-4">
        {projectsData.length} projects total | Sorted by tier
      </div>
      {(["flagship", "strong", "supporting"] as const).map(tier => {
        const projects = projectsData.filter(p => p.tier === tier)
        const tierLabel = tier.toUpperCase()
        return (
          <Section key={tier} title={`[${tierLabel}]`}>
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.link ? (
                      <a href={p.link} target="_blank" rel="noopener noreferrer"
                         className="text-[#4ec9b0] font-bold hover:underline hover:text-[#6ee7c2] transition-colors">
                        {p.title}
                      </a>
                    ) : (
                      <span className="text-[#4ec9b0] font-bold">{p.title}</span>
                    )}
                    <span className="text-[#858585]">—</span>
                    <span className="text-[#d7ba7d] text-xs">{p.category}</span>
                    {p.status === "production" && (
                      <span className="text-[10px] px-1 py-0.5 bg-[#608b4e]/20 text-[#608b4e] border border-[#608b4e]/30">LIVE</span>
                    )}
                  </div>
                  <div className="text-[#ce9178] text-xs mt-0.5">{p.tagline}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.tech.slice(0, 5).map(t => (
                      <span key={t} className="text-[10px] text-[#858585]">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )
      })}
    </div>
  )
}

function BlogContent() {
  return (
    <div className="space-y-4">
      <div className="text-[#608b4e]">{`# Blog`}</div>
      {blogPosts.map(post => (
        <Section key={post.id} title={post.title}>
          <div className="flex items-center gap-3 text-xs text-[#858585] mb-2">
            <span>{post.date}</span>
            <span>{post.readTime} min read</span>
            <span className="text-[#d7ba7d]">{post.category}</span>
          </div>
          <div className="text-sm text-[#ce9178]">{post.excerpt}</div>
          <div className="mt-3 text-sm text-[#d4d4d4] whitespace-pre-wrap leading-relaxed">
            {post.content.slice(0, 500)}
            {post.content.length > 500 && <span className="text-[#858585]">... [truncated]</span>}
          </div>
        </Section>
      ))}
    </div>
  )
}

function HiddenEnvContent() {
  return (
    <div className="space-y-2">
      <div className="text-[#608b4e]">{`# .env — Environment Variables`}</div>
      <div className="text-[#858585] text-xs mb-4">You found a hidden file!</div>
      <div className="bg-[#1a1a1a] p-4 rounded space-y-1 text-sm">
        <div><span className="text-[#569cd6]">HIRE_ME</span><span className="text-[#d4d4d4]">=</span><span className="text-[#ce9178]">true</span></div>
        <div><span className="text-[#569cd6]">COFFEE_LEVEL</span><span className="text-[#d4d4d4]">=</span><span className="text-[#ce9178]">critical</span></div>
        <div><span className="text-[#569cd6]">BUGS</span><span className="text-[#d4d4d4]">=</span><span className="text-[#ce9178]">0</span></div>
        <div><span className="text-[#569cd6]">MOTIVATION</span><span className="text-[#d4d4d4]">=</span><span className="text-[#ce9178]">infinite</span></div>
        <div><span className="text-[#569cd6]">DARK_MODE</span><span className="text-[#d4d4d4]">=</span><span className="text-[#ce9178]">always</span></div>
        <div><span className="text-[#569cd6]">TABS_VS_SPACES</span><span className="text-[#d4d4d4]">=</span><span className="text-[#ce9178]">tabs</span></div>
        <div><span className="text-[#569cd6]">FAVORITE_EDITOR</span><span className="text-[#d4d4d4]">=</span><span className="text-[#ce9178]">the one that doesn't crash</span></div>
        <div className="text-[#608b4e] pt-2"># Don't tell anyone about these</div>
        <div><span className="text-[#569cd6]">SECRET_POWER</span><span className="text-[#d4d4d4]">=</span><span className="text-[#ce9178]">turning caffeine into code</span></div>
        <div><span className="text-[#569cd6]">STACKOVERFLOW_VISITS_TODAY</span><span className="text-[#d4d4d4]">=</span><span className="text-[#ce9178]">42</span></div>
      </div>
    </div>
  )
}

function HiddenSecretContent() {
  return (
    <div className="space-y-4">
      <div className="text-[#608b4e]">{`# .secret — You found the secret file!`}</div>
      <div className="bg-[#1a1a1a] p-4 rounded font-mono text-[#4ec9b0] text-xs leading-relaxed whitespace-pre">
{`    ___       ___       ___       ___
   /\\  \\     /\\__\\     /\\  \\     /\\  \\
  /::\\  \\   /:/__/_   _\\:\\  \\   /::\\  \\
 /:/\\:\\__\\ /::\\/\\__\\ /\\/::\\__\\ /:/\\:\\__\\
 \\:\\/:/  / \\/\\::/  / \\::/\\/__/ \\:\\ \\/__/
  \\::/  /    /:/  /   \\:\\__\\    \\:\\__\\
   \\/__/     \\/__/     \\/__/     \\/__/  `}
      </div>
      <div className="text-[#ce9178] text-sm">
        Congratulations, you found the secret file! You must be the curious type.
      </div>
      <div className="text-[#d7ba7d] text-sm">
        Fun fact: This portfolio has {">"}25 easter eggs hidden throughout.
        How many can you find?
      </div>
      <div className="mt-4 text-xs text-[#858585] space-y-1">
        <div>Hints:</div>
        <div className="text-[#608b4e]">+ Try typing certain words while on this page...</div>
        <div className="text-[#608b4e]">+ The Konami code still works in 2026</div>
        <div className="text-[#608b4e]">+ The terminal knows more than it lets on</div>
        <div className="text-[#608b4e]">+ Some commands are... not in the help menu</div>
      </div>
    </div>
  )
}

function HiddenGitignoreContent() {
  return (
    <div className="space-y-2">
      <div className="text-[#608b4e]">{`# .gitignore`}</div>
      <div className="bg-[#1a1a1a] p-4 rounded space-y-1 text-sm">
        <div className="text-[#d4d4d4]">node_modules/</div>
        <div className="text-[#d4d4d4]">dist/</div>
        <div className="text-[#d4d4d4]">.env</div>
        <div className="text-[#d4d4d4]">.DS_Store</div>
        <div className="text-[#d4d4d4]">*.log</div>
        <div className="text-[#d4d4d4]">coverage/</div>
        <div className="text-[#608b4e]"># The important stuff</div>
        <div className="text-[#d4d4d4]">my-hopes-and-dreams/</div>
        <div className="text-[#d4d4d4]">passwords-definitely-not-here.txt</div>
        <div className="text-[#d4d4d4]">evidence/</div>
        <div className="text-[#d4d4d4]">todo-learn-vim.md</div>
        <div className="text-[#d4d4d4]">*.tears</div>
      </div>
    </div>
  )
}

function ContactContent() {
  return (
    <div className="space-y-4">
      <div className="text-[#608b4e]">{`#!/bin/bash`}</div>
      <div className="text-[#608b4e]">{`# CONTACT.sh — Get in touch`}</div>
      <div className="mt-4 space-y-2">
        <div className="text-sm">
          <span className="text-[#569cd6]">EMAIL</span><span className="text-[#d4d4d4]">=</span>
          <a href="mailto:daniel@interestingandbeyond.com" className="text-[#ce9178] hover:underline">"daniel@interestingandbeyond.com"</a>
        </div>
        <div className="text-sm">
          <span className="text-[#569cd6]">GITHUB</span><span className="text-[#d4d4d4]">=</span>
          <a href="https://github.com/dmhernandez2525" target="_blank" rel="noopener noreferrer" className="text-[#ce9178] hover:underline">"https://github.com/dmhernandez2525"</a>
        </div>
        <div className="text-sm">
          <span className="text-[#569cd6]">LINKEDIN</span><span className="text-[#d4d4d4]">=</span>
          <a href="https://linkedin.com/in/dh25" target="_blank" rel="noopener noreferrer" className="text-[#ce9178] hover:underline">"https://linkedin.com/in/dh25"</a>
        </div>
      </div>
      <div className="mt-6 bg-[#1a1a1a] p-3 text-xs space-y-1">
        <div className="text-[#608b4e]"># Quick connect</div>
        <div><span className="text-[#569cd6]">$</span> echo "Let's build something together" | mail -s "Hello" $EMAIL</div>
      </div>
    </div>
  )
}

function GameLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full text-[#858585] font-mono text-sm">
        Loading executable...
      </div>
    }>
      <div className="h-full overflow-auto">{children}</div>
    </Suspense>
  )
}

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[#858585] font-mono">
      <div className="text-2xl mb-2 text-[#569cd6]">DH OS v1.0.0</div>
      <div className="text-sm mb-6">Select a file from the explorer to get started</div>
      <div className="text-xs space-y-1 text-center">
        <div>Tip: Start with <span className="text-[#4ec9b0]">README.md</span></div>
        <div>or try running <span className="text-[#4ec9b0]">snake.exe</span></div>
      </div>
    </div>
  )
}

export function TechieContentViewer({ tab, onEditorChange, onRunCode, editorSettings, onCursorChange }: TechieContentViewerProps) {
  if (!tab) return <WelcomeScreen />

  // Untitled/editor tabs
  if (tab.isUntitled) {
    return (
      <CodeMirrorEditor
        fileName={tab.fileName}
        content={tab.editorContent ?? ""}
        onChange={(val) => onEditorChange(tab.id, val)}
        onRun={onRunCode}
        settings={editorSettings}
        onCursorChange={onCursorChange}
      />
    )
  }

  const contentKey = tab.contentKey

  // Handle games
  const gameMap: Record<string, React.ReactNode> = {
    "game-snake": <GameLoader><SnakeGame /></GameLoader>,
    "game-tetris": <GameLoader><TetrisGame /></GameLoader>,
    "game-chess": <GameLoader><ChessGame /></GameLoader>,
    "game-falling-blocks": <GameLoader><FallingBlocksGame /></GameLoader>,
    "game-cookie-clicker": <GameLoader><CookieClickerGame /></GameLoader>,
    "game-agar": <GameLoader><AgarGame /></GameLoader>,
    "game-mafia-wars": <GameLoader><MafiaWars /></GameLoader>,
    "game-pokemon": <GameLoader><PokemonGame /></GameLoader>,
    "game-shopping-cart-hero": <GameLoader><ShoppingCartHeroGame /></GameLoader>,
  }

  if (contentKey in gameMap) return <>{gameMap[contentKey]}</>

  // Handle content files
  const contentMap: Record<string, React.ReactNode> = {
    readme: <ReadmeContent />,
    about: <AboutContent />,
    skills: <SkillsContent />,
    experience: <ExperienceContent />,
    projects: <ProjectsContent />,
    blog: <BlogContent />,
    contact: <ContactContent />,
    "hidden-env": <HiddenEnvContent />,
    "hidden-secret": <HiddenSecretContent />,
    "hidden-gitignore": <HiddenGitignoreContent />,
  }

  const content = contentMap[contentKey]

  if (!content) {
    return (
      <div className="p-6 text-[#858585] font-mono text-sm">
        <div className="text-[#f44747]">Error: File not found — {tab.fileName}</div>
      </div>
    )
  }

  return (
    <div className="p-6 font-mono text-sm text-[#d4d4d4] overflow-auto h-full">
      {content}
    </div>
  )
}
