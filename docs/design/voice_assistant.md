# AI Voice Assistant Design Document

## Overview

The AI Voice Assistant is a comprehensive voice-powered interface for Daniel's portfolio website. It combines speech recognition, text-to-speech, and AI-powered responses to create an interactive experience for visitors.

## Architecture

### Component Hierarchy

```
RootLayout
└── AIAssistant (global, persists across pages)
    ├── TourPlayer (floating FAB / expanded player)
    │   ├── Progress ring
    │   ├── Play/Pause controls
    │   ├── Speed controls (0.75x - 2x)
    │   └── Speech toggle
    └── Chat Dialog
        ├── Message list
        ├── Quick questions
        └── Input with voice recognition

HomePage
└── AskAboutMe (standalone section on homepage)
    └── Self-contained chat interface
```

### Service Layer

```
voice-stocks/
├── guidedTour.ts        # Tour state management & step execution
├── domNavigator.ts      # DOM traversal for tour generation
├── highlightSystem.ts   # Visual highlighting of tour elements
├── navigationService.ts # React Router integration
└── voiceCommandRouter.ts # Command parsing & routing
```

### Shared Hooks

```
hooks/
└── useSpeechSynthesis.ts # Robust TTS with Chrome compatibility
```

---

## Text-to-Speech (TTS) Implementation

### The `useSpeechSynthesis` Hook

Located at: `/src/hooks/useSpeechSynthesis.ts`

This hook provides a robust, cross-browser TTS implementation that addresses several browser-specific challenges:

#### Key Features

1. **Chrome Voice Loading**
   - Chrome loads voices asynchronously, unlike Firefox which has them immediately
   - The hook listens for the `voiceschanged` event and queues speech until voices are available
   - Pending speech requests are automatically executed once voices load

2. **Autoplay Policy Compliance**
   - Modern browsers require user interaction before playing audio
   - The hook tracks click/keydown/touchstart events to detect user interaction
   - Speech is queued until user interaction is detected

3. **Chrome "Stuck Speech" Workaround**
   - Chrome sometimes fails to start speech if `speak()` is called too quickly after `cancel()`
   - The hook includes a retry mechanism that detects stuck speech and retries

4. **Voice Selection**
   - Prefers local English voices for better quality and faster response
   - Falls back to any available voice if English is not available

#### Hook API

```typescript
interface UseSpeechSynthesisOptions {
  initialEnabled?: boolean    // Default: true
  defaultRate?: number        // Default: 1.0 (range: 0.1-10)
  defaultPitch?: number       // Default: 1.0 (range: 0-2)
  defaultVolume?: number      // Default: 0.8 (range: 0-1)
  debug?: boolean             // Default: false
}

interface UseSpeechSynthesisReturn {
  speak: (text: string, rate?: number) => void
  stop: () => void
  isSpeaking: boolean
  isReady: boolean              // voices loaded + user interacted
  enabled: boolean
  setEnabled: (enabled: boolean | ((prev) => boolean)) => void
  toggleEnabled: () => void
  voicesLoaded: boolean
  hasUserInteracted: boolean
}
```

#### Usage Example

```typescript
const {
  speak,
  stop,
  isSpeaking,
  enabled,
  toggleEnabled,
} = useSpeechSynthesis({ debug: false })

// Speak with default rate
speak("Hello, welcome to my portfolio!")

// Speak with custom rate (2x speed)
speak("This is fast!", 2.0)

// Stop speaking
stop()

// Toggle enabled/disabled
toggleEnabled()
```

---

## Guided Tour System

### Tour Flow

1. **Initialization**: User says "give me a tour" or clicks tour button
2. **Generation**: `guidedTour.generateTourFromPage()` analyzes DOM structure
3. **Step Execution**: Each step highlights an element and speaks its description
4. **Navigation**: User can pause, skip, or adjust speed via TourPlayer

### Tour Steps

Each step includes:
- `id`: Unique identifier
- `target`: CSS selector for the element
- `title`: Section name
- `description`: Visual tooltip text
- `voiceScript`: Rich narration for TTS
- `action`: 'highlight' | 'spotlight' | 'scroll' | 'point'

### TourPlayer Speed Control

