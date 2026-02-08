// ============================================================================
// Red/Blue — Game Configuration
// ============================================================================

import type { GameConfig, PokemonType } from '../../engine/types';

export const redBlueConfig: GameConfig = {
  version: 'red-blue',
  title: 'POKeMON RED',
  region: 'Kanto',
  startingMap: 'pallet_town',
  starters: [
    { speciesId: 1, level: 5 },   // Bulbasaur
    { speciesId: 4, level: 5 },   // Charmander
    { speciesId: 7, level: 5 },   // Squirtle
  ],
  gyms: [
    { leaderId: 'brock',      badge: 'boulder',   type: 'rock' as PokemonType,     mapId: 'pewter_gym' },
    { leaderId: 'misty',      badge: 'cascade',   type: 'water' as PokemonType,    mapId: 'cerulean_gym' },
    { leaderId: 'lt_surge',   badge: 'thunder',   type: 'electric' as PokemonType, mapId: 'vermilion_gym' },
    { leaderId: 'erika',      badge: 'rainbow',   type: 'grass' as PokemonType,    mapId: 'celadon_gym' },
    { leaderId: 'koga',       badge: 'soul',      type: 'poison' as PokemonType,   mapId: 'fuchsia_gym' },
    { leaderId: 'sabrina',    badge: 'marsh',     type: 'psychic' as PokemonType,  mapId: 'saffron_gym' },
    { leaderId: 'blaine',     badge: 'volcano',   type: 'fire' as PokemonType,     mapId: 'cinnabar_gym' },
    { leaderId: 'giovanni',   badge: 'earth',     type: 'ground' as PokemonType,   mapId: 'viridian_gym' },
  ],
  eliteFour: [
    { trainerId: 'lorelei',   type: 'ice' as PokemonType },
    { trainerId: 'bruno',     type: 'fighting' as PokemonType },
    { trainerId: 'agatha',    type: 'ghost' as PokemonType },
    { trainerId: 'lance',     type: 'dragon' as PokemonType },
  ],
  champion: { trainerId: 'blue' },
  pokedexSize: 151,
  generationRange: [1, 151],
};
