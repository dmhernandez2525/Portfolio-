import type { ReplayEvent } from "@/types/game-enhancement"

export class ReplayRecorder {
  private startedAt = 0
  private events: ReplayEvent[] = []

  start(): void {
    this.startedAt = Date.now()
    this.events = []
  }

  record(input: string): void {
    if (!this.startedAt) this.start()
    this.events.push({
      timestampMs: Date.now() - this.startedAt,
      input,
    })
  }

  snapshot(): ReplayEvent[] {
    return [...this.events]
  }

  clear(): void {
    this.startedAt = 0
    this.events = []
  }
}
