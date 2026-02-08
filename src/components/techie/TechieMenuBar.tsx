import { useState, useEffect, useRef } from "react"
import { useMode } from "@/context/mode-context"

interface MenuItem {
  label: string
  shortcut?: string
  action?: string
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

const menus: MenuGroup[] = [
  {
    label: "File",
    items: [
      { label: "New File", shortcut: "Ctrl+N", action: "new-file" },
      { label: "separator" },
      { label: "Print...", shortcut: "Ctrl+P", action: "print" },
      { label: "separator" },
      { label: "Exit to Gateway", shortcut: "Ctrl+Q", action: "exit" },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Copy", shortcut: "Ctrl+C" },
      { label: "Cut", shortcut: "Ctrl+X" },
      { label: "Paste", shortcut: "Ctrl+V" },
      { label: "separator" },
      { label: "Find", shortcut: "Ctrl+F" },
    ],
  },
  {
    label: "View",
    items: [
      { label: "Toggle Sidebar", shortcut: "Ctrl+B", action: "toggle-sidebar" },
      { label: "separator" },
      { label: "Zoom In", shortcut: "Ctrl+=" },
      { label: "Zoom Out", shortcut: "Ctrl+-" },
    ],
  },
  {
    label: "Go",
    items: [
      { label: "Go to File...", shortcut: "Ctrl+P" },
      { label: "Go to Line...", shortcut: "Ctrl+G" },
    ],
  },
  {
    label: "Window",
    items: [
      { label: "New Window", shortcut: "Ctrl+Shift+N" },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "About DH OS", action: "about" },
      { label: "separator" },
      { label: "Panic!", action: "panic" },
    ],
  },
]

interface TechieMenuBarProps {
  onAction: (action: string) => void
}

export function TechieMenuBar({ onAction }: TechieMenuBarProps) {
  const { clearMode } = useMode()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [time, setTime] = useState(new Date())
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleItemClick = (action?: string) => {
    setOpenMenu(null)
    if (!action) return
    if (action === "exit") {
      clearMode()
      return
    }
    if (action === "print") {
      window.print()
      return
    }
    onAction(action)
  }

  return (
    <div ref={menuRef} className="flex items-center justify-between flex-1 text-[#cccccc] text-xs font-mono select-none">
      <div className="flex items-center">
        {menus.map((menu) => (
          <div key={menu.label} className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
              className={`px-3 py-1.5 transition-colors ${
                openMenu === menu.label ? "bg-[#505050]" : "hover:bg-[#3c3c3c]"
              }`}
            >
              {menu.label}
            </button>

            {openMenu === menu.label && (
              <div className="absolute top-full left-0 min-w-[220px] bg-[#252526] border border-[#454545] shadow-xl z-50 py-1">
                {menu.items.map((item, i) =>
                  item.label === "separator" ? (
                    <div key={i} className="border-t border-[#454545] my-1 mx-2" />
                  ) : (
                    <button
                      key={item.label}
                      onClick={() => handleItemClick(item.action)}
                      className="w-full flex items-center justify-between px-4 py-1 hover:bg-[#094771] text-left transition-colors"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-[#858585] ml-8 text-[10px]">{item.shortcut}</span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-3 py-1.5 text-[#858585]">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  )
}
