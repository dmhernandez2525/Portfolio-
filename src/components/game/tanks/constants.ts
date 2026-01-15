import type { TankType } from "./types"

export const VIEWPORT_WIDTH = 800
export const VIEWPORT_HEIGHT = 600

export const TANK_RADIUS = 15
export const BULLET_RADIUS = 4
export const TANK_SPEED = 2
export const BULLET_SPEED_NORMAL = 5
export const BULLET_SPEED_FAST = 8

export const COLORS = {
  PLAYER: "#4287f5", // Blue
  BROWN: "#8b4513",
  GREY: "#808080",
  TEAL: "#008080",
  YELLOW: "#ffd700",
  RED: "#ff0000",
  GREEN: "#008000",
  PURPLE: "#800080",
  WHITE: "#f0f0f0", // Almost invisible on white, but distinct on dark bg
  BLACK: "#1a1a1a",
  WALL_STATIC: "#555",
  WALL_BREAKABLE: "#a0522d",
}

export const TANK_STATS: Record<TankType, {
  speed: number,
  maxBullets: number,
  bulletSpeed: number,
  cooldown: number, // Frames
  rockets: boolean,
  hp: number,
  maxBounces: number
}> = {
  PLAYER: { speed: 2.5, maxBullets: 5, bulletSpeed: 5, cooldown: 20, rockets: false, hp: 1, maxBounces: 1 },
  BROWN: { speed: 0, maxBullets: 1, bulletSpeed: 4, cooldown: 100, rockets: false, hp: 1, maxBounces: 1 },
  GREY: { speed: 1.5, maxBullets: 1, bulletSpeed: 5, cooldown: 80, rockets: false, hp: 1, maxBounces: 1 },
  TEAL: { speed: 3, maxBullets: 1, bulletSpeed: 9, cooldown: 60, rockets: true, hp: 1, maxBounces: 0 },
  YELLOW: { speed: 2, maxBullets: 2, bulletSpeed: 5, cooldown: 60, rockets: false, hp: 1, maxBounces: 1 },
  RED: { speed: 2.5, maxBullets: 3, bulletSpeed: 5, cooldown: 40, rockets: false, hp: 1, maxBounces: 1 },
  GREEN: { speed: 0, maxBullets: 2, bulletSpeed: 8, cooldown: 60, rockets: false, hp: 1, maxBounces: 2 },
  PURPLE: { speed: 3, maxBullets: 5, bulletSpeed: 6, cooldown: 30, rockets: false, hp: 1, maxBounces: 1 },
  WHITE: { speed: 2.5, maxBullets: 2, bulletSpeed: 5, cooldown: 60, rockets: false, hp: 1, maxBounces: 1 },
  BLACK: { speed: 3.5, maxBullets: 3, bulletSpeed: 7, cooldown: 20, rockets: true, hp: 3, maxBounces: 1 },
}
