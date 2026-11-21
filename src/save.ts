import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { HeroId } from './game/data';

/** Everything the game remembers between launches. */
export interface SaveData {
  version: 1;
  seenIntro: boolean;
  music: boolean;
  sfx: boolean;
  runs: number;
  wins: number;
  kills: number;
  heroes: Partial<Record<HeroId, HeroRecord>>;
}

export interface HeroRecord {
  runs: number;
  wins: number;
  /** Furthest stage index reached (0 = Tondo, last = the shore of Albay). */
  best: number;
  bestLabel: string;
  /** Fastest victory, in seconds. */
  fastest?: number;
}

export interface RunOutcome {
  hero: HeroId;
  victory: boolean;
  reached: number;
  stage: string;
  kills: number;
  time: number;
}

const KEY = 'maharlika.save.v1';
const DEFAULTS: SaveData = { version: 1, seenIntro: false, music: true, sfx: true, runs: 0, wins: 0, kills: 0, heroes: {} };

let data: SaveData = { ...DEFAULTS };
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
}

/** Reads the save once at startup. A missing or broken save starts fresh. */
export async function loadSave() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1) data = { ...DEFAULTS, ...parsed, heroes: { ...parsed.heroes } };
    }
  } catch {
    data = { ...DEFAULTS };
  }
  loaded = true;
  emit();
  return data;
}

export function getSave() {
  return data;
}

export function isLoaded() {
  return loaded;
}

export function updateSave(patch: Partial<SaveData>) {
  data = { ...data, ...patch };
  persist();
  emit();
}

/** Records a finished run. Returns true if it beat the hero's previous best. */
export function recordRun(run: RunOutcome) {
  const prev = data.heroes[run.hero] ?? { runs: 0, wins: 0, best: -1, bestLabel: '' };
  const furthest = run.reached > prev.best;
  const faster = run.victory && (prev.fastest === undefined || run.time < prev.fastest);
  const rec: HeroRecord = {
    runs: prev.runs + 1,
    wins: prev.wins + (run.victory ? 1 : 0),
    best: Math.max(prev.best, run.reached),
    bestLabel: furthest ? run.stage : prev.bestLabel,
    fastest: faster ? run.time : prev.fastest,
  };
  data = {
    ...data,
    runs: data.runs + 1,
    wins: data.wins + (run.victory ? 1 : 0),
    kills: data.kills + run.kills,
    heroes: { ...data.heroes, [run.hero]: rec },
  };
  persist();
  emit();
  return prev.runs > 0 && (furthest || faster);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** React hook: the current save, re-rendering when it changes. */
export function useSave() {
  return useSyncExternalStore(subscribe, getSave, getSave);
}
