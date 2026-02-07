import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { fileTree, getFileIcon, type FileNode } from "./techie-data"

interface TechieFileExplorerProps {
  currentFile: string | null
  onFileSelect: (contentKey: string, fileName: string) => void
}

function FileTreeNode({
  node,
  depth,
  currentFile,
  onFileSelect,
}: {
  node: FileNode
  depth: number
  currentFile: string | null
  onFileSelect: (contentKey: string, fileName: string) => void
}) {
  const [expanded, setExpanded] = useState(depth < 2)

  if (node.type === "folder") {
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
          node.children?.map((child) => (
            <FileTreeNode
              key={child.name}
              node={child}
              depth={depth + 1}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
            />
          ))}
      </div>
    )
  }

  const isActive = currentFile === node.contentKey
  const icon = getFileIcon(node.name)

  return (
    <button
      onClick={() => node.contentKey && onFileSelect(node.contentKey, node.name)}
      className={`w-full flex items-center gap-1.5 px-2 py-0.5 text-left text-xs transition-colors ${
        isActive ? "bg-[#094771] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span className="text-[10px] shrink-0">{icon}</span>
      <span className={node.name.endsWith(".exe") ? "text-[#4ec9b0]" : ""}>{node.name}</span>
    </button>
  )
}

export function TechieFileExplorer({ currentFile, onFileSelect }: TechieFileExplorerProps) {
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
        />
      ))}
    </div>
  )
}
