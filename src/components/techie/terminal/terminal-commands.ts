import { type FileNode, getFileIcon } from "../techie-data"
import {
  resolvePath,
  listDirectory,
  buildTreeString,
  displayPath,
  HOME_PATH,
  normalizePath,
} from "./terminal-filesystem"

export interface OutputLine {
  text: string
  color?: string
  bold?: boolean
  parts?: { text: string; color?: string }[]
}

export interface TerminalContext {
  cwd: string
  setCwd: (path: string) => void
  openFile: (contentKey: string, fileName: string) => void
  addOutput: (lines: OutputLine[]) => void
  clearOutput: () => void
  commandHistory: string[]
  setHackerMode: (on: boolean) => void
  triggerMatrix: () => void
  startTime: number
}

type CommandHandler = (args: string[], ctx: TerminalContext) => void

const FILE_DESCRIPTIONS: Record<string, string> = {
  readme: "Project overview and quick start guide",
  about: "Background, story, and timeline",
  skills: "Technical skills and proficiency levels",
  experience: "Career history and achievements",
  projects: "Portfolio of 28+ projects",
  blog: "Technical articles and insights",
  contact: "Email, GitHub, LinkedIn",
}

// --- Command implementations ---

const help: CommandHandler = (_args, ctx) => {
  ctx.addOutput([
    { text: "DH OS Terminal — Available Commands", color: "#569cd6", bold: true },
    { text: "" },
    { parts: [{ text: "  ls [path]", color: "#4ec9b0" }, { text: "        List directory contents" }] },
    { parts: [{ text: "  cd <path>", color: "#4ec9b0" }, { text: "        Change directory" }] },
    { parts: [{ text: "  pwd", color: "#4ec9b0" }, { text: "              Print working directory" }] },
    { parts: [{ text: "  tree [path]", color: "#4ec9b0" }, { text: "      Show directory tree" }] },
    { parts: [{ text: "  cat <file>", color: "#4ec9b0" }, { text: "       View file contents + open tab" }] },
    { parts: [{ text: "  open <file>", color: "#4ec9b0" }, { text: "      Open file in a new tab" }] },
    { parts: [{ text: "  run <game>", color: "#4ec9b0" }, { text: "       Launch a game executable" }] },
    { text: "" },
    { parts: [{ text: "  whoami", color: "#4ec9b0" }, { text: "           Who are you?" }] },
    { parts: [{ text: "  neofetch", color: "#4ec9b0" }, { text: "         System information" }] },
    { parts: [{ text: "  date", color: "#4ec9b0" }, { text: "             Current date and time" }] },
    { parts: [{ text: "  uptime", color: "#4ec9b0" }, { text: "           Time since page load" }] },
    { parts: [{ text: "  history", color: "#4ec9b0" }, { text: "          Command history" }] },
    { parts: [{ text: "  echo <text>", color: "#4ec9b0" }, { text: "      Print text" }] },
    { parts: [{ text: "  clear", color: "#4ec9b0" }, { text: "            Clear terminal" }] },
    { parts: [{ text: "  man <cmd>", color: "#4ec9b0" }, { text: "        Manual for a command" }] },
    { parts: [{ text: "  fortune", color: "#4ec9b0" }, { text: "          Random programming quote" }] },
    { parts: [{ text: "  cowsay <text>", color: "#4ec9b0" }, { text: "    Make a cow say things" }] },
    { text: "" },
    { text: "  Try exploring! There are hidden files and easter eggs...", color: "#858585" },
  ])
}

