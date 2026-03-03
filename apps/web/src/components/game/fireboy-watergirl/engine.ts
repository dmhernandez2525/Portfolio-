import type { Character, LevelData, MovingPlatform, Vec2 } from "./types"
import {
  TILE_SIZE, COLS, ROWS, GRAVITY, MOVE_SPEED, JUMP_VELOCITY,
  MAX_FALL_SPEED, FRICTION, TILE_WALL, TILE_LAVA,
  TILE_WATER, TILE_GOO, TILE_MECHANISM,
} from "./constants"

export function createCharacter(spawn: Vec2, type: "fire" | "water"): Character {
  return {
    pos: { x: spawn.x * TILE_SIZE, y: spawn.y * TILE_SIZE },
    vel: { x: 0, y: 0 },
    width: 22,
    height: 30,
    onGround: false,
    alive: true,
    atExit: false,
    type,
    facingRight: true,
    walkFrame: 0,
  }
}

function isSolid(level: LevelData, col: number, row: number): boolean {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true
  const tile = level.tiles[row]?.[col]
  if (tile === TILE_WALL) return true
  if (tile === TILE_MECHANISM) {
    const mech = level.mechanisms.find(m => m.tiles.some(t => t.x === col && t.y === row))
    if (mech && !mech.open) return true
  }
  return false
}

function getHazard(level: LevelData, col: number, row: number): number {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return 0
  return level.tiles[row]?.[col] ?? 0
}

function checkPlatformCollision(
  char: Character,
  platforms: MovingPlatform[],
  prevY: number
): { platform: MovingPlatform; surfaceY: number } | null {
  for (const p of platforms) {
    const platLeft = p.x
    const platRight = p.x + p.width * TILE_SIZE
    const platTop = p.y
    const charLeft = char.pos.x + 5
    const charRight = char.pos.x + char.width - 5
    const charBottom = char.pos.y + char.height

    if (charRight > platLeft && charLeft < platRight) {
      if (prevY + char.height <= platTop + 4 && charBottom >= platTop) {
        return { platform: p, surfaceY: platTop - char.height }
      }
    }
  }
  return null
}

export function updateCharacter(
  char: Character,
  input: { left: boolean; right: boolean; up: boolean },
  level: LevelData,
  _dt: number
): void {
  if (!char.alive) return

  // Horizontal input
  if (input.left) {
    char.vel.x = -MOVE_SPEED
    char.facingRight = false
  } else if (input.right) {
    char.vel.x = MOVE_SPEED
    char.facingRight = true
  } else {
    char.vel.x *= FRICTION
    if (Math.abs(char.vel.x) < 0.1) char.vel.x = 0
  }

  // Jump
  if (input.up && char.onGround) {
    char.vel.y = JUMP_VELOCITY
    char.onGround = false
  }

  // Gravity
  char.vel.y += GRAVITY
  if (char.vel.y > MAX_FALL_SPEED) char.vel.y = MAX_FALL_SPEED

  // Walk animation
  if (Math.abs(char.vel.x) > 0.5 && char.onGround) {
    char.walkFrame += 0.15
  } else {
    char.walkFrame = 0
  }

  const prevY = char.pos.y

  // Horizontal collision
  char.pos.x += char.vel.x
  resolveHorizontal(char, level)

  // Vertical collision
  char.pos.y += char.vel.y
  resolveVertical(char, level)

  // Moving platform check
  if (char.vel.y >= 0) {
    const platHit = checkPlatformCollision(char, level.movingPlatforms, prevY)
    if (platHit) {
      char.pos.y = platHit.surfaceY
      char.vel.y = 0
      char.onGround = true
    }
  }

  // Hazard check
  checkHazards(char, level)

  // Exit check
  const door = char.type === "fire" ? level.fireDoor : level.waterDoor
  const doorPx = { x: door.x * TILE_SIZE, y: door.y * TILE_SIZE }
  const cx = char.pos.x + char.width / 2
  const cy = char.pos.y + char.height / 2
  char.atExit = Math.abs(cx - (doorPx.x + TILE_SIZE / 2)) < TILE_SIZE &&
    Math.abs(cy - (doorPx.y + TILE_SIZE / 2)) < TILE_SIZE * 1.2
}

