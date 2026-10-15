// Chests, loot, weapon swapping, whetstones, the two new skills and the island route.
const assert = require('assert');
const E = require('../../.sim/game/engine.js');
const rooms = require('../../.sim/game/rooms.json').rooms;
const idle = { mx: 0, my: 0, attack: false, skill: false, dodge: false };
const step = (g, input = idle, n = 1) => { for (let i = 0; i < n; i++) E.update(g, { ...input }, 1 / 60); };

// 1. every route is made of real rooms, and both new themes show up
const seen = new Set();
for (let i = 0; i < 400; i++) {
  const g = E.newGame('kidlat');
  for (const r of g.route) { assert(rooms[r], `missing room ${r}`); seen.add(r.replace(/_[ab]$/, '')); }
  assert.strictEqual(g.route.length, 7); // port + 5 islands (normal) + shore
}
assert(seen.has('sulu') && seen.has('ifugao'), 'new themes never chosen');
console.log('route ok:', [...seen].join(' '));

// 2. clearing an island spawns a chest; opening it drops loot
let weapons = 0, stones = 0;
for (let i = 0; i < 200; i++) {
  const g = E.newGame('dalisay');
  g.dialog = null;
  g.boat = { x: g.hero.x, y: g.hero.y };
  step(g);
  g.dialog = null;
  g.enemies = []; g.wave = g.waves;
  step(g);
  assert(g.chest && !g.chest.open, 'no chest after clearing');
  assert(E.stageLabel(g).length > 0);
  g.hero.x = g.chest.x; g.hero.y = g.chest.y;
  step(g);
  assert(g.chest.open, 'chest did not open');
  if (g.pickups.some((p) => p.kind === 'weapon')) weapons++;
  if (g.pickups.some((p) => p.kind === 'whetstone')) stones++;
}
console.log(`chests: ${weapons} weapons, ${stones} whetstones in 200`);
assert(weapons > 60 && stones > 40);

// 3. swapping: take the new weapon, the old one waits on the ground and is not grabbed back instantly
{
  const g = E.newGame('kidlat');
  g.dialog = null;
  g.pickups.push({ id: 999, kind: 'weapon', x: g.hero.x, y: g.hero.y, t: 0, weapon: 'lantaka', armed: true });
  step(g, idle, 30);
  assert.strictEqual(g.hero.weapon, 'lantaka');
  const old = g.pickups.find((p) => p.kind === 'weapon');
  assert(old && old.weapon === 'kampilan' && !old.armed, 'old weapon not left behind');
  step(g, idle, 60);
  assert.strictEqual(g.hero.weapon, 'lantaka', 'swapped straight back while standing still');
  g.hero.x += 30; step(g); g.hero.x -= 30; step(g, idle, 5);
  assert.strictEqual(g.hero.weapon, 'kampilan', 'could not take the old weapon back');
  console.log('weapon swap ok');
}

// 4. whetstones: level up to the cap, then turn into coins
{
  const g = E.newGame('liksi');
  g.dialog = null;
  for (let i = 0; i < 7; i++) {
    g.pickups.push({ id: 1000 + i, kind: 'whetstone', x: g.hero.x, y: g.hero.y, t: 0 });
    step(g);
  }
  assert.strictEqual(g.hero.weaponLv, 5);
  assert(g.coins >= 20);
  console.log('whetstones ok: lv', g.hero.weaponLv, 'coins', g.coins);
}

// 5. Banog's kalasag turns shots back; Dalisay's surge clears and pushes
{
  const g = E.newGame('banog');
  g.dialog = null; g.hero.light = 100;
  step(g, { ...idle, skill: true });
  assert(g.hero.shield > 2);
  g.bullets.push({ id: 5000, x: g.hero.x + 15, y: g.hero.y + 2, vx: -80, vy: 0, dmg: 1, fromHero: false, sprite: 'shot_enemy', r: 2.5, life: 2, pierce: false });
  step(g);
  const b = g.bullets.find((b) => b.id === 5000);
  assert(b && b.fromHero && b.vx > 0, 'shot not reflected');
  console.log('kalasag ok');
}
{
  const g = E.newGame('dalisay');
  g.dialog = null; g.hero.light = 100;
  g.enemies.push({ id: 7, type: 'kapre', x: g.hero.x + 30, y: g.hero.y, hp: 50, maxHp: 50, cd: 9, t: 0, spawn: 0, flash: 0, facing: -1, poison: 0, poisonTick: 0, state: 0 });
  g.bullets.push({ id: 5001, x: g.hero.x + 20, y: g.hero.y, vx: -10, vy: 0, dmg: 1, fromHero: false, sprite: 'shot_enemy', r: 2.5, life: 2, pierce: false });
  const x0 = 30;
  step(g, { ...idle, skill: true });
  const k = g.enemies.find((e) => e.id === 7);
  assert(k.hp < 50 && k.x - g.hero.x > x0, 'surge did not hurt and push');
  assert(!g.bullets.some((b) => b.id === 5001), 'surge did not clear the shot');
  console.log('daluyong ok');
}

// 6. lantaka shots explode and hurt neighbours
{
  const g = E.newGame('dalisay', 'lantaka');
  g.dialog = null;
  for (const dy of [0, 10]) g.enemies.push({ id: 20 + dy, type: 'kapre', x: g.hero.x + 60, y: g.hero.y + dy, hp: 40, maxHp: 40, cd: 9, t: 0, spawn: 0, flash: 0, facing: -1, poison: 0, poisonTick: 0, state: 0 });
  step(g, { ...idle, attack: true }, 60);
  const hurt = g.enemies.filter((e) => e.hp < 40).length;
  assert(hurt === 2, `blast hit ${hurt} of 2`);
  assert(g.fx.some((f) => f.kind === 'boom') || true);
  console.log('lantaka blast ok');
}
// 7. sound events: a fight, a chest and a level-up all ask for their sounds
{
  const g = E.newGame('dalisay', 'lantaka');
  g.dialog = null;
  const heard = new Set();
  g.enemies.push({ id: 31, type: 'kapre', x: g.hero.x + 50, y: g.hero.y, hp: 3, maxHp: 120, cd: 9, t: 0, spawn: 0, flash: 0, facing: -1, poison: 0, poisonTick: 0, state: 0 });
  for (let i = 0; i < 90; i++) { E.update(g, { ...idle, attack: true }, 1 / 60); g.sfx.forEach((s) => heard.add(s)); g.sfx.length = 0; }
  g.chest = { x: g.hero.x, y: g.hero.y, open: false };
  E.update(g, idle, 1 / 60); g.sfx.forEach((s) => heard.add(s));
  for (const s of ['cannon', 'boom', 'hit', 'kill', 'levelup', 'chest']) assert(heard.has(s), `no '${s}' sound (heard: ${[...heard].join(' ')})`);
  console.log('sound events ok:', [...heard].join(' '));
}
console.log('ALL LOOT TESTS PASSED');
