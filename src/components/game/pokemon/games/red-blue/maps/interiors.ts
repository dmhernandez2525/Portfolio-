// ============================================================================
// Kanto Interior Maps - Shared indoor spaces
// ============================================================================

import type { GameMap, Direction, NPCDef } from '../../../engine/types';

const FL = 1; // floor
const WL = 9; // wall
const D = 8;  // door
const B = 6;  // counter/shelf

function makeInterior(
  id: string, name: string, width: number, height: number,
  exitTarget: string, exitX: number, exitY: number,
  npcs: GameMap['npcs'] = [],
  customLayout?: { ground: number[][]; collision: GameMap['collision'] },
): GameMap {
  const ground = customLayout?.ground ?? Array.from({ length: height }, (_, y) => {
    const row = new Array(width).fill(FL);
    // Walls on top row and sides
    if (y === 0) row.fill(WL);
    row[0] = WL;
    row[width - 1] = WL;
    // Door at bottom center
    if (y === height - 1) {
      row.fill(WL);
      row[Math.floor(width / 2)] = D;
    }
    return row;
  });

  const collision = customLayout?.collision ?? ground.map(row =>
    row.map(tile => {
      if (tile === WL || tile === B) return 'blocked' as const;
      return 'walkable' as const;
    })
  );

  return {
    id, name, width, height,
    tilesetId: 'interior',
    layers: {
      ground,
      objects: ground.map(() => new Array(width).fill(0)),
      above: ground.map(() => new Array(width).fill(0)),
    },
    collision,
    warps: [
      { x: Math.floor(width / 2), y: height - 1, targetMap: exitTarget, targetX: exitX, targetY: exitY },
    ],
    connections: [],
    encounters: [],
    npcs,
    music: name.toLowerCase().includes('gym') ? 'gym' : 'indoor',
  };
}

// --- Player's House ---
export const playerHouse1F: GameMap = makeInterior(
  'player_house_1f', "PLAYER'S HOUSE", 8, 8,
  'pallet_town', 4, 9,
  [
    {
      id: 'mom', x: 3, y: 3, spriteId: 'mom', direction: 'down',
      movement: 'static',
      dialog: ['MOM: Right. All boys leave home', 'someday. It said so on TV.', 'Oh, be careful out there!'],
      isTrainer: false,
    },
  ],
);

// --- Rival's House ---
export const rivalHouse: GameMap = makeInterior(
  'rival_house', "RIVAL'S HOUSE", 8, 8,
  'pallet_town', 16, 9,
  [
    {
      id: 'rival_sister', x: 4, y: 3, spriteId: 'girl', direction: 'down',
      movement: 'static',
      dialog: ['My brother is out at', 'PROF. OAK\u0027s LAB.'],
      isTrainer: false,
    },
  ],
);

// --- Oak's Lab ---
const oakLabW = 10, oakLabH = 12;
const oakLabGround = Array.from({ length: oakLabH }, (_, y) => {
  const row = new Array(oakLabW).fill(FL);
  if (y === 0) row.fill(WL);
  row[0] = WL; row[oakLabW - 1] = WL;
  // Bookshelves on sides
  if (y >= 1 && y <= 3) { row[1] = B; row[oakLabW - 2] = B; }
  // Lab tables in center
  if (y >= 2 && y <= 4) { row[4] = B; row[5] = B; }
  if (y === oakLabH - 1) { row.fill(WL); row[5] = D; }
  return row;
});
const oakLabCollision = oakLabGround.map(row =>
  row.map(tile => (tile === WL || tile === B) ? 'blocked' as const : 'walkable' as const)
);

