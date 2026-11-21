import type { SfxId } from '../sounds';
import roomData from './rooms.json';
import {
  BASE_BOONS,
  BoonId,
  BOONS,
  BOSSES,
  BulletSprite,
  ENEMIES,
  EnemyType,
  HEROES,
  HeroDef,
  HeroId,
  LIGHT_MAX,
  WEAPONS,
} from './data';
import { bossDialogue, DialogueLine, HALIYA_LINES, PORT, SHORE, STAGES } from './story';

export const TILE = roomData.tile;
export const ROOM_W = roomData.width * TILE;
export const ROOM_H = roomData.height * TILE;
export type RoomName = keyof typeof roomData.rooms;

const FLOOR = 0;
const WATER = 4;
const ENTRY = { x: 2.5 * TILE, y: 7.5 * TILE };
const CENTER = { x: 11.5 * TILE, y: 7.5 * TILE };
const DOCK = { x: 20.5 * TILE, y: 7.5 * TILE };

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
  dawn: boolean; // Hanan
  crit: number; // Amanikable
  thrift: boolean; // Idiyanale
  revive: boolean; // Bathala
}

export interface Hero {
  def: HeroDef;
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
  swing: number; // >0 while a kampilan slash is showing
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
  /** >0 while turned half to stone by the Rabot's gaze (moves at half speed). */
  slow: number;
  /** Bathala's blessing has been spent. */
  revived: boolean;
  dodges: number;
  skills: number;
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
  /** Behavior state; meaning depends on the creature. */
  mode: number;
  timer: number;
  count: number;
  dx: number;
  dy: number;
  /** A practice target on the Tondo dock: never moves or hurts. */
  dummy?: boolean;
  /** Bakunawa has entered its last phase. */
  phase3?: boolean;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  fromHero: boolean;
  sprite: BulletSprite;
  r: number;
  life: number;
  pierce: boolean;
  poison?: number;
  hit?: Set<number>;
  /** The Rabot's stone gaze: slows instead of only hurting. */
  slow?: boolean;
}

export type PickupKind = 'coin' | 'energy_orb' | 'potion_health';

export interface Pickup {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  t: number;
}

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

export interface Game {
  hero: Hero;
  enemies: Enemy[];
  bullets: Bullet[];
  pickups: Pickup[];
  texts: FloatText[];
  shrine: { x: number; y: number; used: boolean } | null;
  choice: BoonId[] | null;
  boons: BoonId[];
  boat: { x: number; y: number } | null;
  route: RoomName[];
  stage: number;
  room: RoomName;
  grid: number[][];
  wave: number;
  waves: number;
  coins: number;
  kills: number;
  time: number;
  shake: number;
  banner: { text: string; baybayin?: string; sub?: string; t: number } | null;
  dialog: { lines: DialogueLine[]; i: number } | null;
  npc: { x: number; y: number; talking: boolean; line: string } | null;
  result: 'dead' | 'victory' | null;
  nextId: number;
  /** Sounds raised this frame; the screen plays and clears them. */
  sfx: SfxId[];
  /** Pulang Buwan (red moon) hard mode. */
  hard: boolean;
  skin: boolean;
  /** Blessings this run can offer. */
  allowed: BoonId[];
  tutorial: TutorialStep | null;
  /** Full-screen color flash for big moments. */
  flash: { color: string; t: number; max: number } | null;
  /** 0..1, the sky darkening during the Bakunawa's last phase. */
  dark: number;
}

export type TutorialStep = 'move' | 'attack' | 'dodge' | 'skill' | 'sail';

