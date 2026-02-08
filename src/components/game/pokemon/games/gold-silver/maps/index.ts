// ============================================================================
// Johto Maps — Central registry
// ============================================================================

import type { GameMap } from '../../../engine/types';
import { newBarkTown } from './new-bark-town';
import {
  route29, route30, route31, route32, route33, route34, route35,
  route36, route37, route38, route39, route40, route41,
  route42, route43, route44, route45, route46,
  violetCity, azaleaTown, goldenrodCity, ecruteakCity, olivineCity,
  cianwoodCity, mahoganyTown, blackthornCity, lakeDomain,
  cherrygroveCity,
  sproutTower, unionCave, ilexForest, icePath, mtSilver,
  unionCaveEntrance, unionCaveExit, icePathEntrance, mtSilverSummit,
  johtoInteriors,
} from './johto-maps';

export const johtoMaps: Record<string, GameMap> = {
  // Towns & Cities
  new_bark_town: newBarkTown,
  cherrygrove_city: cherrygroveCity,
  violet_city: violetCity,
  azalea_town: azaleaTown,
  goldenrod_city: goldenrodCity,
  ecruteak_city: ecruteakCity,
  olivine_city: olivineCity,
  cianwood_city: cianwoodCity,
  mahogany_town: mahoganyTown,
  blackthorn_city: blackthornCity,
  lake_of_rage: lakeDomain,

  // Routes
  route_29: route29,
  route_30: route30,
  route_31: route31,
  route_32: route32,
  route_33: route33,
  route_34: route34,
  route_35: route35,
  route_36: route36,
  route_37: route37,
  route_38: route38,
  route_39: route39,
  route_40: route40,
  route_41: route41,
  route_42: route42,
  route_43: route43,
  route_44: route44,
  route_45: route45,
  route_46: route46,

  // Dungeons
  sprout_tower: sproutTower,
  union_cave: unionCave,
  ilex_forest: ilexForest,
  ice_path: icePath,
  mt_silver: mtSilver,

  // Transitional maps
  union_cave_entrance: unionCaveEntrance,
  union_cave_exit: unionCaveExit,
  ice_path_entrance: icePathEntrance,
  mt_silver_summit: mtSilverSummit,

  // Interiors
  ...johtoInteriors,
};

export function getJohtoMap(mapId: string): GameMap | null {
  return johtoMaps[mapId] ?? null;
}