The TourPlayer allows users to adjust playback speed:
- 0.75x: Slower, for accessibility or careful listening
- 1.0x: Normal speed
- 1.25x: Slightly faster
- 1.5x: Fast
- 2.0x: Maximum speed

Speed is passed to `speakText(text, rate)` and affects both speech rate and auto-advance delay.

---

## Speech Recognition

### Implementation

Both `AIAssistant` and `AskAboutMe` use the Web Speech API for speech recognition:

```typescript
function getSpeechRecognition() {
  return (window as any).SpeechRecognition ||
         (window as any).webkitSpeechRecognition || null
}
```

### Configuration

- `continuous: false` - Single-shot mode for reliability
- `interimResults: true` - Show real-time transcription
- `lang: 'en-US'` - English recognition
- `maxAlternatives: 1` - Use best match only

### Error Handling

- `not-allowed`: Microphone permission denied
- `audio-capture`: No microphone found
- `no-speech`: User didn't speak (silent fail)
- `aborted`: Recognition was stopped programmatically

---

## Voice Command Processing

The `voiceCommandRouter.ts` handles natural language commands:

### Navigation Commands
- "go to [page]" → Navigates to page
- "show me projects" → Navigates to projects section
- "scroll down/up" → Page scrolling

### Tour Commands
- "give me a tour" → Starts guided tour
- "next" / "continue" → Advance tour step
- "previous" / "back" → Go back one step
- "skip to [section]" → Jump to specific section
- "end tour" / "stop tour" → End the tour

### Speed Commands
- "faster" / "speed up" → Increase TTS rate
- "slower" / "slow down" → Decrease TTS rate
- "normal speed" → Reset to 1.0x

---

## Historical Context

### Original Issue (January 2026)

After a refactoring session, TTS stopped working in `AIAssistant.tsx`. Investigation revealed:

1. **Symptom**: `speechSynthesis.speak()` was called but `onstart` never fired
2. **Root Cause**: Multiple issues compounded:
   - Chrome voice loading race condition
   - Browser autoplay policy not respected
   - Component mounted before user interaction

### Solution

Created the `useSpeechSynthesis` hook that:
1. Waits for `voiceschanged` event before speaking
2. Tracks user interaction to comply with autoplay policy
3. Includes retry logic for Chrome's stuck speech bug
4. Is shared between both `AIAssistant` and `AskAboutMe` for consistency

---

## Testing Checklist

### TTS Testing

- [ ] Open site in Chrome, click FAB, send message → audio plays
- [ ] Open site in Firefox, same test → audio plays
- [ ] Start tour, verify narration plays
- [ ] Adjust speed (0.75x, 1x, 1.5x, 2x), verify rate changes
- [ ] Toggle speech off during playback → audio stops
- [ ] Toggle speech on, send message → audio plays again

### Speech Recognition Testing

- [ ] Click mic button → "Listening..." state
- [ ] Speak clearly → text appears in input
- [ ] Stop speaking → recognition ends automatically
- [ ] Deny mic permission → error message displayed
- [ ] Test in mobile browser → works with touch

### Command Testing

- [ ] Say "give me a tour" → tour starts
- [ ] Say "go to games" → navigates to games page
- [ ] Say "next" during tour → advances step
- [ ] Say "end tour" → tour ends

---

## Performance Considerations

1. **Lazy Loading**: TTS only initializes when first used
2. **Event Cleanup**: All listeners removed on component unmount
3. **Voice Caching**: Voices are fetched once and reused
4. **Pending Speech Queue**: Only one pending speech at a time (latest wins)

---

## Browser Compatibility

| Browser | Speech Recognition | TTS | Notes |
|---------|-------------------|-----|-------|
| Chrome 90+ | ✅ | ✅ | Primary target, requires voice loading wait |
| Firefox 90+ | ❌ | ✅ | No speech recognition, TTS works immediately |
| Safari 15+ | ✅ | ✅ | WebKit prefix required |
| Edge 90+ | ✅ | ✅ | Same as Chrome (Chromium) |

---

## Future Enhancements

1. **Voice Selection UI**: Let users choose their preferred voice
2. **Speech Synthesis Markup Language (SSML)**: Richer narration with pauses and emphasis
3. **Offline Support**: Cache voices for offline use
4. **Multi-language**: Support for languages beyond English
5. **Voice Authentication**: Recognize returning users by voice
