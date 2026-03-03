import type { OregonTrailState, Landmark } from './types';

export const LANDMARKS: Landmark[] = [
  { name: 'Independence, Missouri', distance: 0, type: 'Fort' },
  { name: 'Kansas River Crossing', distance: 102, type: 'River' },
  { name: 'Big Blue River Crossing', distance: 185, type: 'River' },
  { name: 'Fort Kearney', distance: 304, type: 'Fort' },
  { name: 'Chimney Rock', distance: 554, type: 'Landmark' },
  { name: 'Fort Laramie', distance: 667, type: 'Fort' },
  { name: 'Independence Rock', distance: 830, type: 'Landmark' },
  { name: 'South Pass', distance: 932, type: 'Landmark' },
  { name: 'Fort Bridger', distance: 1102, type: 'Fort' },
  { name: 'Green River Crossing', distance: 1159, type: 'River' },
  { name: 'Fort Hall', distance: 1283, type: 'Fort' },
  { name: 'Snake River Crossing', distance: 1465, type: 'River' },
  { name: 'Fort Boise', distance: 1581, type: 'Fort' },
  { name: 'Blue Mountains', distance: 1741, type: 'Landmark' },
  { name: 'The Dalles', distance: 1863, type: 'Landmark' },
  { name: 'Willamette Valley, Oregon', distance: 2000, type: 'Fort' }
];

export function calculateDailyConsumption(state: OregonTrailState): number {
  const aliveCount = state.members.filter(m => m.status !== 'Dead').length;
  const rationMultiplier = { 'Filling': 3, 'Meager': 2, 'Bare Bones': 1 }[state.rations];
  return aliveCount * rationMultiplier;
}

export function simulateDay(state: OregonTrailState): OregonTrailState {
  const newState = { ...state };
  
  // 1. Advance Date
  newState.date = new Date(newState.date);
  newState.date.setDate(newState.date.getDate() + 1);
  
  // 2. Consume Food
  const consumption = calculateDailyConsumption(state);
  newState.supplies.food = Math.max(0, newState.supplies.food - consumption);
  
  // 3. Move Miles
  const paceMiles = { 'Steady': 15, 'Strenuous': 20, 'Grueling': 25 }[state.pace];
  const randomMiles = Math.floor(Math.random() * 5);
  const totalMiles = paceMiles + randomMiles;
  newState.milesTraveled += totalMiles;
  
  // 4. Check for Landmark
  const nextLandmark = LANDMARKS[state.location + 1];
  if (nextLandmark && newState.milesTraveled >= nextLandmark.distance) {
    newState.milesTraveled = nextLandmark.distance;
    newState.location += 1;
    newState.status = 'Landmark';
    
    if (nextLandmark.distance === 2000) {
      newState.status = 'Victory';
    }
  }
  
  // 5. Random Events (if not at landmark)
  if (newState.status === 'Travel' && Math.random() < 0.1) {
    const events = [
      'A wagon wheel broke!',
      'You found 20lbs of wild berries!',
      'A member has dysentery.',
      'A heavy storm slows you down.',
      'An ox died.'
    ];
    newState.currentEvent = events[Math.floor(Math.random() * events.length)];
    newState.status = 'Event';
    
    // Process event impacts
    if (newState.currentEvent === 'A member has dysentery.') {
      const aliveMembers = newState.members.filter(m => m.status !== 'Dead');
      if (aliveMembers.length > 0) {
        const victim = aliveMembers[Math.floor(Math.random() * aliveMembers.length)];
        victim.disease = 'Dysentery';
        victim.status = 'Poor';
      }
    } else if (newState.currentEvent === 'You found 20lbs of wild berries!') {
      newState.supplies.food += 20;
    } else if (newState.currentEvent === 'An ox died.') {
      newState.supplies.oxen = Math.max(0, newState.supplies.oxen - 1);
    }
  }
  
  // 6. Check Game Over
  if (newState.supplies.oxen <= 0 || newState.members.every(m => m.status === 'Dead')) {
    newState.status = 'GameOver';
  }
  
  return newState;
}

export function hunt(_state: OregonTrailState): { foodGained: number, ammoSpent: number } {
  const ammoSpent = Math.floor(Math.random() * 10) + 5;
  const foodGained = Math.floor(Math.random() * 100) + 20;
  return { foodGained, ammoSpent };
}