export interface RunOptions {
  hard?: boolean;
  skin?: boolean;
  /** Extra blessings unlocked with barya. */
  unlocked?: BoonId[];
  tutorial?: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const sound = (g: Game, id: SfxId) => {
  g.sfx.push(id);
};
const flash = (g: Game, color: string, t: number) => {
  g.flash = { color, t, max: t };
};

export function stageLabel(g: Game) {
  if (g.room === 'port') return 'TONDO';
  if (g.room === 'shore') return 'ALBAY';
  return STAGES[g.stage - 1].title;
}

export function newGame(heroId: HeroId, opts: RunOptions = {}): Game {
  const def = HEROES.find((h) => h.id === heroId)!;
  const route: RoomName[] = ['port'];
  for (let i = 1; i <= STAGES.length; i++) route.push(pick([`pulo${i}_a`, `pulo${i}_b`]) as RoomName);
  route.push('shore');
  const g: Game = {
    hero: {
      def,
      x: ENTRY.x,
      y: ENTRY.y,
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
      slow: 0,
      revived: false,
      dodges: 0,
      skills: 0,
      mods: { dmg: 1, rate: 1, speed: 1, pierce: false, reach: 1, regen: 1, dodgeCd: 1, herbs: 0, harvest: false, dawn: false, crit: 0, thrift: false, revive: false },
    },
    enemies: [],
    bullets: [],
    pickups: [],
    texts: [],
    shrine: null,
    choice: null,
    boons: [],
    boat: null,
    route,
    stage: 0,
    room: 'port',
    grid: roomData.rooms.port.grid,
    wave: 0,
    waves: 0,
    coins: 0,
    kills: 0,
    time: 0,
    shake: 0,
    banner: null,
    dialog: null,
    npc: null,
    result: null,
    nextId: 1,
    sfx: [],
    hard: !!opts.hard,
    skin: !!opts.skin,
    allowed: [...BASE_BOONS, ...(opts.unlocked ?? [])],
    tutorial: opts.tutorial ? 'move' : null,
    flash: null,
    dark: 0,
  };
  enterRoom(g, 0);
  return g;
}

function enterRoom(g: Game, stage: number) {
  const h = g.hero;
  g.stage = stage;
  g.room = g.route[stage];
  g.grid = roomData.rooms[g.room].grid;
  g.enemies = [];
  g.bullets = [];
  g.pickups = [];
  g.shrine = null;
  g.boat = null;
  g.npc = null;
  h.x = ENTRY.x;
  h.y = ENTRY.y;
  h.spin = h.swing = h.dash = 0;
  h.slow = 0;
  g.wave = 0;
  if (h.mods.dawn && stage > 0) h.light = Math.max(h.light, LIGHT_MAX / 2);
  if (stage > 0) sound(g, 'sail');
  if (h.mods.harvest && stage > 0) {
    h.hp = Math.min(h.maxHp, h.hp + 1);
    addText(g, h.x, h.y - 12, '+1 LAKAPATI', '#62b24a');
  }
  if (g.room === 'port') {
    g.waves = 0;
    g.boat = { ...DOCK };
    g.banner = { text: PORT.title, baybayin: PORT.baybayin, sub: PORT.line, t: 3 };
    g.npc = { x: 5.5 * TILE, y: 6.2 * TILE, talking: false, line: HALIYA_LINES[0] };
    if (g.tutorial) g.banner = null;
  } else if (g.room === 'shore') {
    g.waves = 1;
    g.banner = { text: SHORE.title, baybayin: SHORE.baybayin, sub: SHORE.line, t: 3 };
    g.dialog = { lines: bossDialogue(h.def.id), i: 0 };
    spawnEnemy(g, 'bakunawa', 17 * TILE, 7 * TILE);
    sound(g, 'roar');
    g.wave = 1;
  } else {
    const info = STAGES[stage - 1];
    g.waves = info.waves;
    g.banner = { text: info.title, baybayin: info.baybayin, sub: info.line, t: 3.2 };
    spawnWave(g);
  }
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

function randomFloor(g: Game, minDistFromHero: number) {
  for (let i = 0; i < 300; i++) {
    const tx = 3 + Math.floor(Math.random() * (roomData.width - 6));
    const ty = 2 + Math.floor(Math.random() * (roomData.height - 4));
    if (g.grid[ty][tx] !== FLOOR || g.grid[ty + 1]?.[tx] !== FLOOR) continue;
    const x = (tx + 0.5) * TILE;
    const y = (ty + 0.5) * TILE;
    if (dist(x, y, g.hero.x, g.hero.y) < minDistFromHero) continue;
    return { x, y };
  }
  return { x: CENTER.x, y: CENTER.y };
}

// ---------------------------------------------------------------- spawning
function spawnEnemy(g: Game, type: EnemyType, x: number, y: number) {
  const def = ENEMIES[type];
  const scale = BOSSES.includes(type) ? 1 : 1 + (g.stage - 1) * 0.15;
  const hp = Math.round(def.hp * scale * (g.hard ? 1.35 : 1));
  g.enemies.push({
    id: g.nextId++,
    type,
    x,
    y,
    hp,
    maxHp: hp,
    cd: rand(0.8, 2),
    t: Math.random() * 10,
    spawn: BOSSES.includes(type) ? 1.2 : 0.7,
    flash: 0,
    facing: -1,
    poison: 0,
    poisonTick: 0,
    mode: 0,
    timer: rand(0.5, 1.5),
    count: 0,
    dx: 0,
    dy: 0,
  });
  return g.enemies[g.enemies.length - 1];
}

function spawnWave(g: Game) {
  g.wave++;
  const info = STAGES[Math.min(g.stage, STAGES.length) - 1];
  const pool = info.pool;
  let n = 3 + g.stage + (g.wave - 1);
  if (info.miniboss && g.wave === g.waves) {
    const def = ENEMIES[info.miniboss];
    spawnEnemy(g, info.miniboss, CENTER.x + TILE * 4, CENTER.y);
    g.banner = { text: def.name.toUpperCase(), sub: MINIBOSS_LINES[info.miniboss] ?? '', t: 2.4 };
    sound(g, 'roar');
    flash(g, '#7e1e22', 0.35);
    n = 2;
  } else if (g.wave > 1) sound(g, 'wave');
  if (g.hard) n += 2;
  for (let i = 0; i < n; i++) {
    const p = randomFloor(g, 90);
    spawnEnemy(g, pick(pool), p.x, p.y);
  }
}

const MINIBOSS_LINES: Partial<Record<EnemyType, string>> = {
  aswang: 'By day a neighbor. By night, the beast.',
  rabot: 'Do not meet its eyes. The Ibalong remembers.',
};

function addText(g: Game, x: number, y: number, text: string, color: string) {
  g.texts.push({ id: g.nextId++, x, y, text, color, t: 0.8 });
}

function dropPickup(g: Game, kind: PickupKind, x: number, y: number) {
  g.pickups.push({ id: g.nextId++, kind, x: x + rand(-4, 4), y: y + rand(-4, 4), t: 0 });
}

function shoot(g: Game, x: number, y: number, angle: number, speed: number, dmg: number, fromHero: boolean, sprite: BulletSprite, r = 2.5, pierce = false, poison?: number) {
  if (!fromHero) {
    sound(g, 'enemy_shot');
    if (g.hard) speed *= 1.15;
  }
  g.bullets.push({
    id: g.nextId++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    dmg,
    fromHero,
    sprite,
    r,
    life: 2.5,
    pierce,
    poison,
    hit: pierce ? new Set() : undefined,
  });
  return g.bullets[g.bullets.length - 1];
}

function hurtHero(g: Game, dmg: number) {
  const h = g.hero;
  if (h.invuln > 0 || h.dash > 0 || g.result) return;
  let left = dmg;
  const absorbed = Math.min(h.armor, left);
  h.armor -= absorbed;
  left -= absorbed;
  h.hp -= left;
  h.invuln = 0.8;
  h.sinceHit = 0;
  g.shake = 0.25;
  addText(g, h.x, h.y - 10, `-${dmg}`, left > 0 ? '#ff5a5a' : '#82eed6');
  sound(g, left > 0 ? 'hurt' : 'block');
  if (left > 0) flash(g, '#ff2a2a', 0.18);
  if (h.hp <= 0 && h.mods.revive && !h.revived) {
    h.revived = true;
    h.hp = 2;
    h.invuln = 2;
    g.banner = { text: 'BATHALA', sub: 'Not yet, maharlika. Breathe.', t: 2 };
    flash(g, '#ffe882', 0.6);
    sound(g, 'heal');
    return;
  }
  if (h.hp <= 0) {
    h.hp = 0;
    g.result = 'dead';
    sound(g, 'death');
  }
}

function damageEnemy(g: Game, e: Enemy, dmg: number) {
  if (e.hp <= 0) return;
  const crit = Math.random() < g.hero.mods.crit;
  const d = Math.round(dmg * g.hero.mods.dmg * (crit ? 2 : 1) * 10) / 10;
  e.hp -= d;
  e.flash = 0.1;
  if (e.type === 'tiyanak' && e.mode === 0) revealTiyanak(g, e);
  g.hero.light = Math.min(LIGHT_MAX, g.hero.light + d * 1.3);
  addText(g, e.x, e.y - 10, crit ? `${Math.round(d)}!` : `${Math.round(d)}`, crit ? '#ffe882' : '#ffffff');
  if (e.hp <= 0) killEnemy(g, e);
  else sound(g, 'hit');
}

function killEnemy(g: Game, e: Enemy) {
  g.kills++;
  sound(g, BOSSES.includes(e.type) ? 'roar' : 'kill');
  if (e.dummy) return;
  if (BOSSES.includes(e.type)) {
    flash(g, '#ffffff', 0.3);
    g.shake = 0.4;
  }
  const def = ENEMIES[e.type];
  for (let i = 0; i < def.coins; i++) dropPickup(g, 'coin', e.x, e.y);
  const orbs = BOSSES.includes(e.type) ? 10 : 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < orbs; i++) dropPickup(g, 'energy_orb', e.x, e.y);
  if (Math.random() < 0.06 + g.hero.mods.herbs) dropPickup(g, 'potion_health', e.x, e.y);
}

// ---------------------------------------------------------------- blessings
function boonOptions(g: Game): BoonId[] {
  const left = g.allowed.filter((b) => !g.boons.includes(b));
  const out: BoonId[] = [];
  while (out.length < 3 && left.length) out.push(left.splice(Math.floor(Math.random() * left.length), 1)[0]);
  return out;
}

/** Apply the blessing the player picked at the dambana. */
export function chooseBoon(g: Game, id: BoonId) {
  const h = g.hero;
  const m = h.mods;
  g.boons.push(id);
  g.choice = null;
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
    case 'bathala':
      m.revive = true;
      break;
    case 'hanan':
      m.dawn = true;
      h.light = Math.max(h.light, LIGHT_MAX / 2);
      break;
    case 'amanikable':
      m.crit = 0.15;
      break;
    case 'idiyanale':
      m.thrift = true;
      break;
  }
  addText(g, h.x, h.y - 14, BOONS[id].deity.toUpperCase(), '#ffe882');
  sound(g, 'boon');
}

