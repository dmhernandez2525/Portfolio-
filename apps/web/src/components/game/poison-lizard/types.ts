export interface Position {
  x: number;
  y: number;
}

export interface Projectile {
  id: string;
  position: Position;
  velocity: Position;
  damage: number;
  isPoison: boolean;
}

export interface Enemy {
  id: string;
  type: 'Barbarian' | 'Archer' | 'Giant' | 'Goblin';
  position: Position;
  health: number;
  maxHealth: number;
  speed: number;
  poisonTicks: number;
  reward: number;
}

export interface PoisonLizardState {
  lizardPosition: Position;
  projectiles: Projectile[];
  enemies: Enemy[];
  score: number;
  gold: number;
  health: number;
  maxHealth: number;
  wave: number;
  status: 'Menu' | 'Playing' | 'Upgrading' | 'GameOver';
  upgrades: {
    spitSpeed: number;
    venomPotency: number;
    maxHealth: number;
  };
}
