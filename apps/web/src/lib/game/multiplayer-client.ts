type MessageHandler = (payload: string) => void

export class MultiplayerClient {
  private socket: WebSocket | null = null
  private listeners = new Set<MessageHandler>()
  private queue: string[] = []
  private connected = false

  connect(url: string): void {
    if (typeof WebSocket === "undefined") return
    if (this.socket) return

    this.socket = new WebSocket(url)
    this.socket.addEventListener("open", () => {
      this.connected = true
      for (const message of this.queue) {
        this.socket?.send(message)
      }
      this.queue = []
    })
    this.socket.addEventListener("message", (event) => {
      const data = typeof event.data === "string" ? event.data : ""
      this.listeners.forEach((listener) => listener(data))
    })
    this.socket.addEventListener("close", () => {
      this.connected = false
      this.socket = null
    })
  }

  disconnect(): void {
    this.socket?.close()
    this.socket = null
    this.connected = false
  }

  send(payload: string): void {
    if (this.connected && this.socket) {
      this.socket.send(payload)
      return
    }
    this.queue.push(payload)
  }

  onMessage(listener: MessageHandler): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
