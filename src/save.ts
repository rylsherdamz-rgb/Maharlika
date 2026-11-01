import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeroId, RelicId } from './game/data';
import { Memory } from './game/tales';

/** What the game remembers between sessions. */
export interface Progress {
  wins: number; // voyages won, any difficulty
  hardUnlocked: boolean;
  bestEndless: number; // furthest island reached in endless mode
  relics: RelicId[]; // every mutya ever found, for the collection in the codex
  musicOn: boolean;
  sfxOn: boolean;
  // what Haliya remembers of earlier runs
  runs: number;
  deaths: number;
  lastReached: string | null;
  lastVictory: boolean;
  heroesPlayed: HeroId[];
  cavesCleared: number;
  seen: string[];
}

/** The parts of saved progress that Haliya's greeting draws on. */
export function memoryOf(p: Progress): Memory {
  return {
    runs: p.runs,
    deaths: p.deaths,
    wins: p.wins,
    lastReached: p.lastReached,
    lastVictory: p.lastVictory,
    heroesPlayed: p.heroesPlayed,
    relicsFound: p.relics.length,
    cavesCleared: p.cavesCleared,
    seen: p.seen,
  };
}

const KEY = 'maharlika.progress.v1';
const EMPTY: Progress = {
  wins: 0,
  hardUnlocked: false,
  bestEndless: 0,
  relics: [],
  musicOn: true,
  sfxOn: true,
  runs: 0,
  deaths: 0,
  lastReached: null,
  lastVictory: false,
  heroesPlayed: [],
  cavesCleared: 0,
  seen: [],
};
export const NEW_PROGRESS = EMPTY;

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY; // storage unavailable (private browsing etc.): play on without saving
  }
}

export async function saveProgress(p: Progress) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // nothing to do: progress just won't persist on this device
  }
}
