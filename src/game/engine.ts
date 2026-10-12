import roomData from './rooms.json';
import {
  BulletSprite,
  ENEMIES,
  EnemyType,
  HEROES,
  HeroDef,
  HeroId,
  WEAPONS,
  WeaponId,
} from './data';

export const TILE = roomData.tile;
export const ROOM_W = roomData.width * TILE;
export const ROOM_H = roomData.height * TILE;
export type RoomName = keyof typeof roomData.rooms;

const COMBAT_ROOMS: RoomName[] = ['room_a', 'room_b', 'room_c', 'room_d', 'room_e'];
const COMBAT_STAGES = 4;
const ENTRY = { x: 2.5 * TILE, y: 7.5 * TILE };
const CENTER = { x: 11.5 * TILE, y: 7.5 * TILE };

export interface Hero {
  def: HeroDef;
  x: number;
  y: number;
  hp: number;
  armor: number;
  energy: number;
  facing: 1 | -1;
  aim: number;
  moving: boolean;
  weapons: WeaponId[];
  cur: number;
  fireCd: number;
  invuln: number;
  sinceHit: number;
  armorTick: number;
  skillCd: number;
  buff: number; // dual wield timer
  dash: number;
  dashDx: number;
  dashDy: number;
  walk: number;
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
  hit?: Set<number>;
}

export type PickupKind = 'coin' | 'energy_orb' | 'potion_health' | 'potion_energy' | WeaponId;

export interface Pickup {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  t: number;
  lock: number; // seconds before it can be collected (dropped weapons)
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
  mx: number; // -1..1
  my: number;
  fire: boolean;
  skill: boolean; // edge-triggered, cleared by engine
  swap: boolean; // edge-triggered, cleared by engine
}

