import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Trophy, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { PokemonSpecies, Category, PokedokuState } from './types';
import { generateDailyGrid, checkCriteria, searchPokemon } from './logic';

// Import local pokemon data
import gen1 from '../pokemon/data/pokemon-gen1.json';
import gen2 from '../pokemon/data/pokemon-gen2.json';
import gen3 from '../pokemon/data/pokemon-gen3.json';

const ALL_POKEMON = [...gen1, ...gen2, ...gen3] as PokemonSpecies[];

export const PokedokuGame: React.FC = () => {
  const [grid, setGrid] = useState<{ rows: Category[], cols: Category[] } | null>(null);
  const [state, setState] = useState<PokedokuState>({
    rowCategories: [],
    colCategories: [],
    guesses: {},
    remainingGuesses: 9,
    isComplete: false,
    isVictory: false
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Initialize game
  useEffect(() => {
    const dailyGrid = generateDailyGrid(ALL_POKEMON);
    setGrid(dailyGrid);
    setState(prev => ({
      ...prev,
      rowCategories: dailyGrid.rows,
      colCategories: dailyGrid.cols
    }));
    
    // Load progress from localStorage
    const saved = localStorage.getItem('pokedoku_save');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
      if (parsed.date === today) {
        setState(prev => ({ ...prev, ...parsed.state }));
      }
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (state.rowCategories.length > 0) {
      const today = new Date().toDateString();
      localStorage.setItem('pokedoku_save', JSON.stringify({
        date: today,
        state
      }));
    }
  }, [state]);

  const filteredPokemon = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchPokemon(searchQuery, ALL_POKEMON);
  }, [searchQuery]);

  const handleCellClick = (index: number) => {
    if (state.isComplete || state.guesses[index] !== undefined) return;
    setActiveCell(index);
    setIsSearchOpen(true);
    setSearchQuery('');
  };

  const handleGuess = (pokemon: PokemonSpecies) => {
    if (activeCell === null) return;

    const rowIndex = Math.floor(activeCell / 3);
    const colIndex = activeCell % 3;
    
    const rowCat = state.rowCategories[rowIndex];
    const colCat = state.colCategories[colIndex];
    
    const isCorrect = checkCriteria(pokemon, rowCat) && checkCriteria(pokemon, colCat);
    
    if (isCorrect) {
      const newGuesses = { ...state.guesses, [activeCell]: pokemon.id };
      const isVictory = Object.keys(newGuesses).length === 9;
      const isComplete = isVictory || state.remainingGuesses <= 1;
      
      setState(prev => ({
        ...prev,
        guesses: newGuesses,
        remainingGuesses: prev.remainingGuesses - 1,
        isComplete,
        isVictory
      }));
      setMessage(`Correct! It's ${pokemon.name}!`);
    } else {
      const isComplete = state.remainingGuesses <= 1;
      setState(prev => ({
        ...prev,
        remainingGuesses: prev.remainingGuesses - 1,
        isComplete
      }));
      setMessage(`Incorrect. ${pokemon.name} doesn't fit the criteria.`);
    }
    
    setIsSearchOpen(false);
    setActiveCell(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const resetGame = () => {
    if (window.confirm("Restart today's puzzle? Your progress will be lost.")) {
      const dailyGrid = generateDailyGrid(ALL_POKEMON);
      setState({
        rowCategories: dailyGrid.rows,
        colCategories: dailyGrid.cols,
        guesses: {},
        remainingGuesses: 9,
        isComplete: false,
        isVictory: false
      });
    }
  };

  if (!grid) return null;

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-background text-foreground">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
              PokéDoku
            </h1>
            <p className="text-muted-foreground">Daily Pokémon Grid Trivia</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <p className="text-sm font-medium">Remaining Guesses</p>
              <p className="text-2xl font-bold text-neon-pink">{state.remainingGuesses}</p>
            </div>
            <Button variant="outline" size="icon" onClick={resetGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-3 rounded-lg text-center font-medium ${message.includes('Correct') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
          >
            {message}
          </motion.div>
        )}

        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-8">
          {/* Top-left empty cell */}
          <div className="aspect-square flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-500 opacity-20" />
          </div>

          {/* Column Headers */}
          {state.colCategories.map(cat => (
            <div key={cat.id} className="aspect-square flex flex-col items-center justify-center p-2 rounded-xl bg-secondary/30 border border-border text-center">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{cat.type}</span>
              <span className="text-xs md:text-sm font-bold">{cat.name}</span>
            </div>
          ))}

          {/* Rows */}
          {state.rowCategories.map((rowCat, rowIndex) => (
            <React.Fragment key={rowCat.id}>
              {/* Row Header */}
              <div className="aspect-square flex flex-col items-center justify-center p-2 rounded-xl bg-secondary/30 border border-border text-center">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{rowCat.type}</span>
                <span className="text-xs md:text-sm font-bold">{rowCat.name}</span>
              </div>

              {/* Grid Cells */}
              {[0, 1, 2].map(colIndex => {
                const cellIndex = rowIndex * 3 + colIndex;
                const pokemonId = state.guesses[cellIndex];
                const pokemon = pokemonId ? ALL_POKEMON.find(p => p.id === pokemonId) : null;

                return (
                  <motion.div
                    key={cellIndex}
                    whileHover={!pokemon && !state.isComplete ? { scale: 1.02, borderColor: 'var(--neon-blue)' } : {}}
                    onClick={() => handleCellClick(cellIndex)}
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-colors cursor-pointer
                      ${pokemon ? 'bg-primary/5 border-primary/50' : 'bg-card border-dashed border-muted hover:border-solid'}
                      ${state.isComplete && !pokemon ? 'opacity-50 grayscale' : ''}
                    `}
                  >
                    {pokemon ? (
                      <>
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                          alt={pokemon.name}
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1">
                          <p className="text-[10px] text-center font-bold text-white truncate px-1">{pokemon.name}</p>
                        </div>
                        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground opacity-20">?</span>
                    )}
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {state.isComplete && (
          <Card className="p-6 text-center border-neon-blue bg-neon-blue/5">
            <h2 className="text-2xl font-bold mb-2">
              {state.isVictory ? "Full Grid! Incredible!" : "Game Over"}
            </h2>
            <p className="text-muted-foreground mb-4">
              You correctly identified {Object.keys(state.guesses).length} out of 9 Pokémon.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => window.location.reload()}>Return to Hub</Button>
              <Button variant="outline" onClick={resetGame}>Try Again</Button>
            </div>
          </Card>
        )}
      </motion.div>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Who's that Pokémon?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {filteredPokemon.length > 0 ? (
                filteredPokemon.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleGuess(p)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer border border-transparent hover:border-neon-blue transition-all"
                  >
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                      alt={p.name}
                      className="w-10 h-10 object-contain"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{p.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        {p.types.map(t => (
                          <Badge key={t} variant="outline" className="text-[8px] h-3 px-1.5 uppercase">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Gen {p.generation}</span>
                  </div>
                ))
              ) : searchQuery.length >= 2 ? (
                <p className="text-center text-sm text-muted-foreground py-4">No Pokémon found.</p>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">Type at least 2 characters to search.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PokedokuGame;
