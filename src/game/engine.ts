import roomData from './rooms.json';
import {
  BoonId,
  BOONS,
  BOSS_NAME,
  BulletSprite,
  CAVE_GUARDIANS,
  DIFFICULTIES,
  Difficulty,
  ENEMIES,
  EnemyType,
  HEROES,
  HeroDef,
  HeroId,
  LEVEL_MAX,
  LIGHT_MAX,
  LOOT_WEAPONS,
  Mode,
  RelicId,
  RELICS,
  THEME_GUARDIAN,
  WEAPON_LV_BONUS,
  WEAPON_LV_MAX,
  WeaponId,
  WEAPONS,
  xpToNext,
} from './data';
import type { SfxId } from '../sounds';
import { bossDialogue, CAVE, DialogueLine, ENDLESS, HALIYA_LINES, PORT, ROUTE_SLOTS, SHORE, STAGES } from './story';

export const TILE = roomData.tile;
export const ROOM_W = roomData.width * TILE;
export const ROOM_H = roomData.height * TILE;
export type RoomName = keyof typeof roomData.rooms;

const FLOOR = 0;
const WATER = 4;
const ENTRY = { x: 2.5 * TILE, y: 7.5 * TILE };
const CENTER = { x: 11.5 * TILE, y: 7.5 * TILE };
const DOCK = { x: 20.5 * TILE, y: 7.5 * TILE };
/** Seconds a teammate must stand by a fallen hero to lift them back up. */
export const REVIVE_TIME = 2.2;
/** Rooms in a yungib; the last holds the cave's guardian. */
export const CAVE_DEPTH = 3;
/** In endless mode, every this-many islands has a cave for sure. */
const ENDLESS_CAVE_EVERY = 4;
/** In endless mode, every this-many islands the Bakunawa rises. */
export const ENDLESS_BOSS_EVERY = 8;

export interface Mods {
  dmg: number;
  rate: number;
  speed: number;
  pierce: boolean;
  reach: number;
  regen: number; // multiplier on armor recharge speed
  dodgeCd: number;
  herbs: number; // extra herb drop chance
  harvest: boolean;
}

export interface Hero {
  idx: number; // player slot: 0 = P1, 1 = P2
  def: HeroDef;
  weapon: WeaponId;
  weaponLv: number; // whetstones applied (0..WEAPON_LV_MAX)
  shield: number; // >0 while Banog's kalasag is raised
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  armor: number;
  maxArmor: number;
  light: number;
  facing: 1 | -1;
  aim: number;
  moving: boolean;
  atkCd: number;
  swing: number; // >0 while a melee slash is showing
  swingAim: number;
  spin: number; // >0 while the Bagyo whirl is showing
  invuln: number;
  sinceHit: number;
  armorTick: number;
  dodgeCd: number;
  dash: number;
  dashDx: number;
  dashDy: number;
  walk: number;
  atkAnim: number; // >0 while the attack pose is showing
  dustAt: number; // walk time of the last footstep puff
  lv: number; // antas (level), from 1
  xp: number; // toward the next level
  down: boolean; // fallen in co-op, waiting for a teammate
  revive: number; // seconds of help received while down
  mods: Mods;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  cd: number;
  t: number;
  spawn: number;
  flash: number;
  facing: 1 | -1;
  poison: number;
  poisonTick: number;
  /** Per-creature phase: tiyanak 0 = disguised; sigbin 1 = backing off; bungisngis 1 = winding up a slam. */
  state: number;
  /** Size multiplier: 1 for most, larger for a cave guardian. */
  scale?: number;
  /** Cave guardian (mini-boss): its own health bar, a big chest when it falls. */
  boss?: boolean;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  fromHero: boolean;
  owner?: number; // hero slot that fired it
  sprite: BulletSprite;
  r: number;
  life: number;
  pierce: boolean;
  poison?: number;
  homing?: boolean;
  explode?: number;
  hit?: Set<number>;
}

export type PickupKind = 'coin' | 'energy_orb' | 'potion_health' | 'whetstone' | 'weapon' | 'relic';

export interface Pickup {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  t: number;
  weapon?: WeaponId;
  relic?: RelicId;
  /** false for a weapon a hero just put down, until every hero steps away from it */
  armed?: boolean;
}

/** A kaban: a chest that appears once an island is safe (a big one guards the deepest cave). */
export interface Chest {
  x: number;
  y: number;
  open: boolean;
  big?: boolean;
}

/** Short-lived sprite effects: footstep dust, impact sparks, blasts and the rest. */
export type FxKind = 'dust' | 'hit' | 'boom' | 'poof' | 'sparkle' | 'heal' | 'wave';
export interface Fx {
  id: number;
  kind: FxKind;
  x: number;
  y: number;
  t: number; // seconds since it appeared
  size?: number; // final size for rings and blasts
}

/** Seconds a dodge roll lasts. */
export const DODGE_TIME = 0.2;
export const FX_LIFE: Record<FxKind, number> = { dust: 0.36, hit: 0.18, boom: 0.4, poof: 0.36, sparkle: 0.5, heal: 0.6, wave: 0.45 };
/** Animation frames in each effect's sprite strip (rings scale instead). */
export const FX_FRAMES: Record<FxKind, number> = { dust: 3, hit: 2, boom: 3, poof: 3, sparkle: 2, heal: 2, wave: 1 };

export interface FloatText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  t: number;
}

export interface Input {
  mx: number;
  my: number;
  attack: boolean;
  skill: boolean; // edge-triggered, cleared by engine
  dodge: boolean; // edge-triggered, cleared by engine
}

/** What the island looked like when the party went down into its cave. */
interface Surface {
  room: RoomName;
  grid: number[][];
  chest: Chest | null;
  shrine: { x: number; y: number; used: boolean } | null;
  boat: { x: number; y: number } | null;
  cave: { x: number; y: number };
}

export interface Game {
  heroes: Hero[];
  /** Player 1; kept as a shortcut for single-player code and the HUD. */
  hero: Hero;
  mode: Mode;
  diff: Difficulty;
  /** Co-op: heroes attack by themselves whenever a creature is in reach. */
  autoAttack: boolean;
  enemies: Enemy[];
  bullets: Bullet[];
  pickups: Pickup[];
  texts: FloatText[];
  fx: Fx[];
  /** Sounds that happened this frame; the screen plays and clears them. */
  sfx: SfxId[];
  chest: Chest | null;
  shrine: { x: number; y: number; used: boolean } | null;
  choice: BoonId[] | null;
  boons: BoonId[];
  /** Mutya (boss charms) the party carries this run. */
  relics: RelicId[];
  boat: { x: number; y: number } | null;
  /** A yungib entrance on a cleared island. */
  caveDoor: { x: number; y: number } | null;
  /** Inside a cave: how deep, and the island to return to. */
  cave: { depth: number; surface: Surface } | null;
  /** The way on inside a cave (deeper, or back up after the guardian). */
  exit: { x: number; y: number } | null;
  /** Route indexes of islands that will have a cave (voyage mode). */
  caveStages: number[];
  route: RoomName[];
  stage: number;
  room: RoomName;
  grid: number[][];
  wave: number;
  waves: number;
  coins: number;
  kills: number;
  caves: number; // caves cleared
  time: number;
  shake: number;
  banner: { text: string; baybayin?: string; sub?: string; t: number } | null;
  dialog: { lines: DialogueLine[]; i: number } | null;
  npc: { x: number; y: number; talking: boolean; line: string } | null;
  result: 'dead' | 'victory' | null;
  nextId: number;
}

