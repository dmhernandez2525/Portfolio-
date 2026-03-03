import type { Bean, BeanColor, GameBoard } from './types';

export const COLORS: BeanColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];
export const GRID_WIDTH = 6;
export const GRID_HEIGHT = 12;

export function createEmptyBoard(): GameBoard {
  return {
    grid: Array(GRID_WIDTH).fill(null).map(() => Array(GRID_HEIGHT).fill(null)),
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    score: 0,
    chains: 0,
    pendingGarbage: 0
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getRandomColor(): BeanColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// Check for matches (4 or more same-colored beans)
export function findMatches(grid: (Bean | null)[][]): { x: number, y: number }[][] {
  const matches: { x: number, y: number }[][] = [];
  const visited = new Set<string>();

  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const bean = grid[x][y];
      if (bean && bean.color !== 'garbage' && !visited.has(`${x},${y}`)) {
        const group = floodFill(grid, x, y, bean.color, visited);
        if (group.length >= 4) {
          matches.push(group);
        }
      }
    }
  }

  return matches;
}

function floodFill(grid: (Bean | null)[][], x: number, y: number, color: BeanColor, visited: Set<string>): { x: number, y: number }[] {
  if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return [];
  const bean = grid[x][y];
  if (!bean || bean.color !== color || visited.has(`${x},${y}`)) return [];

  visited.add(`${x},${y}`);
  const group = [{ x, y }];

  group.push(...floodFill(grid, x + 1, y, color, visited));
  group.push(...floodFill(grid, x - 1, y, color, visited));
  group.push(...floodFill(grid, x, y + 1, color, visited));
  group.push(...floodFill(grid, x, y - 1, color, visited));

  return group;
}

// Apply gravity to all beans
export function applyGravity(grid: (Bean | null)[][]): boolean {
  let changed = false;
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
      if (grid[x][y] && !grid[x][y+1]) {
        let targetY = y;
        while (targetY + 1 < GRID_HEIGHT && !grid[x][targetY + 1]) {
          targetY++;
        }
        grid[x][targetY] = grid[x][y];
        if (grid[x][targetY]) {
          grid[x][targetY]!.y = targetY;
        }
        grid[x][y] = null;
        changed = true;
      }
    }
  }
  return changed;
}

// AI logic: Basic implementation
export function getAIMove(board: GameBoard, pair: { primary: BeanColor, secondary: BeanColor }): { x: number, rotation: number } {
  // Simple AI: Try to find a column where the primary color matches the top bean
  for (let x = 0; x < GRID_WIDTH; x++) {
    const topY = getTopBeanY(board.grid, x);
    if (topY < GRID_HEIGHT && board.grid[x][topY]?.color === pair.primary) {
      return { x, rotation: 0 };
    }
  }
  
  // Fallback: Pick a random column that isn't full
  const validCols = [];
  for (let x = 0; x < GRID_WIDTH; x++) {
    if (!board.grid[x][0]) validCols.push(x);
  }
  
  return { 
    x: validCols[Math.floor(Math.random() * validCols.length)] || 2, 
    rotation: Math.floor(Math.random() * 4) * 90 as any 
  };
}

function getTopBeanY(grid: (Bean | null)[][], x: number): number {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    if (grid[x][y]) return y;
  }
  return GRID_HEIGHT;
}