export interface Game {
  hero: Hero;
  enemies: Enemy[];
  bullets: Bullet[];
  pickups: Pickup[];
  texts: FloatText[];
  chest: { x: number; y: number; open: boolean } | null;
  portal: { x: number; y: number } | null;
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
  banner: { text: string; t: number } | null;
  result: 'dead' | 'victory' | null;
  nearWeapon: Pickup | null;
  nextId: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function stageLabel(g: Game) {
  if (g.room === 'start') return 'PLAZA';
  if (g.room === 'boss') return 'SHORE';
  return `PUROK ${g.stage}`;
}

export function newGame(heroId: HeroId): Game {
  const def = HEROES.find((h) => h.id === heroId)!;
  const route: RoomName[] = ['start', ...shuffle(COMBAT_ROOMS).slice(0, COMBAT_STAGES), 'boss'];
  const g: Game = {
    hero: {
      def,
      x: ENTRY.x,
      y: ENTRY.y,
      hp: def.hp,
      armor: def.armor,
      energy: def.energy,
      facing: 1,
      aim: 0,
      moving: false,
      weapons: [...def.weapons],
      cur: 0,
      fireCd: 0,
      invuln: 0,
      sinceHit: 10,
      armorTick: 0,
      skillCd: 0,
      buff: 0,
      dash: 0,
      dashDx: 0,
      dashDy: 0,
      walk: 0,
    },
    enemies: [],
    bullets: [],
    pickups: [],
    texts: [],
    chest: null,
    portal: null,
    route,
    stage: 0,
    room: 'start',
    grid: roomData.rooms.start.grid,
    wave: 0,
    waves: 0,
    coins: 0,
    kills: 0,
    time: 0,
    shake: 0,
    banner: null,
    result: null,
    nearWeapon: null,
    nextId: 1,
  };
  enterRoom(g, 0);
  return g;
}

function enterRoom(g: Game, stage: number) {
  g.stage = stage;
  g.room = g.route[stage];
  g.grid = roomData.rooms[g.room].grid;
  g.enemies = [];
  g.bullets = [];
  g.pickups = [];
  g.chest = null;
  g.portal = null;
  g.hero.x = ENTRY.x;
  g.hero.y = ENTRY.y;
  g.wave = 0;
  if (g.room === 'start') {
    g.waves = 0;
    g.portal = { ...CENTER };
    g.banner = { text: 'STEP INTO THE SPIRIT GATE', t: 3 };
  } else if (g.room === 'boss') {
    g.waves = 1;
    g.banner = { text: 'THE BAKUNAWA RISES', t: 2.5 };
    spawnEnemy(g, 'bakunawa', 17.5 * TILE, 7 * TILE);
    g.wave = 1;
  } else {
    g.waves = 2;
    g.banner = { text: stageLabel(g), t: 2 };
    spawnWave(g);
  }
}

// ---------------------------------------------------------------- map helpers
export function solidAt(g: Game, x: number, y: number) {
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  if (ty < 0 || ty >= g.grid.length || tx < 0 || tx >= g.grid[0].length) return true;
  return g.grid[ty][tx] !== 0;
}

function boxFree(g: Game, x: number, y: number, hw: number) {
  // collision box covers the lower body (feet) of the sprite
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
    if (solidAt(g, ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
  }
  return true;
}

function randomFloor(g: Game, minDistFromHero: number) {
  for (let i = 0; i < 200; i++) {
    const tx = 2 + Math.floor(Math.random() * (roomData.width - 4));
    const ty = 3 + Math.floor(Math.random() * (roomData.height - 5));
    if (g.grid[ty][tx] !== 0) continue;
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
  });
}

function spawnWave(g: Game) {
  g.wave++;
  const pool: EnemyType[] =
    g.stage <= 1
      ? ['duwende', 'duwende', 'manananggal', 'tikbalang']
      : ['duwende', 'manananggal', 'tikbalang', 'tikbalang', 'kapre'];
  const n = 3 + g.stage + (g.wave - 1);
  for (let i = 0; i < n; i++) {
    const p = randomFloor(g, 90);
    spawnEnemy(g, pool[Math.floor(Math.random() * pool.length)], p.x, p.y);
  }
}

function addText(g: Game, x: number, y: number, text: string, color: string) {
  g.texts.push({ id: g.nextId++, x, y, text, color, t: 0.8 });
}

function dropPickup(g: Game, kind: PickupKind, x: number, y: number, lock = 0) {
  g.pickups.push({ id: g.nextId++, kind, x: x + rand(-4, 4), y: y + rand(-4, 4), t: 0, lock });
}

function shoot(
  g: Game,
  x: number,
  y: number,
  angle: number,
  speed: number,
  dmg: number,
  fromHero: boolean,
  sprite: BulletSprite,
  r = 2.5,
  pierce = false,
) {
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
  addText(g, h.x, h.y - 10, `-${dmg}`, left > 0 ? '#ff5a5a' : '#c8d0e8');
  if (h.hp <= 0) {
    h.hp = 0;
    g.result = 'dead';
  }
}

function killEnemy(g: Game, e: Enemy) {
  g.kills++;
  const def = ENEMIES[e.type];
  for (let i = 0; i < def.coins; i++) dropPickup(g, 'coin', e.x, e.y);
  const orbs = e.type === 'bakunawa' ? 10 : 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < orbs; i++) dropPickup(g, 'energy_orb', e.x, e.y);
  if (Math.random() < 0.06) dropPickup(g, 'potion_health', e.x, e.y);
}

