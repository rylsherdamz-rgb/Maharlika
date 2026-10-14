import roomData from './rooms.json';
import {
  BoonId,
  BOONS,
  BulletSprite,
  ENEMIES,
  EnemyType,
  HEROES,
  HeroDef,
  HeroId,
  LIGHT_MAX,
  WeaponId,
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
}

export interface Hero {
  def: HeroDef;
  weapon: WeaponId;
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
  atkAnim: number; // >0 while the attack pose is showing
  dustAt: number; // walk time of the last footstep puff
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
  homing?: boolean;
  hit?: Set<number>;
}

export type PickupKind = 'coin' | 'energy_orb' | 'potion_health';

export interface Pickup {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  t: number;
}

/** Short-lived sprite effects: footstep dust and impact sparks. */
export interface Fx {
  id: number;
  kind: 'dust' | 'hit';
  x: number;
  y: number;
  t: number; // seconds since it appeared
}
/** Seconds a dodge roll lasts. */
export const DODGE_TIME = 0.2;
export const FX_LIFE = { dust: 0.36, hit: 0.18 };

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
  fx: Fx[];
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
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function stageLabel(g: Game) {
  if (g.room === 'port') return 'TONDO';
  if (g.room === 'shore') return 'ALBAY';
  return STAGES[g.stage - 1].title;
}

export function newGame(heroId: HeroId, weapon?: WeaponId): Game {
  const def = HEROES.find((h) => h.id === heroId)!;
  const route: RoomName[] = ['port'];
  for (let i = 1; i <= STAGES.length; i++) route.push(pick([`pulo${i}_a`, `pulo${i}_b`]) as RoomName);
  route.push('shore');
  const g: Game = {
    hero: {
      def,
      weapon: weapon && def.weapons.includes(weapon) ? weapon : def.weapons[0],
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
      atkAnim: 0,
      dustAt: 0,
      mods: { dmg: 1, rate: 1, speed: 1, pierce: false, reach: 1, regen: 1, dodgeCd: 1, herbs: 0, harvest: false },
    },
    enemies: [],
    bullets: [],
    pickups: [],
    texts: [],
    fx: [],
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
  g.fx = [];
  g.shrine = null;
  g.boat = null;
  g.npc = null;
  h.x = ENTRY.x;
  h.y = ENTRY.y;
  h.spin = h.swing = h.dash = h.atkAnim = 0;
  g.wave = 0;
  if (h.mods.harvest && stage > 0) {
    h.hp = Math.min(h.maxHp, h.hp + 1);
    addText(g, h.x, h.y - 12, '+1 LAKAPATI', '#62b24a');
  }
  if (g.room === 'port') {
    g.waves = 0;
    g.boat = { ...DOCK };
    g.banner = { text: PORT.title, baybayin: PORT.baybayin, sub: PORT.line, t: 3 };
    g.npc = { x: 5.5 * TILE, y: 6.2 * TILE, talking: false, line: HALIYA_LINES[0] };
  } else if (g.room === 'shore') {
    g.waves = 1;
    g.banner = { text: SHORE.title, baybayin: SHORE.baybayin, sub: SHORE.line, t: 3 };
    g.dialog = { lines: bossDialogue(h.def.id), i: 0 };
    spawnEnemy(g, 'bakunawa', 17 * TILE, 7 * TILE);
    g.wave = 1;
  } else {
    g.waves = 2;
    const info = STAGES[stage - 1];
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
  const scale = 1 + (g.stage - 1) * 0.15;
  const hp = type === 'bakunawa' ? def.hp : Math.round(def.hp * scale);
  g.enemies.push({
    id: g.nextId++,
    type,
    x,
    y,
    hp,
    maxHp: hp,
    cd: rand(0.8, 2),
    t: Math.random() * 10,
    spawn: type === 'bakunawa' ? 1.2 : 0.7,
    flash: 0,
    facing: -1,
    poison: 0,
    poisonTick: 0,
    state: 0,
  });
}

function spawnWave(g: Game) {
  g.wave++;
  const pool = STAGES[Math.min(g.stage, STAGES.length) - 1].pool;
  const n = 3 + g.stage + (g.wave - 1);
  for (let i = 0; i < n; i++) {
    const p = randomFloor(g, 90);
    spawnEnemy(g, pick(pool), p.x, p.y);
  }
}

function addText(g: Game, x: number, y: number, text: string, color: string) {
  g.texts.push({ id: g.nextId++, x, y, text, color, t: 0.8 });
}

function addFx(g: Game, kind: Fx['kind'], x: number, y: number) {
  g.fx.push({ id: g.nextId++, kind, x, y, t: 0 });
}

function dropPickup(g: Game, kind: PickupKind, x: number, y: number) {
  g.pickups.push({ id: g.nextId++, kind, x: x + rand(-4, 4), y: y + rand(-4, 4), t: 0 });
}

function shoot(g: Game, x: number, y: number, angle: number, speed: number, dmg: number, fromHero: boolean, sprite: BulletSprite, r = 2.5, pierce = false, poison?: number, homing = false) {
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
    homing,
    hit: pierce ? new Set() : undefined,
  });
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
  if (h.hp <= 0) {
    h.hp = 0;
    g.result = 'dead';
  }
}

