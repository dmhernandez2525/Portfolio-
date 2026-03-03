// ============================================================================
// Hoenn Maps - Central registry
// ============================================================================

import type { GameMap } from '../../../engine/types';
import { littlerootTown } from './littleroot-town';
import {
  route101, route102, route103, route104, route106,
  route110, route111, route112, route113, route119, route120, route121, route122, route123,
  route124, route126, route128,
  oldaleTown, petalburgCity, rustboroCity, dewfordTown,
  slateportCity, mauvilleCity, fallarborTown, lavaridgeTown,
  fortreeCity, lilycoveCity, mossdeepCity, sootopolisCity, everGrandeCity,
  petalburgWoods, meteorFalls, victoryRoadHoenn, caveOfOrigin,
  hoennInteriors,
} from './hoenn-maps';

export const hoennMaps: Record<string, GameMap> = {
  // Towns & Cities
  littleroot_town: littlerootTown,
  oldale_town: oldaleTown,
  petalburg_city: petalburgCity,
  rustboro_city: rustboroCity,
  dewford_town: dewfordTown,
  slateport_city: slateportCity,
  mauville_city: mauvilleCity,
  fallarbor_town: fallarborTown,
  lavaridge_town: lavaridgeTown,
  fortree_city: fortreeCity,
  lilycove_city: lilycoveCity,
  mossdeep_city: mossdeepCity,
  sootopolis_city: sootopolisCity,
  ever_grande_city: everGrandeCity,

  // Routes
  route_101: route101,
  route_102: route102,
  route_103: route103,
  route_104: route104,
  route_106: route106,
  route_110: route110,
  route_111: route111,
  route_112: route112,
  route_113: route113,
  route_119: route119,
  route_120: route120,
  route_121: route121,
  route_122: route122,
  route_123: route123,
  route_124: route124,
  route_126: route126,
  route_128: route128,

  // Dungeons
  petalburg_woods: petalburgWoods,
  meteor_falls: meteorFalls,
  victory_road_hoenn: victoryRoadHoenn,
  cave_of_origin: caveOfOrigin,

  // Interiors
  ...hoennInteriors,
};

export function getHoennMap(mapId: string): GameMap | null {
  return hoennMaps[mapId] ?? null;
}