const ls: CommandHandler = (args, ctx) => {
  const showHidden = args.includes("-a") || args.includes("-la") || args.includes("-al")
  const pathArg = args.find((a) => !a.startsWith("-"))
  const targetPath = pathArg ? normalizePath(ctx.cwd, pathArg) : ctx.cwd

  const children = listDirectory(targetPath, showHidden)
  if (children.length === 0) {
    const resolved = resolvePath(ctx.cwd, pathArg ?? ".")
    if (!resolved || resolved.node.type !== "folder") {
      ctx.addOutput([{ text: `ls: ${pathArg ?? ctx.cwd}: No such directory`, color: "#f44747" }])
      return
    }
    ctx.addOutput([{ text: "(empty directory)", color: "#858585" }])
    return
  }

  const lines: OutputLine[] = children.map((child) => {
    const icon = child.type === "folder" ? "\u{1F4C1}" : getFileIcon(child.name)
    const nameColor = child.type === "folder" ? "#569cd6" : child.name.endsWith(".exe") ? "#4ec9b0" : child.hidden ? "#858585" : "#d4d4d4"
    const suffix = child.type === "folder" ? "/" : ""
    return {
      parts: [
        { text: `  ${icon} `, color: "#858585" },
        { text: `${child.name}${suffix}`, color: nameColor },
      ],
    }
  })

  ctx.addOutput(lines)
}

const cd: CommandHandler = (args, ctx) => {
  if (args.length === 0) {
    ctx.setCwd(HOME_PATH)
    return
  }

  const target = args[0]
  const resolved = resolvePath(ctx.cwd, target)
  if (!resolved) {
    ctx.addOutput([{ text: `cd: ${target}: No such directory`, color: "#f44747" }])
    return
  }
  if (resolved.node.type !== "folder") {
    ctx.addOutput([{ text: `cd: ${target}: Not a directory`, color: "#f44747" }])
    return
  }
  ctx.setCwd(resolved.path)
}

const pwd: CommandHandler = (_args, ctx) => {
  ctx.addOutput([{ text: ctx.cwd }])
}

const tree: CommandHandler = (args, ctx) => {
  const showHidden = args.includes("-a")
  const pathArg = args.find((a) => !a.startsWith("-"))
  const targetPath = pathArg ? normalizePath(ctx.cwd, pathArg) : ctx.cwd

  const lines = buildTreeString(targetPath, showHidden)
  ctx.addOutput(lines.map((line) => ({ text: line, color: "#d4d4d4" })))
}

const cat: CommandHandler = (args, ctx) => {
  if (args.length === 0) {
    ctx.addOutput([{ text: "cat: missing file operand", color: "#f44747" }])
    return
  }

  const resolved = resolvePath(ctx.cwd, args[0])
  if (!resolved) {
    ctx.addOutput([{ text: `cat: ${args[0]}: No such file`, color: "#f44747" }])
    return
  }
  if (resolved.node.type === "folder") {
    ctx.addOutput([{ text: `cat: ${args[0]}: Is a directory`, color: "#f44747" }])
    return
  }

  const { node } = resolved
  const desc = node.contentKey ? FILE_DESCRIPTIONS[node.contentKey] : null

  if (desc) {
    ctx.addOutput([
      { text: `--- ${node.name} ---`, color: "#608b4e" },
      { text: desc },
      { text: "" },
      { text: "Opening in tab...", color: "#858585" },
    ])
  } else {
    ctx.addOutput([{ text: `Opening ${node.name}...`, color: "#858585" }])
  }

  if (node.contentKey) {
    ctx.openFile(node.contentKey, node.name)
  }
}

const open: CommandHandler = (args, ctx) => {
  if (args.length === 0) {
    ctx.addOutput([{ text: "open: missing file operand", color: "#f44747" }])
    return
  }

  const resolved = resolvePath(ctx.cwd, args[0])
  if (!resolved) {
    ctx.addOutput([{ text: `open: ${args[0]}: No such file`, color: "#f44747" }])
    return
  }

  if (resolved.node.contentKey) {
    ctx.openFile(resolved.node.contentKey, resolved.node.name)
    ctx.addOutput([{ text: `Opened ${resolved.node.name}`, color: "#858585" }])
  } else {
    ctx.addOutput([{ text: `open: ${args[0]}: Cannot open this file`, color: "#f44747" }])
  }
}

