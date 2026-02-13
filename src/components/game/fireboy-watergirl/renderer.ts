import type { Character, LevelData, MovingPlatform, GameState } from "./types"
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, COLS, ROWS,
  TILE_EMPTY, TILE_WALL, TILE_LAVA, TILE_WATER, TILE_GOO, TILE_MECHANISM,
  COLORS,
} from "./constants"

let animFrame = 0

export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  animFrame++
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  drawBackground(ctx)
  drawTiles(ctx, state.level)
  drawMechanisms(ctx, state.level)
  drawMovingPlatforms(ctx, state.level.movingPlatforms)
  drawButtons(ctx, state.level)
  drawLevers(ctx, state.level)
  drawGems(ctx, state.level)
  drawDoors(ctx, state.level)
  drawCharacter(ctx, state.fire)
  drawCharacter(ctx, state.water)
  drawHUD(ctx, state)
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
  gradient.addColorStop(0, COLORS.bgGradientTop)
  gradient.addColorStop(1, COLORS.bgGradientBottom)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // Ambient temple particles
  ctx.globalAlpha = 0.03
  for (let i = 0; i < 20; i++) {
    const x = ((animFrame * 0.3 + i * 137) % (CANVAS_WIDTH + 40)) - 20
    const y = ((animFrame * 0.1 + i * 89) % (CANVAS_HEIGHT + 40)) - 20
    ctx.fillStyle = i % 2 === 0 ? COLORS.fireChar : COLORS.waterChar
    ctx.fillRect(x, y, 2, 2)
  }
  ctx.globalAlpha = 1
}

function drawTiles(ctx: CanvasRenderingContext2D, level: LevelData): void {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = level.tiles[row]?.[col]
      if (tile === undefined || tile === TILE_EMPTY || tile === TILE_MECHANISM) continue

      const x = col * TILE_SIZE
      const y = row * TILE_SIZE

      if (tile === TILE_WALL) {
        drawWallTile(ctx, x, y, row, col, level)
      } else if (tile === TILE_LAVA) {
        drawHazardTile(ctx, x, y, COLORS.lavaDark, COLORS.lava, COLORS.lavaGlow)
      } else if (tile === TILE_WATER) {
        drawHazardTile(ctx, x, y, COLORS.waterDark, COLORS.water, COLORS.waterGlow)
      } else if (tile === TILE_GOO) {
        drawHazardTile(ctx, x, y, COLORS.gooDark, COLORS.goo, COLORS.gooGlow)
      }
    }
  }
}

function drawWallTile(ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number, level: LevelData): void {
  ctx.fillStyle = COLORS.wall
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)

  // Top highlight
  const above = level.tiles[row - 1]?.[col]
  if (above !== TILE_WALL) {
    ctx.fillStyle = COLORS.wallHighlight
    ctx.fillRect(x, y, TILE_SIZE, 2)
  }

  // Side shadow
  const right = level.tiles[row]?.[col + 1]
  if (right !== TILE_WALL) {
    ctx.fillStyle = COLORS.wallShadow
    ctx.fillRect(x + TILE_SIZE - 2, y, 2, TILE_SIZE)
  }

  // Subtle brick pattern
  ctx.fillStyle = COLORS.wallShadow
  ctx.globalAlpha = 0.15
  if ((row + col) % 2 === 0) {
    ctx.fillRect(x + 1, y + TILE_SIZE / 2, TILE_SIZE - 2, 1)
    ctx.fillRect(x + TILE_SIZE / 2, y + 1, 1, TILE_SIZE / 2 - 1)
  } else {
    ctx.fillRect(x + 1, y + TILE_SIZE / 2, TILE_SIZE - 2, 1)
    ctx.fillRect(x + TILE_SIZE / 4, y + 1, 1, TILE_SIZE / 2 - 1)
    ctx.fillRect(x + (3 * TILE_SIZE) / 4, y + TILE_SIZE / 2 + 1, 1, TILE_SIZE / 2 - 2)
  }
  ctx.globalAlpha = 1
}

