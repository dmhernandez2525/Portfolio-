export type BeanColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'garbage';

export interface Bean {
  id: string;
  color: BeanColor;
  x: number;
  y: number;
  isFalling: boolean;
  connected: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
}

export interface ActivePair {
  primary: Bean;
  secondary: Bean;
  rotation: 0 | 90 | 180 | 270; // 0 is secondary above primary
}

export interface GameBoard {
  grid: (Bean | null)[][]; // 6 columns x 12 rows
  width: number;
  height: number;
  score: number;
  chains: number;
  pendingGarbage: number;
}

export interface GameState {
  player: GameBoard;
  opponent: GameBoard;
  activePair: ActivePair | null;
  nextPair: { primary: BeanColor, secondary: BeanColor };
  status: 'playing' | 'animating' | 'gameover' | 'paused';
  winner: 'player' | 'opponent' | null;
}