export interface Setup {
  players: { hero: HeroId; weapon?: WeaponId }[];
  mode?: Mode;
  difficulty?: 0 | 1 | 2;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const radius = (e: Enemy) => ENEMIES[e.type].radius * (e.scale ?? 1);

/** Heroes still standing. */
export const alive = (g: Game) => g.heroes.filter((h) => !h.down);

function nearestHero(g: Game, x: number, y: number) {
  let best = g.hero;
  let bd = Infinity;
  for (const h of alive(g)) {
    const d = dist(x, y, h.x, h.y);
    if (d < bd) {
      bd = d;
      best = h;
    }
  }
  return best;
}

/** The island theme of the current room, e.g. 'pulo2' or 'sulu'. */
function stageInfo(g: Game) {
  return STAGES[g.route[g.stage].replace(/_[ab]$/, '')] ?? STAGES.pulo1;
}

export function stageLabel(g: Game) {
  if (g.cave) return `${CAVE.title} ${g.cave.depth}/${CAVE_DEPTH}`;
  if (g.room === 'port') return 'TONDO';
  if (g.room === 'shore') return 'ALBAY';
  return stageInfo(g).title;
}

/** Voyage legs for a difficulty; the extra legs visit the islands the first legs passed over. */
function voyageRoute(legs: number): RoomName[] {
  const chosen = ROUTE_SLOTS.map((slot) => pick(slot));
  const skipped = ROUTE_SLOTS.flatMap((slot, i) => slot.filter((t) => t !== chosen[i]));
  const themes = [...chosen.slice(0, -1), ...skipped, chosen[chosen.length - 1]];
  // keep the first legs and the last one (Ibalong, before the shore); trim the middle to fit
  const middle = themes.slice(0, -1).slice(0, legs - 1);
  return ['port', ...[...middle, themes[themes.length - 1]].map((t) => `${t}_${pick(['a', 'b'])}` as RoomName), 'shore'];
}

const ALL_THEMES = ['pulo1', 'bohol', 'pulo2', 'sulu', 'pulo3', 'ifugao', 'taal', 'pulo4', 'palawan'];

/** The name on a boss's health bar. */
export function bossName(e: Enemy) {
  return e.type === 'bakunawa' ? BOSS_NAME : (CAVE_GUARDIANS[e.type]?.name ?? 'BANTAY');
}

/** Bless the whole party with a boss's charm. A charm already carried turns into gold. */
function applyRelic(g: Game, id: RelicId) {
  if (g.relics.includes(id)) {
    g.coins += 20;
    addText(g, g.hero.x, g.hero.y - 18, '+20 BARYA', '#ffe882');
    return;
  }
  g.relics.push(id);
  snd(g, 'relic');
  for (const h of g.heroes) {
    const m = h.mods;
    switch (id) {
      case 'pangil_bungisngis':
        m.dmg *= 1.25;
        break;
      case 'buhok_tikbalang':
        m.speed *= 1.2;
        m.dodgeCd *= 0.6;
        break;
      case 'mutya_kapre':
        h.maxHp += 2;
        if (!h.down) h.hp = Math.min(h.maxHp, h.hp + 2);
        break;
      case 'kaliskis_bakunawa':
        h.maxArmor += 3;
        h.armor = h.maxArmor;
        m.regen *= 2;
        break;
    }
    addFx(g, 'sparkle', h.x, h.y - 8);
  }
  addText(g, g.hero.x, g.hero.y - 20, RELICS[id].name.toUpperCase(), '#82eed6');
}

function makeHero(idx: number, heroId: HeroId, weapon?: WeaponId): Hero {
  const def = HEROES.find((h) => h.id === heroId)!;
  return {
    idx,
    def,
    weapon: weapon && LOOT_WEAPONS.includes(weapon) ? weapon : def.weapons[0],
    weaponLv: 0,
    shield: 0,
    x: ENTRY.x,
    y: ENTRY.y + idx * 14,
    hp: def.hp,
    maxHp: def.hp,
    armor: def.armor,
    maxArmor: def.armor,
    light: 0,
    facing: 1,
    aim: 0,
    moving: false,
    atkCd: 0,
    swing: 0,
    swingAim: 0,
    spin: 0,
    invuln: 0,
    sinceHit: 10,
    armorTick: 0,
    dodgeCd: 0,
    dash: 0,
    dashDx: 0,
    dashDy: 0,
    walk: 0,
    atkAnim: 0,
    dustAt: 0,
    lv: 1,
    xp: 0,
    down: false,
    revive: 0,
    mods: { dmg: 1, rate: 1, speed: 1, pierce: false, reach: 1, regen: 1, dodgeCd: 1, herbs: 0, harvest: false },
  };
}

/** Start a run. The two-argument form is kept for single-player callers and tests. */
export function newGame(setup: Setup | HeroId, weapon?: WeaponId): Game {
  const s: Setup = typeof setup === 'string' ? { players: [{ hero: setup, weapon }] } : setup;
  const mode = s.mode ?? 'voyage';
  const diff = DIFFICULTIES[s.difficulty ?? 1];
  const heroes = s.players.map((p, i) => makeHero(i, p.hero, p.weapon));
  const route = mode === 'endless' ? (['port', `${pick(['pulo1', 'pulo2'])}_a`] as RoomName[]) : voyageRoute(diff.legs);
  // one island in every voyage hides a cave; sometimes a second
  const islands = route.map((_, i) => i).filter((i) => i > 0 && i < route.length - 1);
  const caveStages = [pick(islands)];
  if (Math.random() < 0.5) caveStages.push(pick(islands));
  const g: Game = {
    heroes,
    hero: heroes[0],
    mode,
    diff,
    autoAttack: heroes.length > 1,
    enemies: [],
    bullets: [],
    pickups: [],
    texts: [],
    fx: [],
    sfx: [],
    chest: null,
    shrine: null,
    choice: null,
    boons: [],
    relics: [],
    boat: null,
    caveDoor: null,
    cave: null,
    exit: null,
    caveStages,
    route,
    stage: 0,
    room: 'port',
    grid: roomData.rooms.port.grid,
    wave: 0,
    waves: 0,
    coins: 0,
    kills: 0,
    caves: 0,
    time: 0,
    shake: 0,
    banner: null,
    dialog: null,
    npc: null,
    result: null,
    nextId: 1,
  };
  enterRoom(g, 0);
  return g;
}

function placeParty(g: Game, x: number, y: number) {
  for (const h of g.heroes) {
    h.x = x;
    h.y = y + (g.heroes.length > 1 ? (h.idx ? 8 : -8) : 0);
    h.spin = h.swing = h.dash = h.atkAnim = h.shield = 0;
  }
}

function resetRoom(g: Game) {
  g.enemies = [];
  g.bullets = [];
  g.pickups = [];
  g.fx = [];
  g.chest = null;
  g.shrine = null;
  g.boat = null;
  g.npc = null;
  g.caveDoor = null;
  g.exit = null;
  g.wave = 0;
}

function enterRoom(g: Game, stage: number) {
  // endless mode lays the route down one island ahead
  if (g.mode === 'endless') {
    while (g.route.length <= stage) {
      const next = g.route.length;
      g.route.push(next % ENDLESS_BOSS_EVERY === 0 ? 'shore' : (`${pick(ALL_THEMES)}_${pick(['a', 'b'])}` as RoomName));
    }
  }
  g.stage = stage;
  g.room = g.route[stage];
  g.grid = roomData.rooms[g.room].grid;
  resetRoom(g);
  placeParty(g, ENTRY.x, ENTRY.y);
  if (stage > 0) snd(g, 'sail');
  // a fallen hero gets back up on the next island with a little health
  for (const h of g.heroes) {
    if (h.down) {
      h.down = false;
      h.hp = Math.max(1, Math.floor(h.maxHp / 3));
    }
    if (h.mods.harvest && stage > 0) {
      h.hp = Math.min(h.maxHp, h.hp + 1);
      addText(g, h.x, h.y - 12, '+1 LAKAPATI', '#62b24a');
      addFx(g, 'heal', h.x, h.y - 4);
    }
    if (g.relics.includes('mutya_kapre') && stage > 0 && !h.down) {
      h.hp = Math.min(h.maxHp, h.hp + 1);
      addFx(g, 'heal', h.x, h.y - 4);
    }
  }
  if (g.room === 'port') {
    g.waves = 0;
    g.boat = { ...DOCK };
    const intro = g.mode === 'endless' ? ENDLESS : PORT;
    g.banner = { text: intro.title, baybayin: intro.baybayin, sub: intro.line, t: 3 };
    g.npc = { x: 5.5 * TILE, y: 6.2 * TILE, talking: false, line: HALIYA_LINES[0] };
  } else if (g.room === 'shore') {
    g.waves = 1;
    g.banner = { text: SHORE.title, baybayin: SHORE.baybayin, sub: g.mode === 'endless' ? `The Bakunawa rises again. Island ${stage}.` : SHORE.line, t: 3 };
    // the full exchange plays once; in endless the serpent just comes back
    if (g.mode === 'voyage' || stage === ENDLESS_BOSS_EVERY) g.dialog = { lines: bossDialogue(g.hero.def.id), i: 0 };
    spawnEnemy(g, 'bakunawa', 17 * TILE, 7 * TILE);
    snd(g, 'roar');
    g.wave = 1;
  } else {
    g.waves = 2;
    const info = stageInfo(g);
    const title = g.mode === 'endless' ? `${info.title} · ${stage}` : info.title;
    g.banner = { text: title, baybayin: info.baybayin, sub: info.line, t: 3.2 };
    spawnWave(g);
  }
}

/** Go down into the cave (depth 1) or one level deeper. */
function enterCave(g: Game) {
  if (!g.cave) {
    g.cave = { depth: 1, surface: { room: g.room, grid: g.grid, chest: g.chest, shrine: g.shrine, boat: g.boat, cave: g.caveDoor! } };
  } else {
    g.cave.depth++;
  }
  const rooms: RoomName[] = ['yungib_a', 'yungib_b', 'yungib_c'];
  g.room = rooms[(g.cave.depth - 1) % rooms.length];
  g.grid = roomData.rooms[g.room].grid;
  resetRoom(g);
  placeParty(g, ENTRY.x, ENTRY.y);
  snd(g, 'door');
  g.banner = { text: `${CAVE.title} ${g.cave.depth}/${CAVE_DEPTH}`, baybayin: CAVE.baybayin, sub: g.cave.depth === 1 ? CAVE.line : undefined, t: 2.4 };
  if (g.cave.depth === CAVE_DEPTH) {
    // the guardian depends on the island above: a laughing giant, a tikbalang chief or a kapre king
    g.waves = 1;
    g.wave = 1;
    const guardian = CAVE_GUARDIANS[THEME_GUARDIAN[g.route[g.stage].replace(/_[ab]$/, '')] ?? 'bungisngis'];
    spawnEnemy(g, guardian.type, 16 * TILE, 7.5 * TILE, true);
    snd(g, 'roar');
    for (let i = 0; i < 2; i++) {
      const p = randomFloor(g, 80);
      spawnEnemy(g, pick(stageInfo(g).pool), p.x, p.y);
    }
  } else {
    g.waves = 2;
    spawnWave(g);
  }
}

/** Climb back out to the island, which is just as the party left it (minus the cave). */
function leaveCave(g: Game) {
  const s = g.cave!.surface;
  g.cave = null;
  g.caves++;
  g.room = s.room;
  g.grid = s.grid;
  resetRoom(g);
  g.chest = s.chest;
  g.shrine = s.shrine;
  g.boat = s.boat;
  g.wave = g.waves = 2;
  placeParty(g, s.cave.x, s.cave.y + 14);
  snd(g, 'door');
  g.banner = { text: 'BALIK SA ISLA', sub: 'Back on the island. The balangay is waiting.', t: 2 };
}

// ---------------------------------------------------------------- map helpers
/** True where a body cannot walk: off the map, water, or an obstacle. */
export function solidAt(g: Game, x: number, y: number) {
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  if (ty < 0 || ty >= g.grid.length || tx < 0 || tx >= g.grid[0].length) return true;
  return g.grid[ty][tx] !== FLOOR;
}

/** True where a shot stops: off the map or an obstacle. Shots fly over water. */
function shotBlocked(g: Game, x: number, y: number) {
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  if (ty < 0 || ty >= g.grid.length || tx < 0 || tx >= g.grid[0].length) return true;
  const t = g.grid[ty][tx];
  return t !== FLOOR && t !== WATER;
}

function boxFree(g: Game, x: number, y: number, hw: number) {
  return (
    !solidAt(g, x - hw, y - 1) &&
    !solidAt(g, x + hw, y - 1) &&
    !solidAt(g, x - hw, y + 7) &&
    !solidAt(g, x + hw, y + 7)
  );
}

function moveBody(g: Game, o: { x: number; y: number }, dx: number, dy: number, hw: number) {
  if (boxFree(g, o.x + dx, o.y, hw)) o.x += dx;
  if (boxFree(g, o.x, o.y + dy, hw)) o.y += dy;
}

function lineOfSight(g: Game, ax: number, ay: number, bx: number, by: number) {
  const d = dist(ax, ay, bx, by);
  const steps = Math.ceil(d / 6);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (shotBlocked(g, ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
  }
  return true;
}

/** A free floor tile at least `minDist` from every hero (and clear of the given spots). */
function randomFloor(g: Game, minDist: number, avoid: { x: number; y: number }[] = []) {
  for (let i = 0; i < 300; i++) {
    const tx = 3 + Math.floor(Math.random() * (roomData.width - 6));
    const ty = 2 + Math.floor(Math.random() * (roomData.height - 4));
    if (g.grid[ty][tx] !== FLOOR || g.grid[ty + 1]?.[tx] !== FLOOR) continue;
    const x = (tx + 0.5) * TILE;
    const y = (ty + 0.5) * TILE;
    if (g.heroes.some((h) => dist(x, y, h.x, h.y) < minDist)) continue;
    if (avoid.some((a) => dist(x, y, a.x, a.y) < 28)) continue;
    return { x, y };
  }
  return { x: CENTER.x, y: CENTER.y };
}

// ---------------------------------------------------------------- spawning
function spawnEnemy(g: Game, type: EnemyType, x: number, y: number, boss = false) {
  const def = ENEMIES[type];
  const depth = g.cave ? 0.3 * g.cave.depth : 0;
  const scale = (1 + (g.stage - 1) * 0.15 + depth) * g.diff.hp * (g.heroes.length > 1 ? 1.4 : 1);
  const endlessBoss = g.mode === 'endless' ? 1 + (g.stage / ENDLESS_BOSS_EVERY - 1) * 0.5 : 1;
  let hp = type === 'bakunawa' ? Math.round(def.hp * g.diff.hp * (g.heroes.length > 1 ? 1.5 : 1) * endlessBoss) : Math.round(def.hp * scale);
  if (boss) hp = Math.round(hp * 5);
  g.enemies.push({
    id: g.nextId++,
    type,
    x,
    y,
    hp,
    maxHp: hp,
    cd: rand(0.8, 2),
    t: Math.random() * 10,
    spawn: type === 'bakunawa' || boss ? 1.2 : 0.7,
    flash: 0,
    facing: -1,
    poison: 0,
    poisonTick: 0,
    state: 0,
    scale: boss ? 1.9 : 1,
    boss,
  });
}

function spawnWave(g: Game) {
  g.wave++;
  const pool = g.cave ? [...stageInfo(g).pool, 'tiyanak', 'sigbin'] as EnemyType[] : stageInfo(g).pool;
  const n = Math.min(16, Math.max(2, 3 + Math.min(g.stage, 8) + (g.wave - 1) + g.diff.extra + (g.heroes.length - 1) * 2));
  for (let i = 0; i < n; i++) {
    const p = randomFloor(g, 90);
    spawnEnemy(g, pick(pool), p.x, p.y);
  }
}

function addText(g: Game, x: number, y: number, text: string, color: string) {
  g.texts.push({ id: g.nextId++, x, y, text, color, t: 0.8 });
}

function snd(g: Game, id: SfxId) {
  if (g.sfx.length < 24 && !g.sfx.includes(id)) g.sfx.push(id);
}

function addFx(g: Game, kind: FxKind, x: number, y: number, size?: number) {
  g.fx.push({ id: g.nextId++, kind, x, y, t: 0, size });
}

function dropPickup(g: Game, kind: PickupKind, x: number, y: number, weapon?: WeaponId, armed = true) {
  g.pickups.push({ id: g.nextId++, kind, x: x + rand(-4, 4), y: y + rand(-4, 4), t: 0, weapon, armed });
}

/** Open a kaban: gold, fireflies, maybe herbs, and a weapon or a whetstone (a big one holds both). */
function openChest(g: Game, c: Chest) {
  c.open = true;
  snd(g, 'chest');
  addFx(g, 'sparkle', c.x, c.y - 6);
  addText(g, c.x, c.y - 14, c.big ? 'MALAKING KABAN!' : 'KABAN!', '#ffe882');
  const coins = (c.big ? 12 : 4) + Math.floor(Math.random() * 4);
  for (let i = 0; i < coins; i++) dropPickup(g, 'coin', c.x, c.y + 8);
  for (let i = 0; i < (c.big ? 5 : 2); i++) dropPickup(g, 'energy_orb', c.x, c.y + 8);
  if (c.big || Math.random() < 0.4) dropPickup(g, 'potion_health', c.x, c.y + 8);
  const held = g.heroes.map((h) => h.weapon);
  const newWeapon = () => dropPickup(g, 'weapon', c.x + rand(-10, 10), c.y + 12, pick(LOOT_WEAPONS.filter((w) => !held.includes(w))));
  if (c.big) {
    newWeapon();
    dropPickup(g, 'whetstone', c.x - 8, c.y + 14);
    dropPickup(g, 'whetstone', c.x + 8, c.y + 14);
  } else if (Math.random() < 0.55) newWeapon();
  else dropPickup(g, 'whetstone', c.x, c.y + 12);
}

function shoot(g: Game, x: number, y: number, angle: number, speed: number, dmg: number, fromHero: boolean, sprite: BulletSprite, r = 2.5, pierce = false, poison?: number, homing = false, explode?: number, owner?: number) {
  const v = fromHero ? speed : speed * g.diff.shot;
  g.bullets.push({
    id: g.nextId++,
    x,
    y,
    vx: Math.cos(angle) * v,
    vy: Math.sin(angle) * v,
    dmg,
    fromHero,
    owner,
    sprite,
    r,
    life: 2.5,
    pierce,
    poison,
    homing,
    explode,
    hit: pierce ? new Set() : undefined,
  });
}

function hurtHero(g: Game, h: Hero, dmg: number) {
  if (h.down || h.invuln > 0 || h.dash > 0 || g.result) return;
  let left = dmg;
  const absorbed = Math.min(h.armor, left);
  h.armor -= absorbed;
  left -= absorbed;
  h.hp -= left;
  h.invuln = 0.8;
  h.sinceHit = 0;
  g.shake = 0.25;
  snd(g, 'hurt');
  addText(g, h.x, h.y - 10, `-${dmg}`, left > 0 ? '#ff5a5a' : '#82eed6');
  if (h.hp <= 0) {
    h.hp = 0;
    h.down = true;
    h.revive = 0;
    if (g.heroes.length > 1 && alive(g).length > 0) addText(g, h.x, h.y - 16, 'TULONG!', '#ff8a7a');
    if (alive(g).length === 0) g.result = 'dead';
  }
}

/** XP for the whole party; each level adds health, damage and a little speed. */
function gainXp(g: Game, amount: number) {
  for (const h of g.heroes) {
    if (h.lv >= LEVEL_MAX) continue;
    h.xp += amount;
    while (h.lv < LEVEL_MAX && h.xp >= xpToNext(h.lv)) {
      h.xp -= xpToNext(h.lv);
      h.lv++;
      h.maxHp += 1;
      if (!h.down) h.hp = Math.min(h.maxHp, h.hp + 1);
      h.mods.dmg *= 1.08;
      h.mods.speed *= 1.02;
      addText(g, h.x, h.y - 18, `ANTAS ${h.lv}!`, '#ffe882');
      snd(g, 'levelup');
      addFx(g, 'sparkle', h.x, h.y - 8);
    }
  }
}

function damageEnemy(g: Game, e: Enemy, dmg: number, by: Hero = g.hero) {
  if (e.hp <= 0) return;
  const d = Math.round(dmg * by.mods.dmg * (1 + by.weaponLv * WEAPON_LV_BONUS) * 10) / 10;
  e.hp -= d;
  e.flash = 0.1;
  snd(g, 'hit');
  if (e.type === 'tiyanak' && e.state === 0) revealTiyanak(g, e);
  addFx(g, 'hit', e.x + rand(-3, 3), e.y + rand(-3, 3));
  by.light = Math.min(LIGHT_MAX, by.light + d * 1.3);
  addText(g, e.x, e.y - 10, `${Math.round(d)}`, '#ffffff');
  if (e.hp <= 0) killEnemy(g, e);
}

function revealTiyanak(g: Game, e: Enemy) {
  e.state = 1;
  e.cd = 0.5;
  addText(g, e.x, e.y - 12, 'TIYANAK!', '#ff8a7a');
}

/** The sigbin can only be seen, and so only be targeted, when a hero is close. */
export function sigbinVisible(g: Game, e: Enemy) {
  return e.type !== 'sigbin' || e.flash > 0 || alive(g).some((h) => dist(e.x, e.y, h.x, h.y) < 56);
}

function killEnemy(g: Game, e: Enemy) {
  g.kills++;
  snd(g, 'kill');
  addFx(g, 'poof', e.x, e.y, e.boss ? 36 : undefined);
  const def = ENEMIES[e.type];
  for (let i = 0; i < def.coins * (e.boss ? 4 : 1); i++) dropPickup(g, 'coin', e.x, e.y);
  const orbs = e.type === 'bakunawa' || e.boss ? 10 : 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < orbs; i++) dropPickup(g, 'energy_orb', e.x, e.y);
  if (Math.random() < 0.06 + g.hero.mods.herbs) dropPickup(g, 'potion_health', e.x, e.y);
  gainXp(g, Math.ceil(e.maxHp / 3));
  if (e.boss) {
    g.chest = { x: e.x, y: e.y, open: false, big: true };
    // set the mutya a little apart from the chest, on ground a hero can reach
    const spot = [[0, -28], [0, 28], [-28, 0], [28, 0], [0, -14], [0, 0]].map(([dx, dy]) => ({ x: e.x + dx, y: e.y + dy })).find((p) => boxFree(g, p.x, p.y, 4)) ?? { x: e.x, y: e.y };
    g.pickups.push({ id: g.nextId++, kind: 'relic', x: spot.x, y: spot.y, t: 0, relic: CAVE_GUARDIANS[e.type].relic });
    g.banner = { text: 'NATALO ANG BANTAY', sub: 'The guardian is down. Take its mutya and open the big kaban.', t: 2.6 };
  }
  if (e.type === 'bakunawa') {
    // the voyage ends the moment the serpent falls, so its scale goes straight to the party
    if (g.mode === 'voyage') applyRelic(g, 'kaliskis_bakunawa');
    else g.pickups.push({ id: g.nextId++, kind: 'relic', x: e.x, y: e.y, t: 0, relic: 'kaliskis_bakunawa' });
  }
}

// ---------------------------------------------------------------- blessings
function boonOptions(g: Game): BoonId[] {
  const left = (Object.keys(BOONS) as BoonId[]).filter((b) => !g.boons.includes(b));
  const out: BoonId[] = [];
  while (out.length < 3 && left.length) out.push(left.splice(Math.floor(Math.random() * left.length), 1)[0]);
  return out;
}

/** Apply the blessing the player picked at the dambana. Blessings are for the whole party. */
export function chooseBoon(g: Game, id: BoonId) {
  g.boons.push(id);
  g.choice = null;
  for (const h of g.heroes) {
    const m = h.mods;
    switch (id) {
      case 'apolaki':
        m.dmg *= 1.25;
        break;
      case 'mayari':
        m.pierce = true;
        m.reach *= 1.3;
        break;
      case 'tala':
        h.maxHp += 1;
        h.hp = Math.min(h.maxHp, h.hp + 1);
        break;
      case 'anitun_tabu':
        m.speed *= 1.15;
        m.dodgeCd *= 0.7;
        break;
      case 'dumakulem':
        h.maxArmor += 2;
        h.armor = h.maxArmor;
        break;
      case 'lakapati':
        m.harvest = true;
        m.herbs += 0.1;
        break;
      case 'aman_sinaya':
        m.rate *= 0.8;
        break;
      case 'lakan_bakod':
        m.regen *= 2;
        break;
    }
    addText(g, h.x, h.y - 14, BOONS[id].deity.toUpperCase(), '#ffe882');
  }
}

/** Moves the open dialogue on by one line; closes it after the last. */
export function advanceDialog(g: Game) {
  if (!g.dialog) return;
  g.dialog.i++;
  if (g.dialog.i >= g.dialog.lines.length) g.dialog = null;
}

// ---------------------------------------------------------------- update
const NO_INPUT: Input = { mx: 0, my: 0, attack: false, skill: false, dodge: false };

/** Advance the world. `inputs` holds one entry per player (a single Input works for one player). */
export function update(g: Game, inputs: Input | Input[], dt: number) {
  const ins = Array.isArray(inputs) ? inputs : [inputs];
  if (g.result) return;
  if (g.dialog || g.choice) {
    for (const i of ins) i.skill = i.dodge = false;
    return;
  }
  g.time += dt;
  g.shake = Math.max(0, g.shake - dt);
  if (g.banner) {
    g.banner.t -= dt;
    if (g.banner.t <= 0) g.banner = null;
  }
  for (const h of g.heroes) updateHero(g, h, ins[h.idx] ?? NO_INPUT, dt);
  updateRevives(g, dt);
  updateEnemies(g, dt);
  updateBullets(g, dt);
  updatePickups(g, dt);
  if (g.npc) {
    g.npc.talking = alive(g).some((h) => dist(h.x, h.y, g.npc!.x, g.npc!.y) < 36);
    if (g.npc.talking) g.npc.line = HALIYA_LINES[Math.floor(g.time / 4) % HALIYA_LINES.length];
  }
  for (const t of g.texts) {
    t.t -= dt;
    t.y -= 18 * dt;
  }
  g.texts = g.texts.filter((t) => t.t > 0);
  for (const f of g.fx) f.t += dt;
  g.fx = g.fx.filter((f) => f.t < FX_LIFE[f.kind]);

  // island flow: waves, then the chest, the shrine, maybe a cave, and the boat
  if (g.room !== 'port' && !g.boat && !g.exit && g.enemies.length === 0) {
    if (g.wave < g.waves) {
      spawnWave(g);
    } else if (g.cave) {
      g.exit = { ...DOCK };
      if (g.cave.depth < CAVE_DEPTH) g.banner = { text: 'MAY DAAN PABABA', sub: 'A way down. Take the steps to go deeper.', t: 2 };
    } else if (g.room === 'shore' && g.mode === 'voyage') {
      g.result = 'victory';
    } else {
      g.boat = { ...DOCK };
      g.shrine = { x: CENTER.x, y: CENTER.y - TILE, used: false };
      const spot = randomFloor(g, 40, [g.shrine, g.boat]);
      g.chest = { x: spot.x, y: spot.y, open: false };
      const hasCave = g.room === 'shore' ? false : g.mode === 'endless' ? g.stage % ENDLESS_CAVE_EVERY === 0 || Math.random() < 0.25 : g.caveStages.includes(g.stage);
      if (hasCave) {
        const door = randomFloor(g, 40, [g.shrine, g.boat, g.chest]);
        g.caveDoor = door;
      }
      g.banner = {
        text: 'THE ISLAND IS SAFE',
        sub: hasCave ? 'Open the kaban, visit the dambana. A cave opens below the island.' : 'Open the kaban, visit the dambana, then sail on.',
        t: 2.6,
      };
    }
  }
  const touching = (o: { x: number; y: number } | null, r: number) => !!o && alive(g).some((h) => dist(h.x, h.y, o.x, o.y) < r);
  if (g.chest && !g.chest.open && touching(g.chest, 14)) openChest(g, g.chest);
  if (g.shrine && !g.shrine.used && touching(g.shrine, 20)) {
    g.shrine.used = true;
    const opts = boonOptions(g);
    if (opts.length) g.choice = opts;
  }
  if (g.caveDoor && touching(g.caveDoor, 10)) {
    enterCave(g);
    return;
  }
  if (g.exit && touching(g.exit, 10)) {
    if (g.cave && g.cave.depth < CAVE_DEPTH) enterCave(g);
    else leaveCave(g);
    return;
  }
  if (g.boat && touching(g.boat, 10)) {
    if (g.mode === 'voyage' && g.stage + 1 >= g.route.length) g.result = 'victory';
    else enterRoom(g, g.stage + 1);
  }
}

/** A fallen hero stands back up after a teammate stays beside them long enough. */
function updateRevives(g: Game, dt: number) {
  for (const h of g.heroes) {
    if (!h.down) continue;
    const helper = alive(g).find((o) => dist(o.x, o.y, h.x, h.y) < 18);
    h.revive = helper ? h.revive + dt : Math.max(0, h.revive - dt * 0.5);
    if (h.revive >= REVIVE_TIME) {
      h.down = false;
      h.revive = 0;
      h.hp = Math.max(1, Math.ceil(h.maxHp / 2));
      h.invuln = 1.5;
      addText(g, h.x, h.y - 16, 'BUHAY!', '#62b24a');
      snd(g, 'heal');
      addFx(g, 'heal', h.x, h.y - 4);
    }
  }
}

function nearestTarget(g: Game, h: Hero) {
  let best: Enemy | null = null;
  let bd = 190;
  for (const e of g.enemies) {
    if (e.spawn > 0 || !sigbinVisible(g, e)) continue;
    const d = dist(h.x, h.y, e.x, e.y);
    if (d < bd && lineOfSight(g, h.x, h.y + 2, e.x, e.y)) {
      bd = d;
      best = e;
    }
  }
  return best;
}

function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

/** Melee strike: hits creatures in an arc and cuts enemy shots out of the air. */
function slash(g: Game, h: Hero, aim: number, reach: number, arc: number, dmg: number, poison?: number, knock?: number) {
  const cy = h.y + 3;
  for (const e of g.enemies) {
    if (e.spawn > 0 || e.hp <= 0) continue;
    const d = dist(h.x, cy, e.x, e.y);
    if (d < reach + radius(e) && angleDiff(Math.atan2(e.y - cy, e.x - h.x), aim) < arc) {
      damageEnemy(g, e, dmg, h);
      if (poison) {
        e.poison = poison;
        if (e.poisonTick <= 0) e.poisonTick = 0.5;
      }
      if (knock && e.type !== 'bakunawa' && !e.boss) push(g, e, h.x, cy, knock);
    }
  }
  for (const b of g.bullets) {
    if (b.fromHero) continue;
    if (dist(h.x, cy, b.x, b.y) < reach + 6 && angleDiff(Math.atan2(b.y - cy, b.x - h.x), aim) < arc) b.life = 0;
  }
}

/** Shove a creature directly away from a point, stopping at walls and water. */
function push(g: Game, e: Enemy, fx: number, fy: number, amount: number) {
  const d = dist(e.x, e.y, fx, fy) || 1;
  const steps = 4;
  for (let i = 0; i < steps; i++) moveBody(g, e, ((e.x - fx) / d) * (amount / steps), ((e.y - fy) / d) * (amount / steps), radius(e) - 1);
}

/** A lantaka ball bursting: hurts everything in the blast. */
function blast(g: Game, x: number, y: number, r: number, dmg: number, by: Hero) {
  addFx(g, 'boom', x, y, r * 1.4);
  snd(g, 'boom');
  g.shake = Math.max(g.shake, 0.12);
  for (const e of g.enemies) {
    if (e.spawn > 0 || e.hp <= 0) continue;
    if (dist(x, y, e.x, e.y) < r + radius(e)) damageEnemy(g, e, dmg, by);
  }
}

function updateHero(g: Game, h: Hero, input: Input, dt: number) {
  if (h.down) {
    input.skill = input.dodge = false;
    return;
  }
  const m = h.mods;
  h.invuln = Math.max(0, h.invuln - dt);
  h.atkCd = Math.max(0, h.atkCd - dt);
  h.dodgeCd = Math.max(0, h.dodgeCd - dt);
  h.swing = Math.max(0, h.swing - dt);
  h.atkAnim = Math.max(0, h.atkAnim - dt);
  h.shield = Math.max(0, h.shield - dt);
  if (h.shield > 0) {
    // the raised kalasag turns enemy shots back on the creatures that threw them
    for (const b of g.bullets) {
      if (b.fromHero || dist(b.x, b.y, h.x, h.y + 2) > 22) continue;
      b.fromHero = true;
      b.owner = h.idx;
      b.vx *= -1.4;
      b.vy *= -1.4;
      b.dmg = 3;
      b.pierce = false;
      b.life = 1.5;
    }
  }
  h.spin = Math.max(0, h.spin - dt);
  h.sinceHit += dt;

  // amulets recharge after a quiet moment
  if (h.sinceHit > 3 / m.regen && h.armor < h.maxArmor) {
    h.armorTick += dt * m.regen;
    if (h.armorTick >= 1) {
      h.armorTick = 0;
      h.armor++;
    }
  } else {
    h.armorTick = 0;
  }

  let mx = input.mx;
  let my = input.my;
  const mag = Math.hypot(mx, my);
  if (mag > 1) {
    mx /= mag;
    my /= mag;
  }

  // dodge (iwas): a short roll through danger
  if (input.dodge) {
    input.dodge = false;
    if (h.dodgeCd <= 0) {
      const m2 = Math.hypot(mx, my);
      h.dashDx = m2 > 0.1 ? mx / m2 : h.facing;
      h.dashDy = m2 > 0.1 ? my / m2 : 0;
      h.dash = DODGE_TIME;
      h.invuln = Math.max(h.invuln, 0.3);
      h.dodgeCd = 0.9 * m.dodgeCd;
      addFx(g, 'dust', h.x, h.y + 7);
      snd(g, 'dodge');
    }
  }
  if (h.dash > 0) {
    h.dash -= dt;
    moveBody(g, h, h.dashDx * 240 * dt, h.dashDy * 240 * dt, 5);
  } else {
    moveBody(g, h, mx * h.def.speed * m.speed * dt, my * h.def.speed * m.speed * dt, 5);
  }
  h.moving = mag > 0.15 || h.dash > 0;
  if (h.moving) h.walk += dt;
  if (h.moving && h.dash <= 0 && h.walk - h.dustAt > 0.3) {
    h.dustAt = h.walk;
    addFx(g, 'dust', h.x - h.facing * 3, h.y + 8);
  }

  const target = nearestTarget(g, h);
  if (target) h.aim = Math.atan2(target.y - h.y, target.x - h.x);
  else if (mag > 0.15) h.aim = Math.atan2(my, mx);
  h.facing = Math.cos(h.aim) < 0 ? -1 : 1;

  if (input.skill) {
    input.skill = false;
    if (h.light >= LIGHT_MAX) useSkill(g, h);
  }

  const w = WEAPONS[h.weapon];
  const wantsAttack = input.attack || (g.autoAttack && !!target && dist(h.x, h.y, target.x, target.y) < (w.melee ? w.radius * m.reach + 20 : 170));
  if (wantsAttack && h.atkCd <= 0) {
    if (w.melee) {
      slash(g, h, h.aim, w.radius * m.reach, ((w.arc ?? 75) * Math.PI) / 180, w.damage, w.poison, w.knock);
      h.swing = 0.14;
      h.swingAim = h.aim;
    } else {
      // shots leave from the weapon tip, or closer in when a foe is pressed against the hero
      const tip = target ? Math.min(9, Math.max(0, dist(h.x, h.y, target.x, target.y) - 8)) : 9;
      const gx = h.x + Math.cos(h.aim) * tip;
      const gy = h.y + 3 + Math.sin(h.aim) * tip;
      const n = w.count ?? 1;
      for (let i = 0; i < n; i++) {
        // a fan spreads evenly across the arc; a single shot wobbles inside it
        const a = n > 1 ? h.aim + w.spread * ((i / (n - 1)) * 2 - 1) : h.aim + rand(-w.spread, w.spread);
        shoot(g, gx, gy, a, w.speed, w.damage, true, w.sprite!, w.radius, w.pierce || m.pierce, w.poison, w.homing, w.explode, h.idx);
      }
    }
    h.atkCd = w.rate * m.rate;
    h.atkAnim = Math.min(0.2, h.atkCd);
    snd(g, w.melee ? 'slash' : w.explode ? 'cannon' : w.sprite === 'shot_spirit' || w.sprite === 'shot_chime' ? 'magic' : 'shoot');
  }
}

function useSkill(g: Game, h: Hero) {
  h.light = 0;
  snd(g, 'skill');
  switch (h.def.id) {
    case 'kidlat':
      slash(g, h, 0, 46 * h.mods.reach, Math.PI + 0.01, 14);
      h.spin = 0.35;
      h.invuln = Math.max(h.invuln, 0.4);
      g.shake = 0.2;
      addText(g, h.x, h.y - 14, 'BAGYO!', '#ffe882');
      break;
    case 'liksi':
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        shoot(g, h.x, h.y + 2, a, 260, 4, true, 'shot_arrow', 2.5, true, undefined, false, undefined, h.idx);
        shoot(g, h.x, h.y + 2, a + Math.PI / 24, 200, 4, true, 'shot_arrow', 2.5, true, undefined, false, undefined, h.idx);
      }
      break;
    case 'mayumi':
      for (let i = 0; i < 16; i++) shoot(g, h.x, h.y + 2, (i / 16) * Math.PI * 2, 150, 7, true, 'shot_spirit', 4, true, undefined, false, undefined, h.idx);
      g.shake = 0.15;
      break;
    case 'amihan':
      // Tambal heals the healer and every teammate nearby
      for (const o of alive(g)) {
        if (o !== h && dist(o.x, o.y, h.x, h.y) > 60) continue;
        o.hp = Math.min(o.maxHp, o.hp + 2);
        o.armor = o.maxArmor;
        addText(g, o.x, o.y - 14, '+2 TAMBAL', '#62b24a');
        addFx(g, 'heal', o.x, o.y - 4);
      }
      break;
    case 'banog':
      h.shield = 2.5;
      h.invuln = Math.max(h.invuln, 2.5);
      addText(g, h.x, h.y - 14, 'KALASAG!', '#ecc878');
      break;
    case 'dalisay':
      addFx(g, 'wave', h.x, h.y + 2, 150);
      g.shake = 0.2;
      for (const e of g.enemies) {
        if (e.spawn > 0 || e.hp <= 0 || dist(h.x, h.y, e.x, e.y) > 75) continue;
        damageEnemy(g, e, 8, h);
        if (e.type !== 'bakunawa' && !e.boss) push(g, e, h.x, h.y, 34);
      }
      for (const b of g.bullets) if (!b.fromHero && dist(h.x, h.y, b.x, b.y) < 75) b.life = 0;
      addText(g, h.x, h.y - 14, 'DALUYONG!', '#82eed6');
      break;
  }
}

