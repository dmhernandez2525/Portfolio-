// ============================================================================
// Ruby/Sapphire — Game Configuration
// ============================================================================

import type { GameConfig, PokemonType } from '../../engine/types';

export const rubySapphireConfig: GameConfig = {
  version: 'ruby-sapphire',
  title: 'POKeMON RUBY',
  region: 'Hoenn',
  startingMap: 'littleroot_town',
  starters: [
    { speciesId: 252, level: 5 },  // Treecko
    { speciesId: 255, level: 5 },  // Torchic
    { speciesId: 258, level: 5 },  // Mudkip
  ],
  gyms: [
    { leaderId: 'roxanne',    badge: 'stone',    type: 'rock' as PokemonType,     mapId: 'rustboro_gym' },
    { leaderId: 'brawly',     badge: 'knuckle',  type: 'fighting' as PokemonType, mapId: 'dewford_gym' },
    { leaderId: 'wattson',    badge: 'dynamo',   type: 'electric' as PokemonType, mapId: 'mauville_gym' },
    { leaderId: 'flannery',   badge: 'heat',     type: 'fire' as PokemonType,     mapId: 'lavaridge_gym' },
    { leaderId: 'norman',     badge: 'balance',  type: 'normal' as PokemonType,   mapId: 'petalburg_gym' },
    { leaderId: 'winona',     badge: 'feather',  type: 'flying' as PokemonType,   mapId: 'fortree_gym' },
    { leaderId: 'tate_liza',  badge: 'mind',     type: 'psychic' as PokemonType,  mapId: 'mossdeep_gym' },
    { leaderId: 'juan',       badge: 'rain',     type: 'water' as PokemonType,    mapId: 'sootopolis_gym' },
  ],
  eliteFour: [
    { trainerId: 'sidney',    type: 'dark' as PokemonType },
    { trainerId: 'phoebe',    type: 'ghost' as PokemonType },
    { trainerId: 'glacia',    type: 'ice' as PokemonType },
    { trainerId: 'drake_e4',  type: 'dragon' as PokemonType },
  ],
  champion: { trainerId: 'steven' },
  pokedexSize: 386,
  generationRange: [1, 386],
};
