# Mafia Wars Game Design Document

## Overview

Mafia Wars is a recreation of the classic MySpace text-based crime RPG. Players build a criminal empire by completing jobs, fighting AI opponents, investing in properties, and acquiring equipment.

## Core Mechanics

### 1. Resource System
| Resource | Purpose | Regeneration |
|----------|---------|--------------|
| **Energy** | Required for jobs | 1 per 5 minutes |
| **Stamina** | Required for fighting | 1 per 3 minutes |
| **Health** | Reduced in combat | 1 per 30 seconds |

### 2. Jobs System
- 6 tiers: Street Thug → Associate → Soldier → Capo → Underboss → Boss
- 4 jobs per tier (24 total)
- Jobs consume energy and reward cash + XP
- Mastery system: Bronze → Silver → Gold (3 levels per job)
- Higher level requirements unlock higher tiers

### 3. Combat System
- 8 AI opponent types scaled to different difficulty levels
- Stamina cost: 5 + floor(opponent.level / 10)
- Combat formula: playerPower vs opponentPower with randomness factor
- Winning grants cash + full XP; losing grants 10% XP
- Health damage reduced by defense stat

### 4. Properties System
- 8 property types (Mafia Hangout → Private Island)
- Generate passive hourly income
- Maximum ownership limits per property type
- Income can be collected at any time

### 5. Equipment System
- 3 categories: Weapons (ATK), Armor (DEF), Vehicles (ATK/DEF)
- 8 items per category (24 total)
- Stats stack with base player stats

### 6. Progression
- XP formula: `100 * level * (1 + level * 0.15)`
- Level up grants: 3 skill points + full resource restore
- Skill points can be allocated to: Attack (+2), Defense (+2), Energy (+5), Stamina (+5)

### 7. Banking
- Deposit/withdraw cash to protect from losses
- Supports partial (10%) or full transfers

### 8. Achievements
- 14 achievements tracking milestones
- Categories: Jobs, Fighting, Wealth, Properties, Levels, Equipment

## Technical Architecture

```
src/components/game/mafia-wars/
├── types.ts      # TypeScript interfaces
├── constants.ts  # Game data and helper functions
└── index.tsx     # Main component with UI and game logic
```

### State Persistence
- Auto-saves to localStorage every 30 seconds
- Saves on tab close/navigation
- Merges saved data with initial game data on load

### UI Components
- **JobCard**: Displays job with mastery progress and execute button
- **OpponentCard**: Shows opponent stats, difficulty, and fight button
- **PropertyCard**: Property info with buy button and ownership count
- **EquipmentCard**: Equipment with stat bonuses and purchase option

## Integration Points
- Route: `/mafia-wars`
- Games catalog entry in `Games.tsx`
- Follows portfolio game architecture patterns

## Future Enhancements (Not Implemented)
- Multiplayer/leaderboards
- More job tiers
- Boss fights with special mechanics
- Limited-time events
- Crew/gang system
