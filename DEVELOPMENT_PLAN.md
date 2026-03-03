# Development Plan: Portfolio Games Expansion

This plan outlines the implementation of new games and improvements to existing games in the portfolio.

## Phase 1: Research & Scaffolding
- [ ] Research specific mechanics for PokéDoku, Mean Bean Machine, Oregon Trail, and Poison Lizard.
- [ ] Create base components for each new game.
- [ ] Establish the "Three-Phase PR Review" document template.

## Phase 2: Implementation (Stacked Branches)
Each task below will be a separate branch, stacked on the previous one.

1. **feature/pokedoku**
   - [ ] Implement grid-based trivia mechanics.
   - [ ] Integrate Pokemon data (Species, Types, Generations).
   - [ ] Add Daily challenge logic.
   
2. **feature/mean-bean-machine**
   - [ ] Implement Puyo Puyo falling block physics.
   - [ ] Add combo/chaining system.
   - [ ] Implement AI opponent (Dr. Robotnik).

3. **feature/oregon-trail**
   - [ ] Implement resource management (Food, Health, Distance).
   - [ ] Add event system (Dysentery, Broken Axle, etc.).
   - [ ] Implement hunting minigame.

4. **feature/poison-lizard**
   - [ ] Implement standalone Poison Lizard game or deep integration in COC.
   - [ ] (If standalone) Physics-based ability game.

5. **feature/pokemon-overhaul**
   - [ ]Retool UI/UX for better player experience.
   - [ ] Add missing features (Trainer battles, items in bag).
   - [ ] Improve battle animations and transitions.

6. **feature/shopping-cart-hero-fix**
   - [ ] Fix physics engine (Launch, Flight, Crash).
   - [ ] Improve graphics and polish.

## Phase 3: Review & Merge
- [ ] Conduct 3-Phase PR Review (Functionality, Security, Style) for each branch.
- [ ] Fix all identified issues.
- [ ] Merge into main.

## Standards
- **Styling:** Vanilla CSS or Tailwind (as per existing project).
- **Type Safety:** 100% TypeScript coverage, no `any`.
- **Testing:** Add tests for core mechanics.
- **Architecture:** Maintain modularity in `apps/web/src/components/game/`.
