import { useState, useEffect, useRef, useMemo } from "react"
import { fileTree, getFileIcon, type FileNode } from "../techie-data"

interface CommandPaletteProps {
  onSelect: (contentKey: string, fileName: string) => void
  onClose: () => void
}

interface FileEntry {
  name: string
  path: string
  contentKey: string
  icon: string
}

function flattenTree(nodes: FileNode[], parentPath = ""): FileEntry[] {
  const entries: FileEntry[] = []
  for (const node of nodes) {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name
    if (node.type === "file" && node.contentKey) {
      entries.push({
        name: node.name,
        path,
        contentKey: node.contentKey,
        icon: getFileIcon(node.name),
      })
    }
    if (node.children) {
      entries.push(...flattenTree(node.children, path))
    }
  }
  return entries
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

export function CommandPalette({ onSelect, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const allFiles = useMemo(() => flattenTree(fileTree), [])

  const filtered = useMemo(() => {
    if (!query.trim()) return allFiles
    return allFiles.filter(
      (f) => fuzzyMatch(query, f.name) || fuzzyMatch(query, f.path)
    )
  }, [query, allFiles])

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [filtered.length])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.children[selectedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      const selected = filtered[selectedIndex]
      if (selected) {
        onSelect(selected.contentKey, selected.name)
        onClose()
      }
      return
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center pt-[15%]" onClick={onClose}>
      <div
        className="w-[500px] max-w-[90vw] bg-[#252526] border border-[#454545] shadow-2xl max-h-[60vh] flex flex-col self-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center px-3 py-2 border-b border-[#3c3c3c]">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to search files..."
            className="flex-1 bg-transparent text-[#cccccc] text-sm font-mono outline-none placeholder-[#858585]"
            spellCheck={false}
          />
        </div>

        {/* Results list */}
        <div ref={listRef} className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-[#858585] text-xs font-mono">
              No matching files
            </div>
          ) : (
            filtered.map((file, i) => (
              <button
                key={file.contentKey}
                onClick={() => {
                  onSelect(file.contentKey, file.name)
                  onClose()
                }}
                className={`w-full flex items-center gap-2 px-4 py-1.5 text-left text-xs font-mono transition-colors ${
                  i === selectedIndex
                    ? "bg-[#094771] text-white"
                    : "text-[#cccccc] hover:bg-[#2a2d2e]"
                }`}
              >
                <span className="text-[10px] shrink-0">{file.icon}</span>
                <span className="truncate">{file.name}</span>
                <span className="text-[#858585] truncate ml-auto text-[10px]">
                  {file.path}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-1.5 border-t border-[#3c3c3c] text-[10px] text-[#858585] font-mono">
          <span className="mr-4">&uarr;&darr; navigate</span>
          <span className="mr-4">&crarr; open</span>
          <span>esc dismiss</span>
        </div>
      </div>
    </div>
  )
}
