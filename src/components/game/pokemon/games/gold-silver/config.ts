// ============================================================================
// Gold/Silver — Game Configuration
// ============================================================================

import type { GameConfig, PokemonType } from '../../engine/types';

export const goldSilverConfig: GameConfig = {
  version: 'gold-silver',
  title: 'POKeMON GOLD',
  region: 'Johto',
  startingMap: 'new_bark_town',
  starters: [
    { speciesId: 152, level: 5 },  // Chikorita
    { speciesId: 155, level: 5 },  // Cyndaquil
    { speciesId: 158, level: 5 },  // Totodile
  ],
  gyms: [
    { leaderId: 'falkner',   badge: 'zephyr',   type: 'flying' as PokemonType,   mapId: 'violet_gym' },
    { leaderId: 'bugsy',     badge: 'hive',      type: 'bug' as PokemonType,      mapId: 'azalea_gym' },
    { leaderId: 'whitney',   badge: 'plain',     type: 'normal' as PokemonType,   mapId: 'goldenrod_gym' },
    { leaderId: 'morty',     badge: 'fog',       type: 'ghost' as PokemonType,    mapId: 'ecruteak_gym' },
    { leaderId: 'chuck',     badge: 'storm',     type: 'fighting' as PokemonType, mapId: 'cianwood_gym' },
    { leaderId: 'jasmine',   badge: 'mineral',   type: 'steel' as PokemonType,    mapId: 'olivine_gym' },
    { leaderId: 'pryce',     badge: 'glacier',   type: 'ice' as PokemonType,      mapId: 'mahogany_gym' },
    { leaderId: 'clair',     badge: 'rising',    type: 'dragon' as PokemonType,   mapId: 'blackthorn_gym' },
  ],
  eliteFour: [
    { trainerId: 'will',     type: 'psychic' as PokemonType },
    { trainerId: 'koga_e4',  type: 'poison' as PokemonType },
    { trainerId: 'bruno_e4', type: 'fighting' as PokemonType },
    { trainerId: 'karen',    type: 'dark' as PokemonType },
  ],
  champion: { trainerId: 'lance_champion' },
  pokedexSize: 251,
  generationRange: [1, 251],
};
