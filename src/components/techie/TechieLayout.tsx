import { useState, useCallback } from "react"
import { TechieMenuBar } from "./TechieMenuBar"
import { TechieFileExplorer } from "./TechieFileExplorer"
import { TechieContentViewer } from "./TechieContentViewer"
import { TechieTabs } from "./TechieTabs"
import { TechieStatusBar } from "./TechieStatusBar"
import { MatrixRain } from "./MatrixRain"
import { AboutDialog } from "./AboutDialog"

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

  const activeTab = tabs.find(t => t.id === activeTabId) ?? null

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
        // Activate adjacent tab
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

  const updateEditorContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, editorContent: content } : t
    ))
  }, [])

  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case "new-file":
        createNewFile()
        break
      case "toggle-sidebar":
        setSidebarOpen(prev => !prev)
        break
      case "panic":
        setShowMatrix(true)
        break
      case "about":
        setShowAbout(true)
        break
    }
  }, [createNewFile])

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#d4d4d4] font-mono overflow-hidden select-none">
      {/* Window chrome with traffic lights */}
      <div className="flex items-center bg-[#323233] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2 px-4 py-2.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d4a528]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]" />
        </div>
        <TechieMenuBar onAction={handleMenuAction} />
      </div>

      {/* Tab bar */}
      <TechieTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onActivate={setActiveTabId}
        onClose={closeTab}
      />

      {/* Breadcrumb */}
      <div className="flex items-center px-4 py-1 bg-[#252526] border-b border-[#3c3c3c] text-xs text-[#858585]">
        <span className="text-[#cccccc]">daniel-hernandez</span>
        {activeTab && (
          <>
            <span className="mx-1.5">&gt;</span>
            <span className="text-[#cccccc]">{activeTab.fileName}</span>
          </>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-56 shrink-0 hidden sm:block">
            <TechieFileExplorer
              currentFile={activeTab?.contentKey ?? null}
              onFileSelect={openFile}
            />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-auto bg-[#1e1e1e]">
          <TechieContentViewer
            tab={activeTab}
            onEditorChange={updateEditorContent}
          />
        </div>
      </div>

      <TechieStatusBar
        currentFile={activeTab?.fileName ?? ""}
        lineCount={activeTab?.isUntitled ? (activeTab.editorContent?.split("\n").length ?? 1) : undefined}
      />

      {/* Mobile sidebar */}
      <MobileSidebar
        currentFile={activeTab?.contentKey ?? null}
        onFileSelect={openFile}
        sidebarOpen={sidebarOpen}
      />

      {/* Overlays */}
      {showMatrix && <MatrixRain onDismiss={() => setShowMatrix(false)} />}
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
    </div>
  )
}

function MobileSidebar({
  currentFile,
  onFileSelect,
  sidebarOpen,
}: {
  currentFile: string | null
  onFileSelect: (contentKey: string, fileName: string) => void
  sidebarOpen: boolean
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
            />
          </div>
        </div>
      )}
    </div>
  )
}