export const oaksLab: GameMap = makeInterior(
  'oaks_lab', "OAK'S LAB", oakLabW, oakLabH,
  'pallet_town', 10, 16,
  [
    {
      id: 'prof_oak', x: 5, y: 2, spriteId: 'oak', direction: 'down',
      movement: 'static',
      dialog: ['OAK: There are 3 POKeMON here!', 'Haha! They are for you!', 'Choose one!'],
      isTrainer: false,
    },
    {
      id: 'oak_aide', x: 8, y: 5, spriteId: 'scientist', direction: 'left',
      movement: 'static',
      dialog: ['PROF. OAK is the authority', 'on POKeMON!', 'Many POKeMON trainers hold', 'him in high regard!'],
      isTrainer: false,
    },
  ],
  { ground: oakLabGround, collision: oakLabCollision },
);

// --- Pokemon Centers ---
function makePokecenter(id: string, exitMap: string, exitX: number, exitY: number): GameMap {
  return makeInterior(id, 'POKeMON CENTER', 10, 8, exitMap, exitX, exitY, [
    {
      id: `${id}_nurse`, x: 5, y: 1, spriteId: 'nurse', direction: 'down',
      movement: 'static',
      dialog: ['Welcome to our POKeMON CENTER!', 'We heal your POKeMON to', 'full health!', '...Your POKeMON are fully healed!'],
      isTrainer: false,
      heals: true,
    },
    {
      id: `${id}_pc`, x: 1, y: 1, spriteId: 'pc', direction: 'down',
      movement: 'static',
      dialog: ['Accessed the PC!'],
      isTrainer: false,
      isPC: true,
    },
  ]);
}

export const viridianPokecenter = makePokecenter('viridian_pokecenter', 'viridian_city', 3, 13);
export const pewterPokecenter = makePokecenter('pewter_pokecenter', 'pewter_city', 3, 13);
export const ceruleanPokecenter = makePokecenter('cerulean_pokecenter', 'cerulean_city', 3, 13);
export const vermilionPokecenter = makePokecenter('vermilion_pokecenter', 'vermilion_city', 3, 13);
export const lavenderPokecenter = makePokecenter('lavender_pokecenter', 'lavender_town', 3, 13);
export const celadonPokecenter = makePokecenter('celadon_pokecenter', 'celadon_city', 3, 13);
export const fuchsiaPokecenter = makePokecenter('fuchsia_pokecenter', 'fuchsia_city', 3, 13);
export const saffronPokecenter = makePokecenter('saffron_pokecenter', 'saffron_city', 3, 13);
export const cinnabarPokecenter = makePokecenter('cinnabar_pokecenter', 'cinnabar_island', 3, 13);
export const indigoPokecenter = makePokecenter('indigo_pokecenter', 'indigo_plateau', 3, 13);

// --- PokeMarts ---
const KANTO_BASE_SHOP = ['poke-ball', 'potion', 'antidote', 'parlyz-heal', 'awakening'];
const KANTO_MID_SHOP = [...KANTO_BASE_SHOP, 'great-ball', 'super-potion', 'revive', 'repel', 'escape-rope'];
const KANTO_LATE_SHOP = [...KANTO_MID_SHOP, 'ultra-ball', 'hyper-potion', 'max-repel', 'full-heal'];

function makeMart(id: string, exitMap: string, exitX: number, exitY: number, shopItems: string[]): GameMap {
  return makeInterior(id, 'POKeMON MART', 8, 8, exitMap, exitX, exitY, [
    {
      id: `${id}_clerk`, x: 1, y: 2, spriteId: 'clerk', direction: 'right',
      movement: 'static',
      dialog: ['Welcome! How may I help you?'],
      isTrainer: false,
      shopItems,
    },
  ]);
}

export const viridianMart = makeMart('viridian_mart', 'viridian_city', 14, 10, KANTO_BASE_SHOP);
export const pewterMart = makeMart('pewter_mart', 'pewter_city', 16, 13, KANTO_BASE_SHOP);
export const ceruleanMart = makeMart('cerulean_mart', 'cerulean_city', 16, 13, KANTO_MID_SHOP);

