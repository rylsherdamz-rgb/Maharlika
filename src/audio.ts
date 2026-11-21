import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AppState, Platform } from 'react-native';
import { getSave } from './save';
import { MUSIC, MusicId, SFX, SfxId } from './sounds';

/**
 * Sound for the whole game. Effects come from a small pool of preloaded players per sound
 * (so rapid shots can overlap), rate-limited so a swarm of hits does not turn into noise.
 * Music is one looping player that swaps tracks.
 */

// how many copies of each effect can sound at once, and the minimum gap between starts (ms)
const POOL: Partial<Record<SfxId, number>> = { hit: 3, bow: 3, orb: 3, dart: 3, enemy_shot: 3, coin: 3, light: 2, kill: 3, slash: 2 };
const GAP: Partial<Record<SfxId, number>> = { hit: 60, enemy_shot: 90, coin: 50, light: 70, bow: 40, dart: 40, orb: 40, kill: 50 };
const VOLUME: Partial<Record<SfxId, number>> = { enemy_shot: 0.45, light: 0.5, hit: 0.7, coin: 0.6, talk: 0.6, tap: 0.7 };
const MUSIC_VOLUME = 0.5;

let ready = false;
const pools = new Map<SfxId, { players: AudioPlayer[]; next: number; last: number }>();
let music: AudioPlayer | null = null;
let musicId: MusicId | null = null;
let wantMusic: MusicId | null = null;
let backgrounded = false;

export function initAudio() {
  if (ready) return;
  ready = true;
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => {});
  for (const id of Object.keys(SFX) as SfxId[]) {
    const n = POOL[id] ?? 1;
    const players: AudioPlayer[] = [];
    for (let i = 0; i < n; i++) {
      const p = createAudioPlayer(SFX[id]);
      p.volume = VOLUME[id] ?? 0.85;
      players.push(p);
    }
    pools.set(id, { players, next: 0, last: 0 });
  }
  AppState.addEventListener('change', (s) => {
    backgrounded = s !== 'active';
    if (backgrounded) music?.pause();
    else syncMusic();
  });
}

export function playSfx(id: SfxId) {
  if (!ready || !getSave().sfx || backgrounded) return;
  const pool = pools.get(id);
  if (!pool) return;
  const now = Date.now();
  if (now - pool.last < (GAP[id] ?? 0)) return;
  pool.last = now;
  const p = pool.players[pool.next];
  pool.next = (pool.next + 1) % pool.players.length;
  try {
    p.seekTo(0).catch(() => {});
    p.play();
  } catch {
    // a missing audio device should never take the game down
  }
  // browsers only allow audio after a user gesture; the first tap also starts the music
  if (Platform.OS === 'web') syncMusic();
}

/** Plays every sound the engine raised this frame, then clears the queue. */
export function drainSfx(queue: SfxId[]) {
  if (queue.length === 0) return;
  const seen = new Set<SfxId>();
  for (const id of queue) {
    if (seen.has(id)) continue;
    seen.add(id);
    playSfx(id);
  }
  queue.length = 0;
}

/** Asks for a track; it keeps playing across screens until a different one is asked for. */
export function setMusic(id: MusicId | null) {
  wantMusic = id;
  syncMusic();
}

/** Applies the current settings (call after toggling music on or off). */
export function syncMusic() {
  if (!ready) return;
  const on = getSave().music && !backgrounded && wantMusic !== null;
  if (!on) {
    music?.pause();
    return;
  }
  try {
    if (!music) {
      music = createAudioPlayer(MUSIC[wantMusic!]);
      music.loop = true;
      music.volume = MUSIC_VOLUME;
      musicId = wantMusic;
    } else if (musicId !== wantMusic) {
      music.replace(MUSIC[wantMusic!]);
      music.loop = true;
      musicId = wantMusic;
    }
    if (!music.playing) music.play();
  } catch {
    // ignore: no audio output
  }
}
