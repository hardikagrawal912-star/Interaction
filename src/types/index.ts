export type StarType = 'kahani' | 'sawaal' | 'chunauti';

export type FamilyRelation = 
  | 'Dadi' 
  | 'Nani' 
  | 'Dada' 
  | 'Nana' 
  | 'Papa' 
  | 'Mummy' 
  | 'Bhai' 
  | 'Behen' 
  | 'Dost' 
  | 'Other';

export interface StarItem {
  id: string;
  creatorName: string;
  relation: FamilyRelation;
  type: StarType;
  title?: string;
  textContent?: string;
  audioBlob?: Blob;
  audioDuration?: number;
  targetPerson?: string; // For Sawaal
  createdAt: number;
  isPlayed?: boolean;
  // Seeded polar positioning
  ringIndex?: number;
  angleRatio?: number; // 0 to 1
  radiusRatio?: number; // 0.15 to 0.45 of view
}

export interface ConstellationPoint {
  x: number;
  y: number;
  id: string;
  title: string;
  type: StarType;
  creatorName: string;
}

export interface NightSession {
  id: string;
  dateStr: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  openedStarCount: number;
  openedStars: {
    id: string;
    title: string;
    creatorName: string;
    relation: FamilyRelation;
    type: StarType;
    textContent?: string;
    hasAudio?: boolean;
    audioDuration?: number;
  }[];
  constellationPoints: ConstellationPoint[];
}

export type ActiveScreen = 
  | 'home' 
  | 'stock' 
  | 'andhera' 
  | 'bijli-wapas' 
  | 'history' 
  | 'settings';
