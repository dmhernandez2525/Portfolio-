import { X } from "lucide-react"
import type { TechieTab } from "./TechieLayout"
import { getFileIcon } from "./techie-data"

interface TechieTabsProps {
  tabs: TechieTab[]
  activeTabId: string | null
  onActivate: (id: string) => void
  onClose: (id: string) => void
}

export function TechieTabs({ tabs, activeTabId, onActivate, onClose }: TechieTabsProps) {
  if (tabs.length === 0) return null

  return (
    <div className="flex bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        const icon = tab.isUntitled ? "\u{1F4C4}" : getFileIcon(tab.fileName)

        return (
          <div
            key={tab.id}
            className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-[#3c3c3c] shrink-0 transition-colors ${
              isActive
                ? "bg-[#1e1e1e] text-[#ffffff] border-t-2 border-t-[#007acc]"
                : "bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a] border-t-2 border-t-transparent"
            }`}
            onClick={() => onActivate(tab.id)}
          >
            <span className="text-[10px]">{icon}</span>
            <span className="max-w-[120px] truncate">{tab.fileName}</span>
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
