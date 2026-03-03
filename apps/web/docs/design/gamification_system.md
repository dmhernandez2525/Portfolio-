# Gamification System: Exhaustive Design & Implementation Specification

> **Document Type**: Canonical Specification
> **Version**: 3.1 (Definitive)
> **Last Updated**: January 25, 2026  
> **Maintainer**: Daniel Hernandez  
> **Status**: Live / Active Development

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Project History & Evolution](#2-project-history--evolution)
3. [System Architecture](#3-system-architecture)
4. [Component Specifications](#4-component-specifications)
5. [Creature Bestiary](#5-creature-bestiary)
6. [Interaction Mechanics](#6-interaction-mechanics)
7. [Easter Eggs System](#7-easter-eggs-system)
8. [Bug Audit & Resolution Log](#8-bug-audit--resolution-log)
9. [Planned Features](#9-planned-features)
10. [Testing & Verification](#10-testing--verification)
11. [File Reference](#11-file-reference)

---

## 1. Executive Summary

### Purpose
The Gamification System is an interactive overlay layer for a portfolio website that adds "game-like" elements to engage visitors. Users can catch floating creatures, trigger Easter eggs, and battle a "boss" enemy.

### Key Objectives
1. **Demonstrate Technical Skill**: Complex React state, animation orchestration, and performance optimization.
2. **Add Personality**: Show the developer's sense of humor (e.g., "Daniel the Bug Cleaner").
3. **Increase Engagement**: Give users a reason to explore and stay on the site longer.

### Design Principles
- **Non-Intrusive**: The layer floats above content but does not block critical UI.
- **Opt-In**: Users can disable via the Header toggle.
- **Performant**: Target 60fps animations on mid-range devices.
- **Memorable**: Users should remember "that portfolio with the ghost boss fight".

---

## 2. Project History & Evolution

### Phase Timeline
This feature evolved over multiple development phases:

| Phase | Name | Key Deliverables |
|-------|------|-----------------|
| Phase 10 | Optimization & Polish | Added Konami code Easter egg |
| Phase 12 | Deployment & Gamification | Created `CreatureLayer`, global score counter |
| Phase 14 | Interaction Polish & 3D Globe | Bug Swarm mechanic, Wizard summon, scroll parallax |
| Phase 15 | Final Polish & Launch | "Gandalf" wizard, "Daniel" cleaner, density control |
| Phase 16 | Feedback Implementation | Wizard fireworks, Ghost boss fight, secret word triggers |
| Phase 17 | Theme Polish | Slow-load toggle, hook fixes |

### User Feedback Integration
Throughout development, the user (Daniel) provided specific feedback that shaped the system:

> **User Request (Phase 14)**: "The creatures should move when I scroll. Like parallax."  
> **Implementation**: Added `useScroll` + `useTransform` + `useSpring` for smooth parallax effect.

> **User Request (Phase 15)**: "When you click a bug, maybe it should spawn more bugs like a 'swarm'."  
> **Implementation**: Created `generateSwarm()` function spawning 5 mini-bugs + "Daniel" cleaner.

> **User Request (Phase 16)**: "The ghost should get mad when you shake it. And bigger. And you fight it with a sword."  
> **Implementation**: Full boss fight: Shake detection → Enrage state (4x scale) → Sword cursor → Health bar → Victory reward (Princess).

> **User Request (Phase 16)**: "Add more Easter eggs. Konami code, secret words like 'gandalf'."  
> **Implementation**: Created `use-easter-eggs.ts` hook with Konami sequence and word detection.

> **User Request (Current Session)**: "Creatures take too long to appear. Spawn rate should increase as user scrolls down, but not reset if they scroll back up."  
> **Status**: Designed (not yet implemented). See Section 9.

---

## 3. System Architecture

### Data Flow Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                      GamificationProvider                        │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐│
│  │creatureCount│ │creaturesEnabled│ │ siteHealth │ │  Actions   ││
│  │   (number)  │ │   (boolean)  │ │  (0-100)   │ │incrementCount│
│  │ localStorage│ │    false     │ │    100     │ │toggleCreatures│
│  └─────────────┘ └──────────────┘ └────────────┘ │damageSite   ││
│                                                   │healSite     ││
│                                                   └────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CreatureLayer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ creatures[]     │  │ Spawn Logic     │  │ Interaction      │ │
│  │ (Creature[])    │  │ setInterval     │  │ handleCatch()    │ │
│  │                 │  │ 5000ms          │  │ removeCreature() │ │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘ │
│                              │                                   │
│              ┌───────────────┴───────────────┐                  │
│              ▼                               ▼                  │
│  ┌─────────────────┐              ┌─────────────────┐          │
│  │  Ghost.tsx      │              │  Wizard.tsx     │          │
│  │  (Boss Fight)   │              │  (Fireworks)    │          │
│  └─────────────────┘              └─────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Header UI                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ Score Badge     │  │ CreatureToggle  │  │ SiteHealthBar    │ │
│  │ ✨ {count}      │  │ Loading bar     │  │ (when < 100)     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### State Management Pattern
- **Provider**: `GamificationProvider` wraps the entire app at `RootLayout` level.
- **Context**: `GamificationContext` exposes state and actions.
- **Hook**: `useGamification()` provides typed access in any component.
- **Optimization**: All actions use `useCallback` with empty deps to prevent re-renders.

---

## 4. Component Specifications

### 4.1 GamificationProvider
**File**: `src/components/providers/GamificationProvider.tsx`  
**Lines**: 44

#### State Variables
| Variable | Type | Default | Persistence | Description |
|----------|------|---------|-------------|-------------|
| `creatureCount` | `number` | 0 | `localStorage` | Global score counter |
| `creaturesEnabled` | `boolean` | `false` | Session | Master on/off switch |
| `siteHealth` | `number` | 100 | Session | Used for boss fight damage |

#### Actions
| Action | Signature | Description |
|--------|-----------|-------------|
| `incrementCount` | `(amount?: number) => void` | Adds to score (default: 1) |
| `toggleCreatures` | `() => void` | Flips `creaturesEnabled` |
| `damageSite` | `(amount: number) => void` | Reduces health (min: 0) |
| `healSite` | `() => void` | Resets health to 100 |

---

### 4.2 CreatureLayer
**File**: `src/components/game/CreatureLayer.tsx`  
**Lines**: 397

#### Creature Data Structure
```typescript
interface Creature {
    id: number;           // Unique identifier (Date.now() based)
    type: CreatureType;   // "ghost" | "bug" | "sparkle" | "zap" | "wizard" | "daniel" | "princess"
    x: number;            // Horizontal position (0-100 vw)
    y: number;            // Vertical position (0-100 vh)
    delay: number;        // Animation delay (0-2 seconds)
    scale: number;        // Size multiplier (0.5-1.5)
    fullData?: {          // Optional extended data
        quote?: string;   // For Wizard speech bubble
        swarmOffset?: { x: number, y: number }[];  // For Bug swarm
    }
}
```

#### Spawn Logic Parameters
| Parameter | Value | Description |
|-----------|-------|-------------|
| Spawn Interval | 5000ms | Time between spawn attempts |
| Max Creatures | 6 | Hard cap to prevent screen flood |
| Spawn X Position | 0-20vw OR 80-100vw | Spawns at screen edges |
| Spawn Y Position | 10-90vh | Avoids header/footer |
| Type Probability | Equal (25% each) | ghost, bug, sparkle, zap |

#### Despawn Logic Parameters
| Parameter | Value | Description |
|-----------|-------|-------------|
| Despawn Interval | 5000ms | Check interval |
| Despawn Chance | 30% | Probability of triggering despawn |
| Per-Creature Survival | 50% | Each creature has 50% chance to survive cleanup |
| Protected Types | wizard, daniel | Never auto-despawn |

---

### 4.3 CreatureToggle
**File**: `src/components/game/CreatureToggle.tsx`  
**Lines**: 63

#### Visual States
1. **Loading** (Initial): Spinner icon, progress bar filling 0→100%, percentage text.
2. **Enabled**: Sparkle icon (pulsing), full bar, "ON" text.
3. **Disabled**: Spinner icon (not spinning), empty bar, "0%" text.

#### Loading Animation Parameters
| Parameter | Value | Description |
|-----------|-------|-------------|
| Tick Interval | 50ms | Update frequency |
| Progress Increment | 5 | Per-tick increase |
| Total Duration | ~1 second | Time to reach 100% |
| Auto-Enable | Yes | Toggles on when complete |

---

### 4.4 Ghost Component
**File**: `src/components/game/creatures/Ghost.tsx`
**Lines**: 216

#### Boss Fight Mechanics

##### Phase 1: Normal State
- **Visual**: 8x8 Neon Cyan icon
- **Behavior**: Floats up/down (y: [0, -15, 0] over 3s loop)
- **Interaction**:
  - Click → Caught instantly (if shake count ≤ 2)
  - Drag → Shake detection starts
- **Hint**: "Shake me!" tooltip on hover

##### Phase 2: Shake Detection
- **Detection Method**: Track horizontal drag position changes with debounce
- **Direction Change Detection**:
  ```typescript
  // Direction: -1 (left), 1 (right)
  // Debounce: 50ms between direction changes
  // DeltaX threshold: 3px minimum movement
  if (currentDirection !== lastDirection && Math.abs(deltaX) > 3 && timeDelta > 50) {
      shakeCount += 1
  }
  ```
- **Visual Feedback**:
  - Scale increases from 1.0 → 1.8 as shakeCount grows
  - **NEW**: Progress indicator (4 dots) shows shake progress
- **Enrage Threshold**: 4 direction changes (reduced from 6)

##### Phase 3: Enraged State
- **Trigger**: shakeCount >= 4
- **Visual**:
  - Scale: 4x (400%)
  - Color: Red (#DC2626)
  - Icon: Sword emoji (⚔️) bouncing
  - Health Bar: Red bar showing remaining HP
- **Cursor**: Custom SVG sword via BossContext (golden glow, 32x32px)
- **Behavior**:
  - Pulses (scale: [3.8, 4.0, 3.8] loop)
  - Attacks site every 2000ms for 5 damage
  - **NEW**: Shows taunt dialogue on enrage
- **Taunt Pool**:
  ```typescript
  const BOSS_TAUNTS = [
      "You dare challenge me?!",
      "Feel my wrath!",
      "This site belongs to me now!",
      "You cannot defeat a ghost!"
  ]
  ```

##### Phase 4: Combat
- **HP**: 5
- **Damage Per Click**: 1
- **Click Debounce**: 150ms to prevent rapid-fire exploits
- **Hit Feedback**: Brief scale reduction (×0.9) then snap back
- **Death Condition**: HP ≤ 0
- **State Lock**: `isKilling` flag prevents actions during death sequence

##### Phase 5: Victory
- **Death Dialogue**: Shows random death quote for 1.5 seconds
- **Death Quote Pool**:
  ```typescript
  const DEATH_QUOTES = [
      "Impossible... defeated by a mortal...",
      "I'll be back... someday...",
      "Nooooooo!",
      "You win this time..."
  ]
  ```
- **Ghost Removal**: Removed from creatures array after dialogue
- **Princess Spawn**: New creature at ghost's last position
- **Site Heal**: `healSite()` called after 1 second delay
- **Princess Quote**: "My Hero! Thank you! 💖"

#### BossContext Integration
**File**: `src/context/boss-context.tsx`

The boss fight now uses a global context to communicate enraged state to other components:
- `isBossEnraged`: Boolean state indicating if boss is active
- `setBossEnraged`: Callback to update state
- `useBoss()`: Hook with safe fallback for optional usage
- **Consumers**: Ghost.tsx (sets state), CustomCursor.tsx (reads state for sword cursor)

---

### 4.5 Wizard Component
**File**: `src/components/game/creatures/Wizard.tsx`  
**Lines**: 104

#### Lifecycle
1. **Spawn Animation**: Scale 0→1, Rotate -180°→0°
2. **Display Phase**: Shows for 3 seconds with quote bubble
3. **Exit Trigger**: Auto after 3s OR user click
4. **Exit Animation**: 60 particle firework explosion

#### Firework Particle System
| Parameter | Value |
|-----------|-------|
| Particle Count | 60 |
| Colors | neon-pink, neon-cyan, neon-purple, yellow-400 |
| Velocity Range | 200-1000px |
| Direction | Random 360° |
| Duration | 1.5 seconds |
| Delay Spread | 0-0.2 seconds |

#### Quote Pool
```typescript
const WIZARD_QUOTES = [
    "You shall not pass... without hiring me!",
    "A developer is never late, nor is he early.",
    "Fly, you fools! ...to the contact form!",
    "I have no memory of this place... wait, yes I do, it's React.",
    "All we have to decide is what to do with the time that is given us."
]
```

---

## 5. Creature Bestiary

| Type | Icon | Color | Spawn Rate | Base Scale | Special Behavior |
|------|------|-------|------------|------------|------------------|
| `bug` | 🐞 Bug | Neon Pink | 25% | 0.5-1.0 | Click → Swarm (5 mini-bugs + Daniel) |
| `sparkle` | ✨ Sparkles | Yellow-400 | 25% | 0.5-1.0 | Simple catch |
| `zap` | ⚡ Lightning | Neon Purple | 25% | 0.5-1.0 | Click → Summons Wizard |
| `ghost` | 👻 Ghost | Neon Cyan | 25% | 0.5-1.0 | Boss fight (see Section 4.4) |
| `wizard` | 🧙‍♂️ Emoji | White | Trigger only | 2.0 | Auto-despawn with firework |
| `daniel` | 👤 UserCheck | White | Trigger only | 1.5 | Cleans all bugs on click |
| `princess` | 👸 Emoji | Pink | Trigger only | 1.0-1.5 | Victory reward, auto-despawn |

---

## 6. Interaction Mechanics

### Click Interactions
| Creature Type | Action | Result |
|---------------|--------|--------|
| `bug` | Click | +1 score, triggers Swarm + Daniel |
| `sparkle` | Click | +1 score, removed |
| `zap` | Click | +1 score, Wizard spawns |
| `ghost` (normal) | Click | +1 score, removed (if shake ≤ 2) |
| `ghost` (enraged) | Click | -1 HP, +1 score on death |
| `wizard` | Click | Firework exit |
| `daniel` | Click | Removes all bugs, +N score |
| `princess` | None | Auto-despawns after animation |

### Drag Interactions
| Creature Type | Action | Result |
|---------------|--------|--------|
| `ghost` | Drag shake | Direction changes tracked, Enrage at 6 |

### Keyboard Interactions
See Section 7 (Easter Eggs).

---

## 7. Easter Eggs System
**File**: `src/hooks/use-easter-eggs.ts`

### Implementation
The hook listens for `keydown` events and maintains two detection systems:

#### A. Word Detection
- Maintains a 20-character buffer of recent keypresses
- Checks for word matches at end of buffer
- Clears buffer on match

| Trigger Word | Effect |
|--------------|--------|
| `gandalf` | Spawns Wizard at center (50vw, 50vh) with "You typed my name!" quote |
| `daniel` | Spawns Daniel at center |
| `ghost` | Spawns Ghost at random position |

#### B. Konami Code Detection
Separate index-based tracker for arrow key sequence:
```
↑ ↑ ↓ ↓ ← → ← → B A
```
**Effect**: Spawns 5 random bugs/sparkles across screen with "KONAMI CODE ACTIVATED!" message.

---

## 8. Bug Audit & Resolution Log

### Audit Date: January 14, 2026

#### Issue #1: Ghost Shake Initialization
- **Severity**: 🔴 Critical
- **File**: `Ghost.tsx:47`
- **Problem**: `lastX` started at 0, causing incorrect `deltaX` on first drag
- **Fix**: Initialize `lastX` with `currentX` on first drag event
- **Status**: ✅ RESOLVED

#### Issue #2: ID Collision Risk
- **Severity**: 🔴 Critical
- **File**: `CreatureLayer.tsx:52`
- **Problem**: `generateDaniel` used `Date.now() + 999`, could collide with swarm IDs
- **Fix**: Changed to `Date.now() + 10000`
- **Status**: ✅ RESOLVED

#### Issue #3: Memory Leak (Timeouts)
- **Severity**: 🔴 Critical
- **File**: `CreatureLayer.tsx`
- **Problem**: `setTimeout` IDs not tracked, couldn't be cleared on unmount
- **Fix**: Added `messageTimeoutRef` and cleanup effect
- **Status**: ✅ RESOLVED

#### Issue #4: Provider Function Recreation
- **Severity**: 🟡 Medium
- **File**: `GamificationProvider.tsx:23-37`
- **Problem**: Actions recreated every render, causing consumer re-renders
- **Fix**: Wrapped all functions in `useCallback`
- **Status**: ✅ RESOLVED

#### Issue #5: Toggle Dependency Array
- **Severity**: 🟡 Medium
- **File**: `CreatureToggle.tsx:28`
- **Problem**: Loading effect re-ran on manual toggle
- **Fix**: Removed `creaturesEnabled` and `toggleCreatures` from deps
- **Status**: ✅ RESOLVED

#### Issue #6: Ghost Damage Dependency
- **Severity**: 🟡 Medium
- **File**: `Ghost.tsx:40`
- **Problem**: `damageSite` in deps could cause interval restart
- **Fix**: Resolved by Issue #4 (useCallback in provider)
- **Status**: ✅ RESOLVED

#### Issue #7: No Auto-Heal
- **Severity**: 🟢 Low
- **File**: `CreatureLayer.tsx:197`
- **Problem**: Site health stayed damaged after boss fight
- **Fix**: Added `setTimeout(() => healSite(), 1000)` in `removeCreature`
- **Status**: ✅ RESOLVED

#### Issue #8: Princess Stuck
- **Severity**: 🟢 Low
- **File**: `CreatureLayer.tsx:306`
- **Problem**: Princess could fail to despawn if animation interrupted
- **Fix**: Added `onLayoutAnimationComplete` fallback timeout
- **Status**: ✅ RESOLVED

### Audit Date: January 25, 2026 (PR #16)

#### Issue #9: Shake Detection Too Difficult
- **Severity**: 🟡 Medium
- **File**: `Ghost.tsx:75-110`
- **Problem**: Shake threshold of 6 direction changes was too hard to trigger, deltaX threshold of 2px was too sensitive
- **Fix**: Lowered threshold from 6 to 4, increased deltaX threshold to 3px, added 50ms debounce between direction changes
- **Status**: ✅ RESOLVED

#### Issue #10: Boss Click Race Condition
- **Severity**: 🔴 Critical
- **File**: `Ghost.tsx:112-141`
- **Problem**: Rapid clicks during boss fight could cause double-removal or state corruption
- **Fix**: Added `clickDebounceRef` (150ms) and `isKilling` state lock during kill sequence
- **Status**: ✅ RESOLVED

#### Issue #11: Princess Race Condition
- **Severity**: 🔴 Critical
- **File**: `CreatureLayer.tsx:67-122`
- **Problem**: Princess component lifecycle caused race condition - could fail to appear or double-remove
- **Fix**: Created dedicated `PrincessCreature` component with `hasRemovedRef` to prevent double-removal
- **Status**: ✅ RESOLVED

#### Issue #12: Cursor Not Changing for Boss
- **Severity**: 🟡 Medium
- **File**: `CustomCursor.tsx`
- **Problem**: Custom cursor didn't show sword during boss fight, only inline CSS cursor worked
- **Fix**: Created `BossContext` for global enraged state, `CustomCursor` now renders sword SVG when `isBossEnraged` is true
- **Status**: ✅ RESOLVED

#### Issue #13: No Visual Shake Feedback
- **Severity**: 🟢 Low
- **File**: `Ghost.tsx:188-197`
- **Problem**: Users couldn't see progress toward enrage threshold
- **Fix**: Added `shakeProgress` state (0-4) with visual indicator dots above ghost
- **Status**: ✅ RESOLVED

#### Issue #14: Missing Boss Dialogue
- **Severity**: 🟢 Low
- **File**: `Ghost.tsx:15-28, 49-54, 127-128, 200-212`
- **Problem**: Boss fight lacked personality - no taunts or death quotes
- **Fix**: Added `BOSS_TAUNTS` array (shown on enrage) and `DEATH_QUOTES` array (shown on death) with AnimatePresence dialogue bubble
- **Status**: ✅ RESOLVED

---

## 9. Scroll-Based Spawn System (DETAILED SPECIFICATION)

### 9.1 Problem Statement
> "It takes quite a long time for the little creatures to actually start appearing."

The current spawn interval is a static 5000ms, which feels slow at page load. Users may leave before seeing any creatures. Additionally, the `CreatureToggle` loading bar is purely visual and doesn't actually trigger any spawns when complete.

### 9.2 Design Goals
1. **Faster Initial Engagement**: Creatures should appear within seconds of page load.
2. **Progressive Intensity**: As users explore (scroll), the world becomes more alive.
3. **No "Punishment" for Backtracking**: Scrolling up should NOT reset spawn rate.
4. **Controlled Chaos**: Prevent infinite creature accumulation.

---

### 9.3 The "High Water Mark" Algorithm

#### Concept
We track the **maximum scroll depth** the user has ever reached during the session. The spawn rate is determined by this "high water mark", not the current scroll position.

```
User scrolls from 0% → 50% → 30% → 80%
                           ↑
                     High Water Mark = 80%
                     
Spawn rate stays at what 80% dictates, even at 30% position.
```

#### State Variables
```typescript
// In CreatureLayer.tsx
const maxScrollRef = useRef<number>(0)  // 0.0 to 1.0
const spawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
```

#### Scroll Tracking Logic
```typescript
import { useScroll, useMotionValueEvent } from "framer-motion"

const { scrollYProgress } = useScroll()

useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Only update if we've scrolled DEEPER
    if (latest > maxScrollRef.current) {
        maxScrollRef.current = latest
    }
})
```

---

### 9.4 Dynamic Spawn Interval Curve

#### Parameters
| Scroll Depth | Spawn Interval | Description |
|--------------|----------------|-------------|
| 0% (top) | 6000ms | Relaxed, ambient pace |
| 25% | 4500ms | Warming up |
| 50% | 3000ms | Moderate activity |
| 75% | 2000ms | Getting busy |
| 100% (bottom) | 1500ms | High intensity |

#### Formula
```typescript
const calculateSpawnInterval = (maxScroll: number): number => {
    // Linear interpolation: 6000ms at 0% → 1500ms at 100%
    const BASE_INTERVAL = 6000
    const MIN_INTERVAL = 1500
    const RANGE = BASE_INTERVAL - MIN_INTERVAL  // 4500ms
    
    return BASE_INTERVAL - (maxScroll * RANGE)
}

// Examples:
// maxScroll = 0.0  →  6000ms
// maxScroll = 0.5  →  3750ms
// maxScroll = 1.0  →  1500ms
```

#### Spawn Loop Implementation (Recursive setTimeout)
```typescript
const scheduleNextSpawn = useCallback(() => {
    if (!creaturesEnabled) return
    
    const interval = calculateSpawnInterval(maxScrollRef.current)
    
    spawnTimeoutRef.current = setTimeout(() => {
        if (creatures.length < MAX_CREATURES) {
            spawnRandomCreature()
        }
        scheduleNextSpawn()  // Recursive call with potentially new interval
    }, interval)
}, [creaturesEnabled, creatures.length])

// Start the loop when creatures are enabled
useEffect(() => {
    if (creaturesEnabled) {
        scheduleNextSpawn()
    }
    return () => {
        if (spawnTimeoutRef.current) {
            clearTimeout(spawnTimeoutRef.current)
        }
    }
}, [creaturesEnabled, scheduleNextSpawn])
```

---

### 9.5 Initial Spawn Burst (Boot Sequence)

#### Problem
When `CreatureToggle` hits 100%, it enables creatures but the first spawn doesn't happen for up to 6 seconds (current interval). This feels broken.

#### Solution
Immediately spawn 2-3 creatures when the system "boots up".

#### Implementation

##### A. Add Burst Function to CreatureLayer
```typescript
const triggerInitialBurst = useCallback(() => {
    const burstCount = 2 + Math.floor(Math.random() * 2)  // 2-3 creatures
    const baseId = Date.now()
    
    const burstCreatures = Array.from({ length: burstCount }).map((_, i) => ({
        id: baseId + (i * 1000),
        type: ["bug", "sparkle", "zap"][Math.floor(Math.random() * 3)] as CreatureType,
        x: Math.random() > 0.5 ? Math.random() * 20 : 80 + Math.random() * 20,
        y: Math.random() * 80 + 10,
        delay: i * 0.3,
        scale: 0.5 + Math.random() * 0.5,
    }))
    
    setCreatures(prev => [...prev, ...burstCreatures])
}, [])
```

##### B. Expose via Context
```typescript
// In GamificationProvider - Add new action
const triggerSpawnBurst = useCallback(() => {
    // Dispatch custom event that CreatureLayer listens to
    window.dispatchEvent(new CustomEvent('creature-burst'))
}, [])
```

##### C. Listen in CreatureLayer
```typescript
useEffect(() => {
    const handleBurst = () => triggerInitialBurst()
    window.addEventListener('creature-burst', handleBurst)
    return () => window.removeEventListener('creature-burst', handleBurst)
}, [triggerInitialBurst])
```

##### D. Trigger from CreatureToggle
```typescript
// In CreatureToggle.tsx, when loading completes
if (val >= 100) {
    clearInterval(interval)
    setHasLoaded(true)
    if (!creaturesEnabled) {
        toggleCreatures()
        // Fire the burst event after a tiny delay to ensure layer is ready
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('creature-burst'))
        }, 100)
    }
}
```

---

### 9.6 Safety Mechanisms

#### A. Max Creature Cap
```typescript
const MAX_CREATURES = 8  // Increased from 6 to allow higher intensity
```

#### B. Burst Cooldown
Prevent rapid bursts from Konami code + scroll + toggle all stacking:
```typescript
const lastBurstRef = useRef<number>(0)

const triggerInitialBurst = useCallback(() => {
    const now = Date.now()
    if (now - lastBurstRef.current < 5000) return  // 5 second cooldown
    lastBurstRef.current = now
    // ... spawn logic
}, [])
```

#### C. Despawn Balance
With faster spawns, we need slightly faster despawns at high scroll:
```typescript
const calculateDespawnInterval = (maxScroll: number): number => {
    // 5000ms at 0% → 3000ms at 100%
    return 5000 - (maxScroll * 2000)
}
```

---

### 9.7 Implementation Checklist

#### Phase A: Scroll Tracking
- [x] Add `maxScrollRef` to `CreatureLayer`
- [x] Import `useMotionValueEvent` from framer-motion
- [x] Add scroll listener that updates `maxScrollRef` (high water mark only)

#### Phase B: Dynamic Spawning
- [x] Create `calculateSpawnInterval()` function
- [x] Replace `setInterval` with recursive `setTimeout` pattern
- [x] Add `spawnTimeoutRef` for cleanup

#### Phase C: Initial Burst
- [x] Create `triggerInitialBurst()` function
- [x] Add custom event listener/dispatcher pattern
- [x] Update `CreatureToggle` to dispatch event on load complete

#### Phase D: Safety & Tuning
- [x] Increase `MAX_CREATURES` to 8
- [x] Add burst cooldown mechanism
- [x] Test scroll up/down behavior persists rate

---

### 9.8 Testing Scenarios

#### Test: High Water Mark Persistence
1. Load page (maxScroll = 0, interval = 6000ms)
2. Scroll to bottom (maxScroll = 1.0, interval = 1500ms)
3. Scroll back to top
4. **Expected**: Interval stays at 1500ms, creatures spawn rapidly
5. **Failure**: Interval resets to 6000ms

#### Test: Initial Burst
1. Load fresh page
2. Wait for toggle to hit 100%
3. **Expected**: 2-3 creatures appear instantly
4. **Failure**: Must wait 6 seconds for first creature

#### Test: Cap Enforcement
1. Spam Konami code 5 times
2. **Expected**: Max 8 creatures on screen, extras don't spawn
3. **Failure**: Screen floods with 25+ creatures

---

### 9.9 Future Wishlist (Priority: LOW)
- [ ] Global Leaderboard (Firebase backend)
- [ ] Boss Rush Mode (fight 3 ghosts)
- [ ] Mobile shake gesture (device accelerometer)
- [ ] Sound effects (muted by default)
- [ ] Theme-aware creature colors

---

## 10. Testing & Verification

### Automated
| Type | Command | Status |
|------|---------|--------|
| Lint | `npm run lint` | ✅ Passing (1 warning - intentional) |
| Build | `npm run build` | ✅ Passing |
| TypeScript | `tsc -b` | ✅ No errors |

### Manual Test Cases

#### TC-001: Boss Fight Flow
1. Type `ghost` → Ghost spawns at random position
2. Drag ghost left-right rapidly → Scale increases
3. After 6 direction changes → Ghost turns red, grows 4x
4. Cursor becomes sword
5. Click 5 times → Ghost dies
6. Princess spawns with message
7. Site health bar disappears (healed)

#### TC-002: Bug Swarm + Daniel
1. Wait for bug spawn OR type `ghost` then `daniel` to test independently
2. Click bug → 5 mini-bugs spawn + Daniel icon appears
3. Click Daniel → "Debugging..." message
4. All bugs removed → Score increases by bug count

#### TC-003: Konami Code
1. Focus window (click anywhere)
2. Press: ↑ ↑ ↓ ↓ ← → ← → B A
3. Message: "KONAMI CODE ACTIVATED!"
4. 5 random creatures spawn

#### TC-004: Toggle Persistence
1. Toggle creatures OFF
2. Toggle creatures ON
3. Loading bar should NOT restart

#### TC-005: Memory Leak Check
1. Open DevTools → Performance → Memory
2. Take heap snapshot
3. Toggle creatures 20 times rapidly
4. Take another heap snapshot
5. Compare: No significant growth

---

## 11. File Reference

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/providers/GamificationProvider.tsx` | 44 | Global state provider |
| `src/context/gamification-context.tsx` | 13 | Context definition |
| `src/context/boss-context.tsx` | 31 | Boss fight state context |
| `src/hooks/use-gamification.ts` | 10 | Consumer hook |
| `src/hooks/use-easter-eggs.ts` | 73 | Keyboard Easter egg detection |
| `src/components/game/CreatureLayer.tsx` | 471 | Main rendering + logic (incl. PrincessCreature) |
| `src/components/game/CreatureToggle.tsx` | 63 | Header toggle control |
| `src/components/game/creatures/Ghost.tsx` | 216 | Boss fight component |
| `src/components/game/creatures/Wizard.tsx` | 104 | Rare NPC with fireworks |
| `src/components/game/GameHub.tsx` | 95 | Minigames hub (related) |
| `src/components/shared/Header.tsx` | 165 | Score display + toggle host |
| `src/components/ui/CustomCursor.tsx` | 180 | Custom cursor with boss sword |
| `feature_checklist.md` | 167 | Feature verification checklist |

---

*Document generated by the Gamification Development Team. Last verified: January 14, 2026.*