function resolveHorizontal(char: Character, level: LevelData): void {
  const top = Math.floor(char.pos.y / TILE_SIZE)
  const bottom = Math.floor((char.pos.y + char.height - 1) / TILE_SIZE)
  const margin = 5

  if (char.vel.x > 0) {
    const col = Math.floor((char.pos.x + char.width - 1) / TILE_SIZE)
    for (let row = top; row <= bottom; row++) {
      if (isSolid(level, col, row)) {
        char.pos.x = col * TILE_SIZE - char.width
        char.vel.x = 0
        return
      }
    }
  } else if (char.vel.x < 0) {
    const col = Math.floor(char.pos.x / TILE_SIZE)
    for (let row = top; row <= bottom; row++) {
      if (isSolid(level, col, row)) {
        char.pos.x = (col + 1) * TILE_SIZE
        char.vel.x = 0
        return
      }
    }
  }

  // Boundary clamp
  if (char.pos.x < margin) { char.pos.x = margin; char.vel.x = 0 }
  if (char.pos.x + char.width > COLS * TILE_SIZE - margin) {
    char.pos.x = COLS * TILE_SIZE - char.width - margin
    char.vel.x = 0
  }
}

function resolveVertical(char: Character, level: LevelData): void {
  char.onGround = false
  const left = Math.floor((char.pos.x + 2) / TILE_SIZE)
  const right = Math.floor((char.pos.x + char.width - 3) / TILE_SIZE)

  if (char.vel.y > 0) {
    const row = Math.floor((char.pos.y + char.height) / TILE_SIZE)
    for (let col = left; col <= right; col++) {
      if (isSolid(level, col, row)) {
        char.pos.y = row * TILE_SIZE - char.height
        char.vel.y = 0
        char.onGround = true
        return
      }
    }
  } else if (char.vel.y < 0) {
    const row = Math.floor(char.pos.y / TILE_SIZE)
    for (let col = left; col <= right; col++) {
      if (isSolid(level, col, row)) {
        char.pos.y = (row + 1) * TILE_SIZE
        char.vel.y = 0
        return
      }
    }
  }
}

function checkHazards(char: Character, level: LevelData): void {
  const cx = Math.floor((char.pos.x + char.width / 2) / TILE_SIZE)
  const feet = Math.floor((char.pos.y + char.height + 2) / TILE_SIZE)
  const body = Math.floor((char.pos.y + char.height / 2) / TILE_SIZE)

  const checkTiles = [
    { col: cx, row: feet },
    { col: cx, row: body },
    { col: Math.floor(char.pos.x / TILE_SIZE), row: feet },
    { col: Math.floor((char.pos.x + char.width) / TILE_SIZE), row: feet },
  ]

  for (const { col, row } of checkTiles) {
    const hazard = getHazard(level, col, row)
    if (hazard === TILE_GOO) {
      char.alive = false
      return
    }
    if (hazard === TILE_LAVA && char.type === "water") {
      char.alive = false
      return
    }
    if (hazard === TILE_WATER && char.type === "fire") {
      char.alive = false
      return
    }
  }
}