// ---------------------------------------------------------------- update
export function update(g: Game, input: Input, dt: number) {
  if (g.result) return;
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
  for (const t of g.texts) {
    t.t -= dt;
    t.y -= 18 * dt;
  }
  g.texts = g.texts.filter((t) => t.t > 0);

  // room flow
  if (g.room !== 'start' && !g.portal && g.enemies.length === 0) {
    if (g.wave < g.waves) {
      spawnWave(g);
    } else if (g.room === 'boss') {
      g.result = 'victory';
    } else {
      g.portal = { ...CENTER };
      const cx = CENTER.x + 2.5 * TILE;
      g.chest = { x: solidAt(g, cx, CENTER.y) ? CENTER.x : cx, y: solidAt(g, cx, CENTER.y) ? CENTER.y + TILE : CENTER.y, open: false };
      g.banner = { text: 'PUROK SAFE', t: 1.6 };
    }
  }
  if (g.portal && dist(g.hero.x, g.hero.y, g.portal.x, g.portal.y) < 8) {
    enterRoom(g, g.stage + 1);
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

function updateHero(g: Game, input: Input, dt: number) {
  const h = g.hero;
  h.invuln = Math.max(0, h.invuln - dt);
  h.fireCd = Math.max(0, h.fireCd - dt);
  h.skillCd = Math.max(0, h.skillCd - dt);
  h.buff = Math.max(0, h.buff - dt);
  h.sinceHit += dt;

  // armor regen: after 3s without damage, +1 per second
  if (h.sinceHit > 3 && h.armor < h.def.armor) {
    h.armorTick += dt;
    if (h.armorTick >= 1) {
      h.armorTick = 0;
      h.armor++;
    }
  } else {
    h.armorTick = 0;
  }

  // movement
  let mx = input.mx;
  let my = input.my;
  const mag = Math.hypot(mx, my);
  if (mag > 1) {
    mx /= mag;
    my /= mag;
  }
  if (h.dash > 0) {
    h.dash -= dt;
    moveBody(g, h, h.dashDx * 250 * dt, h.dashDy * 250 * dt, 5);
  } else {
    moveBody(g, h, mx * h.def.speed * dt, my * h.def.speed * dt, 5);
  }
  h.moving = mag > 0.15 || h.dash > 0;
  if (h.moving) h.walk += dt;

  // aim
  const target = nearestTarget(g);
  if (target) {
    h.aim = Math.atan2(target.y - h.y, target.x - h.x);
  } else if (mag > 0.15) {
    h.aim = Math.atan2(my, mx);
  }
  h.facing = Math.cos(h.aim) < 0 ? -1 : 1;

  // skill
  if (input.skill) {
    input.skill = false;
    if (h.skillCd <= 0) useSkill(g, mx, my);
  }

  // swap / pick up
  if (input.swap) {
    input.swap = false;
    if (g.nearWeapon) {
      const p = g.nearWeapon;
      const old = h.weapons[h.cur];
      h.weapons[h.cur] = p.kind as WeaponId;
      g.pickups = g.pickups.filter((q) => q !== p);
      dropPickup(g, old, h.x, h.y + 6, 1.5);
      addText(g, h.x, h.y - 12, WEAPONS[p.kind as WeaponId].name, '#fcd854');
      g.nearWeapon = null;
    } else {
      h.cur = (h.cur + 1) % h.weapons.length;
    }
  }

  // fire
  if (input.fire && h.fireCd <= 0) {
    const w = WEAPONS[h.weapons[h.cur]];
    if (h.energy >= w.energy) {
      h.energy -= w.energy;
      const gx = h.x + Math.cos(h.aim) * 9;
      const gy = h.y + 3 + Math.sin(h.aim) * 9;
      for (let i = 0; i < w.pellets; i++) {
        const spread = w.pellets > 1 ? (i / (w.pellets - 1) - 0.5) * w.spread : rand(-w.spread, w.spread);
        shoot(g, gx, gy, h.aim + spread, w.speed * rand(0.92, 1.05), w.damage, true, w.sprite, w.radius, w.pierce);
      }
      h.fireCd = w.rate * (h.buff > 0 ? 0.5 : 1);
    } else {
      h.fireCd = 0.3;
      const free = h.weapons.findIndex((id) => WEAPONS[id].energy === 0);
      if (free >= 0) {
        h.cur = free;
        addText(g, h.x, h.y - 12, 'LOW LIGHT', '#ffba48');
      } else {
        addText(g, h.x, h.y - 12, 'NO LIGHT', '#ffba48');
      }
    }
  }
}

function useSkill(g: Game, mx: number, my: number) {
  const h = g.hero;
  h.skillCd = h.def.skill.cooldown;
  switch (h.def.id) {
    case 'kidlat':
      h.buff = 5;
      addText(g, h.x, h.y - 14, 'LIGHTNING!', '#ffe882');
      break;
    case 'liksi': {
      const m = Math.hypot(mx, my);
      h.dashDx = m > 0.1 ? mx / m : Math.cos(h.aim);
      h.dashDy = m > 0.1 ? my / m : Math.sin(h.aim);
      h.dash = 0.22;
      h.invuln = 0.4;
      break;
    }
    case 'mayumi':
      for (let i = 0; i < 16; i++) {
        shoot(g, h.x, h.y + 2, (i / 16) * Math.PI * 2, 150, 5, true, 'shot_spirit', 4, true);
      }
      g.shake = 0.15;
      break;
    case 'amihan':
      h.hp = Math.min(h.def.hp, h.hp + 2);
      h.armor = h.def.armor;
      addText(g, h.x, h.y - 14, '+2 HP', '#62cc5c');
      break;
  }
}

/** BFS distance (in tiles) from the hero's tile to every open tile. */
function flowField(g: Game) {
  const H = g.grid.length;
  const W = g.grid[0].length;
  const field = new Array<number>(W * H).fill(Infinity);
  const sx = Math.floor(g.hero.x / TILE);
  const sy = Math.floor((g.hero.y + 3) / TILE);
  if (g.grid[sy]?.[sx] !== 0) return field;
  const queue = [sy * W + sx];
  field[queue[0]] = 0;
  for (let i = 0; i < queue.length; i++) {
    const c = queue[i];
    const cx = c % W;
    const cy = (c - cx) / W;
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + ox;
      const ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || g.grid[ny][nx] !== 0) continue;
      const n = ny * W + nx;
      if (field[n] !== Infinity) continue;
      field[n] = field[c] + 1;
      queue.push(n);
    }
  }
  return field;
}

