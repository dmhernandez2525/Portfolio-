import { useState, useRef, useEffect, useCallback } from "react"
import { X } from "lucide-react"
import type { TechieTab } from "./TechieLayout"
import { getFileIcon } from "./techie-data"

interface TechieTabsProps {
  tabs: TechieTab[]
  activeTabId: string | null
  onActivate: (id: string) => void
  onClose: (id: string) => void
  onRename?: (id: string, newName: string) => void
}

export function TechieTabs({ tabs, activeTabId, onActivate, onClose, onRename }: TechieTabsProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const startRename = useCallback((tab: TechieTab) => {
    if (!onRename) return
    setRenamingId(tab.id)
    setRenameValue(tab.fileName)
  }, [onRename])

  const commitRename = useCallback(() => {
    if (!renamingId || !onRename) return
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== tabs.find(t => t.id === renamingId)?.fileName) {
      onRename(renamingId, trimmed)
    }
    setRenamingId(null)
  }, [renamingId, renameValue, onRename, tabs])

  const cancelRename = useCallback(() => {
    setRenamingId(null)
  }, [])

  // Focus input when renaming starts
  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [renamingId])

  // F2 to rename active tab
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F2" && activeTabId && onRename && !renamingId) {
        e.preventDefault()
        const tab = tabs.find(t => t.id === activeTabId)
        if (tab) startRename(tab)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [activeTabId, onRename, renamingId, tabs, startRename])

  if (tabs.length === 0) return null

  return (
    <div className="flex bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        const icon = tab.isUntitled ? "\u{1F4C4}" : getFileIcon(tab.fileName)
        const isRenaming = renamingId === tab.id

        return (
          <div
            key={tab.id}
            className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-[#3c3c3c] shrink-0 transition-colors ${
              isActive
                ? "bg-[#1e1e1e] text-[#ffffff] border-t-2 border-t-[#007acc]"
                : "bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a] border-t-2 border-t-transparent"
            }`}
            onClick={() => onActivate(tab.id)}
            onDoubleClick={() => startRename(tab)}
          >
            <span className="text-[10px]">{icon}</span>

            {isRenaming ? (
              <input
                ref={inputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename()
                  if (e.key === "Escape") cancelRename()
                  e.stopPropagation()
                }}
                onBlur={commitRename}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#3c3c3c] border border-[#007acc] text-[#cccccc] text-xs px-1 py-0 outline-none w-[100px] font-mono"
              />
            ) : (
              <span className="max-w-[120px] truncate">{tab.fileName}</span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose(tab.id)
              }}
              className={`ml-1 p-0.5 rounded-sm transition-colors ${
                isActive
                  ? "hover:bg-[#3c3c3c] text-[#cccccc]"
                  : "opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] text-[#969696]"
              }`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