function drawHazardTile(ctx: CanvasRenderingContext2D, x: number, y: number, dark: string, mid: string, glow: string): void {
  ctx.fillStyle = dark
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)

  // Animated surface wave
  const waveOffset = Math.sin(animFrame * 0.08 + x * 0.1) * 3
  ctx.fillStyle = mid
  ctx.fillRect(x, y + 2 + waveOffset, TILE_SIZE, TILE_SIZE / 2)

  // Glow on top
  ctx.fillStyle = glow
  ctx.globalAlpha = 0.5 + Math.sin(animFrame * 0.1 + x * 0.05) * 0.3
  ctx.fillRect(x + 2, y + waveOffset, TILE_SIZE - 4, 4)
  ctx.globalAlpha = 1

  // Bubbles
  const bubbleX = x + ((animFrame * 0.5 + x * 3) % TILE_SIZE)
  const bubbleY = y + ((animFrame * 0.3 + x * 7) % (TILE_SIZE * 0.6)) + TILE_SIZE * 0.3
  ctx.fillStyle = glow
  ctx.globalAlpha = 0.4
  ctx.beginPath()
  ctx.arc(bubbleX, bubbleY, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawMechanisms(ctx: CanvasRenderingContext2D, level: LevelData): void {
  for (const mech of level.mechanisms) {
    for (const tile of mech.tiles) {
      const x = tile.x * TILE_SIZE
      const y = tile.y * TILE_SIZE

      if (mech.open) {
        ctx.fillStyle = COLORS.mechanismOpen
        ctx.globalAlpha = 0.3
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        ctx.globalAlpha = 1
        // Draw open outline
        ctx.strokeStyle = COLORS.mechanismClosed
        ctx.globalAlpha = 0.4
        ctx.setLineDash([4, 4])
        ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2)
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      } else {
        ctx.fillStyle = COLORS.mechanismClosed
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        // Cross-hatch pattern
        ctx.strokeStyle = COLORS.wall
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x + 4, y + 4)
        ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE - 4)
        ctx.moveTo(x + TILE_SIZE - 4, y + 4)
        ctx.lineTo(x + 4, y + TILE_SIZE - 4)
        ctx.stroke()
      }
    }
  }
}

function drawMovingPlatforms(ctx: CanvasRenderingContext2D, platforms: MovingPlatform[]): void {
  for (const p of platforms) {
    const w = p.width * TILE_SIZE
    // Platform body
    ctx.fillStyle = COLORS.platform
    ctx.fillRect(p.x, p.y, w, TILE_SIZE / 2)
    // Top edge
    ctx.fillStyle = COLORS.platformTop
    ctx.fillRect(p.x, p.y, w, 3)
    // Grip dots
    ctx.fillStyle = COLORS.wallShadow
    for (let i = 0; i < p.width; i++) {
      ctx.fillRect(p.x + i * TILE_SIZE + TILE_SIZE / 2 - 2, p.y + 8, 4, 4)
    }
  }
}

function drawButtons(ctx: CanvasRenderingContext2D, level: LevelData): void {
  for (const btn of level.buttons) {
    const x = btn.x * TILE_SIZE
    const y = btn.y * TILE_SIZE
    const w = btn.width * TILE_SIZE
    const h = btn.pressed ? 4 : 8

    ctx.fillStyle = btn.pressed ? COLORS.buttonPressed : COLORS.button
    ctx.fillRect(x + 2, y + TILE_SIZE - h, w - 4, h)

    // Top plate
    ctx.fillStyle = COLORS.button
    ctx.fillRect(x, y + TILE_SIZE - h - 2, w, 3)
  }
}

