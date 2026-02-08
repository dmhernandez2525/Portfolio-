import { useState, useCallback, useEffect } from "react"
import { TechieMenuBar } from "./TechieMenuBar"
import { TechieFileExplorer } from "./TechieFileExplorer"
import { TechieContentViewer } from "./TechieContentViewer"
import { TechieTabs } from "./TechieTabs"
import { TechieStatusBar } from "./TechieStatusBar"
import { TechieTerminal } from "./terminal/TechieTerminal"
import { MatrixRain } from "./MatrixRain"
import { AboutDialog } from "./AboutDialog"
import { CommandPalette } from "./dialogs/CommandPalette"
import { KeyboardShortcutsDialog } from "./dialogs/KeyboardShortcutsDialog"
import { ReleaseNotesDialog } from "./dialogs/ReleaseNotesDialog"
import { useEasterEggs } from "@/hooks/use-easter-eggs"

export interface TechieTab {
  id: string
  fileName: string
  contentKey: string
  isUntitled?: boolean
  editorContent?: string
}

export function TechieLayout() {
  const [tabs, setTabs] = useState<TechieTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [showMatrix, setShowMatrix] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [untitledCounter, setUntitledCounter] = useState(1)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [hackerMode, setHackerMode] = useState(false)
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [zenMode, setZenMode] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showReleaseNotes, setShowReleaseNotes] = useState(false)
  const [showHiddenFiles, setShowHiddenFiles] = useState(false)
  const [easterEggToast, setEasterEggToast] = useState<string | null>(null)

  const activeTab = tabs.find(t => t.id === activeTabId) ?? null

  // Hacker mode auto-off after 10 seconds
  useEffect(() => {
    if (!hackerMode) return
    const timer = setTimeout(() => setHackerMode(false), 10000)
    return () => clearTimeout(timer)
  }, [hackerMode])

  // Easter egg toast auto-dismiss
  useEffect(() => {
    if (!easterEggToast) return
    const timer = setTimeout(() => setEasterEggToast(null), 3000)
    return () => clearTimeout(timer)
  }, [easterEggToast])

  // Easter egg keyboard triggers
  useEasterEggs({
    onKonami: useCallback(() => {
      setShowHiddenFiles(true)
      setEasterEggToast("Hidden files revealed! Check the explorer.")
    }, []),
    onGandalf: useCallback(() => {
      setEasterEggToast("You shall not pass! ...but you can browse.")
    }, []),
    onDaniel: useCallback(() => {
      setShowAbout(true)
    }, []),
    onGhost: useCallback(() => {
      setEasterEggToast("Boo! ...did I scare you?")
    }, []),
    onMonkey: useCallback(() => {
      setEasterEggToast("Monkey mode activated! Just kidding.")
    }, []),
  })

  const openFile = useCallback((contentKey: string, fileName: string) => {
    // External links
    if (contentKey.startsWith("link-")) {
      const urls: Record<string, string> = {
        "link-github": "https://github.com/dmhernandez2525",
        "link-linkedin": "https://linkedin.com/in/dh25",
      }
      const url = urls[contentKey]
      if (url) window.open(url, "_blank")
      return
    }

    // Check if tab already exists
    const existing = tabs.find(t => t.contentKey === contentKey && !t.isUntitled)
    if (existing) {
      setActiveTabId(existing.id)
      return
    }

    const newTab: TechieTab = {
      id: `${contentKey}-${Date.now()}`,
      fileName,
      contentKey,
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [tabs])

  const createNewFile = useCallback(() => {
    const num = untitledCounter
    setUntitledCounter(prev => prev + 1)
    const newTab: TechieTab = {
      id: `untitled-${Date.now()}`,
      fileName: `Untitled-${num}`,
      contentKey: `untitled-${num}`,
      isUntitled: true,
      editorContent: "",
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [untitledCounter])

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId)
      const next = prev.filter(t => t.id !== tabId)
      if (activeTabId === tabId) {
        if (next.length > 0) {
          const newIdx = Math.min(idx, next.length - 1)
          setActiveTabId(next[newIdx].id)
        } else {
          setActiveTabId(null)
        }
      }
      return next
    })
  }, [activeTabId])

  const closeAllTabs = useCallback(() => {
    setTabs([])
    setActiveTabId(null)
  }, [])

  const handleSave = useCallback(() => {
    if (!activeTab?.isUntitled || !activeTab.editorContent) return
    const blob = new Blob([activeTab.editorContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeTab.fileName}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [activeTab])

  const updateEditorContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, editorContent: content } : t
    ))
  }, [])

  // Action lookup table (no switch statement)
  const menuActions: Record<string, () => void> = {
    "new-file": createNewFile,
    "close-tab": () => { if (activeTabId) closeTab(activeTabId) },
    "close-all-tabs": closeAllTabs,
    "save": handleSave,
    "toggle-sidebar": () => setSidebarOpen(prev => !prev),
    "toggle-terminal": () => setTerminalOpen(prev => !prev),
    "toggle-statusbar": () => setShowStatusBar(prev => !prev),
    "fullscreen": () => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        document.documentElement.requestFullscreen?.()
      }
    },
    "zen-mode": () => setZenMode(prev => !prev),
    "command-palette": () => setShowCommandPalette(true),
    "shortcuts": () => setShowShortcuts(true),
    "release-notes": () => setShowReleaseNotes(true),
    "welcome": () => openFile("readme", "README.md"),
    "check-updates": () => {
      // Brief visual feedback - handled by menu bar toast
    },
    "panic": () => setShowMatrix(true),
    "about": () => setShowAbout(true),
  }

  const handleMenuAction = useCallback((action: string) => {
    const handler = menuActions[action]
    if (handler) handler()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId, createNewFile, closeAllTabs, handleSave, openFile])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key === "`") {
        e.preventDefault()
        setTerminalOpen(prev => !prev)
        return
      }
      if (ctrl && e.key === "b") {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
        return
      }
      if (ctrl && e.key === "w") {
        e.preventDefault()
        if (activeTabId) closeTab(activeTabId)
        return
      }
      if (ctrl && e.key === "p") {
        e.preventDefault()
        setShowCommandPalette(prev => !prev)
        return
      }
      if (ctrl && e.key === "n") {
        e.preventDefault()
        createNewFile()
        return
      }
      if (e.key === "F11") {
        e.preventDefault()
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          document.documentElement.requestFullscreen?.()
        }
        return
      }
      if (e.key === "Escape") {
        if (showCommandPalette) { setShowCommandPalette(false); return }
        if (showShortcuts) { setShowShortcuts(false); return }
        if (showReleaseNotes) { setShowReleaseNotes(false); return }
        if (zenMode) { setZenMode(false); return }
        if (showMatrix) { setShowMatrix(false); return }
        if (showAbout) { setShowAbout(false); return }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [activeTabId, closeTab, createNewFile, zenMode, showMatrix, showAbout, showCommandPalette, showShortcuts, showReleaseNotes])

  const showChrome = !zenMode

  return (
    <div className={`h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#d4d4d4] font-mono overflow-hidden select-none ${hackerMode ? "hacker-mode" : ""}`}>
      {/* Window chrome with traffic lights */}
      {showChrome && (
        <div className="flex items-center bg-[#323233] border-b border-[#3c3c3c]">
          <div className="flex items-center gap-2 px-4 py-2.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d4a528]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]" />
          </div>
          <TechieMenuBar onAction={handleMenuAction} />
        </div>
      )}

      {/* Tab bar */}
      {showChrome && (
        <TechieTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onActivate={setActiveTabId}
          onClose={closeTab}
        />
      )}

      {/* Breadcrumb */}
      {showChrome && (
        <div className="flex items-center px-4 py-1 bg-[#252526] border-b border-[#3c3c3c] text-xs text-[#858585]">
          <span className="text-[#cccccc]">daniel-hernandez</span>
          {activeTab && (
            <>
              <span className="mx-1.5">&gt;</span>
              <span className="text-[#cccccc]">{activeTab.fileName}</span>
            </>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showChrome && sidebarOpen && (
          <div className="w-56 shrink-0 hidden sm:block">
            <TechieFileExplorer
              currentFile={activeTab?.contentKey ?? null}
              onFileSelect={openFile}
              showHidden={showHiddenFiles}
            />
          </div>
        )}

        {/* Main content + terminal vertical split */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content viewer */}
          <div className="flex-1 overflow-auto bg-[#1e1e1e]">
            <TechieContentViewer
              tab={activeTab}
              onEditorChange={updateEditorContent}
            />
          </div>

          {/* Terminal panel */}
          {terminalOpen && (
            <div className="h-[200px] sm:h-[240px] shrink-0 border-t border-[#3c3c3c]">
              <TechieTerminal
                openFile={openFile}
                onClose={() => setTerminalOpen(false)}
                setHackerMode={setHackerMode}
                triggerMatrix={() => setShowMatrix(true)}
              />
            </div>
          )}
        </div>
      </div>

      {showChrome && showStatusBar && (
        <TechieStatusBar
          currentFile={activeTab?.fileName ?? ""}
          lineCount={activeTab?.isUntitled ? (activeTab.editorContent?.split("\n").length ?? 1) : undefined}
          terminalOpen={terminalOpen}
          onToggleTerminal={() => setTerminalOpen(prev => !prev)}
        />
      )}

      {/* Zen mode escape hint */}
      {zenMode && (
        <div className="fixed bottom-4 right-4 text-[10px] text-[#858585] opacity-50 hover:opacity-100 transition-opacity">
          Press Escape to exit Zen Mode
        </div>
      )}

      {/* Mobile sidebar */}
      <MobileSidebar
        currentFile={activeTab?.contentKey ?? null}
        onFileSelect={openFile}
        sidebarOpen={sidebarOpen}
        showHidden={showHiddenFiles}
      />

      {/* Overlays */}
      {showMatrix && <MatrixRain onDismiss={() => setShowMatrix(false)} />}
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
      {showCommandPalette && (
        <CommandPalette
          onSelect={openFile}
          onClose={() => setShowCommandPalette(false)}
        />
      )}
      {showShortcuts && <KeyboardShortcutsDialog onClose={() => setShowShortcuts(false)} />}
      {showReleaseNotes && <ReleaseNotesDialog onClose={() => setShowReleaseNotes(false)} />}

      {/* Easter egg toast */}
      {easterEggToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#252526] border border-[#454545] px-4 py-2 text-xs text-[#4ec9b0] font-mono shadow-xl">
          {easterEggToast}
        </div>
      )}
    </div>
  )
}

function MobileSidebar({
  currentFile,
  onFileSelect,
  sidebarOpen,
  showHidden,
}: {
  currentFile: string | null
  onFileSelect: (contentKey: string, fileName: string) => void
  sidebarOpen: boolean
  showHidden: boolean
}) {
  const [open, setOpen] = useState(false)

  if (sidebarOpen) return null

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-1 right-2 z-50 px-2 py-1 bg-[#252526] border border-[#3c3c3c] text-[#cccccc] text-xs font-mono"
      >
        {open ? "Close" : "Files"}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-[#252526] border-r border-[#3c3c3c] overflow-y-auto">
            <TechieFileExplorer
              currentFile={currentFile}
              onFileSelect={(key, name) => {
                onFileSelect(key, name)
                setOpen(false)
              }}
              showHidden={showHidden}
            />
          </div>
        </div>
      )}
    </div>
  )
}