// --- Gyms ---
function makeGym(
  id: string, name: string, exitMap: string, exitX: number, exitY: number,
  leaderId: string, _leaderName: string, leaderX: number, leaderY: number,
  leaderDialog: string[],
): GameMap {
  return makeInterior(id, name, 12, 12, exitMap, exitX, exitY, [
    {
      id: leaderId, x: leaderX, y: leaderY, spriteId: leaderId, direction: 'down',
      movement: 'static',
      dialog: leaderDialog,
      isTrainer: true,
      trainerData: { id: leaderId, party: [] }, // Party defined in trainers.ts
    },
  ]);
}

export const pewterGym = makeGym(
  'pewter_gym', 'PEWTER GYM', 'pewter_city', 12, 9,
  'brock', 'BROCK', 6, 2,
  ['I\u0027m BROCK, the PEWTER GYM LEADER!', 'My rock-hard willpower is', 'evident in my POKeMON!', 'Show me your best!'],
);

export const ceruleanGym = makeGym(
  'cerulean_gym', 'CERULEAN GYM', 'cerulean_city', 11, 10,
  'misty', 'MISTY', 6, 2,
  ['I\u0027m MISTY, the Gym Leader of', 'CERULEAN CITY!', 'My policy is an all-out', 'offensive with WATER POKeMON!'],
);

export const vermilionGym = makeGym(
  'vermilion_gym', 'VERMILION GYM', 'vermilion_city', 12, 9,
  'lt_surge', 'LT. SURGE', 6, 2,
  ['Hey, kid! What do you think', 'you\u0027re doing here?', 'You won\u0027t live long in combat!', 'That\u0027s for Pokemon and my Pokemon!'],
);

export const celadonGym = makeGym(
  'celadon_gym', 'CELADON GYM', 'celadon_city', 12, 9,
  'erika', 'ERIKA', 6, 2,
  ['Hello... Lovely weather, isn\u0027t it?', 'It\u0027s so pleasant...', 'Oh, you wished to challenge me?', 'Very well, I shall accept.'],
);

export const fuchsiaGym = makeGym(
  'fuchsia_gym', 'FUCHSIA GYM', 'fuchsia_city', 12, 9,
  'koga', 'KOGA', 6, 2,
  ['Fwahahaha!', 'A mere child like you dares', 'challenge the POISONOUS NINJA MASTER?', 'Very well! You shall feel the', 'fury of my POISON POKeMON!'],
);

export const saffronGym = makeGym(
  'saffron_gym', 'SAFFRON GYM', 'saffron_city', 12, 9,
  'sabrina', 'SABRINA', 6, 2,
  ['I had a vision of your arrival!', 'I have had psychic powers', 'since I was a child.', 'I foresaw that you would challenge me!'],
);

export const cinnabarGym = makeGym(
  'cinnabar_gym', 'CINNABAR GYM', 'cinnabar_island', 12, 9,
  'blaine', 'BLAINE', 6, 2,
  ['Hah! I\u0027m BLAINE, the red-hot', 'leader of CINNABAR GYM!', 'My fiery POKeMON are all', 'fired up and ready to go!'],
);

export const viridianGym = makeGym(
  'viridian_gym', 'VIRIDIAN GYM', 'viridian_city', 3, 5,
  'giovanni', 'GIOVANNI', 6, 2,
  ['So! You have come all the way', 'to challenge me.', 'I am GIOVANNI, the leader of', 'TEAM ROCKET!', 'For your Pokemon\u0027s sake,', 'I hope you are ready!'],
);

// --- Gym Trainers ---
function gymTrainer(id: string, x: number, y: number, dir: Direction, dialog: string[], los: number): NPCDef {
  return {
    id, x, y, spriteId: id, direction: dir,
    movement: 'static', dialog,
    isTrainer: true, trainerData: { id, party: [] },
    lineOfSight: los,
  };
}

