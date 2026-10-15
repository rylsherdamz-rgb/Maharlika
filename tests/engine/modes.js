// Co-op, revives, XP, difficulty, voyage length, caves and endless mode.
const assert = require('assert');
const E = require('../../.sim/game/engine.js');
const { DIFFICULTIES, xpToNext } = require('../../.sim/game/data.js');
const rooms = require('../../.sim/game/rooms.json').rooms;
const idle = () => ({ mx: 0, my: 0, attack: false, skill: false, dodge: false });
const step = (g, ins, n = 1) => { for (let i = 0; i < n; i++) E.update(g, ins ?? g.heroes.map(idle), 1 / 60); };
const sail = (g) => { g.dialog = null; g.boat = { x: g.hero.x, y: g.hero.y }; step(g); g.dialog = null; };
const clear = (g) => { g.enemies = []; g.wave = g.waves; step(g); };

// 1. voyage length follows difficulty, and every island appears with 6 legs
for (const d of DIFFICULTIES) {
  for (let i = 0; i < 100; i++) {
    const g = E.newGame({ players: [{ hero: 'kidlat' }], difficulty: d.id });
    assert.strictEqual(g.route.length, d.legs + 2);
    assert.strictEqual(g.route[0], 'port');
    assert.strictEqual(g.route[g.route.length - 1], 'shore');
    assert(/^(pulo4|palawan)_/.test(g.route[g.route.length - 2]), 'a forest island (Ibalong or Palawan) comes last');
    g.route.forEach((r) => assert(rooms[r], r));
    if (d.legs === 6) assert.strictEqual(new Set(g.route.map((r) => r.replace(/_[ab]$/, ''))).size, 8, 'hard visits six different islands');
  }
}
console.log('voyage lengths ok');

// 2. hard creatures are tougher than easy ones
{
  const hp = (d) => { const g = E.newGame({ players: [{ hero: 'kidlat' }], difficulty: d }); sail(g); return g.enemies.reduce((s, e) => s + e.maxHp, 0) / g.enemies.length; };
  let easy = 0, hard = 0;
  for (let i = 0; i < 30; i++) { easy += hp(0); hard += hp(2); }
  assert(hard > easy * 1.4, `hard ${hard} vs easy ${easy}`);
  console.log('difficulty scaling ok');
}

// 3. co-op: two heroes, both move, revive a fallen partner, game over only when both fall
{
  const g = E.newGame({ players: [{ hero: 'kidlat' }, { hero: 'dalisay', weapon: 'lantaka' }] });
  g.dialog = null;
  assert.strictEqual(g.heroes.length, 2);
  assert(g.autoAttack);
  const x0 = g.heroes[1].x;
  step(g, [idle(), { ...idle(), mx: 1 }], 30);
  assert(g.heroes[1].x > x0 && Math.abs(g.heroes[0].x - 2.5 * 16) < 1, 'P2 moved, P1 stayed');
  // P2 falls; P1 stands beside them and lifts them up
  const [p1, p2] = g.heroes;
  p2.hp = 1; p2.invuln = 0; p2.armor = 0;
  g.enemies.push({ id: 1, type: 'duwende', x: p2.x, y: p2.y, hp: 999, maxHp: 999, cd: 9, t: 0, spawn: 0, flash: 0, facing: 1, poison: 0, poisonTick: 0, state: 0 });
  step(g);
  assert(p2.down && !g.result, 'P2 down but the run goes on');
  g.enemies = [];
  p1.x = p2.x + 6; p1.y = p2.y;
  step(g, undefined, Math.ceil(E.REVIVE_TIME * 60) + 5);
  assert(!p2.down && p2.hp > 0, 'P2 revived');
  p1.hp = p2.hp = 1; p1.invuln = p2.invuln = 0; p1.armor = p2.armor = 0;
  for (const p of [p1, p2]) g.enemies.push({ id: 2 + p.idx, type: 'duwende', x: p.x, y: p.y, hp: 999, maxHp: 999, cd: 9, t: 0, spawn: 0, flash: 0, facing: 1, poison: 0, poisonTick: 0, state: 0 });
  step(g);
  assert.strictEqual(g.result, 'dead');
  console.log('co-op and revive ok');
}

// 4. co-op auto-attack kills things with no attack input
{
  const g = E.newGame({ players: [{ hero: 'liksi' }, { hero: 'mayumi' }] });
  sail(g);
  let t = 0;
  while (g.enemies.length && t < 60) { step(g, undefined, 60); t++; }
  assert(g.kills > 0, 'auto-attack never killed anything');
  console.log(`co-op auto-attack: ${g.kills} kills in ${t}s`);
}