function drawLevers(ctx: CanvasRenderingContext2D, level: LevelData): void {
  for (const lever of level.levers) {
    const x = lever.x * TILE_SIZE + TILE_SIZE / 2
    const y = lever.y * TILE_SIZE + TILE_SIZE

    // Base
    ctx.fillStyle = COLORS.lever
    ctx.fillRect(x - 8, y - 6, 16, 6)

    // Handle
    ctx.strokeStyle = COLORS.leverHandle
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(x, y - 6)
    const angle = lever.activated ? -0.6 : 0.6
    ctx.lineTo(x + Math.sin(angle) * 16, y - 6 - Math.cos(angle) * 16)
    ctx.stroke()

    // Knob
    ctx.fillStyle = lever.activated ? COLORS.goo : COLORS.lava
    ctx.beginPath()
    ctx.arc(x + Math.sin(angle) * 16, y - 6 - Math.cos(angle) * 16, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawGems(ctx: CanvasRenderingContext2D, level: LevelData): void {
  for (const gem of level.gems) {
    if (gem.collected) continue
    const cx = gem.x * TILE_SIZE + TILE_SIZE / 2
    const cy = gem.y * TILE_SIZE + TILE_SIZE / 2 + Math.sin(animFrame * 0.06 + gem.x) * 3

    const isFire = gem.type === "fire"
    const color = isFire ? COLORS.fireGem : COLORS.waterGem
    const glow = isFire ? COLORS.fireGemGlow : COLORS.waterGemGlow

    // Glow
    ctx.fillStyle = glow
    ctx.globalAlpha = 0.2 + Math.sin(animFrame * 0.1) * 0.1
    ctx.beginPath()
    ctx.arc(cx, cy, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    // Diamond shape
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(cx, cy - 8)
    ctx.lineTo(cx + 6, cy)
    ctx.lineTo(cx, cy + 8)
    ctx.lineTo(cx - 6, cy)
    ctx.closePath()
    ctx.fill()

    // Highlight
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.moveTo(cx - 2, cy - 5)
    ctx.lineTo(cx + 2, cy - 3)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx - 3, cy - 2)
    ctx.closePath()
    ctx.fill()
  }
}

function drawDoors(ctx: CanvasRenderingContext2D, level: LevelData): void {
  drawDoor(ctx, level.fireDoor.x, level.fireDoor.y, COLORS.doorFire, "fire")
  drawDoor(ctx, level.waterDoor.x, level.waterDoor.y, COLORS.doorWater, "water")
}

function drawDoor(ctx: CanvasRenderingContext2D, col: number, row: number, color: string, type: string): void {
  const x = col * TILE_SIZE
  const y = row * TILE_SIZE - TILE_SIZE / 2

  // Door frame
  ctx.fillStyle = COLORS.doorFrame
  ctx.fillRect(x - 2, y, TILE_SIZE + 4, TILE_SIZE + TILE_SIZE / 2 + 2)

  // Door interior
  ctx.fillStyle = color
  ctx.globalAlpha = 0.3 + Math.sin(animFrame * 0.05) * 0.1
  ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE + TILE_SIZE / 2 - 4)
  ctx.globalAlpha = 1

  // Icon above door
  ctx.fillStyle = color
  ctx.font = "bold 12px monospace"
  ctx.textAlign = "center"
  ctx.fillText(type === "fire" ? "F" : "W", x + TILE_SIZE / 2, y - 4)
}

function drawCharacter(ctx: CanvasRenderingContext2D, char: Character): void {
  if (!char.alive) return

  const isFire = char.type === "fire"
  const primary = isFire ? COLORS.fireChar : COLORS.waterChar
  const light = isFire ? COLORS.fireCharLight : COLORS.waterCharLight
  const dark = isFire ? COLORS.fireCharDark : COLORS.waterCharDark

  const x = char.pos.x
  const y = char.pos.y
  const w = char.width
  const h = char.height
  const cx = x + w / 2
  const dir = char.facingRight ? 1 : -1

  // Character glow
  ctx.fillStyle = primary
  ctx.globalAlpha = 0.15
  ctx.beginPath()
  ctx.arc(cx, y + h / 2, 20, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Body
  ctx.fillStyle = primary
  ctx.fillRect(x + 3, y + 10, w - 6, h - 16)

  // Head
  ctx.fillStyle = light
  ctx.beginPath()
  ctx.arc(cx, y + 8, 8, 0, Math.PI * 2)
  ctx.fill()

  // Eyes
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(cx + dir * 2 - 2, y + 6, 3, 3)
  ctx.fillStyle = dark
  ctx.fillRect(cx + dir * 2 - 1 + dir, y + 7, 1.5, 1.5)

  // Crown/element indicator on head
  if (isFire) {
    // Flame on head
    ctx.fillStyle = COLORS.fireCharLight
    const flicker = Math.sin(animFrame * 0.2) * 2
    ctx.beginPath()
    ctx.moveTo(cx - 4, y + 2)
    ctx.lineTo(cx, y - 5 + flicker)
    ctx.lineTo(cx + 4, y + 2)
    ctx.closePath()
    ctx.fill()
  } else {
    // Water drop on head
    ctx.fillStyle = COLORS.waterCharLight
    ctx.beginPath()
    ctx.moveTo(cx, y - 4)
    ctx.quadraticCurveTo(cx + 4, y + 1, cx, y + 3)
    ctx.quadraticCurveTo(cx - 4, y + 1, cx, y - 4)
    ctx.fill()
  }

  // Legs (animated)
  const legOffset = char.onGround ? Math.sin(char.walkFrame) * 4 : 2
  ctx.fillStyle = dark
  ctx.fillRect(x + 5, y + h - 8, 4, 8)
  ctx.fillRect(x + w - 9, y + h - 8, 4, 8)
  if (Math.abs(char.vel.x) > 0.5) {
    // Animate legs
    ctx.fillRect(x + 5 + legOffset, y + h - 6, 4, 6)
    ctx.fillRect(x + w - 9 - legOffset, y + h - 6, 4, 6)
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState): void {
  // Level name
  ctx.fillStyle = COLORS.text
  ctx.font = "bold 14px monospace"
  ctx.textAlign = "center"
  ctx.globalAlpha = 0.8
  ctx.fillText(`Level ${state.levelIndex + 1}: ${state.level.name}`, CANVAS_WIDTH / 2, 20)
  ctx.globalAlpha = 1

  // Timer
  const minutes = Math.floor(state.timer / 60)
  const seconds = Math.floor(state.timer % 60)
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  ctx.fillStyle = COLORS.hudDim
  ctx.font = "12px monospace"
  ctx.textAlign = "right"
  ctx.fillText(timeStr, CANVAS_WIDTH - 10, 20)

  // Gem counts
  ctx.textAlign = "left"
  ctx.font = "12px monospace"
  ctx.fillStyle = COLORS.fireGem
  ctx.fillText(`Fire: ${state.fireGems}/${state.totalFireGems}`, 10, 20)
  ctx.fillStyle = COLORS.waterGem
  ctx.fillText(`Water: ${state.waterGems}/${state.totalWaterGems}`, 10, 36)

  // Death indicators
  if (!state.fire.alive || !state.water.alive) {
    ctx.fillStyle = "#ff4444"
    ctx.globalAlpha = 0.5 + Math.sin(animFrame * 0.15) * 0.3
    ctx.font = "bold 24px monospace"
    ctx.textAlign = "center"
    ctx.fillText(state.deathMessage || "A character died!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20)
    ctx.font = "14px monospace"
    ctx.fillText("Press SPACE to retry", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10)
    ctx.globalAlpha = 1
  }
}