// Pewter Gym: 1 trainer (Jr. Trainer)
pewterGym.npcs.push(
  gymTrainer('pewter_gym_1', 4, 6, 'right', ['Stop right there!', 'BROCK is up ahead!', 'You have to beat me first!'], 3),
);

// Cerulean Gym: 2 trainers
ceruleanGym.npcs.push(
  gymTrainer('cerulean_gym_1', 3, 7, 'right', ['My WATER POKeMON are', 'ready to battle!'], 3),
  gymTrainer('cerulean_gym_2', 9, 5, 'left', ['You want to challenge MISTY?', 'You have to get past me!'], 3),
);

// Vermilion Gym: 2 trainers
vermilionGym.npcs.push(
  gymTrainer('vermilion_gym_1', 3, 7, 'right', ['LT. SURGE set up traps!', 'You gotta find the switch!'], 3),
  gymTrainer('vermilion_gym_2', 9, 5, 'left', ['LT. SURGE is gonna shock you!'], 3),
);

// Celadon Gym: 3 trainers
celadonGym.npcs.push(
  gymTrainer('celadon_gym_1', 3, 8, 'right', ['This GYM is full of women!', 'Are you ready?'], 3),
  gymTrainer('celadon_gym_2', 9, 6, 'left', ['My GRASS POKeMON will', 'put you to sleep!'], 3),
  gymTrainer('celadon_gym_3', 6, 4, 'down', ['ERIKA is right behind me!', 'But you have to beat me first!'], 2),
);

// Fuchsia Gym: 2 trainers
fuchsiaGym.npcs.push(
  gymTrainer('fuchsia_gym_1', 4, 7, 'right', ['The POISONOUS NINJA MASTER', 'awaits you!'], 3),
  gymTrainer('fuchsia_gym_2', 8, 4, 'down', ['My POKeMON are full of poison!', 'Watch out!'], 3),
);

// Saffron Gym: 3 trainers
saffronGym.npcs.push(
  gymTrainer('saffron_gym_1', 3, 8, 'right', ['SABRINA\u0027s power is', 'beyond comprehension!'], 3),
  gymTrainer('saffron_gym_2', 9, 6, 'left', ['Can you solve the warp puzzles?'], 3),
  gymTrainer('saffron_gym_3', 6, 4, 'down', ['SABRINA foresaw your coming!', 'She is not impressed!'], 2),
);

// Cinnabar Gym: 2 trainers
cinnabarGym.npcs.push(
  gymTrainer('cinnabar_gym_1', 3, 7, 'right', ['BLAINE\u0027s fire burns hot!', 'Can you take the heat?'], 3),
  gymTrainer('cinnabar_gym_2', 9, 5, 'left', ['Answer the quiz or battle me!'], 3),
);

// Viridian Gym: 3 trainers
viridianGym.npcs.push(
  gymTrainer('viridian_gym_1', 3, 8, 'right', ['This GYM has been closed', 'for a long time!', 'The LEADER is very powerful!'], 3),
  gymTrainer('viridian_gym_2', 9, 6, 'left', ['Our LEADER is the strongest', 'in all of KANTO!'], 3),
  gymTrainer('viridian_gym_3', 6, 4, 'down', ['GIOVANNI will crush you!'], 2),
);

// --- Pewter Museum ---
export const pewterMuseum: GameMap = makeInterior(
  'pewter_museum', 'PEWTER MUSEUM', 10, 10,
  'pewter_city', 4, 5,
  [
    {
      id: 'museum_guide', x: 5, y: 3, spriteId: 'scientist', direction: 'down',
      movement: 'static',
      dialog: ['Welcome to PEWTER MUSEUM!', 'We have a fine collection of', 'fossils and space exhibits!'],
      isTrainer: false,
    },
  ],
);

