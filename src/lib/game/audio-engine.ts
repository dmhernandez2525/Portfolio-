type SoundName = "collect" | "hit" | "achievement"

interface PlayOptions {
  frequencyHz?: number
  durationMs?: number
}

const SOUND_FREQUENCIES: Record<SoundName, number> = {
  collect: 720,
  hit: 220,
  achievement: 980,
}

export class GameAudioEngine {
  private context: AudioContext | null = null
  private gainNode: GainNode | null = null
  private muted = false
  private volume = 0.35

  private ensureContext(): void {
    if (typeof window === "undefined") return
    if (this.context) return
    const audioContextCtor = window.AudioContext
    if (!audioContextCtor) return
    this.context = new audioContextCtor()
    this.gainNode = this.context.createGain()
    this.gainNode.gain.value = this.volume
    this.gainNode.connect(this.context.destination)
  }

  setMuted(value: boolean): void {
    this.muted = value
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value))
    if (this.gainNode) this.gainNode.gain.value = this.volume
  }

  getSettings(): { muted: boolean; volume: number } {
    return { muted: this.muted, volume: this.volume }
  }

  play(sound: SoundName, options?: PlayOptions): void {
    if (this.muted) return
    this.ensureContext()
    if (!this.context || !this.gainNode) return

    const oscillator = this.context.createOscillator()
    const envelope = this.context.createGain()
    const frequency = options?.frequencyHz ?? SOUND_FREQUENCIES[sound]
    const duration = Math.max(0.05, (options?.durationMs ?? 110) / 1000)

    oscillator.type = "square"
    oscillator.frequency.value = frequency
    envelope.gain.setValueAtTime(0.0001, this.context.currentTime)
    envelope.gain.exponentialRampToValueAtTime(this.volume, this.context.currentTime + 0.01)
    envelope.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration)

    oscillator.connect(envelope)
    envelope.connect(this.gainNode)
    oscillator.start()
    oscillator.stop(this.context.currentTime + duration + 0.01)
  }
}
