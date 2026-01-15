import type { Entity, Wall, Bullet } from "./types"

// Check intersection between Circle and AABB (Wall)
export function checkWallCollision(entity: Entity, wall: Wall): boolean {
  // Find point on box closest to circle center
  const closestX = Math.max(wall.x, Math.min(entity.x, wall.x + wall.width))
  const closestY = Math.max(wall.y, Math.min(entity.y, wall.y + wall.height))

  const dx = entity.x - closestX
  const dy = entity.y - closestY
  const distSquared = dx * dx + dy * dy

  return distSquared < (entity.radius * entity.radius)
}

// Resolve tank collision with simple sliding
export function resolveWallCollision(entity: Entity, wall: Wall) {
  const closestX = Math.max(wall.x, Math.min(entity.x, wall.x + wall.width))
  const closestY = Math.max(wall.y, Math.min(entity.y, wall.y + wall.height))

  const dx = entity.x - closestX
  const dy = entity.y - closestY
  
  // Normalize
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist === 0) return // Overlap center? Should not happen if speed < radius

  const overlap = entity.radius - dist
  
  if (overlap > 0) {
    const nx = dx / dist
    const ny = dy / dist
    entity.x += nx * overlap
    entity.y += ny * overlap
  }
}

// Bullet ricochet logic
export function updateBulletPhysics(bullet: Bullet, walls: Wall[], viewportW: number, viewportH: number): boolean {
  let bounced = false
  
  // 1. Move
  bullet.x += bullet.vx
  bullet.y += bullet.vy

  // 2. Window Bounds Collision
  if (bullet.x <= bullet.radius) {
    bullet.x = bullet.radius
    bullet.vx *= -1
    bounced = true
  }
  if (bullet.x >= viewportW - bullet.radius) {
    bullet.x = viewportW - bullet.radius
    bullet.vx *= -1
    bounced = true
  }
  if (bullet.y <= bullet.radius) {
    bullet.y = bullet.radius
    bullet.vy *= -1
    bounced = true
  }
  if (bullet.y >= viewportH - bullet.radius) {
    bullet.y = viewportH - bullet.radius
    bullet.vy *= -1
    bounced = true
  }

  if (bounced) {
    handleBounce(bullet)
    return true // Alive
  }

  // 3. Wall Collision
  for (const wall of walls) {
    if (checkWallCollision(bullet, wall)) {
      // Determine side of collision for reflection
      // Simple AABB logic: where was it previously?
      const prevX = bullet.x - bullet.vx
      const prevY = bullet.y - bullet.vy
      
      // Check X range overlap (horizontal collision?)
      const inXRange = prevX >= wall.x - bullet.radius && prevX <= wall.x + wall.width + bullet.radius
      const inYRange = prevY >= wall.y - bullet.radius && prevY <= wall.y + wall.height + bullet.radius
      
      let reflectX = false
      let reflectY = false

      if (inYRange) {
        // Hit Left or right?
        if (prevX < wall.x) { // Left hit
             bullet.x = wall.x - bullet.radius - 1
             reflectX = true
        } else if (prevX > wall.x + wall.width) { // Right hit
             bullet.x = wall.x + wall.width + bullet.radius + 1
             reflectX = true
        }
      }
      
      if (inXRange && !reflectX) { // Only check Y if X didn't trigger (corner cases hard)
        // Hit Top or Bottom?
        if (prevY < wall.y) { // Top hit
            bullet.y = wall.y - bullet.radius - 1
            reflectY = true
        } else if (prevY > wall.y + wall.height) { // Bottom hit
            bullet.y = wall.y + wall.height + bullet.radius + 1
            reflectY = true
        }
      }
      
      // Fallback for corner exact hits
      if (!reflectX && !reflectY) {
         bullet.vx *= -1
         bullet.vy *= -1
      } else {
         if (reflectX) bullet.vx *= -1
         if (reflectY) bullet.vy *= -1
      }
      
      handleBounce(bullet)
      if (bullet.bounces > bullet.maxBounces) return false // Destroyed
      return true // Alive
    }
  }

  return true
}

function handleBounce(bullet: Bullet) {
  if (bullet.isRocket) {
    bullet.bounces = 999 // Rockets expire on first hit usually, or handled by caller
  } else {
    bullet.bounces++
  }
}

export function checkCircleCollision(a: Entity, b: Entity): boolean {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  return dist < (a.radius + b.radius)
}