// --- Cerulean Bike Shop ---
export const ceruleanBikeShop: GameMap = makeInterior(
  'cerulean_bike_shop', 'BIKE SHOP', 8, 8,
  'cerulean_city', 3, 5,
  [
    {
      id: 'bike_clerk', x: 4, y: 2, spriteId: 'clerk', direction: 'down',
      movement: 'static',
      dialog: ['Welcome to the BIKE SHOP!', 'We have a great selection!', 'A BICYCLE costs 1,000,000!', '...You don\'t have enough money.'],
      isTrainer: false,
    },
  ],
);

// --- Cerulean House ---
export const ceruleanHouse: GameMap = makeInterior(
  'cerulean_house', 'CERULEAN HOUSE', 8, 8,
  'cerulean_city', 16, 5,
  [
    {
      id: 'cerulean_resident', x: 3, y: 3, spriteId: 'boy', direction: 'down',
      movement: 'static',
      dialog: ['TEAM ROCKET broke into our', 'house through the back!', 'They stole a TM!'],
      isTrainer: false,
    },
  ],
);

// --- Victory Road Entrance ---
export const victoryRoadEntrance: GameMap = makeInterior(
  'victory_road_entrance', 'VICTORY ROAD GATE', 10, 8,
  'route_23', 7, 1,
  [
    {
      id: 'vr_guard', x: 5, y: 3, spriteId: 'guard', direction: 'down',
      movement: 'static',
      dialog: ['This is the entrance to', 'VICTORY ROAD!', 'Only trainers with all 8', 'BADGES may enter!'],
      isTrainer: false,
    },
  ],
);

// --- Victory Road Exit ---
export const victoryRoadExit: GameMap = makeInterior(
  'victory_road_exit', 'VICTORY ROAD GATE', 10, 8,
  'route_23', 7, 28,
  [
    {
      id: 'vr_exit_guard', x: 5, y: 3, spriteId: 'guard', direction: 'down',
      movement: 'static',
      dialog: ['You made it through', 'VICTORY ROAD!', 'The INDIGO PLATEAU awaits!'],
      isTrainer: false,
    },
  ],
);

// --- Rock Tunnel Entrance ---
export const rockTunnelEntrance: GameMap = makeInterior(
  'rock_tunnel_entrance', 'ROCK TUNNEL GATE', 10, 8,
  'route_9', 18, 5,
  [
    {
      id: 'rt_guard', x: 5, y: 3, spriteId: 'boy', direction: 'down',
      movement: 'static',
      dialog: ['This cave leads to', 'LAVENDER TOWN.', 'It\'s pitch black inside!', 'You\'ll need FLASH!'],
      isTrainer: false,
    },
  ],
);

// --- Elite Four / Indigo Plateau ---
export const indigoPlateau: GameMap = makeInterior(
  'indigo_plateau', 'INDIGO PLATEAU', 12, 10,
  'victory_road_exit', 6, 8,
  [
    {
      id: 'indigo_guard', x: 6, y: 3, spriteId: 'guard', direction: 'down',
      movement: 'static',
      dialog: ['Welcome to the POKeMON LEAGUE!', 'Beyond here, the ELITE FOUR await!', 'Do you have all 8 BADGES?'],
      isTrainer: false,
    },
  ],
);
// Add warp from Indigo Plateau to E4 Room 1
indigoPlateau.warps.push({ x: 6, y: 0, targetMap: 'e4_room_1_kanto', targetX: 5, targetY: 9 });

// --- Elite Four Chambers (Kanto) ---
function makeE4Chamber(
  id: string, name: string,
  trainerId: string, trainerDialog: string[],
  exitMap: string, exitX: number, exitY: number,
): GameMap {
  return makeInterior(id, name, 10, 10, exitMap, exitX, exitY, [
    {
      id: trainerId, x: 5, y: 3, spriteId: trainerId, direction: 'down',
      movement: 'static', dialog: trainerDialog,
      isTrainer: true, trainerData: { id: trainerId, party: [] },
      lineOfSight: 4,
    },
  ]);
}