const run: CommandHandler = (args, ctx) => {
  if (args.length === 0) {
    ctx.addOutput([{ text: "run: specify a game to run (e.g., run snake)", color: "#f44747" }])
    return
  }

  const gameName = args[0].replace(/\.exe$/, "").toLowerCase()
  const gameKeys: Record<string, { contentKey: string; fileName: string }> = {
    snake: { contentKey: "game-snake", fileName: "snake.exe" },
    tetris: { contentKey: "game-tetris", fileName: "tetris.exe" },
    chess: { contentKey: "game-chess", fileName: "chess.exe" },
    "falling-blocks": { contentKey: "game-falling-blocks", fileName: "falling-blocks.exe" },
    "cookie-clicker": { contentKey: "game-cookie-clicker", fileName: "cookie-clicker.exe" },
    agar: { contentKey: "game-agar", fileName: "agar.exe" },
  }

  const game = gameKeys[gameName]
  if (!game) {
    ctx.addOutput([
      { text: `run: ${gameName}: Unknown game`, color: "#f44747" },
      { text: "Available games: " + Object.keys(gameKeys).join(", "), color: "#858585" },
    ])
    return
  }

  ctx.addOutput([{ text: `Launching ${game.fileName}...`, color: "#4ec9b0" }])
  ctx.openFile(game.contentKey, game.fileName)
}

const whoami: CommandHandler = (_args, ctx) => {
  ctx.addOutput([{ text: "daniel" }])
}

const neofetch: CommandHandler = (_args, ctx) => {
  const uptimeMs = Date.now() - ctx.startTime
  const uptimeMin = Math.floor(uptimeMs / 60000)
  const uptimeSec = Math.floor((uptimeMs % 60000) / 1000)

  ctx.addOutput([
    { text: "         ___          daniel@dh-os", color: "#569cd6" },
    { text: "        /   \\         -----------", color: "#569cd6" },
    { parts: [{ text: "       |     |        ", color: "#569cd6" }, { text: "OS: ", color: "#4ec9b0" }, { text: "DH OS v1.0.0" }] },
    { parts: [{ text: "       | DH  |        ", color: "#569cd6" }, { text: "Host: ", color: "#4ec9b0" }, { text: "Portfolio Machine" }] },
    { parts: [{ text: "       |     |        ", color: "#569cd6" }, { text: "Kernel: ", color: "#4ec9b0" }, { text: "React 19" }] },
    { parts: [{ text: "        \\___/         ", color: "#569cd6" }, { text: "Shell: ", color: "#4ec9b0" }, { text: "dh-terminal 1.0" }] },
    { parts: [{ text: "       /     \\        ", color: "#569cd6" }, { text: "Uptime: ", color: "#4ec9b0" }, { text: `${uptimeMin}m ${uptimeSec}s` }] },
    { parts: [{ text: "      /  | |  \\       ", color: "#569cd6" }, { text: "Language: ", color: "#4ec9b0" }, { text: "TypeScript 5.9" }] },
    { parts: [{ text: "     /   | |   \\      ", color: "#569cd6" }, { text: "Framework: ", color: "#4ec9b0" }, { text: "Vite 7 + React" }] },
    { parts: [{ text: "    /    | |    \\     ", color: "#569cd6" }, { text: "Projects: ", color: "#4ec9b0" }, { text: "28+" }] },
    { parts: [{ text: "   '-----' '-----'   ", color: "#569cd6" }, { text: "Games: ", color: "#4ec9b0" }, { text: "6 installed" }] },
    { parts: [{ text: "                      ", color: "#569cd6" }, { text: "Coffee: ", color: "#4ec9b0" }, { text: "Critical" }] },
    { text: "" },
    { parts: [
      { text: "   ", color: "#569cd6" },
      { text: "\u2588\u2588\u2588", color: "#000000" },
      { text: "\u2588\u2588\u2588", color: "#cc0000" },
      { text: "\u2588\u2588\u2588", color: "#00cc00" },
      { text: "\u2588\u2588\u2588", color: "#cccc00" },
      { text: "\u2588\u2588\u2588", color: "#0000cc" },
      { text: "\u2588\u2588\u2588", color: "#cc00cc" },
      { text: "\u2588\u2588\u2588", color: "#00cccc" },
      { text: "\u2588\u2588\u2588", color: "#cccccc" },
    ]},
  ])
}

