import { Files, Puzzle, Settings } from "lucide-react"

export type ActivityBarPanel = "files" | "extensions"

interface TechieActivityBarProps {
  activePanel: ActivityBarPanel
  onPanelChange: (panel: ActivityBarPanel) => void
  onOpenSettings: () => void
}

const topItems: { id: ActivityBarPanel; icon: typeof Files; label: string }[] = [
  { id: "files", icon: Files, label: "Explorer" },
  { id: "extensions", icon: Puzzle, label: "Extensions" },
]

export function TechieActivityBar({ activePanel, onPanelChange, onOpenSettings }: TechieActivityBarProps) {
  return (
    <div className="w-12 shrink-0 bg-[#333333] flex flex-col items-center justify-between border-r border-[#3c3c3c] py-1">
      <div className="flex flex-col items-center gap-0.5">
        {topItems.map(({ id, icon: Icon, label }) => {
          const isActive = activePanel === id
          return (
            <button
              key={id}
              onClick={() => onPanelChange(id)}
              className={`w-12 h-12 flex items-center justify-center transition-colors relative ${
                isActive
                  ? "text-white"
                  : "text-[#858585] hover:text-white"
              }`}
              title={label}
            >
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-white" />
              )}
              <Icon className="w-5 h-5" />
            </button>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-0.5 pb-1">
        <button
          onClick={onOpenSettings}
          className="w-12 h-12 flex items-center justify-center text-[#858585] hover:text-white transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
