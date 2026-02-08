// ============================================================================
// Pokemon RPG Engine — Core Type Definitions
// ============================================================================

// --- Primitive types ---

export type Direction = 'up' | 'down' | 'left' | 'right';

export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export type MoveCategory = 'physical' | 'special' | 'status';

export type StatusCondition = 'burn' | 'freeze' | 'paralysis' | 'poison' | 'bad_poison' | 'sleep' | null;

export type VolatileStatus = 'confusion' | 'flinch' | 'leech_seed' | 'infatuation';

export type Weather = 'clear' | 'rain' | 'sun' | 'sandstorm' | 'hail';

export type Nature =
  | 'hardy' | 'lonely' | 'brave' | 'adamant' | 'naughty'
  | 'bold' | 'docile' | 'relaxed' | 'impish' | 'lax'
  | 'timid' | 'hasty' | 'serious' | 'jolly' | 'naive'
  | 'modest' | 'mild' | 'quiet' | 'bashful' | 'rash'
  | 'calm' | 'gentle' | 'sassy' | 'careful' | 'quirky';

export type StatName = 'hp' | 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed';

export type BagCategory = 'items' | 'medicine' | 'pokeballs' | 'tms' | 'berries' | 'key_items';

export type AITier = 'random' | 'basic' | 'smart' | 'expert';

export type GameVersion = 'red-blue' | 'gold-silver' | 'ruby-sapphire';

// --- Tile/Map types ---

export type TileType = 'walkable' | 'blocked' | 'surfable' | 'tall_grass' | 'ledge_down' | 'ledge_left' | 'ledge_right';

export interface TilesetDef {
  id: string;
  image: string;           // path to tileset spritesheet
  tileWidth: number;       // typically 16
  tileHeight: number;
  columns: number;
  tileCount: number;
  collision: Record<number, TileType>;  // tileId → collision type
}

export interface WarpPoint {
  x: number;
  y: number;
  targetMap: string;
  targetX: number;
  targetY: number;
}

export interface MapConnection {
  direction: Direction;
  targetMap: string;
  offset: number;           // tile offset for alignment
}

export interface WildEncounterEntry {
  speciesId: number;
  minLevel: number;
  maxLevel: number;
  weight: number;           // encounter chance weight
}

export interface WildEncounterZone {
  type: 'grass' | 'surf' | 'fishing' | 'cave';
  entries: WildEncounterEntry[];
}

// Simplified trainer data for inline NPC definitions
export interface NPCTrainerData {
  id: string;
  party: TrainerPokemon[];
}

export interface NPCDef {
  id: string;
  x: number;
  y: number;
  spriteId: string;
  direction: Direction;
  movement: 'static' | 'wander' | 'patrol';
  patrolPath?: { x: number; y: number }[];
  dialog: string[];
  isTrainer: boolean;
  trainerData?: NPCTrainerData | TrainerDef;
  lineOfSight?: number;     // tiles of LOS for trainers
}

export interface GameMap {
  id: string;
  name: string;
  width: number;            // in tiles
  height: number;
  tilesetId: string;
  layers: {
    ground: number[][];     // 2D array of tile IDs
    objects: number[][];
    above: number[][];      // rendered above player
  };
  collision: TileType[][];  // 2D collision grid
  warps: WarpPoint[];
  connections: MapConnection[];
  encounters: WildEncounterZone[];
  npcs: NPCDef[];
  music?: string;
}

// --- Pokemon / Species ---

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface LearnsetEntry {
  level: number;
  moveId: string;
}

export interface EvolutionCondition {
  type: 'level' | 'item' | 'trade' | 'happiness';
  level?: number;
  item?: string;
}