const date: CommandHandler = (_args, ctx) => {
  ctx.addOutput([{ text: new Date().toString() }])
}

const uptime: CommandHandler = (_args, ctx) => {
  const uptimeMs = Date.now() - ctx.startTime
  const hours = Math.floor(uptimeMs / 3600000)
  const minutes = Math.floor((uptimeMs % 3600000) / 60000)
  const seconds = Math.floor((uptimeMs % 60000) / 1000)
  ctx.addOutput([{ text: `up ${hours}h ${minutes}m ${seconds}s` }])
}

const history: CommandHandler = (_args, ctx) => {
  if (ctx.commandHistory.length === 0) {
    ctx.addOutput([{ text: "(no history)", color: "#858585" }])
    return
  }
  ctx.addOutput(
    ctx.commandHistory.map((cmd, i) => ({
      parts: [
        { text: `  ${String(i + 1).padStart(3)} `, color: "#858585" },
        { text: cmd },
      ],
    }))
  )
}

const echo: CommandHandler = (args, ctx) => {
  ctx.addOutput([{ text: args.join(" ") }])
}

const clear: CommandHandler = (_args, ctx) => {
  ctx.clearOutput()
}

const man: CommandHandler = (args, ctx) => {
  if (args.length === 0) {
    ctx.addOutput([{ text: "What manual page do you want?", color: "#f44747" }])
    return
  }

  const manPages: Record<string, string[]> = {
    ls: [
      "LS(1) — list directory contents",
      "",
      "SYNOPSIS: ls [-a] [path]",
      "",
      "DESCRIPTION:",
      "  Lists files and directories at the specified path.",
      "  If no path is given, lists the current directory.",
      "",
      "OPTIONS:",
      "  -a    Show hidden files (dotfiles)",
    ],
    cd: [
      "CD(1) — change directory",
      "",
      "SYNOPSIS: cd [path]",
      "",
      "DESCRIPTION:",
      "  Changes the current working directory.",
      "  Supports ., .., ~, and absolute paths.",
      "  With no arguments, changes to ~/PORTFOLIO.",
    ],
    cat: [
      "CAT(1) — view file contents",
      "",
      "SYNOPSIS: cat <file>",
      "",
      "DESCRIPTION:",
      "  Displays a preview of the file and opens it in a new tab.",
    ],
    open: [
      "OPEN(1) — open a file",
      "",
      "SYNOPSIS: open <file>",
      "",
      "DESCRIPTION:",
      "  Opens the specified file in a new tab.",
    ],
    run: [
      "RUN(1) — launch a game",
      "",
      "SYNOPSIS: run <game>",
      "",
      "DESCRIPTION:",
      "  Launches a game executable.",
      "  Available: snake, tetris, chess, falling-blocks, cookie-clicker, agar",
    ],
    neofetch: [
      "NEOFETCH(1) — system information",
      "",
      "SYNOPSIS: neofetch",
      "",
      "DESCRIPTION:",
      "  Displays system information with ASCII art.",
    ],
  }

  const page = manPages[args[0]]
  if (!page) {
    ctx.addOutput([{ text: `No manual entry for ${args[0]}`, color: "#f44747" }])
    return
  }

  ctx.addOutput(page.map((line) => ({
    text: line,
    color: line.startsWith("  ") ? "#d4d4d4" : "#569cd6",
  })))
}

const FORTUNES = [
  "There are only two hard things in CS: cache invalidation, naming things, and off-by-one errors.",
  "It works on my machine. -- Every developer ever",
  "// TODO: fix this later  (Committed 3 years ago)",
  "A QA engineer walks into a bar. Orders 1 beer. Orders 0 beers. Orders 99999999 beers. Orders -1 beers. Orders a lizard.",
  "Debugging is like being the detective in a crime movie where you are also the murderer.",
  "The best error message is the one that never shows up.",
  "Programming is 10% writing code and 90% understanding why it doesn't work.",
  "If at first you don't succeed, call it version 1.0.",
  "Real programmers count from 0.",
  "There is no place like 127.0.0.1.",
  "!false — It's funny because it's true.",
  "Why do programmers prefer dark mode? Because light attracts bugs.",
]

