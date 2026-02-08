import { experienceData } from "@/data/experience"
import { skillsData, type SkillCategory } from "@/data/skills"
import { projectsData } from "@/data/projects"
import { FORTUNES } from "./RetroAsciiArt"

export interface RetroLine {
  text: string
  color?: "green" | "amber" | "dim" | "bright" | "cyan" | "red"
}

export interface RetroContext {
  addLines: (lines: RetroLine[]) => void
  clear: () => void
  setColorScheme: (scheme: "green" | "amber") => void
}

type CommandHandler = (args: string[], ctx: RetroContext) => void

function handleHelp(_args: string[], ctx: RetroContext) {
  ctx.addLines([
    { text: "Available commands:", color: "bright" },
    { text: "" },
    { text: "  whoami      About me", color: "green" },
    { text: "  skills      Technical skills", color: "green" },
    { text: "  experience  Career history", color: "green" },
    { text: "  projects    Featured projects", color: "green" },
    { text: "  contact     Get in touch", color: "green" },
    { text: "" },
    { text: "  fortune     Random quote", color: "dim" },
    { text: "  color       Set green/amber theme", color: "dim" },
    { text: "  clear       Clear screen", color: "dim" },
    { text: "  help        Show this menu", color: "dim" },
    { text: "" },
  ])
}

function handleWhoami(_args: string[], ctx: RetroContext) {
  ctx.addLines([
    { text: "Daniel Hernandez", color: "bright" },
    { text: "Senior Software Engineer", color: "cyan" },
    { text: "" },
    { text: "Self-taught engineer who went from a GED to building DoD" },
    { text: "applications for Space Force. Co-founded a software" },
    { text: `consultancy, built ${projectsData.length}+ projects, and never stopped learning.` },
    { text: "" },
    { text: "Beyond code: welding, 3D printing, VR development, PCB" },
    { text: "soldering, and CAD prototyping. The best engineers build" },
    { text: "things with their hands." },
    { text: "" },
  ])
}

function handleSkills(_args: string[], ctx: RetroContext) {
  const categories: SkillCategory[] = ["Frontend", "Backend", "Database", "Cloud", "Beyond Code"]
  const lines: RetroLine[] = [
    { text: "Technical Skills", color: "bright" },
    { text: "=" .repeat(50), color: "dim" },
  ]

  for (const cat of categories) {
    const skills = skillsData.filter(s => s.category === cat)
    lines.push({ text: "" })
    lines.push({ text: `[${cat.toUpperCase()}]`, color: "cyan" })
    for (const s of skills) {
      const level = s.level.padEnd(14)
      const years = s.years ? `${s.years}y` : "  "
      lines.push({ text: `  ${s.name.padEnd(20)} ${level} ${years}` })
    }
  }

  lines.push({ text: "" })
  ctx.addLines(lines)
}

function handleExperience(_args: string[], ctx: RetroContext) {
  const lines: RetroLine[] = [
    { text: "Career History", color: "bright" },
    { text: "=" .repeat(50), color: "dim" },
    { text: "" },
  ]

  for (const exp of experienceData) {
    lines.push({ text: `${exp.company}`, color: "cyan" })
    lines.push({ text: `  ${exp.title}  (${exp.duration})`, color: "bright" })
    lines.push({ text: `  ${exp.description}`, color: "dim" })
    for (const a of exp.achievements.slice(0, 2)) {
      lines.push({ text: `  + ${a}` })
    }
    lines.push({ text: "" })
  }

  ctx.addLines(lines)
}

function handleProjects(_args: string[], ctx: RetroContext) {
  const flagship = projectsData.filter(p => p.tier === "flagship")
  const lines: RetroLine[] = [
    { text: "Featured Projects", color: "bright" },
    { text: "=" .repeat(50), color: "dim" },
    { text: "" },
  ]

  for (const [i, p] of flagship.entries()) {
    const status = p.status === "production" ? "[LIVE]" : `[${p.status.toUpperCase()}]`
    lines.push({ text: `${(i + 1).toString().padStart(2)}. ${p.title}  ${status}`, color: "cyan" })
    lines.push({ text: `      ${p.tagline}`, color: "dim" })
    lines.push({ text: `      Tech: ${p.tech.slice(0, 4).join(", ")}` })
    lines.push({ text: "" })
  }

  ctx.addLines(lines)
}