// ---------------------------------------------------------------- creatures
/** BFS distance (in tiles) from the nearest standing hero to every walkable tile. */
function flowField(g: Game) {
  const H = g.grid.length;
  const W = g.grid[0].length;
  const field = new Array<number>(W * H).fill(Infinity);
  const queue: number[] = [];
  for (const h of alive(g)) {
    const sx = Math.floor(h.x / TILE);
    const sy = Math.floor((h.y + 3) / TILE);
    if (g.grid[sy]?.[sx] !== FLOOR) continue;
    field[sy * W + sx] = 0;
    queue.push(sy * W + sx);
  }
  for (let i = 0; i < queue.length; i++) {
    const c = queue[i];
    const cx = c % W;
    const cy = (c - cx) / W;
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + ox;
      const ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || g.grid[ny][nx] !== FLOOR) continue;
      const n = ny * W + nx;
      if (field[n] !== Infinity) continue;
      field[n] = field[c] + 1;
      queue.push(n);
    }
  }
  return field;
}

/** True when a body of half-width `hw` could walk the straight line between two points (no water or obstacles). */
function walkLine(g: Game, ax: number, ay: number, bx: number, by: number, hw: number) {
  const steps = Math.ceil(dist(ax, ay, bx, by) / 4);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (!boxFree(g, ax + (bx - ax) * t, ay + (by - ay) * t, hw)) return false;
  }
  return true;
}

