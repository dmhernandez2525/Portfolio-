# Cookie Clicker - Software Design Document

## 1. Overview
The Cookie Clicker implementation aims to replicate the depth of the original web game, moving beyond simple infinite scaling mechanics to include "paradigm shift" features like the Grandmapocalypse, Ascension, and active Minigames.

## 2. Gameplay Mechanics

### 2.1 Core Loop (Existing)
- **Click**: Generate cookies.
- **Buy**: Buildings generate cookies over time (CpS).
- **Upgrade**: Multipliers for clicking and buildings.

### 2.2 The Grandmapocalypse
A mid-to-late game event triggered by the "One Mind" upgrade.
- **Wrath Cookies**: Replace Golden Cookies (33-100% chance). Spawns `Elder Frenzy` (x666 CpS) or `Clot` (0.5x CpS).
- **Wrinklers**:
  - Spawn around the Big Cookie.
  - Siphon 5% of CpS each.
  - When actively "popped" (clicked), they return 1.1x the withered cookies.
  - Strategy: Let them eat for hours, then pop for massive bank.
- **Stages**:
  1.  **Awoken**: 33% Wrath cookies.
  2.  **Displeased**: 66% Wrath cookies.
  3.  **Angered**: 100% Wrath cookies.
- **Appeasement**: `Elder Pledge` (30min pause) and `Elder Covenant` (Permanent pause, -5% CpS cost).

### 2.3 Prestige (Ascension)
- **Reset**: Player forfeits all buildings/cookies.
- **Reward**: `Heavenly Chips` based on total cookies baked all-time (Cube root scaling).
- **Heavenly Upgrades**:
  - Permanent upgrades bought with Chips in a special UI.
  - `Season Switcher`, `Permanent Upgrade Slot`, `Starter Kit`.

### 2.4 Minigames
Each building type (level 1+) unlocks a minigame tab.
1.  **Grimoire (Wizard Tower)**: Mana-based spell casting.
    - *Force the Hand of Fate*: Spawns a Golden Cookie (critical for combos).
2.  **Garden (Farm)**: Grid-based crop growing. Cross-breeding plants for bonuses.
3.  **Pantheon (Temple)**: Slot 3 "Gods" into Diamond/Ruby/Jade slots for passive trade-offs.

## 3. Technical Architecture

### 3.1 Folder Structure
Refactoring `CookieClickerGame.tsx` into:
```
src/games/cookie-clicker/
├── index.tsx
├── constants.ts       # Building costs/Upgrade data
├── types.ts
├── context/
│   └── GameContext.tsx # Central store (useReducer)
├── components/
│   ├── BigCookie.tsx  # Interactive clicker + Particle effects
│   ├── Buildings.tsx  # Purchase list
│   ├── Upgrades.tsx   # Upgrade grid
│   ├── Minigames/
│   │   ├── Grimoire.tsx
│   │   └── Pantheon.tsx
│   └── Overlays/
│       ├── Ascension.tsx
│       └── OfflineEarnings.tsx
└── hooks/
    ├── useTicks.ts    # Game heartbeat (100ms)
    └── useSave.ts     # LocalStorage/Cloud save
```

### 3.2 State Management
The game logic is complex enough to require a reducer pattern (`GameAction` types).
- **Tick Logic**: 
  - `cookies += (CpS / ticksPerSec)`
  - `wrinklersEaten += (CpS * 0.05 / ticksPerSec)`
  - `buff.duration--`

### 3.3 Particle Engine
For "Click Effects" (numbers popping up), use a lightweight separate canvas overlay on the `BigCookie` component to avoid DOM thrashing with hundreds of `<div>`s.

## 4. Performance
- **Big Number Math**: Use scientific notation logic for numbers > 1e21 (sextillion+). JS `number` creates infinity issues around 1e308, but game balancing keeps us safe or requires a `BigInt` wrapper for display.
- **Save Format**: Compress Base64 string to prevent local storage bloat.

## 5. Roadmap
- **Phase 1**: Refactor to Folder Structure + Grandmapocalypse.
- **Phase 2**: Prestige System + Heavenly Upgrades.
- **Phase 3**: Grimoire Minigame.
