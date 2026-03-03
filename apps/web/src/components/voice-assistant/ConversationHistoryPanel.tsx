import { Download, Search } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { AssistantHistoryEntry, AssistantHistoryRoleFilter } from "@/types/assistant-enhancements"

interface ConversationHistoryPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entries: AssistantHistoryEntry[]
  searchTerm: string
  onSearchTermChange: (value: string) => void
  roleFilter: AssistantHistoryRoleFilter
  onRoleFilterChange: (value: AssistantHistoryRoleFilter) => void
  onExport: () => void
}

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp)
}

export function ConversationHistoryPanel({
  open,
  onOpenChange,
  entries,
  searchTerm,
  onSearchTermChange,
  roleFilter,
  onRoleFilterChange,
  onExport,
}: ConversationHistoryPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Conversation History</DialogTitle>
          <DialogDescription>
            Search, filter, and export previous assistant conversations.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Search conversation history"
              className="w-full h-9 pl-8 pr-3 rounded-lg border bg-background text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => onRoleFilterChange(event.target.value as AssistantHistoryRoleFilter)}
            className="h-9 rounded-lg border bg-background text-sm px-2"
          >
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="assistant">Assistant</option>
          </select>
          <Button size="sm" variant="outline" onClick={onExport} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>

        <div className="border rounded-lg flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground">No conversation entries match the current filters.</p>
          )}

          {entries.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-2.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span className="uppercase tracking-wide">{entry.role}</span>
                <span>{formatTimestamp(entry.timestamp)}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