export const e4Room1Kanto = makeE4Chamber(
  'e4_room_1_kanto', 'LORELEI', 'lorelei',
  ['Welcome to the POKeMON LEAGUE!', 'I am LORELEI of the ELITE FOUR!', 'Prepare for battle!'],
  'indigo_plateau', 6, 1,
);
e4Room1Kanto.warps.push({ x: 5, y: 0, targetMap: 'e4_room_2_kanto', targetX: 5, targetY: 9 });

export const e4Room2Kanto = makeE4Chamber(
  'e4_room_2_kanto', 'BRUNO', 'bruno',
  ['I am BRUNO of the ELITE FOUR!', 'My fighting POKeMON will', 'crush you!'],
  'e4_room_1_kanto', 5, 1,
);
e4Room2Kanto.warps.push({ x: 5, y: 0, targetMap: 'e4_room_3_kanto', targetX: 5, targetY: 9 });

export const e4Room3Kanto = makeE4Chamber(
  'e4_room_3_kanto', 'AGATHA', 'agatha',
  ['I am AGATHA of the ELITE FOUR!', 'I hear you are quite the', 'trainer. Let me see!'],
  'e4_room_2_kanto', 5, 1,
);
e4Room3Kanto.warps.push({ x: 5, y: 0, targetMap: 'e4_room_4_kanto', targetX: 5, targetY: 9 });

export const e4Room4Kanto = makeE4Chamber(
  'e4_room_4_kanto', 'LANCE', 'lance',
  ['I am LANCE, the last of the', 'ELITE FOUR!', 'I have been waiting for you!'],
  'e4_room_3_kanto', 5, 1,
);
e4Room4Kanto.warps.push({ x: 5, y: 0, targetMap: 'champion_room_kanto', targetX: 5, targetY: 9 });

export const championRoomKanto = makeE4Chamber(
  'champion_room_kanto', 'CHAMPION', 'blue',
  ['So, you are finally here!', 'I am the POKeMON LEAGUE CHAMPION!', 'Or I was, until now...'],
  'e4_room_4_kanto', 5, 1,
);

// Aggregated interior maps (mirrors johtoInteriors / hoennInteriors pattern)
export const kantoInteriors: Record<string, GameMap> = {
  player_house_1f: playerHouse1F,
  rival_house: rivalHouse,
  oaks_lab: oaksLab,
  viridian_pokecenter: viridianPokecenter,
  pewter_pokecenter: pewterPokecenter,
  cerulean_pokecenter: ceruleanPokecenter,
  vermilion_pokecenter: vermilionPokecenter,
  lavender_pokecenter: lavenderPokecenter,
  celadon_pokecenter: celadonPokecenter,
  fuchsia_pokecenter: fuchsiaPokecenter,
  saffron_pokecenter: saffronPokecenter,
  cinnabar_pokecenter: cinnabarPokecenter,
  indigo_pokecenter: indigoPokecenter,
  viridian_mart: viridianMart,
  pewter_mart: pewterMart,
  cerulean_mart: ceruleanMart,
  pewter_gym: pewterGym,
  cerulean_gym: ceruleanGym,
  vermilion_gym: vermilionGym,
  celadon_gym: celadonGym,
  fuchsia_gym: fuchsiaGym,
  saffron_gym: saffronGym,
  cinnabar_gym: cinnabarGym,
  viridian_gym: viridianGym,
  indigo_plateau: indigoPlateau,
  e4_room_1_kanto: e4Room1Kanto,
  e4_room_2_kanto: e4Room2Kanto,
  e4_room_3_kanto: e4Room3Kanto,
  e4_room_4_kanto: e4Room4Kanto,
  champion_room_kanto: championRoomKanto,
  pewter_museum: pewterMuseum,
  cerulean_bike_shop: ceruleanBikeShop,
  cerulean_house: ceruleanHouse,
  victory_road_entrance: victoryRoadEntrance,
  victory_road_exit: victoryRoadExit,
  rock_tunnel_entrance: rockTunnelEntrance,
};
