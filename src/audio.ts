import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { MUSIC, MusicId, SFX, SfxId } from './sounds';

/**
 * Music and sound effects.
 *
 * One looping player per music track (created when first needed) and a small pool of players per
 * effect, so the same effect can overlap itself. Everything is fire-and-forget: a sound that
 * fails to play is skipped, never an error in the game.
 */

/** Relative loudness per effect, so frequent sounds sit under the music. */
const SFX_VOLUME: Partial<Record<SfxId, number>> = {
  slash: 0.45,
  shoot: 0.4,
  magic: 0.4,
  hit: 0.35,
  kill: 0.5,
  coin: 0.35,
  pickup: 0.35,
  dodge: 0.45,
  hurt: 0.6,
  heal: 0.5,
  click: 0.5,
};
/** Effects that fire often get more players, so rapid repeats overlap instead of cutting off. */
const POOL: Partial<Record<SfxId, number>> = { slash: 3, shoot: 3, magic: 3, hit: 4, kill: 3, coin: 4, pickup: 2 };
/** Shortest gap between two plays of the same effect, in ms; stops a wall of identical sounds. */
const MIN_GAP = 45;
const MUSIC_VOLUME = 0.55;

let musicOn = true;
let sfxOn = true;
let current: MusicId | null = null;
const tracks: Partial<Record<MusicId, AudioPlayer>> = {};
const pools: Partial<Record<SfxId, { players: AudioPlayer[]; next: number; last: number }>> = {};
// Browsers refuse to start audio before the player has touched the page.
let unlocked = Platform.OS !== 'web';
let ready = false;

function safe(fn: () => void) {
  try {
    fn();
  } catch {
    // audio is a nicety: never let it break the game
  }
}

/** Call once at start-up. */
export function initAudio() {
  if (ready) return;
  ready = true;
  // respect the phone's silent switch, and let the player's own music keep playing
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  if (!unlocked && typeof window !== 'undefined') {
    const unlock = () => {
      unlocked = true;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      if (current) startTrack(current);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }
}

function track(id: MusicId) {
  if (!tracks[id]) {
    const p = createAudioPlayer(MUSIC[id]);
    p.loop = true;
    p.volume = MUSIC_VOLUME;
    tracks[id] = p;
  }
  return tracks[id]!;
}

function startTrack(id: MusicId) {
  if (!musicOn || !unlocked) return;
  safe(() => {
    const p = track(id);
    p.seekTo(0).catch(() => {});
    p.play();
  });
}

/** Switch the background music; asking for the track already playing does nothing. */
export function playMusic(id: MusicId | null) {
  if (id === current) return;
  if (current) {
    const old = tracks[current];
    if (old) safe(() => old.pause());
  }
  current = id;
  if (id) startTrack(id);
}

/** Play a sound effect. */
export function playSfx(id: SfxId) {
  if (!sfxOn || !unlocked) return;
  safe(() => {
    let pool = pools[id];
    if (!pool) {
      const n = POOL[id] ?? 1;
      pool = { players: Array.from({ length: n }, () => createAudioPlayer(SFX[id])), next: 0, last: 0 };
      for (const p of pool.players) p.volume = SFX_VOLUME[id] ?? 0.7;
      pools[id] = pool;
    }
    const now = Date.now();
    if (now - pool.last < MIN_GAP) return;
    pool.last = now;
    const p = pool.players[pool.next];
    pool.next = (pool.next + 1) % pool.players.length;
    p.seekTo(0).catch(() => {});
    p.play();
  });
}

export function setMusicOn(on: boolean) {
  musicOn = on;
  const p = current ? tracks[current] : undefined;
  if (!on && p) safe(() => p.pause());
  if (on && current) startTrack(current);
}

export function setSfxOn(on: boolean) {
  sfxOn = on;
}

export const audioSettings = () => ({ musicOn, sfxOn });
