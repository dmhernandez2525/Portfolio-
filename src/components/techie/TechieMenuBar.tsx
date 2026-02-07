import { useState, useEffect, useRef } from "react"
import { useMode } from "@/context/mode-context"

interface MenuItem {
  label: string
  shortcut?: string
  action?: string
  disabled?: boolean
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

const menus: MenuGroup[] = [
  {
    label: "File",
    items: [
      { label: "New File", shortcut: "\u2318N", action: "new-file" },
      { label: "separator" },
      { label: "Close Tab", shortcut: "\u2318W", action: "close-tab" },
      { label: "Close All Tabs", shortcut: "\u2318\u21E7W", action: "close-all-tabs" },
      { label: "separator" },
      { label: "Save", shortcut: "\u2318S", action: "save" },
      { label: "separator" },
      { label: "Print...", shortcut: "\u2318P", action: "print" },
      { label: "separator" },
      { label: "Exit to Gateway", shortcut: "\u2318Q", action: "exit" },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Undo", shortcut: "\u2318Z" },
      { label: "Redo", shortcut: "\u2318\u21E7Z" },
      { label: "separator" },
      { label: "Copy", shortcut: "\u2318C" },
      { label: "Cut", shortcut: "\u2318X" },
      { label: "Paste", shortcut: "\u2318V" },
      { label: "separator" },
      { label: "Select All", shortcut: "\u2318A" },
      { label: "Find", shortcut: "\u2318F" },
    ],
  },
  {
    label: "View",
    items: [
      { label: "Toggle Sidebar", shortcut: "\u2318B", action: "toggle-sidebar" },
      { label: "Toggle Terminal", shortcut: "\u2318`", action: "toggle-terminal" },
      { label: "Toggle Status Bar", action: "toggle-statusbar" },
      { label: "separator" },
      { label: "Full Screen", shortcut: "F11", action: "fullscreen" },
      { label: "Zen Mode", shortcut: "\u2318K Z", action: "zen-mode" },
      { label: "separator" },
      { label: "Zoom In", shortcut: "\u2318=" },
      { label: "Zoom Out", shortcut: "\u2318-" },
    ],
  },
  {
    label: "Go",
    items: [
      { label: "Go to File...", shortcut: "\u2318P", action: "command-palette" },
    ],
  },
  {
    label: "Window",
    items: [
      { label: "Toggle Zen Mode", shortcut: "\u2318K Z", action: "zen-mode" },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "About DH OS", action: "about" },
      { label: "Welcome", action: "welcome" },
      { label: "separator" },
      { label: "Check for Updates", action: "check-updates" },
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
  const [updateToast, setUpdateToast] = useState(false)
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

  // Auto-dismiss update toast
  useEffect(() => {
    if (!updateToast) return
    const timer = setTimeout(() => setUpdateToast(false), 3000)
    return () => clearTimeout(timer)
  }, [updateToast])

  const handleItemClick = (item: MenuItem) => {
    setOpenMenu(null)
    if (!item.action || item.disabled) return

    // Actions handled directly in menu bar
    if (item.action === "exit") {
      clearMode()
      return
    }
    if (item.action === "print") {
      window.print()
      return
    }
    if (item.action === "check-updates") {
      setUpdateToast(true)
      return
    }

    onAction(item.action)
  }

  return (
    <>
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
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        className={`w-full flex items-center justify-between px-4 py-1 text-left transition-colors ${
                          item.disabled
                            ? "text-[#585858] cursor-default"
                            : "hover:bg-[#094771]"
                        }`}
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

      {/* Update toast */}
      {updateToast && (
        <div className="fixed top-12 right-4 z-50 bg-[#252526] border border-[#454545] px-4 py-2 text-xs text-[#cccccc] font-mono shadow-xl">
          You're on the latest version of DH OS v1.0.0
        </div>
      )}
    </>
  )
}
