// ============================================================================
// Pokemon RPG - Move Deleter / Move Reminder Screen
// ============================================================================

import { useState } from 'react';
import type { Pokemon, SpeciesData } from '../engine/types';
import { getMoveData } from '../engine/battle-engine';
import { getSpeciesName } from '../engine/evolution-system';

interface MoveTutorScreenProps {
  party: Pokemon[];
  mode: 'deleter' | 'reminder';
  speciesDatabase: Map<number, SpeciesData>;
  hasHeartScale: boolean;
  onDeleteMove: (partyIndex: number, moveIndex: number) => void;
  onRelearnMove: (partyIndex: number, moveId: string) => void;
  onBack: () => void;
}

export default function MoveTutorScreen({
  party, mode, speciesDatabase, hasHeartScale,
  onDeleteMove, onRelearnMove, onBack,
}: MoveTutorScreenProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
  const [_selectedMove, _setSelectedMove] = useState<number | null>(null);

  // Step 1: Select a Pokemon
  if (selectedPokemon === null) {
    return (
      <div className="absolute inset-0 z-40 bg-[#306098] flex flex-col">
        <div className="p-2 border-b-2 border-[#204070]">
          <span className="font-mono text-white font-bold text-sm">
            {mode === 'deleter' ? 'Move Deleter: Choose a Pokemon' : 'Move Reminder: Choose a Pokemon'}
          </span>
          {mode === 'reminder' && (
            <span className="font-mono text-yellow-300 text-xs ml-2">
              {hasHeartScale ? '(Heart Scale ready)' : '(Need Heart Scale!)'}
            </span>
          )}
        </div>
        <div className="flex-1 p-2 overflow-y-auto flex flex-col gap-1">
          {party.map((pkmn, idx) => (
            <button
              key={pkmn.uid}
              onClick={() => setSelectedPokemon(idx)}
              className="flex items-center gap-2 px-3 py-2 rounded font-mono text-xs text-white bg-[#4080c0] hover:bg-[#5090d0] transition-colors"
            >
              <span className="font-bold">#{pkmn.speciesId}</span>
              <span>{pkmn.nickname ?? getSpeciesName(pkmn.speciesId)}</span>
              <span className="ml-auto text-white/60">Lv.{pkmn.level} | {pkmn.moves.length} moves</span>
            </button>
          ))}
        </div>
        <div className="p-2 border-t-2 border-[#204070]">
          <button onClick={onBack}
            className="w-full px-4 py-2 bg-neutral-600 text-white font-mono text-xs font-bold rounded hover:bg-neutral-500">
            BACK
          </button>
        </div>
      </div>
    );
  }

  const pokemon = party[selectedPokemon];

  // Step 2 (Deleter): Select a move to delete
  if (mode === 'deleter') {
    return (
      <div className="absolute inset-0 z-40 bg-[#306098] flex flex-col">
        <div className="p-2 border-b-2 border-[#204070]">
          <span className="font-mono text-white font-bold text-sm">
            Delete a move from {pokemon.nickname ?? getSpeciesName(pokemon.speciesId)}
          </span>
        </div>
        <div className="flex-1 p-2 overflow-y-auto flex flex-col gap-1">
          {pokemon.moves.length <= 1 ? (
            <div className="font-mono text-white/60 text-xs p-2">
              Cannot delete the last move!
            </div>
          ) : (
            pokemon.moves.map((move, idx) => {
              const data = getMoveData(move.moveId);
              return (
                <button
                  key={move.moveId}
                  onClick={() => {
                    onDeleteMove(selectedPokemon, idx);
                    setSelectedPokemon(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded font-mono text-xs text-white bg-[#4080c0] hover:bg-[#c04040] transition-colors"
                >
                  <span className="font-bold">{data?.name ?? move.moveId}</span>
                  <span className="text-white/60">{data?.type ?? '???'}</span>
                  <span className="ml-auto text-white/60">PP: {move.pp}/{move.maxPp}</span>
                </button>
              );
            })
          )}
        </div>
        <div className="p-2 border-t-2 border-[#204070]">
          <button onClick={() => setSelectedPokemon(null)}
            className="w-full px-4 py-2 bg-neutral-600 text-white font-mono text-xs font-bold rounded hover:bg-neutral-500">
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  // Step 2 (Reminder): Select a move to relearn
  const species = speciesDatabase.get(pokemon.speciesId);
  const knownMoveIds = new Set(pokemon.moves.map(m => m.moveId));
  const relearnableMoves = species?.learnset
    .filter(e => e.level <= pokemon.level && !knownMoveIds.has(e.moveId))
    .map(e => e.moveId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx) ?? [];

  return (
    <div className="absolute inset-0 z-40 bg-[#306098] flex flex-col">
      <div className="p-2 border-b-2 border-[#204070]">
        <span className="font-mono text-white font-bold text-sm">
          Relearn a move for {pokemon.nickname ?? getSpeciesName(pokemon.speciesId)}
        </span>
      </div>
      <div className="flex-1 p-2 overflow-y-auto flex flex-col gap-1">
        {!hasHeartScale ? (
          <div className="font-mono text-yellow-300 text-xs p-2">
            You need a Heart Scale to relearn a move!
          </div>
        ) : pokemon.moves.length >= 4 ? (
          <div className="font-mono text-white/60 text-xs p-2">
            This Pokemon already knows 4 moves. Delete a move first!
          </div>
        ) : relearnableMoves.length === 0 ? (
          <div className="font-mono text-white/60 text-xs p-2">
            No moves available to relearn.
          </div>
        ) : (
          relearnableMoves.map(moveId => {
            const data = getMoveData(moveId);
            return (
              <button
                key={moveId}
                onClick={() => {
                  onRelearnMove(selectedPokemon, moveId);
                  setSelectedPokemon(null);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded font-mono text-xs text-white bg-[#4080c0] hover:bg-[#50a050] transition-colors"
              >
                <span className="font-bold">{data?.name ?? moveId}</span>
                <span className="text-white/60">{data?.type ?? '???'} | {data?.category ?? '???'}</span>
                <span className="ml-auto text-white/60">
                  {data?.power ? `Pow: ${data.power}` : 'Status'} | PP: {data?.pp ?? '?'}
                </span>
              </button>
            );
          })
        )}
      </div>
      <div className="p-2 border-t-2 border-[#204070]">
        <button onClick={() => setSelectedPokemon(null)}
          className="w-full px-4 py-2 bg-neutral-600 text-white font-mono text-xs font-bold rounded hover:bg-neutral-500">
          CANCEL
        </button>
      </div>
    </div>
  );
}
