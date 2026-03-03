# Agar.io Clone - Software Design Document

## 1. Overview
The Agar.io Clone is a multiplayer-style arcade game where players control a cell that grows by consuming food and smaller cells. The goal is to become the largest cell on the server. The implementation focuses on authentic physics, smooth rendering, and high-performance entity management.

## 2. Gameplay Mechanics

### 2.1 Core Rules
- **Movement**: Cells move toward the mouse cursor. Speed decreases as mass increases ($v \propto r^{-1}$).
- **Growth**: Eating food (pellets) or smaller player/AI cells increases mass.
- **Consumption**: A cell can eat another entity if it is 10% larger ($r_{eater} > 1.1 \times r_{prey}$) and overlaps significantly.

### 2.2 Advanced Mechanics
- **Splitting (Spacebar)**:
  - Splits the player into up to **256** indepedent cells.
  - Ejects half the mass forward at high velocity.
  - Used for attacking (catching fast prey) or escaping.
  - **Recombination**: Split cells can merge back together after a cooldown period (30s) if they collide.
- **Ejecting Mass (W)**:
  - Shoots a small blob of mass forward.
  - Costs 16 mass, blob contains 12 mass (efficiency loss).
  - **Uses**: Feeding allies (teaming), shooting viruses, reducing size to maneuver.
- **Viruses**:
  - Static green spiked entities.
  - **Safe**: If cell radius < virus radius (< 100 mass).
  - **Deadly**: If cell is larger, it "explodes" upon touching a virus, splitting into up to 16 pieces instantly.
  - **Shooting**: Feeding a virus 7 times causes it to spawn a new virus in the direction of the shot (offensive mechanic).

## 3. Technical Architecture

### 3.1 Folder Structure
The monolithic `AgarGame.tsx` will be refactored into a modular domain:
```
src/games/agar/
├── index.tsx          # Main Entry Point
├── constants.ts       # Game config (World size, colors)
├── types.ts           # Shared interfaces (Cell, Virus, Food)
├── components/
│   ├── GameCanvas.tsx # Pure rendering component
│   ├── HUD.tsx        # UI Overlay (Score, Leaderboard)
│   └── Menu.tsx       # Start/Game Over screens
├── hooks/
│   ├── useGameLoop.ts # core RAF loop
│   ├── useGameState.ts# State management (reducers)
│   └── usePhysics.ts  # Collision and movement logic
└── utils/
    ├── physics.ts     # Collision detection math
    ├── rendering.ts   # Canvas drawing helpers
    └── generation.ts  # Food/Virus placement
```

### 3.2 Data Models

**Cell Interface**
```typescript
interface Cell {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number; // Velocity X
  vy: number; // Velocity Y
  mass: number; // Derived from radius
}
```

**Virus Interface**
```typescript
interface Virus {
  id: string;
  x: number;
  y: number;
  radius: number; // Fixed at ~40
  fedMass: number; // Track shots received
}
```

### 3.3 Game Loop
The game runs on a `requestAnimationFrame` loop handled by `useGameLoop`.
1.  **Input**: Update camera target based on mouse.
2.  **Physics**:
    - Update velocities (decay split speed).
    - Update positions.
    - Clamp to World Boundary (10000x10000).
3.  **Collision**:
    - Broad-phase: Spatial hashing (optional optimization) or simple N^2 checks for now.
    - Narrow-phase: Circle-Circle intersection.
    - Resolution: Eat, Split, or Bounce.
4.  **AI**:
    - Simple state machine: Wander -> Chase -> Flee.
5.  **Render**:
    - Clear Canvas.
    - Apply Camera Transform (Scale based on total player mass).
    - Draw Grid.
    - Draw Entities (Sorted by Z-index/size).

## 4. Performance Optimization
- **Canvas Layering**: Static background grid can be pre-rendered or on a separate canvas (optional).
- **Object Pooling**: Not strictly necessary for < 2000 entities, but Arrays should be mutated carefully to avoid GC spikes.
- **Culling**: Only render entities within the viewport + buffer.

## 5. Future Roadmap
- **Multiplayer**: WebSocket integration using Socket.io or Colyseus.
- **Skins**: Custom images for cells.
- **Teams Mode**: Red vs Blue vs Green.