export function updateButtons(level: LevelData, fire: Character, water: Character): void {
  for (const btn of level.buttons) {
    const btnLeft = btn.x * TILE_SIZE
    const btnRight = btnLeft + btn.width * TILE_SIZE
    const btnTop = btn.y * TILE_SIZE

    const fireOnBtn = fire.alive &&
      fire.pos.x + fire.width > btnLeft && fire.pos.x < btnRight &&
      Math.abs(fire.pos.y + fire.height - btnTop) < 6

    const waterOnBtn = water.alive &&
      water.pos.x + water.width > btnLeft && water.pos.x < btnRight &&
      Math.abs(water.pos.y + water.height - btnTop) < 6

    btn.pressed = fireOnBtn || waterOnBtn
  }

  // Update mechanisms: open if ANY button with matching trigger is pressed
  for (const mech of level.mechanisms) {
    const matchingButtons = level.buttons.filter(b => b.triggerId === mech.id)
    if (matchingButtons.length > 0) {
      mech.open = matchingButtons.some(b => b.pressed)
    }
  }
}

export function updateLevers(level: LevelData, fire: Character, water: Character, justPressed: Set<string>): void {
  for (const lever of level.levers) {
    const lx = lever.x * TILE_SIZE
    const ly = lever.y * TILE_SIZE

    const fireNear = fire.alive &&
      Math.abs(fire.pos.x + fire.width / 2 - (lx + TILE_SIZE / 2)) < TILE_SIZE &&
      Math.abs(fire.pos.y + fire.height - (ly + TILE_SIZE)) < 10

    const waterNear = water.alive &&
      Math.abs(water.pos.x + water.width / 2 - (lx + TILE_SIZE / 2)) < TILE_SIZE &&
      Math.abs(water.pos.y + water.height - (ly + TILE_SIZE)) < 10

    if ((fireNear || waterNear) && !justPressed.has(lever.triggerId)) {
      lever.activated = !lever.activated
      justPressed.add(lever.triggerId)
      const mech = level.mechanisms.find(m => m.id === lever.triggerId)
      if (mech) mech.open = lever.activated
    }
    if (!fireNear && !waterNear) {
      justPressed.delete(lever.triggerId)
    }
  }
}

export function updateMovingPlatforms(level: LevelData, fire: Character, water: Character): void {
  for (const p of level.movingPlatforms) {
    const prevX = p.x
    const prevY = p.y

    p.progress += p.speed * p.direction
    if (p.progress >= 1) { p.progress = 1; p.direction = -1 }
    if (p.progress <= 0) { p.progress = 0; p.direction = 1 }

    p.x = p.pathStart.x + (p.pathEnd.x - p.pathStart.x) * p.progress
    p.y = p.pathStart.y + (p.pathEnd.y - p.pathStart.y) * p.progress

    const dx = p.x - prevX
    const dy = p.y - prevY

    // Move characters riding this platform
    for (const ch of [fire, water]) {
      if (!ch.alive) continue
      const platLeft = p.x
      const platRight = p.x + p.width * TILE_SIZE
      const platTop = p.y
      const charLeft = ch.pos.x + 3
      const charRight = ch.pos.x + ch.width - 3
      const charBottom = ch.pos.y + ch.height

      if (charRight > platLeft && charLeft < platRight &&
        Math.abs(charBottom - platTop) < 4 && ch.onGround) {
        ch.pos.x += dx
        ch.pos.y += dy
      }
    }
  }
}

export function collectGems(level: LevelData, fire: Character, water: Character): { fireCollected: number; waterCollected: number } {
  let fireCollected = 0
  let waterCollected = 0

  for (const gem of level.gems) {
    if (gem.collected) continue
    const gx = gem.x * TILE_SIZE + TILE_SIZE / 2
    const gy = gem.y * TILE_SIZE + TILE_SIZE / 2

    if (gem.type === "fire") {
      const dx = (fire.pos.x + fire.width / 2) - gx
      const dy = (fire.pos.y + fire.height / 2) - gy
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        gem.collected = true
        fireCollected++
      }
    } else {
      const dx = (water.pos.x + water.width / 2) - gx
      const dy = (water.pos.y + water.height / 2) - gy
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        gem.collected = true
        waterCollected++
      }
    }
  }

  return { fireCollected, waterCollected }
}
