# Tanks Game - Software Design Document

## 1. Overview
This projects aims to replicate the mechanics of the classic "Wii Play Tanks" mission mode. The game is a top-down tactical shooter where players control a tank using a joystick (movement) and pointer (aiming). The core distinct features are ricocheting bullets, diverse enemy tank classes, and destructible/indestructible walls.

**Note:** This is a complete rewrite from the previous "Artillery/Worms" style implementation.

## 2. Gameplay Mechanics

### 2.1 Core Mechanics
- **Perspective**: Top-down 2D.
- **Controls**:
  - **Move**: WASD / Left Stick (Independent of aim).
  - **Aim**: Mouse / Right Stick (Turret rotates independently).
  - **Fire**: Left Click / Trigger.
  - **Mine**: Space / B Button.
- **Physics**:
  - **Ricochet**: Standard bullets bounce exactly **once** off walls.
  - **Collision**: Tanks collide with walls and each other (no passing through).
  - **Explosions**: Bullets create small blast radius; Mines create large blast radius.

### 2.2 Tank Classes
All tanks share a base hitbox size but differ in speed, ammo, and behavior.

| Class | Color | Speed | Bullet Type | Max Bullets | Strategy |
|-------|-------|-------|-------------|-------------|----------|
| **Player**| Blue | Normal| Ricochet (Slow) | 5 | versatile |
| **Basic** | Brown | Stationary | Ricochet (Slow) | 1 | Turret for training |
| **Mobile**| Grey | Slow | Ricochet (Slow) | 1 | Moves and shoots |
| **Fast** | Teal | Fast | Rocket (No Bounce)| 1 | Rushes player |
| **Mine** | Yellow| Normal| Ricochet | 2 (4 Mines)| Areas denial |
| **Aggro** | Red | Fast | Ricochet | 3 | Bursts of fire |
| **Sniper**| Green | Stationary | Ricochet (Fast) | 2 | **Bounces 2x** for trick shots |
| **Stealth**| White | Fast | Ricochet | 5 | Invisible (tracks only) |
| **Boss** | Black | Very Fast| Rocket | 5 | Constant pressure |

## 3. Technical Architecture

### 3.1 Folder Structure
Refactoring `TanksGame.tsx` into:
```
src/games/tanks/
├── index.tsx
├── constants.ts
├── types.ts
├── assets/            # Tank sprites (SVG/Canvas)
├── components/
│   ├── GameView.tsx   # Canvas interactions
│   └── Joystick.tsx   # Mobile controls
├── engine/
│   ├── GameLoop.ts    # Main logic
│   ├── Physics.ts     # AABB + Raycast (for bullets)
│   ├── AI.ts          # Enemy behavior trees
│   └── LevelLoader.ts # Map perser
└── levels/
    ├── mission1.ts    # Level definitions
    └── mission2.ts
```

### 3.2 Physics Engine
A custom lightweight physics engine is required for top-down movement.
- **AABB Collision**: Axis-Aligned Bounding Box for walls and tanks.
- **Raycasting**: Essential for AI aiming (checking if a ricochet shot hits the player).
- **Bullet Logic**:
  ```typescript
  updateBullet(b) {
      nextPos = b.pos + b.vel;
      if (hitWall(nextPos)) {
          if (b.bounces < b.maxBounces) {
              b.vel = reflect(b.vel, wallNormal);
              b.bounces++;
          } else {
              destroy(b);
          }
      }
  }
  ```

### 3.3 AI System
The AI will use a simplified Behavior Tree or Finite State Machine (FSM):
- **States**:
  - `IDLE`: Scan for player.
  - `CHASE`: Move to line-of-sight.
  - `FLANK`: Move to side angles.
  - `AIM`: Calculate direct or ricochet shot.
  - `FLEE`: Avoid mines/bullets.

**Ricochet Targeting**:
The Green Tank AI uses a recursive raycast to find 1-bounce or 2-bounce paths to the player:
`Raycast(start, target) || Raycast(start, wall) -> Raycast(wall_hit, target)`

## 4. Performance
- **Map Rendering**: Cache static walls to an off-screen canvas.
- **Bullet Batching**: Update bullets in a single contiguous loop.

## 5. Roadmap
- **Phase 1**: Core Engine (Move, Shoot, Ricochet).
- **Phase 2**: Basic Enemies (Brown, Grey).
- **Phase 3**: Advanced AI (Green/Black) & Levels system.
