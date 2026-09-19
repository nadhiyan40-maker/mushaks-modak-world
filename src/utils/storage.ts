import { LeaderboardEntry, PlayerProfile, GameMode } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'vinayaka_player_profile',
  LEADERBOARD: 'vinayaka_cross_campus_leaderboard',
  HIGH_SCORES: 'vinayaka_high_scores',
};

export const CAMPUS_LIST = [
  'NIAT Campus (Organizers)',
  'IIT Bombay',
  'COEP Tech Pune',
  'VJTI Mumbai',
  'BITS Pilani',
  'MIT World Peace Univ',
  'RV College of Engg',
  'NIT Karnataka Surathkal',
  'DTU Delhi',
  'Anna University Chennai',
  'PES University Bangalore',
  'Other Campus'
];

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    playerName: 'Aarav Sharma',
    campus: 'NIAT Campus (Organizers)',
    gameMode: 'mushak_quest',
    score: 1840,
    metricLabel: 'pts',
    timestamp: Date.now() - 1000 * 60 * 45,
    levelReached: 3
  },
  {
    id: 'seed-2',
    playerName: 'Tanvi Kulkarni',
    campus: 'COEP Tech Pune',
    gameMode: 'dhol_rhythm',
    score: 2450,
    metricLabel: 'pts (48x Combo)',
    timestamp: Date.now() - 1000 * 60 * 90,
  },
  {
    id: 'seed-3',
    playerName: 'Rohan Deshmukh',
    campus: 'VJTI Mumbai',
    gameMode: 'eco_murti',
    score: 98,
    metricLabel: 'Eco-Rating %',
    timestamp: Date.now() - 1000 * 60 * 120,
  },
  {
    id: 'seed-4',
    playerName: 'Ananya Iyer',
    campus: 'IIT Bombay',
    gameMode: 'mushak_quest',
    score: 1620,
    metricLabel: 'pts',
    timestamp: Date.now() - 1000 * 60 * 180,
    levelReached: 3
  },
  {
    id: 'seed-5',
    playerName: 'Siddharth Patil',
    campus: 'BITS Pilani',
    gameMode: 'dhol_rhythm',
    score: 2180,
    metricLabel: 'pts (36x Combo)',
    timestamp: Date.now() - 1000 * 60 * 240,
  },
  {
    id: 'seed-6',
    playerName: 'Meera Nair',
    campus: 'RV College of Engg',
    gameMode: 'eco_murti',
    score: 95,
    metricLabel: 'Eco-Rating %',
    timestamp: Date.now() - 1000 * 60 * 300,
  },
  {
    id: 'seed-7',
    playerName: 'Vikram Joshi',
    campus: 'MIT World Peace Univ',
    gameMode: 'mushak_quest',
    score: 1390,
    metricLabel: 'pts',
    timestamp: Date.now() - 1000 * 60 * 360,
    levelReached: 2
  }
];

export function getPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    name: 'Festive Devotee',
    campus: 'NIAT Campus (Organizers)',
    soundEnabled: true,
    musicEnabled: false,
  };
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // fallback
  }
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  // Store default seeded
  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(INITIAL_LEADERBOARD));
  } catch {
    // fallback
  }
  return INITIAL_LEADERBOARD;
}

export function addLeaderboardScore(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): LeaderboardEntry {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
  };

  const updated = [newEntry, ...current].sort((a, b) => {
    if (a.gameMode !== b.gameMode) return 0;
    return b.score - a.score;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated.slice(0, 100)));
  } catch {
    // fallback
  }

  // Update best for this mode
  try {
    const highScores = getHighScores();
    if (!highScores[entry.gameMode] || entry.score > highScores[entry.gameMode]) {
      highScores[entry.gameMode] = entry.score;
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(highScores));
    }
  } catch {
    // fallback
  }

  return newEntry;
}

export function getHighScores(): Record<GameMode, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    mushak_quest: 0,
    dhol_rhythm: 0,
    eco_murti: 0,
  };
}
