import { beforeEach, describe, expect, it, vi } from "vitest"
import { createCreatureTradeChannel } from "@/lib/creature-system/trading"

let mockPostMessage: ReturnType<typeof vi.fn>
let mockClose: ReturnType<typeof vi.fn>
let onMessageHandler: ((event: { data: unknown }) => void) | null

beforeEach(() => {
  onMessageHandler = null
  mockPostMessage = vi.fn()
  mockClose = vi.fn()

  vi.stubGlobal("window", {
    BroadcastChannel: class {
      onmessage: ((event: { data: unknown }) => void) | null = null
      constructor() {
        setTimeout(() => {
          onMessageHandler = this.onmessage
        }, 0)
      }
      postMessage = mockPostMessage
      close = mockClose
    },
  })
})

describe("createCreatureTradeChannel", () => {
  it("returns a channel with sendTrade and close methods", () => {
    const channel = createCreatureTradeChannel(vi.fn())
    expect(channel).not.toBeNull()
    expect(typeof channel?.sendTrade).toBe("function")
    expect(typeof channel?.close).toBe("function")
  })

  it("calls postMessage when sendTrade is invoked", () => {
    const channel = createCreatureTradeChannel(vi.fn())
    channel?.sendTrade("bug")
    expect(mockPostMessage).toHaveBeenCalledTimes(1)
    const message = mockPostMessage.mock.calls[0][0]
    expect(message.speciesId).toBe("bug")
    expect(typeof message.timestamp).toBe("number")
    expect(typeof message.senderId).toBe("string")
  })

  it("calls close on the underlying BroadcastChannel", () => {
    const channel = createCreatureTradeChannel(vi.fn())
    channel?.close()
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it("returns null when BroadcastChannel is unavailable", () => {
    vi.stubGlobal("window", {})
    const channel = createCreatureTradeChannel(vi.fn())
    expect(channel).toBeNull()
  })

  it("returns null on server (no window)", () => {
    vi.stubGlobal("window", undefined)
    const channel = createCreatureTradeChannel(vi.fn())
    expect(channel).toBeNull()
  })
})
