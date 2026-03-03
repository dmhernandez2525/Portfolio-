import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { fileTree, getFileIcon, type FileNode } from "./techie-data"

interface TechieFileExplorerProps {
  currentFile: string | null
  onFileSelect: (contentKey: string, fileName: string) => void
  showHidden?: boolean
}

function FileTreeNode({
  node,
  depth,
  currentFile,
  onFileSelect,
  showHidden,
}: {
  node: FileNode
  depth: number
  currentFile: string | null
  onFileSelect: (contentKey: string, fileName: string) => void
  showHidden: boolean
}) {
  const [expanded, setExpanded] = useState(depth < 2)

  if (node.type === "folder") {
    const visibleChildren = showHidden
      ? node.children
      : node.children?.filter((child) => !child.hidden)

    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-1 px-2 py-0.5 hover:bg-[#2a2d2e] text-left text-[#cccccc] transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-[#858585] shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-[#858585] shrink-0" />
          )}
          <span className="text-xs">{node.name}</span>
        </button>
        {expanded &&
          visibleChildren?.map((child) => (
            <FileTreeNode
              key={child.name}
              node={child}
              depth={depth + 1}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              showHidden={showHidden}
            />
          ))}
      </div>
    )
  }

  const isActive = currentFile === node.contentKey
  const icon = getFileIcon(node.name)
  const isHidden = node.hidden

  const stateStyle = isActive
    ? "bg-[#094771] text-white"
    : isHidden
      ? "text-[#6a6a6a] hover:bg-[#2a2d2e]"
      : "text-[#cccccc] hover:bg-[#2a2d2e]"

  const nameStyle = node.name.endsWith(".exe")
    ? "text-[#4ec9b0]"
    : isHidden
      ? "italic"
      : ""

  return (
    <button
      onClick={() => node.contentKey && onFileSelect(node.contentKey, node.name)}
      className={`w-full flex items-center gap-1.5 px-2 py-0.5 text-left text-xs transition-colors ${stateStyle}`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span className="text-[10px] shrink-0">{icon}</span>
      <span className={nameStyle}>{node.name}</span>
    </button>
  )
}

export function TechieFileExplorer({ currentFile, onFileSelect, showHidden = false }: TechieFileExplorerProps) {
  return (
    <div className="h-full bg-[#252526] border-r border-[#3c3c3c] overflow-y-auto">
      <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#bbbbbb]">
        Explorer
      </div>
      {fileTree.map((node) => (
        <FileTreeNode
          key={node.name}
          node={node}
          depth={0}
          currentFile={currentFile}
          onFileSelect={onFileSelect}
          showHidden={showHidden}
        />
      ))}
    </div>
  )
}