// 5. XP and levels
{
  const g = E.newGame('kidlat');
  sail(g);
  const h = g.hero;
  const hp0 = h.maxHp;
  g.enemies = [{ id: 9, type: 'kapre', x: h.x + 10, y: h.y, hp: 1, maxHp: xpToNext(1) * 3 + 3, cd: 9, t: 0, spawn: 0, flash: 0, facing: 1, poison: 0, poisonTick: 0, state: 0 }];
  step(g, [{ ...idle(), attack: true }], 20);
  assert(h.lv >= 2 && h.maxHp > hp0, `level ${h.lv}`);
  console.log('levels ok: antas', h.lv);
}

// 6. caves: door on a cave island, 3 rooms deep, guardian, big chest, back to the island
{
  const g = E.newGame({ players: [{ hero: 'banog' }], difficulty: 1 });
  g.caveStages = [1];
  sail(g);
  clear(g);
  assert(g.caveDoor && g.boat && g.chest, 'cave island has door, boat and chest');
  const island = g.room;
  const h = g.hero;
  h.x = g.caveDoor.x; h.y = g.caveDoor.y; step(g);
  assert(g.cave && g.cave.depth === 1 && g.room.startsWith('yungib'));
  for (let depth = 1; depth <= E.CAVE_DEPTH; depth++) {
    assert.strictEqual(g.cave.depth, depth);
    if (depth === E.CAVE_DEPTH) {
      const boss = g.enemies.find((e) => e.boss);
      assert(boss && boss.type === 'bungisngis' && boss.scale > 1, 'guardian present');
      boss.spawn = 0; boss.hp = 1; h.x = boss.x - 10; h.y = boss.y; h.invuln = 99;
      g.enemies = [boss];
      step(g, [{ ...idle(), attack: true }], 40);
      assert(g.chest && g.chest.big, 'big chest after the guardian');
    } else {
      clear(g);
    }
    assert(g.exit, `exit at depth ${depth}`);
    h.x = g.exit.x; h.y = g.exit.y; step(g);
  }
  assert(!g.cave && g.room === island && g.boat && !g.caveDoor && g.caves === 1, 'back on the island');
  console.log('cave run ok');
}