/** Unit vector an enemy should walk: straight at the hero when in sight, else down the flow field. */
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
  // aim for the centre of the next tile so bodies don't scrape corners
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
        // hop toward the hero
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
      case 'bakunawa':
        updateBoss(g, e, ux, uy, d, aim, dt);
        break;
    }

    // contact damage
    if (d < def.radius + 5) hurtHero(g, def.contact);
  }
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
    // radial burst
    const n = enraged ? 18 : 12;
    const rot = e.t;
    for (let i = 0; i < n; i++) shoot(g, e.x, e.y, rot + (i / n) * Math.PI * 2, 70, 1, false, 'shot_enemy', 3);
    e.cd = enraged ? 1.1 : 1.6;
  } else if (pattern === 1) {
    // aimed fan
    for (let i = -2; i <= 2; i++) shoot(g, e.x, e.y, aim + i * 0.18, 105, 1, false, 'shot_enemy', 3);
    e.cd = enraged ? 0.6 : 0.9;
  } else {
    // summon bats
    if (g.enemies.length < (enraged ? 7 : 5)) {
      for (let i = 0; i < 2; i++) spawnEnemy(g, 'manananggal', e.x + rand(-20, 20), e.y + rand(-10, 10));
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
    if (solidAt(g, b.x, b.y)) {
      b.life = 0;
      continue;
    }
    if (b.fromHero) {
      for (const e of g.enemies) {
        if (e.spawn > 0 || e.hp <= 0) continue;
        if (b.hit?.has(e.id)) continue;
        if (dist(b.x, b.y, e.x, e.y) < ENEMIES[e.type].radius + b.r) {
          e.hp -= b.dmg;
          e.flash = 0.1;
          addText(g, e.x, e.y - 10, `${b.dmg}`, '#ffffff');
          if (b.pierce) b.hit!.add(e.id);
          else b.life = 0;
          if (e.hp <= 0) killEnemy(g, e);
          if (!b.pierce) break;
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
  g.nearWeapon = null;
  if (g.chest && !g.chest.open && dist(h.x, h.y, g.chest.x, g.chest.y) < 14) {
    g.chest.open = true;
    const owned = new Set(h.weapons);
    const options = (Object.keys(WEAPONS) as WeaponId[]).filter((w) => !owned.has(w));
    if (options.length && Math.random() < 0.6) {
      dropPickup(g, options[Math.floor(Math.random() * options.length)], g.chest.x, g.chest.y + 12);
    } else {
      dropPickup(g, Math.random() < 0.5 ? 'potion_health' : 'potion_energy', g.chest.x, g.chest.y + 12);
    }
    for (let i = 0; i < 4; i++) dropPickup(g, 'coin', g.chest.x, g.chest.y + 10);
  }
  const keep: Pickup[] = [];
  for (const p of g.pickups) {
    p.t += dt;
    p.lock = Math.max(0, p.lock - dt);
    const d = dist(h.x, h.y, p.x, p.y);
    const isWeapon = p.kind in WEAPONS;
    if (isWeapon) {
      if (d < 14 && p.lock <= 0) g.nearWeapon = p;
      keep.push(p);
      continue;
    }
    // magnet
    if ((p.kind === 'coin' || p.kind === 'energy_orb') && d < 40) {
      p.x += ((h.x - p.x) / d) * 120 * dt;
      p.y += ((h.y - p.y) / d) * 120 * dt;
    }
    if (d < 8) {
      switch (p.kind) {
        case 'coin':
          g.coins++;
          break;
        case 'energy_orb':
          h.energy = Math.min(h.def.energy, h.energy + 6);
          break;
        case 'potion_health':
          h.hp = Math.min(h.def.hp, h.hp + 2);
          addText(g, h.x, h.y - 12, '+2 HP', '#62cc5c');
          break;
        case 'potion_energy':
          h.energy = Math.min(h.def.energy, h.energy + 80);
          addText(g, h.x, h.y - 12, '+80 LIGHT', '#ffba48');
          break;
      }
      continue;
    }
    keep.push(p);
  }
  g.pickups = keep;
}