/** Walk straight at the hero when the way is clear, otherwise down the flow field (around water and obstacles). */
function chaseDir(g: Game, e: Enemy, h: Hero, field: number[], ux: number, uy: number): [number, number] {
  if (walkLine(g, e.x, e.y, h.x, h.y, radius(e) - 1)) return [ux, uy];
  const W = g.grid[0].length;
  const tx = Math.floor(e.x / TILE);
  const ty = Math.floor((e.y + 3) / TILE);
  let best = field[ty * W + tx] ?? Infinity;
  let bx = 0;
  let by = 0;
  for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const v = field[(ty + oy) * W + (tx + ox)];
    if (v !== undefined && v < best) {
      best = v;
      bx = ox;
      by = oy;
    }
  }
  if (bx === 0 && by === 0) return [ux, uy];
  const cx = (tx + bx + 0.5) * TILE - e.x;
  const cy = (ty + by + 0.5) * TILE - (e.y + 3);
  const m = Math.hypot(cx, cy) || 1;
  return [cx / m, cy / m];
}

function updateEnemies(g: Game, dt: number) {
  const field = flowField(g);
  for (const e of g.enemies) {
    e.flash = Math.max(0, e.flash - dt);
    if (e.spawn > 0) {
      e.spawn -= dt;
      continue;
    }
    if (e.poison > 0) {
      e.poison -= dt;
      e.poisonTick -= dt;
      if (e.poisonTick <= 0) {
        e.poisonTick = 0.5;
        damageEnemy(g, e, 1);
      }
    }
    if (e.hp <= 0) continue;
    e.t += dt;
    e.cd -= dt;
    const def = ENEMIES[e.type];
    const h = nearestHero(g, e.x, e.y);
    const dx = h.x - e.x;
    const dy = h.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const [ux, uy] = chaseDir(g, e, h, field, dx / d, dy / d);
    e.facing = dx < 0 ? -1 : 1;
    const r = radius(e);
    const hw = r - 1;
    const aim = Math.atan2(dy, dx);

    switch (e.type) {
      case 'duwende': {
        const hop = Math.max(0, Math.sin(e.t * 5));
        moveBody(g, e, ux * def.speed * 1.8 * hop * dt, uy * def.speed * 1.8 * hop * dt, hw);
        break;
      }
      case 'manananggal': {
        const wob = Math.sin(e.t * 6) * 0.9;
        moveBody(g, e, (ux - uy * wob) * def.speed * dt, (uy + ux * wob) * def.speed * dt, hw);
        break;
      }
      case 'tikbalang': {
        const want = d > 80 ? 1 : d < 55 ? -1 : 0;
        const side = Math.sin(e.t * 1.3);
        moveBody(g, e, (ux * want - uy * side * 0.6) * def.speed * dt, (uy * want + ux * side * 0.6) * def.speed * dt, hw);
        if (e.cd <= 0 && d < 200 && lineOfSight(g, e.x, e.y, h.x, h.y)) {
          if (e.boss) {
            // the tikbalang chief: a three-shot volley, then a gallop straight at the nearest hero
            for (const off of [-0.18, 0, 0.18]) shoot(g, e.x, e.y + 2, aim + off, 110, 1, false, 'shot_enemy', 3);
            e.state = 1;
            e.cd = rand(1.1, 1.5);
          } else {
            shoot(g, e.x, e.y + 2, aim + rand(-0.1, 0.1), 85, 1, false, 'shot_enemy');
            e.cd = rand(1.4, 2.0);
          }
        }
        if (e.boss && e.state === 1 && e.cd > 0.6) moveBody(g, e, ux * def.speed * 5 * dt, uy * def.speed * 5 * dt, hw);
        else if (e.state === 1 && e.cd <= 0.6) e.state = 0;
        break;
      }
      case 'kapre': {
        const want = d > 100 ? 1 : d < 60 ? -1 : 0;
        moveBody(g, e, ux * want * def.speed * dt, uy * want * def.speed * dt, hw);
        if (e.cd <= 0 && d < 220 && lineOfSight(g, e.x, e.y, h.x, h.y)) {
          if (e.boss) {
            // the kapre king: a wide fan of cigar embers, and now and then a ring
            const n = 7;
            for (let i = 0; i < n; i++) shoot(g, e.x, e.y + 2, aim + (i - (n - 1) / 2) * 0.16, 80, 1, false, 'shot_enemy', 3);
            if (Math.random() < 0.35) for (let i = 0; i < 14; i++) shoot(g, e.x, e.y, (i / 14) * Math.PI * 2, 60, 1, false, 'shot_enemy', 3);
            e.cd = rand(1.3, 1.7);
          } else {
            for (const off of [-0.25, 0, 0.25]) shoot(g, e.x, e.y + 2, aim + off, 75, 1, false, 'shot_enemy');
            e.cd = rand(2, 2.6);
          }
        }
        break;
      }
      case 'tiyanak': {
        // sits crying until someone comes close, then lunges in short bursts
        if (e.state === 0) {
          if (d < 46) revealTiyanak(g, e);
          else if (e.cd <= 0) {
            addText(g, e.x, e.y - 10, 'uwaa...', '#d8cce4');
            e.cd = rand(2.5, 4);
          }
          break;
        }
        // between lunges it creeps in from range, or backs away after a bite
        const lunge = e.cd < 0.35;
        const pace = lunge ? 4 : d < 30 ? -0.8 : 0.6;
        moveBody(g, e, ux * def.speed * pace * dt, uy * def.speed * pace * dt, hw);
        if (e.cd <= 0) e.cd = rand(1.1, 1.6);
        break;
      }
      case 'sigbin': {
        // closes in unseen, bites, then backs off before the next pass
        if (e.state === 1) {
          moveBody(g, e, -ux * def.speed * 0.8 * dt, -uy * def.speed * 0.8 * dt, hw);
          if (e.cd <= 0) e.state = 0;
        } else {
          const weave = Math.sin(e.t * 4) * 0.7;
          moveBody(g, e, (ux - uy * weave) * def.speed * dt, (uy + ux * weave) * def.speed * dt, hw);
          if (d < r + 7) {
            e.state = 1;
            e.cd = 1.1;
          }
        }
        break;
      }
      case 'santelmo': {
        // drifts over water and walls alike, circling, and casts sparks in a cross
        const want = d > 80 ? 1 : d < 60 ? -1 : 0;
        const vx = (dx / d) * want - (dy / d) * 0.9;
        const vy = (dy / d) * want + (dx / d) * 0.9;
        e.x = Math.max(8, Math.min(ROOM_W - 8, e.x + vx * def.speed * dt));
        e.y = Math.max(8, Math.min(ROOM_H - 8, e.y + vy * def.speed * dt));
        if (e.cd <= 0) {
          const base = Math.floor(e.t) % 2 ? Math.PI / 4 : 0;
          for (let i = 0; i < 4; i++) shoot(g, e.x, e.y, base + (i * Math.PI) / 2, 70, 1, false, 'shot_enemy');
          e.cd = rand(2, 2.6);
        }
        break;
      }
      case 'bungisngis': {
        // lumbers in, laughs while winding up, then slams out a ring of shots
        if (e.state === 1) {
          if (e.cd <= 0) {
            const n = e.boss ? 20 : 12;
            for (let i = 0; i < n; i++) shoot(g, e.x, e.y + 4, (i / n) * Math.PI * 2 + e.t, e.boss ? 90 : 80, 1, false, 'shot_enemy', 3);
            if (e.boss) for (const off of [-0.2, 0, 0.2]) shoot(g, e.x, e.y + 4, aim + off, 120, 1, false, 'shot_enemy', 3);
            g.shake = Math.max(g.shake, e.boss ? 0.35 : 0.2);
            e.state = 0;
            e.cd = e.boss ? rand(1.4, 1.9) : rand(2.4, 3);
          }
          break;
        }
        moveBody(g, e, ux * def.speed * (e.boss ? 1.3 : 1) * dt, uy * def.speed * (e.boss ? 1.3 : 1) * dt, hw);
        if (e.cd <= 0 && d < (e.boss ? 140 : 90)) {
          e.state = 1;
          e.cd = 0.7;
          addText(g, e.x, e.y - 16 * (e.scale ?? 1), 'HA HA HA!', '#ffe882');
        }
        break;
      }
      case 'bakunawa':
        updateBoss(g, e, ux, uy, d, aim, dt);
        break;
    }
    const harmless = e.type === 'tiyanak' && e.state === 0;
    if (!harmless) for (const o of alive(g)) if (dist(o.x, o.y, e.x, e.y) < r + 5) hurtHero(g, o, def.contact);
  }
  g.enemies = g.enemies.filter((e) => e.hp > 0);
}