// 7. endless mode: keeps generating islands (the Bakunawa every 8th), harder each time
{
  const g = E.newGame({ players: [{ hero: 'kidlat' }], mode: 'endless' });
  for (let i = 0; i < 12; i++) { sail(g); assert.strictEqual(g.room === 'shore', g.stage % E.ENDLESS_BOSS_EVERY === 0, `island ${g.stage}: ${g.room}`); assert(rooms[g.room], g.room); clear(g); g.caveDoor = null; }
  assert.strictEqual(g.stage, 12);
  sail(g);
  const late = g.enemies.reduce((s, e) => s + e.maxHp, 0) / g.enemies.length;
  assert(late > 12 && g.enemies.length >= 10, `late islands ${late} hp x${g.enemies.length}`);
  console.log(`endless ok: island ${g.stage}, ${g.enemies.length} creatures`);
}
// 8. no creature gets stuck: from random spots on every map, walkers reach an idle hero
{
  let stuck = 0, total = 0;
  for (const room of Object.keys(rooms)) {
    if (room === 'port') continue;
    for (let trial = 0; trial < 6; trial++) {
      const g = E.newGame('kidlat');
      g.dialog = null;
      g.room = room; g.grid = rooms[room].grid;
      g.enemies = []; g.wave = g.waves = 99; g.bullets = [];
      const h = g.hero; h.hp = h.maxHp = 999; h.x = 2.5 * 16; h.y = 7.5 * 16;
      // a walker (duwende) on a random floor tile far from the hero
      let x, y;
      do { x = (1 + Math.floor(Math.random() * 20) + 0.5) * 16; y = (1 + Math.floor(Math.random() * 11) + 0.5) * 16; }
      while (rooms[room].grid[Math.floor(y / 16)][Math.floor(x / 16)] !== 0 || rooms[room].grid[Math.floor((y + 7) / 16)]?.[Math.floor(x / 16)] !== 0 || Math.hypot(x - h.x, y - h.y) < 120);
      g.enemies.push({ id: 1, type: 'duwende', x, y, hp: 999, maxHp: 999, cd: 9, t: 0, spawn: 0, flash: 0, facing: 1, poison: 0, poisonTick: 0, state: 0 });
      let reached = false;
      for (let i = 0; i < 60 * 30 && !reached; i++) {
        E.update(g, [idle()], 1 / 60);
        h.invuln = 0;
        reached = Math.hypot(g.enemies[0].x - h.x, g.enemies[0].y - h.y) < 14;
      }
      total++;
      if (!reached) { stuck++; console.log(`  stuck on ${room} from ${x},${y} at ${g.enemies[0].x.toFixed(0)},${g.enemies[0].y.toFixed(0)}`); }
    }
  }
  assert.strictEqual(stuck, 0, `${stuck}/${total} creatures got stuck`);
  console.log(`pathing ok: ${total} walkers reached the hero on every map`);
}
// 9. every island theme turns up, and each cave guardian drops its own mutya
{
  const { CAVE_GUARDIANS, THEME_GUARDIAN, RELICS } = require('../../.sim/game/data.js');
  const themes = new Set();
  for (let i = 0; i < 300; i++) E.newGame({ players: [{ hero: 'kidlat' }], difficulty: 2 }).route.forEach((r) => themes.add(r.replace(/_[ab]$/, '')));
  for (const t of ['pulo1', 'bohol', 'pulo2', 'sulu', 'pulo3', 'ifugao', 'taal', 'pulo4', 'palawan']) assert(themes.has(t), `theme ${t} never chosen`);
  for (const theme of Object.keys(THEME_GUARDIAN)) {
    const g = E.newGame('liksi');
    g.route[1] = `${theme}_a`;
    g.caveStages = [1];
    sail(g); clear(g);
    const h = g.hero;
    for (let d = 0; d < E.CAVE_DEPTH; d++) {
      const door = g.caveDoor || g.exit; h.x = door.x; h.y = door.y; step(g);
      if (d < E.CAVE_DEPTH - 1) clear(g);
    }
    const boss = g.enemies.find((e) => e.boss);
    const want = CAVE_GUARDIANS[THEME_GUARDIAN[theme]];
    assert(boss && boss.type === want.type, `${theme}: guardian ${boss && boss.type}`);
    assert.strictEqual(E.bossName(boss), want.name);
    // fight it for real for a while: the guardian must attack and survive the first seconds
    h.hp = h.maxHp = 999; h.x = boss.x - 60; h.y = boss.y;
    let shots = 0;
    for (let i = 0; i < 300; i++) { step(g); shots += g.bullets.filter((b) => !b.fromHero).length > 0 ? 1 : 0; h.invuln = 0; }
    assert(shots > 0, `${theme} guardian never attacked`);
    boss.hp = 1; boss.spawn = 0; g.enemies = [boss]; h.x = boss.x - 12; h.y = boss.y; h.invuln = 99;
    step(g, [{ ...idle(), attack: true }], 40);
    const relic = g.pickups.find((p) => p.kind === 'relic');
    assert(relic && relic.relic === want.relic, `${theme}: dropped ${relic && relic.relic}`);
    const dmg0 = h.mods.dmg, spd0 = h.mods.speed, hp0 = h.maxHp;
    h.x = relic.x; h.y = relic.y; step(g);
    assert(g.relics.includes(want.relic), 'relic picked up');
    if (want.relic === 'pangil_bungisngis') assert(h.mods.dmg > dmg0);
    if (want.relic === 'buhok_tikbalang') assert(h.mods.speed > spd0);
    if (want.relic === 'mutya_kapre') assert(h.maxHp === hp0 + 2);
  }
  console.log(`guardians and mutya ok: ${Object.keys(RELICS).length} relics, ${themes.size} themes`);
}

// 10. the Bakunawa: in a voyage its scale goes straight to the party; in endless it rises every 8 islands
{
  const g = E.newGame('dalisay');
  g.stage = g.route.length - 2; g.dialog = null;
  g.boat = { x: g.hero.x, y: g.hero.y }; step(g); g.dialog = null;
  assert.strictEqual(g.room, 'shore');
  const serpent = g.enemies.find((e) => e.type === 'bakunawa');
  serpent.spawn = 0; serpent.hp = 1; g.hero.x = serpent.x - 14; g.hero.y = serpent.y; g.hero.invuln = 99;
  step(g, [{ ...idle(), attack: true }], 60);
  assert(g.relics.includes('kaliskis_bakunawa') && g.result === 'victory', 'voyage win carries the scale');
  const e = E.newGame({ players: [{ hero: 'kidlat' }], mode: 'endless' });
  for (let i = 0; i < E.ENDLESS_BOSS_EVERY; i++) { sail(e); if (e.room !== 'shore') { clear(e); e.caveDoor = null; } }
  assert.strictEqual(e.room, 'shore', 'endless island 8 is the Bakunawa');
  assert(e.enemies.some((x) => x.type === 'bakunawa'));
  e.enemies = []; e.wave = e.waves; step(e);
  assert(e.boat && !e.result, 'endless carries on after the Bakunawa');
  console.log('bakunawa ok');
}
console.log('ALL MODE TESTS PASSED');