function handleContact(_args: string[], ctx: RetroContext) {
  ctx.addLines([
    { text: "Contact Information", color: "bright" },
    { text: "=" .repeat(50), color: "dim" },
    { text: "" },
    { text: "  EMAIL     daniel@interestingandbeyond.com", color: "cyan" },
    { text: "  GITHUB    github.com/dmhernandez2525" },
    { text: "  LINKEDIN  linkedin.com/in/dh25" },
    { text: "" },
    { text: '  $ echo "Let\'s build something" | mail daniel', color: "dim" },
    { text: "" },
  ])
}

function handleFortune(_args: string[], ctx: RetroContext) {
  const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
  ctx.addLines([
    { text: "" },
    { text: quote, color: "cyan" },
    { text: "" },
  ])
}

const VALID_SCHEMES = new Set<"green" | "amber">(["green", "amber"])

function handleColor(_args: string[], ctx: RetroContext) {
  const scheme = VALID_SCHEMES.has(_args[0] as "green" | "amber") ? (_args[0] as "green" | "amber") : null
  if (!scheme) {
    ctx.addLines([{ text: 'Usage: color <green|amber>', color: "dim" }])
    return
  }
  ctx.setColorScheme(scheme)
  ctx.addLines([{ text: `Color scheme set to ${scheme}`, color: "bright" }])
}

function handleClear(_args: string[], ctx: RetroContext) {
  ctx.clear()
}

function handleSudo(args: string[], ctx: RetroContext) {
  const full = args.join(" ")
  if (full.includes("hire daniel")) {
    ctx.addLines([
      { text: "" },
      { text: "ACCESS GRANTED", color: "bright" },
      { text: "Sending offer letter to daniel@interestingandbeyond.com...", color: "cyan" },
      { text: "Just kidding. But seriously, let's talk!", color: "dim" },
      { text: "" },
    ])
    return
  }
  ctx.addLines([
    { text: "daniel is not in the sudoers file. This incident will be reported.", color: "red" },
  ])
}

function handleRm(args: string[], ctx: RetroContext) {
  if (args.join(" ").includes("-rf /")) {
    ctx.addLines([
      { text: "Deleting everything..." },
      { text: "rm: /portfolio: Operation not permitted", color: "red" },
      { text: "Nice try. System intact.", color: "dim" },
      { text: "" },
    ])
    return
  }
  ctx.addLines([{ text: "rm: permission denied", color: "red" }])
}

function handleMatrix(_args: string[], ctx: RetroContext) {
  ctx.addLines([
    { text: "Wake up, Neo...", color: "bright" },
    { text: "The Matrix has you...", color: "dim" },
    { text: "(Matrix rain not available in retro mode. Try the Techie terminal!)", color: "dim" },
    { text: "" },
  ])
}

function handleExit(_args: string[], ctx: RetroContext) {
  ctx.addLines([
    { text: "There is no escape from DANIEL-OS.", color: "dim" },
    { text: 'Use the "Switch Mode" button to leave.', color: "dim" },
    { text: "" },
  ])
}

function handleVim(_args: string[], ctx: RetroContext) {
  ctx.addLines([
    { text: "Opening vim... Just kidding, nobody can exit vim.", color: "dim" },
    { text: "" },
  ])
}

const COMMANDS: Record<string, CommandHandler> = {
  help: handleHelp,
  whoami: handleWhoami,
  about: handleWhoami,
  skills: handleSkills,
  experience: handleExperience,
  projects: handleProjects,
  contact: handleContact,
  fortune: handleFortune,
  color: handleColor,
  clear: handleClear,
  sudo: handleSudo,
  rm: handleRm,
  matrix: handleMatrix,
  exit: handleExit,
  vim: handleVim,
  nano: handleVim,
}

export function executeRetroCommand(input: string, ctx: RetroContext) {
  const trimmed = input.trim()
  if (!trimmed) return

  const parts = trimmed.split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)

  const handler = COMMANDS[cmd]
  if (handler) {
    handler(args, ctx)
  } else {
    ctx.addLines([
      { text: `${cmd}: command not found. Type "help" for available commands.`, color: "red" },
    ])
  }
}