export interface SpeciesData {
  id: number;
  name: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  baseStats: BaseStats;
  baseExp: number;
  catchRate: number;
  growthRate: 'fast' | 'medium_fast' | 'medium_slow' | 'slow' | 'erratic' | 'fluctuating';
  learnset: LearnsetEntry[];
  evolvesTo?: { speciesId: number; condition: EvolutionCondition }[];
  spriteId: string;
  generation: 1 | 2 | 3;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface Pokemon {
  uid: string;              // unique instance ID
  speciesId: number;
  nickname?: string;
  level: number;
  exp: number;
  nature: Nature;
  ivs: PokemonStats;
  evs: PokemonStats;
  stats: PokemonStats;     // computed stats
  currentHp: number;
  moves: PokemonMove[];
  status: StatusCondition;
  friendship: number;
  isShiny: boolean;
  originalTrainer: string;
  caughtBall: string;
}

export interface PokemonMove {
  moveId: string;
  pp: number;
  maxPp: number;
}

// --- Move data ---

export interface MoveData {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  effect?: MoveEffect;
  description: string;
}

export interface MoveEffect {
  type: string;             // 'status', 'stat_change', 'drain', 'recoil', etc.
  target: 'self' | 'opponent';
  status?: StatusCondition;
  volatileStatus?: VolatileStatus;
  statChanges?: Partial<Record<StatName, number>>;
  accuracyChange?: number;  // -6 to +6 modifier to target's accuracy stage
  chance?: number;          // 0-100 probability
  drain?: number;           // fraction of damage drained
  recoil?: number;          // fraction of damage as recoil
  curesStatus?: boolean;    // for items: also cures status conditions
}

// --- Item data ---

export interface ItemData {
  id: string;
  name: string;
  category: BagCategory;
  description: string;
  price: number;
  effect?: ItemEffect;
  isKeyItem: boolean;
}

export interface ItemEffect {
  type: 'heal_hp' | 'heal_status' | 'heal_pp' | 'revive' | 'pokeball'
    | 'boost_stat' | 'evolution' | 'tm' | 'rare_candy';
  value?: number;
  status?: StatusCondition | 'all';
  moveId?: string;          // for TMs
  catchMultiplier?: number; // for pokeballs
  curesStatus?: boolean;    // for items that also cure status
}

// --- Battle types ---

export type BattlePhase =
  | 'intro'
  | 'action_select'
  | 'move_select'
  | 'item_select'
  | 'switch_select'
  | 'turn_execute'
  | 'damage_animate'
  | 'status_animate'
  | 'post_turn'
  | 'faint_check'
  | 'switch_prompt'
  | 'exp_gain'
  | 'level_up'
  | 'move_learn'
  | 'evolution_check'
  | 'catch_attempt'
  | 'catch_animate'
  | 'battle_end'
  | 'reward';

export type BattleType = 'wild' | 'trainer';

export interface BattleAction {
  type: 'fight' | 'item' | 'switch' | 'run';
  moveIndex?: number;
  itemId?: string;
  switchIndex?: number;
}

export interface BattlePokemon {
  pokemon: Pokemon;
  types: PokemonType[];
  statStages: Record<StatName, number>;  // -6 to +6
  accuracyStage: number;   // -6 to +6
  evasionStage: number;    // -6 to +6
  volatileStatuses: Set<VolatileStatus>;
  isProtected: boolean;
  sleepTurns: number;
  confusionTurns: number;
  toxicCounter: number;
}

export interface BattleState {
  type: BattleType;
  phase: BattlePhase;
  playerParty: Pokemon[];
  playerActive: BattlePokemon;
  opponentParty: Pokemon[];
  opponentActive: BattlePokemon;
  weather: Weather;
  weatherTurns: number;
  turnNumber: number;
  textQueue: string[];
  currentText: string;
  playerAction: BattleAction | null;
  opponentAction: BattleAction | null;
  trainerDef?: TrainerDef;
  canRun: boolean;
  catchAttempts: number;
  runAttempts: number;
  expGained: number;
  pendingLevelUps: { pokemon: Pokemon; newLevel: number; newMoves: string[] }[];
  pendingEvolution: { pokemon: Pokemon; evolvesTo: number } | null;
  battleResult: 'ongoing' | 'win' | 'lose' | 'run' | 'caught';
}

// --- Trainer types ---

export interface TrainerDef {
  id: string;
  name: string;
  class: string;            // "Bug Catcher", "Gym Leader", etc.
  spriteId: string;
  party: TrainerPokemon[];
  aiTier: AITier;
  reward: number;           // prize money
  defeatDialog: string[];
  isGymLeader: boolean;
  badge?: string;
}

export interface TrainerPokemon {
  speciesId: number;
  level: number;
  moves?: string[];         // override default moves
  heldItem?: string;
}

// --- Player / Overworld state ---

export interface Player {
  x: number;                // pixel position
  y: number;
  tileX: number;            // tile position
  tileY: number;
  direction: Direction;
  isMoving: boolean;
  moveProgress: number;     // 0-1 interpolation during movement
  spriteFrame: number;
  speed: number;            // pixels per frame
  isSurfing: boolean;
  isBiking: boolean;
}

export interface BagItem {
  itemId: string;
  quantity: number;
}

export interface PokedexEntry {
  seen: boolean;
  caught: boolean;
}

export interface PCBox {
  name: string;
  pokemon: (Pokemon | null)[];  // 30 slots per box
}

export interface StoryFlags {
  [key: string]: boolean;
}

export interface GameSave {
  version: GameVersion;
  playerName: string;
  rivalName: string;
  player: Player;
  party: Pokemon[];
  pcBoxes: PCBox[];
  bag: BagItem[];
  money: number;
  badges: string[];
  pokedex: Record<number, PokedexEntry>;
  storyFlags: StoryFlags;
  currentMap: string;
  playTime: number;         // seconds
  timestamp: number;
}

// --- Game state (master) ---

export type GameScreen =
  | 'title'
  | 'game_select'
  | 'new_game'
  | 'overworld'
  | 'battle'
  | 'menu'
  | 'party'
  | 'bag'
  | 'pokedex'
  | 'pc_storage'
  | 'pokemon_center'
  | 'poke_mart'
  | 'dialog'
  | 'evolution'
  | 'credits';

export interface GameState {
  screen: GameScreen;
  version: GameVersion | null;
  save: GameSave | null;
  currentMap: GameMap | null;
  player: Player;
  battleState: BattleState | null;
  dialog: { lines: string[]; currentLine: number; charIndex: number } | null;
  menuOpen: boolean;
  paused: boolean;
  frameCount: number;
  deltaTime: number;
}

// --- Input ---

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;               // confirm / interact
  b: boolean;               // cancel / run
  start: boolean;           // menu
  select: boolean;          // special
}

// --- Game config (per version) ---

export interface StarterConfig {
  speciesId: number;
  level: number;
}

export interface GymConfig {
  leaderId: string;
  badge: string;
  type: PokemonType;
  mapId: string;
}

export interface EliteFourConfig {
  trainerId: string;
  type: PokemonType;
}

export interface GameConfig {
  version: GameVersion;
  title: string;
  region: string;
  startingMap: string;
  starters: [StarterConfig, StarterConfig, StarterConfig];
  gyms: GymConfig[];
  eliteFour: EliteFourConfig[];
  champion: { trainerId: string };
  pokedexSize: number;
  generationRange: [number, number];  // [startId, endId]
}

// --- Renderer ---

export interface SpriteSheet {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
}

export interface Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  viewportWidth: number;
  viewportHeight: number;
  smoothing: number;        // 0-1, lerp factor
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  tileSize: number;
  scale: number;
  frameCount: number;
}