/** Moves the open dialogue on by one line; closes it after the last. */
export function advanceDialog(g: Game) {
  if (!g.dialog) return;
  g.dialog.i++;
  sound(g, 'talk');
  if (g.dialog.i >= g.dialog.lines.length) g.dialog = null;
}

// ---------------------------------------------------------------- update
export function update(g: Game, input: Input, dt: number) {
  if (g.result) return;
  if (g.dialog || g.choice) {
    input.skill = input.dodge = false;
    return;
  }
  g.time += dt;
  g.shake = Math.max(0, g.shake - dt);
  if (g.flash) {
    g.flash.t -= dt;
    if (g.flash.t <= 0) g.flash = null;
  }
  const boss = g.enemies.find((e) => e.phase3);
  g.dark += ((boss ? 1 : 0) - g.dark) * Math.min(1, dt * 2);
  if (g.banner) {
    g.banner.t -= dt;
    if (g.banner.t <= 0) g.banner = null;
  }
  updateHero(g, input, dt);
  updateEnemies(g, dt);
  updateBullets(g, dt);
  updatePickups(g, dt);
  if (g.npc) {
    g.npc.talking = dist(g.hero.x, g.hero.y, g.npc.x, g.npc.y) < 36;
    if (g.npc.talking) g.npc.line = HALIYA_LINES[Math.floor(g.time / 4) % HALIYA_LINES.length];
  }
  for (const t of g.texts) {
    t.t -= dt;
    t.y -= 18 * dt;
  }
  g.texts = g.texts.filter((t) => t.t > 0);

  // island flow: waves, then the shrine and the boat
  if (g.room !== 'port' && !g.boat && g.enemies.length === 0) {
    if (g.wave < g.waves) {
      spawnWave(g);
    } else if (g.room === 'shore') {
      g.result = 'victory';
      sound(g, 'victory');
    } else {
      sound(g, 'island_clear');
      g.boat = { ...DOCK };
      g.shrine = { x: CENTER.x, y: CENTER.y - TILE, used: false };
      g.banner = { text: 'THE ISLAND IS SAFE', sub: 'Visit the dambana, then sail on.', t: 2 };
    }
  }
  if (g.shrine && !g.shrine.used && dist(g.hero.x, g.hero.y, g.shrine.x, g.shrine.y) < 20) {
    g.shrine.used = true;
    const opts = boonOptions(g);
    if (opts.length) g.choice = opts;
  }
  if (g.tutorial) updateTutorial(g);
  if (g.boat && dist(g.hero.x, g.hero.y, g.boat.x, g.boat.y) < 10 && (!g.tutorial || g.tutorial === 'sail')) {
    g.tutorial = null;
    enterRoom(g, g.stage + 1);
  }
}

