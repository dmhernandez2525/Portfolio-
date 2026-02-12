// =============================================================================
// Pokemon RPG Engine - Collision Detection Test Suite
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { GameMap, NPCDef, TileType, Direction } from '../types';
import {
  isTileWalkable,
  canCrossLedge,
  isTallGrass,
  getTileType,
  isNPCAtTile,
  getAdjacentTile,
  checkWarp,
  checkTrainerLOS,
} from '../collision';

// =============================================================================
// Fixtures
// =============================================================================

/** Build a minimal GameMap from a 2D collision grid. */
function makeMap(
  collision: TileType[][],
  overrides?: Partial<GameMap>
): GameMap {
  const height = collision.length;
  const width = height > 0 ? collision[0].length : 0;
  const emptyGrid = collision.map(row => row.map(() => 0));
  return {
    id: 'test-map',
    name: 'Test Map',
    width,
    height,
    tilesetId: 'test',
    layers: { ground: emptyGrid, objects: emptyGrid, above: emptyGrid },
    collision,
    warps: [],
    connections: [],
    encounters: [],
    npcs: [],
    ...overrides,
  };
}

/** Build a minimal NPCDef for testing. */
function makeNPC(overrides?: Partial<NPCDef>): NPCDef {
  return {
    id: 'npc-1',
    x: 0,
    y: 0,
    spriteId: 'test-sprite',
    direction: 'down',
    movement: 'static',
    dialog: ['Hello!'],
    isTrainer: false,
    ...overrides,
  };
}

// A 5x5 map with various tile types for general tests
//
//  Row 0: walkable  walkable  blocked   surfable    tall_grass
//  Row 1: walkable  walkable  walkable  walkable    walkable
//  Row 2: blocked   tall_grass walkable ledge_down  walkable
//  Row 3: walkable  walkable  walkable  walkable    ledge_right
//  Row 4: walkable  ledge_left walkable walkable    walkable
const MIXED_COLLISION: TileType[][] = [
  ['walkable', 'walkable',   'blocked',    'surfable',   'tall_grass'],
  ['walkable', 'walkable',   'walkable',   'walkable',   'walkable'],
  ['blocked',  'tall_grass', 'walkable',   'ledge_down', 'walkable'],
  ['walkable', 'walkable',   'walkable',   'walkable',   'ledge_right'],
  ['walkable', 'ledge_left', 'walkable',   'walkable',   'walkable'],
];

const MIXED_MAP = makeMap(MIXED_COLLISION);

// =============================================================================
// isTileWalkable
// =============================================================================

describe('isTileWalkable', () => {
  it('returns true for a walkable tile (not surfing)', () => {
    expect(isTileWalkable(MIXED_MAP, 0, 0, false)).toBe(true);
  });

  it('returns true for tall_grass when not surfing', () => {
    expect(isTileWalkable(MIXED_MAP, 4, 0, false)).toBe(true);
  });

  it('returns false for a blocked tile', () => {
    expect(isTileWalkable(MIXED_MAP, 2, 0, false)).toBe(false);
  });

  it('returns false for a surfable tile when not surfing', () => {
    expect(isTileWalkable(MIXED_MAP, 3, 0, false)).toBe(false);
  });

  it('returns true for a surfable tile when surfing', () => {
    expect(isTileWalkable(MIXED_MAP, 3, 0, true)).toBe(true);
  });

  it('returns true for a walkable tile when surfing', () => {
    expect(isTileWalkable(MIXED_MAP, 0, 0, true)).toBe(true);
  });

  it('returns false for tall_grass when surfing', () => {
    // surfing only allows surfable or walkable
    expect(isTileWalkable(MIXED_MAP, 4, 0, true)).toBe(false);
  });

  it('returns false for ledge tiles (not walkable)', () => {
    expect(isTileWalkable(MIXED_MAP, 3, 2, false)).toBe(false); // ledge_down
    expect(isTileWalkable(MIXED_MAP, 4, 3, false)).toBe(false); // ledge_right
    expect(isTileWalkable(MIXED_MAP, 1, 4, false)).toBe(false); // ledge_left
  });

  describe('out-of-bounds checks', () => {
    it('returns false for negative X', () => {
      expect(isTileWalkable(MIXED_MAP, -1, 0, false)).toBe(false);
    });

    it('returns false for negative Y', () => {
      expect(isTileWalkable(MIXED_MAP, 0, -1, false)).toBe(false);
    });

    it('returns false for X beyond map width', () => {
      expect(isTileWalkable(MIXED_MAP, 5, 0, false)).toBe(false);
    });

    it('returns false for Y beyond map height', () => {
      expect(isTileWalkable(MIXED_MAP, 0, 5, false)).toBe(false);
    });
  });
});

