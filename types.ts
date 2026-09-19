export type GameMode = 'mushak_quest' | 'dhol_rhythm' | 'eco_murti';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  campus: string;
  gameMode: GameMode;
  score: number;
  metricLabel: string; // e.g., 'pts', 'combo', 'eco rating'
  timestamp: number;
  levelReached?: number;
}

export interface PlayerProfile {
  name: string;
  campus: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

// Mushak Quest Types
export interface GameObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'modak' | 'golden_modak' | 'laddu' | 'durva' | 'flower' | 'obstacle_pot' | 'obstacle_cracker' | 'obstacle_coconut' | 'power_shield' | 'power_magnet';
  points: number;
  vy?: number;
  vx?: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  shape?: 'circle' | 'sparkle' | 'flower' | 'petal';
}

// Dhol Rhythm Types
export interface RhythmNote {
  id: number;
  lane: 0 | 1 | 2; // 0: Tasha, 1: Puneri Dhol, 2: Jhanj / Taal
  time: number; // Target timestamp in milliseconds
  hit?: boolean;
  missed?: boolean;
  rating?: 'divine' | 'auspicious' | 'good' | 'miss';
}

// Eco Murti Types
export interface ClayOption {
  id: string;
  name: string;
  description: string;
  ecoScore: number;
  color: string;
  texture: string;
}

export interface DecorationOption {
  id: string;
  name: string;
  category: 'garland' | 'durva' | 'modak' | 'diya' | 'mukut' | 'chandan';
  icon: string;
  ecoScore: number;
  description: string;
}