// ---------------------------------------------------------------- tutorial (first run, Tondo dock)
function updateTutorial(g: Game) {
  const h = g.hero;
  switch (g.tutorial) {
    case 'move':
      if (dist(h.x, h.y, ENTRY.x, ENTRY.y) > 40) {
        g.tutorial = 'attack';
        const e = spawnEnemy(g, 'duwende', h.x + 48, h.y);
        e.dummy = true;
        e.hp = e.maxHp = 6;
        sound(g, 'boon');
      }
      break;
    case 'attack':
      if (!g.enemies.some((e) => e.dummy)) {
        g.tutorial = 'dodge';
        sound(g, 'boon');
      }
      break;
    case 'dodge':
      if (h.dodges > 0) {
        g.tutorial = 'skill';
        h.light = LIGHT_MAX;
        sound(g, 'boon');
      }
      break;
    case 'skill':
      if (h.skills > 0) {
        g.tutorial = 'sail';
        sound(g, 'island_clear');
      }
      break;
  }
}

function nearestTarget(g: Game) {
  const h = g.hero;
  let best: Enemy | null = null;
  let bd = 190;
  for (const e of g.enemies) {
    if (e.spawn > 0) continue;
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
function slash(g: Game, aim: number, reach: number, arc: number, dmg: number) {
  const h = g.hero;
  const cy = h.y + 3;
  for (const e of g.enemies) {
    if (e.spawn > 0 || e.hp <= 0) continue;
    const d = dist(h.x, cy, e.x, e.y);
    if (d < reach + ENEMIES[e.type].radius && angleDiff(Math.atan2(e.y - cy, e.x - h.x), aim) < arc) damageEnemy(g, e, dmg);
  }
  for (const b of g.bullets) {
    if (b.fromHero) continue;
    if (dist(h.x, cy, b.x, b.y) < reach + 6 && angleDiff(Math.atan2(b.y - cy, b.x - h.x), aim) < arc) b.life = 0;
  }
}

function updateHero(g: Game, input: Input, dt: number) {
  const h = g.hero;
  const m = h.mods;
  h.invuln = Math.max(0, h.invuln - dt);
  h.atkCd = Math.max(0, h.atkCd - dt);
  h.dodgeCd = Math.max(0, h.dodgeCd - dt);
  h.swing = Math.max(0, h.swing - dt);
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
      h.dash = 0.2;
      h.invuln = Math.max(h.invuln, 0.3);
      h.dodgeCd = 0.9 * m.dodgeCd;
      h.dodges++;
      sound(g, 'dodge');
    }
  }
  if (h.dash > 0) {
    h.dash -= dt;
    moveBody(g, h, h.dashDx * 240 * dt, h.dashDy * 240 * dt, 5);
  } else {
    const slow = h.slow > 0 ? 0.5 : 1;
    moveBody(g, h, mx * h.def.speed * m.speed * slow * dt, my * h.def.speed * m.speed * slow * dt, 5);
  }
  h.slow = Math.max(0, h.slow - dt);
  h.moving = mag > 0.15 || h.dash > 0;
  if (h.moving) h.walk += dt;

  const target = nearestTarget(g);
  if (target) h.aim = Math.atan2(target.y - h.y, target.x - h.x);
  else if (mag > 0.15) h.aim = Math.atan2(my, mx);
  h.facing = Math.cos(h.aim) < 0 ? -1 : 1;

  if (input.skill) {
    input.skill = false;
    if (h.light >= LIGHT_MAX) {
      useSkill(g, mx, my);
      h.skills++;
      sound(g, 'skill');
      flash(g, '#ffe882', 0.25);
    }
  }

  const w = WEAPONS[h.def.weapon];
  if (input.attack && h.atkCd <= 0) {
    if (w.melee) {
      slash(g, h.aim, w.radius * m.reach, (75 * Math.PI) / 180, w.damage);
      h.swing = 0.14;
      h.swingAim = h.aim;
      sound(g, 'slash');
    } else {
      const gx = h.x + Math.cos(h.aim) * 9;
      const gy = h.y + 3 + Math.sin(h.aim) * 9;
      shoot(g, gx, gy, h.aim + rand(-w.spread, w.spread), w.speed, w.damage, true, w.sprite!, w.radius, w.pierce || m.pierce, w.poison);
      sound(g, w.sprite === 'shot_arrow' ? 'bow' : w.sprite === 'shot_dart' ? 'dart' : 'orb');
    }
    h.atkCd = w.rate * m.rate;
  }
}