// =============================================================================
// canCrossLedge
// =============================================================================

describe('canCrossLedge', () => {
  it('returns true when crossing a ledge_down tile going down', () => {
    // ledge_down is at (3, 2), approaching from (3, 1) going down
    expect(canCrossLedge(MIXED_MAP, 3, 1, 'down')).toBe(true);
  });

  it('returns false when crossing a ledge_down tile going up', () => {
    expect(canCrossLedge(MIXED_MAP, 3, 1, 'up')).toBe(false);
  });

  it('returns false when crossing a ledge_down tile going left', () => {
    expect(canCrossLedge(MIXED_MAP, 3, 1, 'left')).toBe(false);
  });

  it('returns true when crossing a ledge_right tile going right', () => {
    // ledge_right is at (4, 3), approaching from (3, 3) going right
    expect(canCrossLedge(MIXED_MAP, 3, 3, 'right')).toBe(true);
  });

  it('returns false when crossing a ledge_right tile going left', () => {
    expect(canCrossLedge(MIXED_MAP, 3, 3, 'left')).toBe(false);
  });

  it('returns true when crossing a ledge_left tile going left', () => {
    // ledge_left is at (1, 4), approaching from (2, 4) going left
    expect(canCrossLedge(MIXED_MAP, 2, 4, 'left')).toBe(true);
  });

  it('returns false when crossing a ledge_left tile going right', () => {
    expect(canCrossLedge(MIXED_MAP, 2, 4, 'right')).toBe(false);
  });

  it('returns false when the target tile is not a ledge', () => {
    // (1, 1) is walkable, not a ledge
    expect(canCrossLedge(MIXED_MAP, 1, 0, 'down')).toBe(false);
  });

  it('returns false when the target is out of bounds', () => {
    expect(canCrossLedge(MIXED_MAP, 0, 0, 'up')).toBe(false);
    expect(canCrossLedge(MIXED_MAP, 0, 0, 'left')).toBe(false);
    expect(canCrossLedge(MIXED_MAP, 4, 4, 'right')).toBe(false);
    expect(canCrossLedge(MIXED_MAP, 4, 4, 'down')).toBe(false);
  });
});

// =============================================================================
// isTallGrass
// =============================================================================

describe('isTallGrass', () => {
  it('returns true for a tall_grass tile', () => {
    expect(isTallGrass(MIXED_MAP, 4, 0)).toBe(true);
    expect(isTallGrass(MIXED_MAP, 1, 2)).toBe(true);
  });

  it('returns false for a walkable tile', () => {
    expect(isTallGrass(MIXED_MAP, 0, 0)).toBe(false);
  });

  it('returns false for a blocked tile', () => {
    expect(isTallGrass(MIXED_MAP, 2, 0)).toBe(false);
  });

  it('returns false for out-of-bounds coordinates', () => {
    expect(isTallGrass(MIXED_MAP, -1, 0)).toBe(false);
    expect(isTallGrass(MIXED_MAP, 0, -1)).toBe(false);
    expect(isTallGrass(MIXED_MAP, 10, 10)).toBe(false);
  });
});

// =============================================================================
// getTileType
// =============================================================================

describe('getTileType', () => {
  it('returns the correct type for each tile kind', () => {
    expect(getTileType(MIXED_MAP, 0, 0)).toBe('walkable');
    expect(getTileType(MIXED_MAP, 2, 0)).toBe('blocked');
    expect(getTileType(MIXED_MAP, 3, 0)).toBe('surfable');
    expect(getTileType(MIXED_MAP, 4, 0)).toBe('tall_grass');
    expect(getTileType(MIXED_MAP, 3, 2)).toBe('ledge_down');
    expect(getTileType(MIXED_MAP, 4, 3)).toBe('ledge_right');
    expect(getTileType(MIXED_MAP, 1, 4)).toBe('ledge_left');
  });

  it('returns null for out-of-bounds coordinates', () => {
    expect(getTileType(MIXED_MAP, -1, 0)).toBeNull();
    expect(getTileType(MIXED_MAP, 0, -1)).toBeNull();
    expect(getTileType(MIXED_MAP, 5, 0)).toBeNull();
    expect(getTileType(MIXED_MAP, 0, 5)).toBeNull();
  });
});

