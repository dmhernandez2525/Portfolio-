import { type FileNode, fileTree } from "../techie-data"

const ROOT_PATH = "/"
const HOME_PATH = "/PORTFOLIO"

export interface ResolvedNode {
  node: FileNode
  path: string
}

function findNodeInChildren(
  children: FileNode[],
  name: string
): FileNode | null {
  return children.find((c) => c.name === name) ?? null
}

function getNodeChildren(node: FileNode): FileNode[] {
  if (node.type === "folder" && node.children) return node.children
  return []
}

/** Build a virtual root node that wraps the file tree */
function getRootNode(): FileNode {
  return { name: "", type: "folder", children: fileTree }
}

/** Split a path into segments, filtering empty strings */
function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean)
}

/** Normalize a path: resolve ., .., and ~ */
export function normalizePath(cwd: string, input: string): string {
  let segments: string[]

  if (input.startsWith("/")) {
    segments = splitPath(input)
  } else if (input.startsWith("~")) {
    const rest = input.slice(1).replace(/^\//, "")
    segments = [...splitPath(HOME_PATH), ...splitPath(rest)]
  } else {
    segments = [...splitPath(cwd), ...splitPath(input)]
  }

  const resolved: string[] = []
  for (const seg of segments) {
    if (seg === ".") continue
    if (seg === "..") {
      resolved.pop()
      continue
    }
    resolved.push(seg)
  }

  return ROOT_PATH + resolved.join("/")
}

/** Get a FileNode at a given absolute path */
export function getNodeAtPath(absolutePath: string): FileNode | null {
  const segments = splitPath(absolutePath)
  let current = getRootNode()

  for (const seg of segments) {
    const children = getNodeChildren(current)
    const found = findNodeInChildren(children, seg)
    if (!found) return null
    current = found
  }

  return current
}

/** Resolve a path relative to cwd, returning the node and absolute path */
export function resolvePath(
  cwd: string,
  input: string
): ResolvedNode | null {
  const absolutePath = normalizePath(cwd, input)
  const node = getNodeAtPath(absolutePath)
  if (!node) return null
  return { node, path: absolutePath }
}

/** List children of a directory at the given path */
export function listDirectory(
  absolutePath: string,
  showHidden = false
): FileNode[] {
  const node = getNodeAtPath(absolutePath)
  if (!node || node.type !== "folder") return []
  const children = getNodeChildren(node)
  if (showHidden) return children
  return children.filter((c) => !c.hidden)
}

/** Get all file/folder paths recursively for autocomplete */
export function getAllPaths(
  basePath = ROOT_PATH,
  showHidden = false
): string[] {
  const results: string[] = []

  function walk(node: FileNode, currentPath: string) {
    const children = getNodeChildren(node)
    for (const child of children) {
      if (!showHidden && child.hidden) continue
      const childPath =
        currentPath === ROOT_PATH
          ? `/${child.name}`
          : `${currentPath}/${child.name}`
      results.push(childPath)
      if (child.type === "folder") {
        walk(child, childPath)
      }
    }
  }

  const rootNode = getNodeAtPath(basePath)
  if (rootNode) walk(rootNode, basePath)
  return results
}

/** Build a tree string representation with box-drawing characters */
export function buildTreeString(
  absolutePath: string,
  showHidden = false
): string[] {
  const node = getNodeAtPath(absolutePath)
  if (!node) return ["No such directory"]

  const lines: string[] = []
  lines.push(node.name || "/")

  function walk(parent: FileNode, prefix: string) {
    const children = getNodeChildren(parent).filter(
      (c) => showHidden || !c.hidden
    )
    children.forEach((child, i) => {
      const isLast = i === children.length - 1
      const connector = isLast ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 "
      const suffix = child.type === "folder" ? "/" : ""
      lines.push(`${prefix}${connector}${child.name}${suffix}`)
      if (child.type === "folder") {
        const nextPrefix = prefix + (isLast ? "    " : "\u2502   ")
        walk(child, nextPrefix)
      }
    })
  }

  walk(node, "")
  return lines
}

/** Find a node by its contentKey */
export function findNodeByContentKey(
  contentKey: string,
  basePath = ROOT_PATH
): ResolvedNode | null {
  function walk(
    node: FileNode,
    currentPath: string
  ): ResolvedNode | null {
    if (node.contentKey === contentKey) {
      return { node, path: currentPath }
    }
    for (const child of getNodeChildren(node)) {
      const childPath =
        currentPath === ROOT_PATH
          ? `/${child.name}`
          : `${currentPath}/${child.name}`
      const result = walk(child, childPath)
      if (result) return result
    }
    return null
  }

  const rootNode = getNodeAtPath(basePath)
  if (!rootNode) return null

  // For root, check children directly
  for (const child of getNodeChildren(rootNode)) {
    const childPath =
      basePath === ROOT_PATH
        ? `/${child.name}`
        : `${basePath}/${child.name}`
    const result = walk(child, childPath)
    if (result) return result
  }
  return null
}

/** Get display path with ~ substitution */
export function displayPath(absolutePath: string): string {
  if (absolutePath === HOME_PATH) return "~"
  if (absolutePath.startsWith(HOME_PATH + "/")) {
    return "~" + absolutePath.slice(HOME_PATH.length)
  }
  return absolutePath
}

export { ROOT_PATH, HOME_PATH }
