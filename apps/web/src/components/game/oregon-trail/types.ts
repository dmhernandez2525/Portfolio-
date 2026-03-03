export type Profession = 'Banker' | 'Carpenter' | 'Farmer';
export type Pace = 'Steady' | 'Strenuous' | 'Grueling';
export type Rations = 'Filling' | 'Meager' | 'Bare Bones';

export interface Supplies {
  oxen: number;
  food: number;
  clothing: number;
  ammunition: number;
  spareParts: number;
  money: number;
}

export interface WagonMember {
  name: string;
  status: 'Healthy' | 'Fair' | 'Poor' | 'Very Poor' | 'Dead';
  disease?: string;
}

export interface Landmark {
  name: string;
  distance: number;
  type: 'Fort' | 'River' | 'Landmark';
  description?: string;
}

export interface OregonTrailState {
  date: Date;
  milesTraveled: number;
  supplies: Supplies;
  members: WagonMember[];
  pace: Pace;
  rations: Rations;
  location: number; // Index in landmarks
  status: 'Travel' | 'Landmark' | 'Event' | 'RiverCrossing' | 'Hunting' | 'GameOver' | 'Victory';
  currentEvent?: string;
}