// =============================================================================
// isNPCAtTile
// =============================================================================

describe('isNPCAtTile', () => {
  const npcs: NPCDef[] = [
    makeNPC({ id: 'nurse', x: 3, y: 1 }),
    makeNPC({ id: 'guard', x: 0, y: 4 }),
    makeNPC({ id: 'trainer', x: 2, y: 2, isTrainer: true }),
  ];

  it('returns the NPC at the given tile', () => {
    const result = isNPCAtTile(npcs, 3, 1);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('nurse');
  });

  it('returns a different NPC at another tile', () => {
    const result = isNPCAtTile(npcs, 0, 4);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('guard');
  });

  it('returns null when no NPC is at the tile', () => {
    expect(isNPCAtTile(npcs, 1, 1)).toBeNull();
  });

  it('returns null for an empty NPC array', () => {
    expect(isNPCAtTile([], 0, 0)).toBeNull();
  });
});

// =============================================================================
// getAdjacentTile
// =============================================================================

describe('getAdjacentTile', () => {
  it('returns the tile above for direction "up"', () => {
    expect(getAdjacentTile(2, 3, 'up')).toEqual({ x: 2, y: 2 });
  });

  it('returns the tile below for direction "down"', () => {
    expect(getAdjacentTile(2, 3, 'down')).toEqual({ x: 2, y: 4 });
  });

  it('returns the tile to the left for direction "left"', () => {
    expect(getAdjacentTile(2, 3, 'left')).toEqual({ x: 1, y: 3 });
  });

  it('returns the tile to the right for direction "right"', () => {
    expect(getAdjacentTile(2, 3, 'right')).toEqual({ x: 3, y: 3 });
  });

  it('can produce negative coordinates (no bounds checking)', () => {
    expect(getAdjacentTile(0, 0, 'up')).toEqual({ x: 0, y: -1 });
    expect(getAdjacentTile(0, 0, 'left')).toEqual({ x: -1, y: 0 });
  });
});

// =============================================================================
// checkWarp
// =============================================================================

describe('checkWarp', () => {
  const mapWithWarps = makeMap(
    [
      ['walkable', 'walkable', 'walkable'],
      ['walkable', 'walkable', 'walkable'],
    ],
    {
      warps: [
        { x: 0, y: 0, targetMap: 'indoor-1', targetX: 5, targetY: 10 },
        { x: 2, y: 1, targetMap: 'route-2', targetX: 0, targetY: 0 },
      ],
    }
  );

  it('returns the matching warp point', () => {
    const warp = checkWarp(mapWithWarps, 0, 0);
    expect(warp).not.toBeNull();
    expect(warp!.targetMap).toBe('indoor-1');
    expect(warp!.targetX).toBe(5);
    expect(warp!.targetY).toBe(10);
  });

  it('returns the second warp when coordinates match', () => {
    const warp = checkWarp(mapWithWarps, 2, 1);
    expect(warp).not.toBeNull();
    expect(warp!.targetMap).toBe('route-2');
  });

  it('returns null when no warp exists at the tile', () => {
    expect(checkWarp(mapWithWarps, 1, 0)).toBeNull();
    expect(checkWarp(mapWithWarps, 1, 1)).toBeNull();
  });

  it('returns null on a map with no warps', () => {
    expect(checkWarp(MIXED_MAP, 0, 0)).toBeNull();
  });
});

// =============================================================================
// checkTrainerLOS
// =============================================================================