function damageEnemy(g: Game, e: Enemy, dmg: number) {
  if (e.hp <= 0) return;
  const d = Math.round(dmg * g.hero.mods.dmg * 10) / 10;
  e.hp -= d;
  e.flash = 0.1;
  if (e.type === 'tiyanak' && e.state === 0) revealTiyanak(g, e);
  addFx(g, 'hit', e.x + rand(-3, 3), e.y + rand(-3, 3));
  g.hero.light = Math.min(LIGHT_MAX, g.hero.light + d * 1.3);
  addText(g, e.x, e.y - 10, `${Math.round(d)}`, '#ffffff');
  if (e.hp <= 0) killEnemy(g, e);
}

function revealTiyanak(g: Game, e: Enemy) {
  e.state = 1;
  e.cd = 0.5;
  addText(g, e.x, e.y - 12, 'TIYANAK!', '#ff8a7a');
}

/** The sigbin can only be seen, and so only be targeted, when it is close. */
export function sigbinVisible(g: Game, e: Enemy) {
  return e.type !== 'sigbin' || e.flash > 0 || dist(e.x, e.y, g.hero.x, g.hero.y) < 56;
}

function killEnemy(g: Game, e: Enemy) {
  g.kills++;
  const def = ENEMIES[e.type];
  for (let i = 0; i < def.coins; i++) dropPickup(g, 'coin', e.x, e.y);
  const orbs = e.type === 'bakunawa' ? 10 : 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < orbs; i++) dropPickup(g, 'energy_orb', e.x, e.y);
  if (Math.random() < 0.06 + g.hero.mods.herbs) dropPickup(g, 'potion_health', e.x, e.y);
}

// ---------------------------------------------------------------- blessings
function boonOptions(g: Game): BoonId[] {
  const left = (Object.keys(BOONS) as BoonId[]).filter((b) => !g.boons.includes(b));
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
  }
  addText(g, h.x, h.y - 14, BOONS[id].deity.toUpperCase(), '#ffe882');
}

/** Moves the open dialogue on by one line; closes it after the last. */
export function advanceDialog(g: Game) {
  if (!g.dialog) return;
  g.dialog.i++;
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
  for (const f of g.fx) f.t += dt;
  g.fx = g.fx.filter((f) => f.t < FX_LIFE[f.kind]);

  // island flow: waves, then the shrine and the boat
  if (g.room !== 'port' && !g.boat && g.enemies.length === 0) {
    if (g.wave < g.waves) {
      spawnWave(g);
    } else if (g.room === 'shore') {
      g.result = 'victory';
    } else {
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
  if (g.boat && dist(g.hero.x, g.hero.y, g.boat.x, g.boat.y) < 10) {
    enterRoom(g, g.stage + 1);
  }
}

function nearestTarget(g: Game) {
  const h = g.hero;
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
  h.atkAnim = Math.max(0, h.atkAnim - dt);
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

  const target = nearestTarget(g);
  if (target) h.aim = Math.atan2(target.y - h.y, target.x - h.x);
  else if (mag > 0.15) h.aim = Math.atan2(my, mx);
  h.facing = Math.cos(h.aim) < 0 ? -1 : 1;

  if (input.skill) {
    input.skill = false;
    if (h.light >= LIGHT_MAX) useSkill(g, mx, my);
  }

  const w = WEAPONS[h.weapon];
  if (input.attack && h.atkCd <= 0) {
    if (w.melee) {
      slash(g, h.aim, w.radius * m.reach, ((w.arc ?? 75) * Math.PI) / 180, w.damage);
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
        shoot(g, gx, gy, a, w.speed, w.damage, true, w.sprite!, w.radius, w.pierce || m.pierce, w.poison, w.homing);
      }
    }
    h.atkCd = w.rate * m.rate;
    h.atkAnim = Math.min(0.2, h.atkCd);
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
    if (e.hp <= 0) continue;
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
          if (d < def.radius + 7) {
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
            for (let i = 0; i < 12; i++) shoot(g, e.x, e.y + 4, (i / 12) * Math.PI * 2 + e.t, 80, 1, false, 'shot_enemy', 3);
            g.shake = Math.max(g.shake, 0.2);
            e.state = 0;
            e.cd = rand(2.4, 3);
          }
          break;
        }
        moveBody(g, e, ux * def.speed * dt, uy * def.speed * dt, hw);
        if (e.cd <= 0 && d < 90) {
          e.state = 1;
          e.cd = 0.7;
          addText(g, e.x, e.y - 16, 'HA HA HA!', '#ffe882');
        }
        break;
      }
      case 'bakunawa':
        updateBoss(g, e, ux, uy, d, aim, dt);
        break;
    }
    const harmless = e.type === 'tiyanak' && e.state === 0;
    if (!harmless && d < def.radius + 5) hurtHero(g, def.contact);
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
  const h = g.hero;
  for (const b of g.bullets) {
    if (b.homing) steer(g, b, dt);
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
      if (p.kind === 'coin') g.coins++;
      else if (p.kind === 'energy_orb') h.light = Math.min(LIGHT_MAX, h.light + 6);
      else {
        h.hp = Math.min(h.maxHp, h.hp + 2);
        addText(g, h.x, h.y - 12, '+2', '#62b24a');
      }
      continue;
    }
    keep.push(p);
  }
  g.pickups = keep;
}