function useSkill(g: Game, mx: number, my: number) {
  const h = g.hero;
  h.light = 0;
  switch (h.def.id) {
    case 'kidlat':
      slash(g, 0, 46 * h.mods.reach, Math.PI + 0.01, 14);
      h.spin = 0.35;
      h.invuln = Math.max(h.invuln, 0.4);
      g.shake = 0.2;
      addText(g, h.x, h.y - 14, 'BAGYO!', '#ffe882');
      break;
    case 'liksi':
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        shoot(g, h.x, h.y + 2, a, 260, 4, true, 'shot_arrow', 2.5, true);
        shoot(g, h.x, h.y + 2, a + Math.PI / 24, 200, 4, true, 'shot_arrow', 2.5, true);
      }
      break;
    case 'mayumi':
      for (let i = 0; i < 16; i++) shoot(g, h.x, h.y + 2, (i / 16) * Math.PI * 2, 150, 7, true, 'shot_spirit', 4, true);
      g.shake = 0.15;
      break;
    case 'amihan':
      h.hp = Math.min(h.maxHp, h.hp + 2);
      h.armor = h.maxArmor;
      addText(g, h.x, h.y - 14, '+2 TAMBAL', '#62b24a');
      sound(g, 'heal');
      break;
  }
}

// ---------------------------------------------------------------- creatures
/** BFS distance (in tiles) from the hero's tile to every walkable tile. */
function flowField(g: Game) {
  const H = g.grid.length;
  const W = g.grid[0].length;
  const field = new Array<number>(W * H).fill(Infinity);
  const sx = Math.floor(g.hero.x / TILE);
  const sy = Math.floor((g.hero.y + 3) / TILE);
  if (g.grid[sy]?.[sx] !== FLOOR) return field;
  const queue = [sy * W + sx];
  field[queue[0]] = 0;
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

/** Walk straight at the hero when in sight, otherwise down the flow field. */
function chaseDir(g: Game, e: Enemy, field: number[], ux: number, uy: number): [number, number] {
  if (lineOfSight(g, e.x, e.y + 3, g.hero.x, g.hero.y + 3)) return [ux, uy];
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
  const h = g.hero;
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
    if (e.hp <= 0 || e.dummy) continue;
    e.t += dt;
    e.cd -= dt;
    const def = ENEMIES[e.type];
    const dx = h.x - e.x;
    const dy = h.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const [ux, uy] = chaseDir(g, e, field, dx / d, dy / d);
    e.facing = dx < 0 ? -1 : 1;
    const hw = def.radius - 1;
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
          shoot(g, e.x, e.y + 2, aim + rand(-0.1, 0.1), 85, 1, false, 'shot_enemy');
          e.cd = rand(1.4, 2.0);
        }
        break;
      }
      case 'kapre': {
        const want = d > 100 ? 1 : d < 60 ? -1 : 0;
        moveBody(g, e, ux * want * def.speed * dt, uy * want * def.speed * dt, hw);
        if (e.cd <= 0 && d < 220 && lineOfSight(g, e.x, e.y, h.x, h.y)) {
          for (const off of [-0.25, 0, 0.25]) shoot(g, e.x, e.y + 2, aim + off, 75, 1, false, 'shot_enemy');
          e.cd = rand(2, 2.6);
        }
        break;
      }
      case 'sigbin': {
        // 0: stalk, half-seen in the dark; 1: freeze and glare; 2: lunge
        e.timer -= dt;
        if (e.mode === 0) {
          moveBody(g, e, ux * def.speed * dt, uy * def.speed * dt, hw);
          if (d < 72 && e.timer <= 0 && lineOfSight(g, e.x, e.y, h.x, h.y)) {
            e.mode = 1;
            e.timer = 0.45;
          }
        } else if (e.mode === 1) {
          if (e.timer <= 0) {
            e.mode = 2;
            e.timer = 0.38;
            e.dx = dx / d;
            e.dy = dy / d;
          }
        } else {
          moveBody(g, e, e.dx * 175 * dt, e.dy * 175 * dt, hw);
          if (e.timer <= 0) {
            e.mode = 0;
            e.timer = rand(1.4, 2);
          }
        }
        break;
      }
      case 'tiyanak': {
        // 0: a crying bundle; 1: revealed, hopping fast
        if (e.mode === 0) {
          if (d < 46) revealTiyanak(g, e);
          break;
        }
        const hop = Math.max(0, Math.sin(e.t * 9));
        moveBody(g, e, ux * def.speed * 1.6 * hop * dt, uy * def.speed * 1.6 * hop * dt, hw);
        break;
      }
      case 'aswang':
        updateAswang(g, e, ux, uy, dx, dy, d, aim, dt);
        break;
      case 'rabot':
        updateRabot(g, e, ux, uy, d, aim, dt);
        break;
      case 'bakunawa':
        updateBoss(g, e, ux, uy, d, aim, dt);
        break;
    }
    const harmless = e.type === 'tiyanak' && e.mode === 0;
    if (d < def.radius + 5 && !harmless) hurtHero(g, def.contact);
  }
  g.enemies = g.enemies.filter((e) => e.hp > 0);
}