describe('checkTrainerLOS', () => {
  // A 7-wide, 1-tall walkable row for horizontal LOS tests
  const horizontalMap = makeMap([
    ['walkable', 'walkable', 'walkable', 'walkable', 'walkable', 'walkable', 'walkable'],
  ]);

  // A 1-wide, 7-tall walkable column for vertical LOS tests
  const verticalMap = makeMap([
    ['walkable'],
    ['walkable'],
    ['walkable'],
    ['walkable'],
    ['walkable'],
    ['walkable'],
    ['walkable'],
  ]);

  it('returns false if NPC is not a trainer', () => {
    const npc = makeNPC({ x: 0, y: 0, direction: 'right', isTrainer: false, lineOfSight: 3 });
    expect(checkTrainerLOS(npc, 2, 0, horizontalMap)).toBe(false);
  });

  it('returns false if NPC has no lineOfSight defined', () => {
    const npc = makeNPC({ x: 0, y: 0, direction: 'right', isTrainer: true });
    expect(checkTrainerLOS(npc, 2, 0, horizontalMap)).toBe(false);
  });

  it('detects a player within LOS facing right', () => {
    const npc = makeNPC({ x: 1, y: 0, direction: 'right', isTrainer: true, lineOfSight: 4 });
    expect(checkTrainerLOS(npc, 3, 0, horizontalMap)).toBe(true);
  });

  it('does not detect a player behind the trainer (facing right, player to left)', () => {
    const npc = makeNPC({ x: 3, y: 0, direction: 'right', isTrainer: true, lineOfSight: 4 });
    expect(checkTrainerLOS(npc, 1, 0, horizontalMap)).toBe(false);
  });

  it('detects a player within LOS facing left', () => {
    const npc = makeNPC({ x: 5, y: 0, direction: 'left', isTrainer: true, lineOfSight: 3 });
    expect(checkTrainerLOS(npc, 3, 0, horizontalMap)).toBe(true);
  });

  it('detects a player within LOS facing down', () => {
    const npc = makeNPC({ x: 0, y: 1, direction: 'down', isTrainer: true, lineOfSight: 4 });
    expect(checkTrainerLOS(npc, 0, 4, verticalMap)).toBe(true);
  });

  it('detects a player within LOS facing up', () => {
    const npc = makeNPC({ x: 0, y: 5, direction: 'up', isTrainer: true, lineOfSight: 4 });
    expect(checkTrainerLOS(npc, 0, 2, verticalMap)).toBe(true);
  });

  it('does not detect a player beyond the LOS range', () => {
    const npc = makeNPC({ x: 0, y: 0, direction: 'right', isTrainer: true, lineOfSight: 2 });
    expect(checkTrainerLOS(npc, 4, 0, horizontalMap)).toBe(false);
  });

  it('does not detect a player at exactly LOS + 1 distance', () => {
    const npc = makeNPC({ x: 1, y: 0, direction: 'right', isTrainer: true, lineOfSight: 3 });
    // Player at x=5 is distance 4, LOS is 3
    expect(checkTrainerLOS(npc, 5, 0, horizontalMap)).toBe(false);
  });

  it('detects a player at exactly the LOS boundary', () => {
    const npc = makeNPC({ x: 1, y: 0, direction: 'right', isTrainer: true, lineOfSight: 3 });
    // Player at x=4 is distance 3
    expect(checkTrainerLOS(npc, 4, 0, horizontalMap)).toBe(true);
  });

  it('returns false if a blocked tile interrupts the LOS', () => {
    const blockedMap = makeMap([
      ['walkable', 'walkable', 'blocked', 'walkable', 'walkable'],
    ]);
    const npc = makeNPC({ x: 0, y: 0, direction: 'right', isTrainer: true, lineOfSight: 4 });
    expect(checkTrainerLOS(npc, 3, 0, blockedMap)).toBe(false);
  });

  it('can see through tall_grass tiles', () => {
    const grassMap = makeMap([
      ['walkable', 'tall_grass', 'tall_grass', 'walkable', 'walkable'],
    ]);
    const npc = makeNPC({ x: 0, y: 0, direction: 'right', isTrainer: true, lineOfSight: 4 });
    expect(checkTrainerLOS(npc, 3, 0, grassMap)).toBe(true);
  });

  it('does not detect a player on a different row (horizontal LOS)', () => {
    const twoRowMap = makeMap([
      ['walkable', 'walkable', 'walkable', 'walkable'],
      ['walkable', 'walkable', 'walkable', 'walkable'],
    ]);
    const npc = makeNPC({ x: 0, y: 0, direction: 'right', isTrainer: true, lineOfSight: 3 });
    // Player is on row 1, trainer looks along row 0
    expect(checkTrainerLOS(npc, 2, 1, twoRowMap)).toBe(false);
  });
});
