const SANDBOX_TIMEOUT_MS = 3000

const BLOCKED_GLOBALS = [
  "window", "globalThis", "self", "top", "parent", "frames",
  "document", "fetch", "XMLHttpRequest", "localStorage",
  "sessionStorage", "indexedDB", "navigator", "location", "history",
  "alert", "confirm", "prompt", "eval", "Function", "importScripts",
  "WebSocket", "Worker", "SharedWorker", "ServiceWorker",
] as const

const BLOCKED_PATTERNS = [
  /\.constructor\b/,
  /\[['"`]constructor['"`]\]/,
  /\.__proto__\b/,
  /\[['"`]__proto__['"`]\]/,
  /\[\s*['"`].*\+/,
  /\bimport\s*\(/,
] as const

export function formatValue(val: unknown, depth = 0, quoteStrings = false): string {
  if (depth > 3) return "[...]"
  if (val === null) return "null"
  if (val === undefined) return "undefined"
  if (typeof val === "string") return quoteStrings || depth > 0 ? `"${val}"` : val
  if (typeof val === "number" || typeof val === "boolean") return String(val)
  if (typeof val === "function") return `[Function: ${val.name || "anonymous"}]`
  if (typeof val === "symbol") return val.toString()
  if (Array.isArray(val)) {
    const items = val.slice(0, 20).map((v) => formatValue(v, depth + 1, true))
    const suffix = val.length > 20 ? `, ... (${val.length} items)` : ""
    return `[${items.join(", ")}${suffix}]`
  }
  if (typeof val === "object") {
    const entries = Object.entries(val as Record<string, unknown>).slice(0, 10)
    const items = entries.map(([k, v]) => `${k}: ${formatValue(v, depth + 1, true)}`)
    return `{ ${items.join(", ")} }`
  }
  return String(val)
}

function createSandbox() {
  const logs: string[] = []
  const maxLogs = 100

  function capture(...args: unknown[]) {
    if (logs.length >= maxLogs) return
    logs.push(args.map((a) => formatValue(a)).join(" "))
  }

  const console = {
    log: capture,
    info: capture,
    warn: capture,
    error: capture,
    debug: capture,
    dir: capture,
    table: (...args: unknown[]) => {
      if (Array.isArray(args[0])) {
        args[0].forEach((row, i) => capture(`[${i}]`, row))
      } else {
        capture(...args)
      }
    },
    clear: () => { logs.length = 0 },
    time: () => {},
    timeEnd: () => {},
    assert: (cond: unknown, ...args: unknown[]) => {
      if (!cond) capture("Assertion failed:", ...args)
    },
    count: (() => {
      const counts: Record<string, number> = {}
      return (label = "default") => {
        counts[label] = (counts[label] ?? 0) + 1
        capture(`${label}: ${counts[label]}`)
      }
    })(),
    group: () => {},
    groupEnd: () => {},
  }

  return { logs, console }
}

export interface SandboxResult {
  logs: string[]
  result: string | null
  error: string | null
}

export function executeSandboxedJS(code: string): SandboxResult {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return { logs: [], result: null, error: "Blocked: restricted syntax detected (prototype chain access)" }
    }
  }

  const { logs, console } = createSandbox()

  const blockedParams = BLOCKED_GLOBALS.join(", ")
  const blockedValues = BLOCKED_GLOBALS.map(() => undefined)

  try {
    const wrappedCode = `"use strict"; ${code}`

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(
      "console", "Math", "JSON", "Date", "Array", "Object", "String",
      "Number", "Boolean", "RegExp", "Map", "Set", "Symbol", "Promise",
      "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURIComponent",
      "decodeURIComponent", "setTimeout", "setInterval", "clearTimeout", "clearInterval",
      blockedParams,
      wrappedCode,
    )

    let result: unknown
    let timedOut = false
    const startTime = performance.now()

    try {
      result = fn(
        console, Math, JSON, Date, Array, Object, String,
        Number, Boolean, RegExp, Map, Set, Symbol, Promise,
        parseInt, parseFloat, isNaN, isFinite, encodeURIComponent,
        decodeURIComponent,
        () => {}, () => {}, () => {}, () => {},
        ...blockedValues,
      )
    } finally {
      if (performance.now() - startTime > SANDBOX_TIMEOUT_MS) {
        timedOut = true
      }
    }

    if (timedOut) {
      return { logs, result: null, error: `Execution timed out (>${SANDBOX_TIMEOUT_MS}ms)` }
    }

    const resultStr = result !== undefined ? formatValue(result, 0, true) : null
    return { logs, result: resultStr, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { logs, result: null, error: message }
  }
}
