import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
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
// browsers block audio until the first tap or key press
let webUnlocked = Platform.OS !== 'web';

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
  if (!webUnlocked && typeof window !== 'undefined') {
    const unlock = () => {
      webUnlocked = true;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      syncMusic();
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }
  AppState.addEventListener('change', (s) => {
    backgrounded = s !== 'active';
    if (backgrounded) music?.pause();
    else syncMusic();
  });
}

export function playSfx(id: SfxId) {
  if (!ready || !getSave().sfx || backgrounded || !webUnlocked) return;
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
}

// game moments you can feel (phones only)
const BUZZ: Partial<Record<SfxId, () => Promise<void>>> = {
  hurt: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  block: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  skill: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  roar: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  death: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  victory: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  boon: () => Haptics.selectionAsync(),
};
let lastBuzz = 0;

export function buzz(id: SfxId) {
  if (Platform.OS === 'web' || !getSave().haptics || backgrounded) return;
  const fn = BUZZ[id];
  const now = Date.now();
  if (!fn || now - lastBuzz < 80) return;
  lastBuzz = now;
  fn().catch(() => {});
}

/** Plays every sound the engine raised this frame, then clears the queue. */
export function drainSfx(queue: SfxId[]) {
  if (queue.length === 0) return;
  const seen = new Set<SfxId>();
  for (const id of queue) {
    if (seen.has(id)) continue;
    seen.add(id);
    playSfx(id);
    buzz(id);
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
  const on = getSave().music && !backgrounded && webUnlocked && wantMusic !== null;
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