function updateBoss(g: Game, e: Enemy, ux: number, uy: number, d: number, aim: number, dt: number) {
  const def = ENEMIES.bakunawa;
  const enraged = e.hp < e.maxHp / 2;
  const want = d > 90 ? 1 : d < 50 ? -0.6 : 0.2;
  const side = Math.sin(e.t * 0.8);
  moveBody(g, e, (ux * want - uy * side) * def.speed * dt, (uy * want + ux * side) * def.speed * dt, 10);
  if (e.cd > 0) return;
  const pattern = Math.floor(e.t / 4) % 3;
  if (pattern === 0) {
    const n = enraged ? 18 : 12;
    for (let i = 0; i < n; i++) shoot(g, e.x, e.y, e.t + (i / n) * Math.PI * 2, 70, 1, false, 'shot_enemy', 3);
    e.cd = enraged ? 1.1 : 1.6;
  } else if (pattern === 1) {
    for (let i = -2; i <= 2; i++) shoot(g, e.x, e.y, aim + i * 0.18, 105, 1, false, 'shot_enemy', 3);
    e.cd = enraged ? 0.6 : 0.9;
  } else {
    if (g.enemies.length < (enraged ? 7 : 5)) {
      for (let i = 0; i < 2; i++) {
        const sx = e.x + rand(-20, 20);
        const sy = e.y + rand(-10, 10);
        // only summon onto walkable ground, never out over the water
        if (boxFree(g, sx, sy, 4)) spawnEnemy(g, 'manananggal', sx, sy);
        else spawnEnemy(g, 'manananggal', e.x, e.y);
      }
    }
    e.cd = 2.2;
  }
}

