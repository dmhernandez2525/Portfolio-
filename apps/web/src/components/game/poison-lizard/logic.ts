import type { Enemy, PoisonLizardState } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export function createInitialState(): PoisonLizardState {
  return {
    lizardPosition: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50 },
    projectiles: [],
    enemies: [],
    score: 0,
    gold: 0,
    health: 100,
    maxHealth: 100,
    wave: 1,
    status: 'Menu',
    upgrades: {
      spitSpeed: 1,
      venomPotency: 1,
      maxHealth: 100
    }
  };
}

export function spawnEnemy(wave: number): Enemy {
  const types: Enemy['type'][] = ['Barbarian', 'Archer', 'Giant', 'Goblin'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const stats = {
    Barbarian: { health: 50, speed: 1, reward: 10 },
    Archer: { health: 30, speed: 1.5, reward: 15 },
    Giant: { health: 200, speed: 0.5, reward: 50 },
    Goblin: { health: 20, speed: 2.5, reward: 20 }
  };

  const stat = stats[type];
  const multiplier = 1 + (wave - 1) * 0.2;

  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    position: { x: Math.random() * (CANVAS_WIDTH - 40) + 20, y: -50 },
    health: stat.health * multiplier,
    maxHealth: stat.health * multiplier,
    speed: stat.speed,
    poisonTicks: 0,
    reward: stat.reward
  };
}

export function updateGameState(state: PoisonLizardState): PoisonLizardState {
  const newState = { ...state };

  // 1. Update Projectiles
  newState.projectiles = state.projectiles
    .map(p => ({
      ...p,
      position: { x: p.position.x + p.velocity.x, y: p.position.y + p.velocity.y }
    }))
    .filter(p => p.position.y > -50 && p.position.x > -50 && p.position.x < CANVAS_WIDTH + 50);

  // 2. Update Enemies & Collision
  newState.enemies = state.enemies.map(enemy => {
    let health = enemy.health;
    let poisonTicks = enemy.poisonTicks;

    // Apply poison damage
    if (poisonTicks > 0) {
      health -= 0.5 * state.upgrades.venomPotency;
      poisonTicks--;
    }

    // Check projectile collision
    newState.projectiles.forEach((p, pIdx) => {
      const dist = Math.sqrt(
        Math.pow(p.position.x - enemy.position.x, 2) + 
        Math.pow(p.position.y - enemy.position.y, 2)
      );
      if (dist < 30) {
        health -= p.damage;
        if (p.isPoison) poisonTicks += 60; // 1 second of poison
        newState.projectiles.splice(pIdx, 1);
      }
    });

    return {
      ...enemy,
      position: { x: enemy.position.x, y: enemy.position.y + enemy.speed },
      health,
      poisonTicks
    };
  });

  // 3. Filter Dead/Off-screen Enemies
  const killedEnemies = newState.enemies.filter(e => e.health <= 0);
  newState.gold += killedEnemies.reduce((sum, e) => sum + e.reward, 0);
  newState.score += killedEnemies.length * 100;
  
  const leakedEnemies = newState.enemies.filter(e => e.position.y > CANVAS_HEIGHT);
  newState.health -= leakedEnemies.length * 10;

  newState.enemies = newState.enemies.filter(e => e.health > 0 && e.position.y <= CANVAS_HEIGHT);

  if (newState.health <= 0) {
    newState.status = 'GameOver';
  }

  return newState;
}