function revealTiyanak(g: Game, e: Enemy) {
  e.mode = 1;
  e.flash = 0.2;
  addText(g, e.x, e.y - 12, 'TIYANAK!', '#ff8a7a');
  sound(g, 'hurt');
}

/** Aswang: stalks and throws curses as a person, then turns beast and charges three times. */
function updateAswang(g: Game, e: Enemy, ux: number, uy: number, dx: number, dy: number, d: number, aim: number, dt: number) {
  const def = ENEMIES.aswang;
  const enraged = e.hp < e.maxHp / 2;
  e.timer -= dt;
  if (e.mode === 0) {
    // human form: keep a distance and throw a fan of curses
    const want = d > 100 ? 1 : d < 70 ? -1 : 0;
    const side = Math.sin(e.t * 1.1);
    moveBody(g, e, (ux * want - uy * side * 0.7) * def.speed * dt, (uy * want + ux * side * 0.7) * def.speed * dt, 8);
    if (e.cd <= 0) {
      const n = enraged ? 5 : 3;
      for (let i = 0; i < n; i++) shoot(g, e.x, e.y, aim + (i - (n - 1) / 2) * 0.22, 85, 1, false, 'shot_enemy', 3);
      e.cd = enraged ? 1.1 : 1.5;
    }
    if (e.timer <= 0) {
      e.mode = 1;
      e.count = enraged ? 3 : 2;
      e.timer = 0.7;
      addText(g, e.x, e.y - 16, 'ASWANG!', '#ff5a5a');
      sound(g, 'roar');
    }
  } else if (e.mode === 1) {
    // beast form: crouch and glare (the warning), then charge
    if (e.timer <= 0) {
      e.mode = 2;
      e.timer = 0.42;
      e.dx = dx / d;
      e.dy = dy / d;
      sound(g, 'dodge');
    }
  } else {
    moveBody(g, e, e.dx * (enraged ? 200 : 170) * dt, e.dy * (enraged ? 200 : 170) * dt, 8);
    if (e.timer <= 0) {
      e.count--;
      if (e.count > 0) {
        e.mode = 1;
        e.timer = enraged ? 0.5 : 0.6;
      } else {
        e.mode = 0;
        e.timer = enraged ? 4 : 5.5;
        e.cd = 0.8;
      }
    }
  }
}