/** Turn a seeking shot toward the closest living creature, keeping its speed. */
function steer(g: Game, b: Bullet, dt: number) {
  let best: Enemy | null = null;
  let bd = 120;
  for (const e of g.enemies) {
    if (e.spawn > 0 || e.hp <= 0) continue;
    const d = dist(b.x, b.y, e.x, e.y);
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  if (!best) return;
  const speed = Math.hypot(b.vx, b.vy);
  const cur = Math.atan2(b.vy, b.vx);
  let diff = Math.atan2(best.y - b.y, best.x - b.x) - cur;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const turn = Math.max(-5 * dt, Math.min(5 * dt, diff));
  b.vx = Math.cos(cur + turn) * speed;
  b.vy = Math.sin(cur + turn) * speed;
}

function updateBullets(g: Game, dt: number) {
  for (const b of g.bullets) {
    const by = g.heroes[b.owner ?? 0] ?? g.hero;
    if (b.homing) steer(g, b, dt);
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (shotBlocked(g, b.x, b.y)) {
      b.life = 0;
      if (b.explode) blast(g, b.x, b.y, b.explode, b.dmg * 0.7, by);
      continue;
    }
    if (b.fromHero) {
      for (const e of g.enemies) {
        if (e.spawn > 0 || e.hp <= 0 || b.hit?.has(e.id)) continue;
        if (dist(b.x, b.y, e.x, e.y) < radius(e) + b.r) {
          damageEnemy(g, e, b.dmg, by);
          if (b.poison) {
            e.poison = b.poison;
            if (e.poisonTick <= 0) e.poisonTick = 0.5;
          }
          if (b.pierce) b.hit!.add(e.id);
          else {
            b.life = 0;
            if (b.explode) blast(g, b.x, b.y, b.explode, b.dmg * 0.7, by);
            break;
          }
        }
      }
    } else {
      for (const h of alive(g)) {
        if (dist(b.x, b.y, h.x, h.y + 2) < b.r + 4) {
          b.life = 0;
          hurtHero(g, h, b.dmg);
          break;
        }
      }
    }
  }
  g.bullets = g.bullets.filter((b) => b.life > 0);
  g.enemies = g.enemies.filter((e) => e.hp > 0);
}

function updatePickups(g: Game, dt: number) {
  const keep: Pickup[] = [];
  const standing = alive(g);
  for (const p of g.pickups) {
    p.t += dt;
    if (!standing.length) {
      keep.push(p);
      continue;
    }
    const h = nearestHero(g, p.x, p.y);
    const d = dist(h.x, h.y, p.x, p.y);
    if ((p.kind === 'coin' || p.kind === 'energy_orb') && d < 44) {
      p.x += ((h.x - p.x) / d) * 120 * dt;
      p.y += ((h.y - p.y) / d) * 120 * dt;
    }
    if (p.kind === 'weapon' && !p.armed && standing.every((o) => dist(o.x, o.y, p.x, p.y) > 14)) p.armed = true;
    if (d < 8 && p.kind === 'weapon') {
      if (!p.armed) {
        keep.push(p);
        continue;
      }
      // swap: the old weapon is left on the ground so the player can change their mind
      const old = h.weapon;
      h.weapon = p.weapon!;
      g.pickups.push({ id: g.nextId++, kind: 'weapon', x: p.x, y: p.y, t: 0, weapon: old, armed: false });
      addText(g, h.x, h.y - 14, WEAPONS[h.weapon].name.toUpperCase(), '#ffba48');
      snd(g, 'pickup');
      addFx(g, 'sparkle', h.x, h.y - 6);
      continue;
    }
    if (d < 10 && p.kind === 'relic') {
      applyRelic(g, p.relic!);
      continue;
    }
    if (d < 8) {
      if (p.kind === 'coin') {
        g.coins++;
        snd(g, 'coin');
      } else if (p.kind === 'energy_orb') {
        h.light = Math.min(LIGHT_MAX, h.light + 6);
        snd(g, 'pickup');
      } else if (p.kind === 'whetstone') {
        snd(g, 'levelup');
        if (h.weaponLv < WEAPON_LV_MAX) {
          h.weaponLv++;
          addText(g, h.x, h.y - 14, `HASA +${h.weaponLv}`, '#ffe882');
        } else {
          g.coins += 10;
          addText(g, h.x, h.y - 14, '+10 BARYA', '#ffe882');
        }
        addFx(g, 'sparkle', h.x, h.y - 6);
      } else {
        h.hp = Math.min(h.maxHp, h.hp + 2);
        addText(g, h.x, h.y - 12, '+2', '#62b24a');
        addFx(g, 'heal', h.x, h.y - 4);
        snd(g, 'heal');
      }
      continue;
    }
    keep.push(p);
  }
  g.pickups = keep;
}
