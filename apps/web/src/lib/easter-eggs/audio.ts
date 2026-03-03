export function playMarioCoinSound(): void {
  if (typeof window === "undefined") {
    return
  }

  const AudioCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) {
    return
  }

  const context = new AudioCtor()
  const now = context.currentTime

  const oscillatorOne = context.createOscillator()
  const oscillatorTwo = context.createOscillator()
  const gain = context.createGain()

  oscillatorOne.type = "square"
  oscillatorTwo.type = "square"

  oscillatorOne.frequency.setValueAtTime(880, now)
  oscillatorOne.frequency.exponentialRampToValueAtTime(1320, now + 0.08)

  oscillatorTwo.frequency.setValueAtTime(1320, now + 0.08)
  oscillatorTwo.frequency.exponentialRampToValueAtTime(1760, now + 0.16)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)

  oscillatorOne.connect(gain)
  oscillatorTwo.connect(gain)
  gain.connect(context.destination)

  oscillatorOne.start(now)
  oscillatorOne.stop(now + 0.1)
  oscillatorTwo.start(now + 0.08)
  oscillatorTwo.stop(now + 0.18)

  const closeContext = () => {
    context.close().catch(() => undefined)
  }

  oscillatorTwo.onended = closeContext
}