/** Rabot: slow and heavy; its gaze sends out rings of stone that slow you. */
function updateRabot(g: Game, e: Enemy, ux: number, uy: number, d: number, aim: number, dt: number) {
  const def = ENEMIES.rabot;
  const enraged = e.hp < e.maxHp / 2;
  const want = d > 70 ? 1 : d < 40 ? -0.5 : 0;
  moveBody(g, e, ux * want * def.speed * dt, uy * want * def.speed * dt, 9);
  if (e.cd > 0) return;
  e.count++;
  if (e.count % 3 === 0) {
    for (let i = 0; i < 2; i++) {
      const p = randomFloor(g, 50);
      spawnEnemy(g, 'duwende', p.x, p.y);
    }
    addText(g, e.x, e.y - 16, 'TABI-TABI PO!', '#ffba48');
    e.cd = 1.6;
    return;
  }
  const n = enraged ? 14 : 10;
  const off = Math.random() * Math.PI;
  for (let i = 0; i < n; i++) {
    const b = shoot(g, e.x, e.y, off + (i / n) * Math.PI * 2, 60, 1, false, 'shot_enemy', 3.5);
    b.slow = true;
  }
  if (enraged) for (const o of [-0.15, 0, 0.15]) shoot(g, e.x, e.y, aim + o, 115, 1, false, 'shot_enemy', 3);
  e.cd = enraged ? 1.7 : 2.3;
}

