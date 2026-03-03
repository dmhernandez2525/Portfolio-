import { beforeEach, describe, expect, it, vi } from "vitest"
import { GameAudioEngine } from "@/lib/game/audio-engine"

let oscillatorStartCalls = 0

class MockGainNode {
  gain = {
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
  connect = vi.fn()
}

class MockOscillatorNode {
  type = "square"
  frequency = { value: 0 }
  connect = vi.fn()
  start = vi.fn(() => {
    oscillatorStartCalls += 1
  })
  stop = vi.fn()
}

class MockAudioContext {
  currentTime = 0
  destination = {}
  createGain() {
    return new MockGainNode()
  }
  createOscillator() {
    return new MockOscillatorNode()
  }
}

describe("GameAudioEngine", () => {
  beforeEach(() => {
    oscillatorStartCalls = 0
    vi.stubGlobal("AudioContext", MockAudioContext)
  })

  it("plays sound effects and respects mute", () => {
    const engine = new GameAudioEngine()
    engine.play("collect")
    expect(oscillatorStartCalls).toBe(1)

    engine.setMuted(true)
    engine.play("achievement")
    expect(oscillatorStartCalls).toBe(1)
  })
})
