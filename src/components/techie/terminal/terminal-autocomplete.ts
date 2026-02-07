import { commands } from "./terminal-commands"
import { listDirectory, normalizePath } from "./terminal-filesystem"

const PATH_COMMANDS = new Set(["cd", "cat", "open", "ls", "tree", "run", "man"])

/** Get tab completion candidates for the current input */
export function getCompletions(
  input: string,
  cwd: string
): string[] {
  const trimmed = input.trimStart()
  const parts = trimmed.split(/\s+/)

  // Completing command name (first token)
  if (parts.length <= 1) {
    const partial = parts[0]?.toLowerCase() ?? ""
    return Object.keys(commands)
      .filter((cmd) => cmd.startsWith(partial) && cmd !== partial)
      .sort()
  }

  const cmdName = parts[0].toLowerCase()

  // man command: complete with command names
  if (cmdName === "man") {
    const partial = parts[parts.length - 1].toLowerCase()
    return Object.keys(commands)
      .filter((cmd) => cmd.startsWith(partial) && cmd !== partial)
      .sort()
  }

  // run command: complete with game names
  if (cmdName === "run") {
    const gameNames = ["snake", "tetris", "chess", "falling-blocks", "cookie-clicker", "agar"]
    const partial = parts[parts.length - 1].toLowerCase()
    return gameNames
      .filter((g) => g.startsWith(partial) && g !== partial)
      .sort()
  }

  // Path-based completion for cd, cat, open, ls, tree
  if (!PATH_COMMANDS.has(cmdName)) return []

  const lastArg = parts[parts.length - 1]
  if (lastArg.startsWith("-")) return []

  // Split into directory part and partial name
  const lastSlash = lastArg.lastIndexOf("/")
  let dirPart: string
  let partial: string

  if (lastSlash === -1) {
    dirPart = cwd
    partial = lastArg.toLowerCase()
  } else {
    dirPart = normalizePath(cwd, lastArg.slice(0, lastSlash + 1))
    partial = lastArg.slice(lastSlash + 1).toLowerCase()
  }

  const children = listDirectory(dirPart, lastArg.startsWith("."))
  const matches = children
    .filter((child) => child.name.toLowerCase().startsWith(partial) && child.name.toLowerCase() !== partial)
    .map((child) => {
      const prefix = lastSlash === -1 ? "" : lastArg.slice(0, lastSlash + 1)
      const suffix = child.type === "folder" ? "/" : ""
      return prefix + child.name + suffix
    })
    .sort()

  return matches
}

/** Apply a completion to the current input, returning the new input string */
export function applyCompletion(input: string, completion: string): string {
  const parts = input.trimStart().split(/\s+/)

  if (parts.length <= 1) {
    // Completing command name
    return completion + " "
  }

  // Completing an argument
  parts[parts.length - 1] = completion
  return parts.join(" ") + (completion.endsWith("/") ? "" : " ")
}