const fortune: CommandHandler = (_args, ctx) => {
  const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
  ctx.addOutput([{ text: quote, color: "#ce9178" }])
}

const cowsay: CommandHandler = (args, ctx) => {
  const text = args.join(" ") || "moo"
  const border = "-".repeat(text.length + 2)
  ctx.addOutput([
    { text: ` ${border}` },
    { text: `< ${text} >` },
    { text: ` ${border}` },
    { text: "        \\   ^__^" },
    { text: "         \\  (oo)\\_______" },
    { text: "            (__)\\       )\\/\\" },
    { text: "                ||----w |" },
    { text: "                ||     ||" },
  ])
}

// --- Easter egg commands ---

const sudo: CommandHandler = (args, ctx) => {
  const fullCmd = args.join(" ")
  if (fullCmd.startsWith("rm -rf /") || fullCmd === "rm -rf /") {
    ctx.addOutput([
      { text: "Deleting everything...", color: "#f44747" },
      { text: "[##########          ] 50%", color: "#f44747" },
      { text: "[####################] 100%", color: "#f44747" },
      { text: "" },
      { text: "Just kidding. Your portfolio is safe.", color: "#608b4e" },
    ])
    return
  }
  ctx.addOutput([
    { text: "daniel is not in the sudoers file.", color: "#f44747" },
    { text: "This incident will be reported.", color: "#f44747" },
  ])
}

const vim: CommandHandler = (_args, ctx) => {
  ctx.addOutput([
    { text: "Opening vim...", color: "#858585" },
    { text: "" },
    { text: "~", color: "#569cd6" },
    { text: "~", color: "#569cd6" },
    { text: "~                    VIM - Vi IMproved", color: "#569cd6" },
    { text: "~", color: "#569cd6" },
    { text: "~         How do I exit this thing?!", color: "#d7ba7d" },
    { text: "~         (Hint: you don't.)", color: "#858585" },
    { text: "~", color: "#569cd6" },
  ])
}

const exitCmd: CommandHandler = (_args, ctx) => {
  ctx.addOutput([
    { text: "There is no escape from DH OS.", color: "#d7ba7d" },
    { text: "Try: File > Exit to Gateway", color: "#858585" },
  ])
}

const git: CommandHandler = (args, ctx) => {
  const fullCmd = args.join(" ")
  if (fullCmd.includes("push") && fullCmd.includes("force") && fullCmd.includes("main")) {
    ctx.addOutput([
      { text: "Whoa there! That's production!", color: "#f44747", bold: true },
      { text: "NEVER push --force to main. THIS IS NON-NEGOTIABLE.", color: "#f44747" },
    ])
    return
  }
  if (fullCmd === "status") {
    ctx.addOutput([
      { text: "On branch main", color: "#608b4e" },
      { text: "Your branch is up to date with 'origin/main'." },
      { text: "" },
      { text: "nothing to commit, working tree clean" },
    ])
    return
  }
  ctx.addOutput([{ text: `git: simulated — try 'git status'`, color: "#858585" }])
}

const hackermode: CommandHandler = (_args, ctx) => {
  ctx.addOutput([
    { text: "Activating hacker mode...", color: "#00ff00" },
    { text: "ACCESS GRANTED", color: "#00ff00", bold: true },
  ])
  ctx.setHackerMode(true)
}

const ping: CommandHandler = (args, ctx) => {
  const host = args[0] || "localhost"
  ctx.addOutput([
    { text: `PING ${host} (127.0.0.1): 56 data bytes` },
    { text: `64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.042 ms` },
    { text: `64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.038 ms` },
    { text: `64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.041 ms` },
    { text: "" },
    { text: `--- ${host} ping statistics ---` },
    { text: "3 packets transmitted, 3 packets received, 0.0% packet loss", color: "#608b4e" },
    { text: "(this is a simulation)", color: "#858585" },
  ])
}

