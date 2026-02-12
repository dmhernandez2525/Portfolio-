// ============================================================================
// Kanto Maps - Central registry
// ============================================================================

import type { GameMap } from '../../../engine/types';

// Individual maps
import { palletTown } from './pallet-town';
import { route1 } from './route-1';
import { viridianCity } from './viridian-city';
import { route2 } from './route-2';
import { viridianForest } from './viridian-forest';
import { pewterCity } from './pewter-city';
import { route3 } from './route-3';
import { mtMoon } from './mt-moon';
import { route4 } from './route-4';
import { ceruleanCity } from './cerulean-city';

// Interior maps
import {
  playerHouse1F, rivalHouse, oaksLab,
  viridianPokecenter, pewterPokecenter, ceruleanPokecenter,
  vermilionPokecenter, lavenderPokecenter, celadonPokecenter,
  fuchsiaPokecenter, saffronPokecenter, cinnabarPokecenter,
  indigoPokecenter,
  viridianMart, pewterMart, ceruleanMart,
  pewterGym, ceruleanGym, vermilionGym, celadonGym,
  fuchsiaGym, saffronGym, cinnabarGym, viridianGym,
  indigoPlateau,
  e4Room1Kanto, e4Room2Kanto, e4Room3Kanto, e4Room4Kanto, championRoomKanto,
} from './interiors';

// Later routes & cities
import {
  route5, route6, route7, route8, route9, route10,
  route11, route12, route13, route14, route15,
  route16, route17, route18, route19, route20, route21,
  route22, route23, route24, route25,
  vermilionCity, lavenderTown, celadonCity,
  fuchsiaCity, saffronCity, cinnabarIsland,
  rockTunnel, victoryRoad, ceruleanCave, safariZone,
} from './later-routes';

// All maps indexed by ID
export const kantoMaps: Record<string, GameMap> = {
  // Towns & Cities
  pallet_town: palletTown,
  viridian_city: viridianCity,
  pewter_city: pewterCity,
  cerulean_city: ceruleanCity,
  vermilion_city: vermilionCity,
  lavender_town: lavenderTown,
  celadon_city: celadonCity,
  fuchsia_city: fuchsiaCity,
  saffron_city: saffronCity,
  cinnabar_island: cinnabarIsland,
  indigo_plateau: indigoPlateau,

  // Routes
  route_1: route1,
  route_2: route2,
  route_3: route3,
  route_4: route4,
  route_5: route5,
  route_6: route6,
  route_7: route7,
  route_8: route8,
  route_9: route9,
  route_10: route10,
  route_11: route11,
  route_12: route12,
  route_13: route13,
  route_14: route14,
  route_15: route15,
  route_16: route16,
  route_17: route17,
  route_18: route18,
  route_19: route19,
  route_20: route20,
  route_21: route21,
  route_22: route22,
  route_23: route23,
  route_24: route24,
  route_25: route25,

  // Interiors
  player_house_1f: playerHouse1F,
  rival_house: rivalHouse,
  oaks_lab: oaksLab,

  // Pokemon Centers
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

  // PokeMarts
  viridian_mart: viridianMart,
  pewter_mart: pewterMart,
  cerulean_mart: ceruleanMart,

  // Gyms
  pewter_gym: pewterGym,
  cerulean_gym: ceruleanGym,
  vermilion_gym: vermilionGym,
  celadon_gym: celadonGym,
  fuchsia_gym: fuchsiaGym,
  saffron_gym: saffronGym,
  cinnabar_gym: cinnabarGym,
  viridian_gym: viridianGym,

  // Elite Four Chambers
  e4_room_1_kanto: e4Room1Kanto,
  e4_room_2_kanto: e4Room2Kanto,
  e4_room_3_kanto: e4Room3Kanto,
  e4_room_4_kanto: e4Room4Kanto,
  champion_room_kanto: championRoomKanto,

  // Dungeons
  viridian_forest: viridianForest,
  mt_moon: mtMoon,
  rock_tunnel: rockTunnel,
  victory_road: victoryRoad,
  cerulean_cave: ceruleanCave,
  safari_zone: safariZone,
};

// Get a map by ID
export function getMap(mapId: string): GameMap | null {
  return kantoMaps[mapId] ?? null;
}

// Re-export for direct imports
export {
  palletTown, route1, viridianCity, route2, viridianForest,
  pewterCity, route3, mtMoon, route4, ceruleanCity,
};
