import AsyncStorage from '@react-native-async-storage/async-storage';
import { RelicId } from './game/data';

/** What the game remembers between sessions. */
export interface Progress {
  wins: number; // voyages won, any difficulty
  hardUnlocked: boolean;
  bestEndless: number; // furthest island reached in endless mode
  relics: RelicId[]; // every mutya ever found, for the collection in the codex
}

const KEY = 'maharlika.progress.v1';
const EMPTY: Progress = { wins: 0, hardUnlocked: false, bestEndless: 0, relics: [] };

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