function updateBoss(g: Game, e: Enemy, ux: number, uy: number, d: number, aim: number, dt: number) {
  const def = ENEMIES.bakunawa;
  const enraged = e.hp < e.maxHp / 2;
  if (!e.phase3 && e.hp < e.maxHp / 4) {
    // Lamon: the serpent opens its jaws for the last moon
    e.phase3 = true;
    e.cd = 1.2;
    g.banner = { text: 'LAMON', sub: 'The serpent opens its jaws for the moon. Hold!', t: 2.4 };
    flash(g, '#c0202a', 0.6);
    g.shake = 0.6;
    sound(g, 'roar');
    for (let i = 0; i < 4; i++) {
      const p = randomFloor(g, 60);
      spawnEnemy(g, 'manananggal', p.x, p.y);
    }
  }
  if (e.phase3) {
    const want = d > 80 ? 1 : d < 50 ? -0.6 : 0.3;
    const side = Math.sin(e.t * 1.2);
    moveBody(g, e, (ux * want - uy * side) * def.speed * 1.3 * dt, (uy * want + ux * side) * def.speed * 1.3 * dt, 10);
    if (e.cd > 0) return;
    if (Math.floor(e.t / 3) % 2 === 0) {
      // spiral of two arms
      const a = e.t * 2.4;
      shoot(g, e.x, e.y, a, 80, 1, false, 'shot_enemy', 3);
      shoot(g, e.x, e.y, a + Math.PI, 80, 1, false, 'shot_enemy', 3);
      e.cd = 0.11;
    } else {
      for (let i = -3; i <= 3; i++) shoot(g, e.x, e.y, aim + i * 0.15, 110, 1, false, 'shot_enemy', 3);
      e.cd = 0.75;
    }
    return;
  }
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

function updateBullets(g: Game, dt: number) {
  const h = g.hero;
  for (const b of g.bullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (shotBlocked(g, b.x, b.y)) {
      b.life = 0;
      continue;
    }
    if (b.fromHero) {
      for (const e of g.enemies) {
        if (e.spawn > 0 || e.hp <= 0 || b.hit?.has(e.id)) continue;
        if (dist(b.x, b.y, e.x, e.y) < ENEMIES[e.type].radius + b.r) {
          damageEnemy(g, e, b.dmg);
          if (b.poison) {
            e.poison = b.poison;
            if (e.poisonTick <= 0) e.poisonTick = 0.5;
          }
          if (b.pierce) b.hit!.add(e.id);
          else {
            b.life = 0;
            break;
          }
        }
      }
    } else if (dist(b.x, b.y, h.x, h.y + 2) < b.r + 4) {
      b.life = 0;
      if (b.slow && h.dash <= 0) h.slow = 1.6;
      hurtHero(g, b.dmg);
    }
  }
  g.bullets = g.bullets.filter((b) => b.life > 0);
  g.enemies = g.enemies.filter((e) => e.hp > 0);
}

function updatePickups(g: Game, dt: number) {
  const h = g.hero;
  const keep: Pickup[] = [];
  for (const p of g.pickups) {
    p.t += dt;
    const d = dist(h.x, h.y, p.x, p.y);
    if ((p.kind === 'coin' || p.kind === 'energy_orb') && d < 44) {
      p.x += ((h.x - p.x) / d) * 120 * dt;
      p.y += ((h.y - p.y) / d) * 120 * dt;
    }
    if (d < 8) {
      if (p.kind === 'coin') {
        g.coins += h.mods.thrift && Math.random() < 0.5 ? 2 : 1;
        sound(g, 'coin');
      } else if (p.kind === 'energy_orb') {
        h.light = Math.min(LIGHT_MAX, h.light + 6);
        sound(g, 'light');
      } else {
        sound(g, 'heal');
        h.hp = Math.min(h.maxHp, h.hp + 2);
        addText(g, h.x, h.y - 12, '+2', '#62b24a');
      }
      continue;
    }
    keep.push(p);
  }
  g.pickups = keep;
}
