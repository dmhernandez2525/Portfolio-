// Physics utilities for artillery tanks
import { GRAVITY, CANVAS_WIDTH, CANVAS_HEIGHT, EXPLOSION_RADIUS } from "./constants"
import type { WeaponType } from "./types"

// Generate procedural terrain using sine waves
export function generateTerrain(width: number, resolution: number): number[] {
    const points: number[] = []
    const numPoints = Math.floor(width / resolution)
    
    // Multiple sine waves for interesting terrain
    const baseHeight = 350
    const amplitude1 = 80
    const amplitude2 = 40
    const amplitude3 = 20
    
    for (let i = 0; i < numPoints; i++) {
        const x = i / numPoints
        const height = baseHeight
            - Math.sin(x * Math.PI * 2) * amplitude1
            - Math.sin(x * Math.PI * 5 + 1) * amplitude2
            - Math.sin(x * Math.PI * 11 + 2) * amplitude3
            + (Math.random() - 0.5) * 10 // Small noise
        
        points.push(Math.max(100, Math.min(CANVAS_HEIGHT - 50, height)))
    }
    
    return points
}

// Get terrain height at a given x position
export function getTerrainHeight(terrain: number[], x: number, resolution: number): number {
    const index = Math.floor(x / resolution)
    if (index < 0) return terrain[0]
    if (index >= terrain.length - 1) return terrain[terrain.length - 1]
    
    // Linear interpolation between points
    const t = (x / resolution) - index
    return terrain[index] * (1 - t) + terrain[index + 1] * t
}

// Update projectile with gravity and wind
export function updateProjectile(
    px: number, py: number, 
    vx: number, vy: number,
    wind: number
): { x: number, y: number, vx: number, vy: number } {
    return {
        x: px + vx,
        y: py + vy,
        vx: vx + wind * 0.005, // Subtle wind effect
        vy: vy + GRAVITY      // Gravity
    }
}

// Robust collision detection using raycasting-style check
export function checkTerrainCollision(
    x1: number, y1: number,
    x2: number, y2: number,
    terrain: number[],
    resolution: number
): boolean {
    // Basic check for current position
    const terrainY = getTerrainHeight(terrain, x2, resolution)
    if (y2 >= terrainY) return true

    // Intermediate check for high-speed projectiles (interpolation)
    const steps = 3
    for (let i = 1; i < steps; i++) {
        const tx = x1 + (x2 - x1) * (i / steps)
        const ty = y1 + (y2 - y1) * (i / steps)
        const tY = getTerrainHeight(terrain, tx, resolution)
        if (ty >= tY) return true
    }

    return false
}

// Destroy terrain in a radius (create crater)
export function destroyTerrain(
    terrain: number[],
    impactX: number,
    resolution: number,
    radius: number
): number[] {
    const newTerrain = [...terrain]
    const centerIndex = Math.floor(impactX / resolution)
    const radiusInPoints = Math.floor(radius / resolution)
    
    for (let i = centerIndex - radiusInPoints; i <= centerIndex + radiusInPoints; i++) {
        if (i >= 0 && i < newTerrain.length) {
            const distanceX = Math.abs(i - centerIndex) * resolution
            if (distanceX < radius) {
                const depth = Math.sqrt(radius * radius - distanceX * distanceX)
                // Lower the terrain (make it deeper)
                newTerrain[i] = Math.min(CANVAS_HEIGHT - 10, newTerrain[i] + depth * 0.8)
            }
        }
    }
    
    return newTerrain
}

// Check if projectile hit a tank
export function checkTankCollision(
    px: number, py: number,
    tankX: number, tankY: number,
    tankWidth: number, tankHeight: number
): boolean {
    return px >= tankX - tankWidth/2 
        && px <= tankX + tankWidth/2
        && py >= tankY - tankHeight
        && py <= tankY
}

// Simple AI: Calculate angle and power to hit target
export function calculateAIShot(
    fromX: number, fromY: number,
    toX: number, toY: number,
    wind: number
): { angle: number, power: number } {
    const dx = toX - fromX
    const dy = toY - fromY
    const distance = Math.abs(dx)
    
    // Power based on distance
    let power = Math.min(95, Math.max(40, distance * 0.12 + Math.random() * 10))
    
    // Angle (mostly lobs)
    let angle = dx > 0 ? 45 : 135
    angle += (Math.random() - 0.5) * 20
    
    // Compensate for wind
    angle -= wind * 2
    
    return { 
        angle: Math.max(10, Math.min(170, angle)), 
        power: Math.max(30, Math.min(95, power)) 
    }
}