const sl: CommandHandler = (_args, ctx) => {
  ctx.addOutput([
    { text: "      ====        ________                ___________", color: "#d7ba7d" },
    { text: "  _D _|  |_______/        \\__I_I_____===__|_________)", color: "#d7ba7d" },
    { text: "   |(_)---  |   H\\________/ |   |        =|___ ___|", color: "#d7ba7d" },
    { text: "   /     |  |   H  |  |     |   |         ||_| |_||", color: "#d7ba7d" },
    { text: "  |      |  |   H  |__--------------------| [___] |", color: "#d7ba7d" },
    { text: "  | ________|___H__/__|_____/[][]~\\_______|       |", color: "#d7ba7d" },
    { text: "  |/ |   |-----------I_____I [][] []  D   |=======|__", color: "#d7ba7d" },
    { text: "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__", color: "#d7ba7d" },
    { text: " |/-=|___|=    ||    ||    ||    |_____/~\\___/       ", color: "#d7ba7d" },
    { text: "  \\_/      \\_O=====O=====O=====O_/      \\_/         ", color: "#d7ba7d" },
    { text: "" },
    { text: "  Choo choo! You meant 'ls', didn't you?", color: "#858585" },
  ])
}

const curl: CommandHandler = (args, ctx) => {
  if (args[0]?.includes("danielhernandez") || args[0]?.includes("dh-os") || args[0]?.includes("portfolio")) {
    ctx.addOutput([
      { text: "# Daniel Hernandez", color: "#608b4e" },
      { text: "## Senior Software Engineer", color: "#608b4e" },
      { text: "" },
      { text: "Full-stack engineer with 6+ years building production-grade applications.", color: "#ce9178" },
      { text: "From co-founding a software consultancy to developing secure DoD applications." },
      { text: "" },
      { text: 'Try: open README.md', color: "#858585" },
    ])
    return
  }
  ctx.addOutput([{ text: `curl: simulated — try 'curl danielhernandez.dev'`, color: "#858585" }])
}

const rm: CommandHandler = (args, ctx) => {
  const fullCmd = args.join(" ")
  if (fullCmd.includes("node_modules")) {
    ctx.addOutput([
      { text: "Are you sure? That's 847MB of joy.", color: "#d7ba7d" },
      { text: "Permission denied.", color: "#f44747" },
    ])
    return
  }
  if (fullCmd.includes("-rf /")) {
    ctx.addOutput([{ text: "Nice try. Use 'sudo rm -rf /' for the full experience.", color: "#858585" }])
    return
  }
  ctx.addOutput([{ text: "rm: this is a read-only filesystem", color: "#f44747" }])
}

const nano: CommandHandler = (_args, ctx) => {
  ctx.addOutput([
    { text: "nano? In this economy?", color: "#d7ba7d" },
    { text: "Use File > New File instead.", color: "#858585" },
  ])
}

// --- Command registry ---

export const commands: Record<string, CommandHandler> = {
  help,
  ls,
  dir: ls,
  cd,
  pwd,
  tree,
  cat,
  open,
  run,
  whoami,
  neofetch,
  date,
  uptime,
  history,
  echo,
  clear,
  man,
  fortune,
  cowsay,
  sudo,
  vim,
  exit: exitCmd,
  git,
  hackermode,
  ping,
  sl,
  curl,
  rm,
  nano,
}

/** Parse and execute a command string */
export function executeCommandString(
  input: string,
  ctx: TerminalContext
): void {
  const trimmed = input.trim()
  if (!trimmed) return

  // Handle ./ prefix for executables
  if (trimmed.startsWith("./")) {
    const fileName = trimmed.slice(2)
    const gameName = fileName.replace(/\.exe$/, "")
    run([gameName], ctx)
    return
  }

  const parts = trimmed.split(/\s+/)
  const cmdName = parts[0].toLowerCase()
  const args = parts.slice(1)

  const handler = commands[cmdName]
  if (!handler) {
    ctx.addOutput([
      { text: `${cmdName}: command not found`, color: "#f44747" },
      { text: "Type 'help' for available commands.", color: "#858585" },
    ])
    return
  }

  handler(args, ctx)
}
