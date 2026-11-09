import AsyncStorage from '@react-native-async-storage/async-storage';
import { HEROES, HeroId } from '../game/data';
import type { RunStats } from '../screens/ResultScreen';

/** Saved between sessions: how far each maharlika has come. */
export interface HeroRecord {
  runs: number;
  wins: number;
  bestTime: number | null; // fastest victory, in seconds
  furthest: number; // furthest island reached (0 = Tondo, 5 = Albay)
}

export interface Records {
  heroes: Record<HeroId, HeroRecord>;
  totalKills: number;
  gongsRung: number;
}

export interface RunOutcome {
  newBestTime: boolean;
  firstWin: boolean;
  furtherThanEver: boolean;
}

const KEY = 'maharlika.records.v1';

export function emptyRecords(): Records {
  const heroes = {} as Record<HeroId, HeroRecord>;
  for (const h of HEROES) heroes[h.id] = { runs: 0, wins: 0, bestTime: null, furthest: 0 };
  return { heroes, totalKills: 0, gongsRung: 0 };
}

export async function loadRecords(): Promise<Records> {
  const base = emptyRecords();
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<Records>;
    for (const h of HEROES) base.heroes[h.id] = { ...base.heroes[h.id], ...saved.heroes?.[h.id] };
    base.totalKills = saved.totalKills ?? 0;
    base.gongsRung = saved.gongsRung ?? 0;
  } catch {
    // unreadable storage: start fresh rather than crash
  }
  return base;
}

/** Folds a finished run into the records. Returns the updated copy and what was new. */
export function recordRun(prev: Records, run: RunStats): { records: Records; outcome: RunOutcome } {
  const old = prev.heroes[run.hero];
  const won = run.victory;
  const newBestTime = won && (old.bestTime === null || run.time < old.bestTime);
  const hero: HeroRecord = {
    runs: old.runs + 1,
    wins: old.wins + (won ? 1 : 0),
    bestTime: newBestTime ? run.time : old.bestTime,
    furthest: Math.max(old.furthest, run.stageNum),
  };
  const records: Records = {
    heroes: { ...prev.heroes, [run.hero]: hero },
    totalKills: prev.totalKills + run.kills,
    gongsRung: prev.gongsRung + run.gongs,
  };
  return {
    records,
    outcome: { newBestTime, firstWin: won && old.wins === 0, furtherThanEver: run.stageNum > old.furthest },
  };
}

export async function saveRecords(r: Records) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(r));
  } catch {
    // a failed save only loses the record, never the game
  }
}

export function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}
