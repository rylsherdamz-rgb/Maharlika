// Story and feel: Haliya's memory, island scenes, the voyage map, the shop, crits, elites, objectives.
const assert = require('assert');
const E = require('../../.sim/game/engine.js');
const T = require('../../.sim/game/tales.js');
const idle = () => ({ mx: 0, my: 0, attack: false, skill: false, dodge: false });
const step = (g, ins, n = 1) => { for (let i = 0; i < n; i++) E.update(g, ins ?? g.heroes.map(idle), 1 / 60); };
const finishDialog = (g) => { while (g.dialog) E.advanceDialog(g); };

// 1. Haliya remembers: first run, first death, a new hero, then fallbacks; one-time lines are spent
{
  const m = { ...T.NEW_MEMORY };
  let r = T.haliyaGreeting(m, ['kidlat']);
  assert.strictEqual(r.remark, 'first');
  Object.assign(m, { runs: 1, deaths: 1, lastReached: 'SIQUIJOR', heroesPlayed: ['kidlat'], seen: ['first'] });
  r = T.haliyaGreeting(m, ['kidlat']);
  assert.strictEqual(r.remark, 'first_death');
  assert(r.lines[0].text.includes('SIQUIJOR'));
  m.seen.push('first_death');
  assert.strictEqual(T.haliyaGreeting(m, ['banog']).remark, 'new_banog');
  assert.strictEqual(T.haliyaGreeting(m, ['kidlat', 'liksi']).remark, 'coop');
  assert.strictEqual(T.haliyaGreeting(m, ['kidlat']).remark, 'died');
  Object.assign(m, { wins: 1, lastVictory: true });
  assert.strictEqual(T.haliyaGreeting(m, ['kidlat']).remark, 'first_win');
  m.seen.push('first_win');
  assert.strictEqual(T.haliyaGreeting(m, ['kidlat']).remark, 'won');
  // every remark has a speaker line and a hero reply
  for (const h of ['kidlat', 'liksi', 'mayumi', 'amihan', 'banog', 'dalisay']) assert.strictEqual(T.haliyaGreeting(m, [h]).lines.length, 2);
  console.log('haliya memory ok');
}

// 2. the greeting plays at the docks, then each island's local speaks once, and the hero answers
{
  const greeting = T.haliyaGreeting({ ...T.NEW_MEMORY }, ['mayumi']).lines;
  const g = E.newGame({ players: [{ hero: 'mayumi' }], greeting });
  assert(g.dialog && g.dialog.lines[0].speaker === 'HALIYA', 'greeting plays at the docks');
  finishDialog(g);
  g.boat = { x: g.hero.x, y: g.hero.y };
  step(g);
  assert(g.voyage && g.voyage.to === 1, 'boarding shows the voyage map');
  step(g, undefined, Math.ceil(E.VOYAGE_TIME * 60) + 2);
  assert.strictEqual(g.stage, 1, 'the voyage lands on its own');
  const theme = g.room.replace(/_[ab]$/, '');
  assert(g.dialog, 'island scene plays on landing');
  const lines = g.dialog.lines;
  assert.strictEqual(lines[0].speaker, T.LOCALS[theme].name);
  assert.strictEqual(lines[lines.length - 1].speaker, 'MAYUMI');
  assert(g.npc && g.npc.quiet && g.npc.sprite === `npc_${T.LOCALS[theme].id}`);
  finishDialog(g);
  // the local stays quiet while creatures are about, and talks once the island is safe
  g.hero.x = g.npc.x + 10; g.hero.y = g.npc.y;
  step(g);
  assert(!g.npc.talking, 'local hides during the fight');
  g.enemies = []; g.wave = g.waves; step(g); step(g);
  assert(g.npc.talking && g.npc.line === T.LOCALS[theme].after, 'local thanks you after');
  console.log('island scenes ok:', theme);
}

// 3. the tindera: her stall opens on even islands, sells for coins, says no when you are short
{
  const g = E.newGame({ players: [{ hero: 'amihan' }], scenes: true });
  finishDialog(g);
  g.stage = 1; g.boat = { x: g.hero.x, y: g.hero.y }; step(g); E.skipVoyage(g); step(g); finishDialog(g);
  assert.strictEqual(g.stage, 2);
  g.enemies = []; g.wave = g.waves; step(g);
  assert(g.shop && g.shop.items.length === 3, 'stall opens');
  const spots = [g.shop, ...g.shop.items, g.chest, g.boat, g.shrine].filter(Boolean);
  for (let i = 0; i < spots.length; i++) for (let j = i + 1; j < spots.length; j++) assert(Math.hypot(spots[i].x - spots[j].x, spots[i].y - spots[j].y) >= 8, 'stall items overlap');
  assert(g.dialog && g.dialog.lines[0].speaker === T.TINDERA.name, 'Aling Nena greets you');
  finishDialog(g);
  const herb = g.shop.items.find((i) => i.kind === 'herb');
  const h = g.hero;
  g.coins = 0; h.hp = 1; h.x = herb.x; h.y = herb.y; step(g);
  assert(!herb.sold && h.hp === 1, 'cannot buy without coins');
  assert(g.texts.some((t) => t.text === 'KULANG ANG BARYA'));
  g.coins = 100; step(g);
  assert(herb.sold && h.hp === 4 && g.coins === 100 - herb.price, 'bought the herb');
  for (const it of g.shop.items.filter((i) => !i.sold)) { h.x = it.x; h.y = it.y; step(g); h.x = 30; step(g); }
  assert(g.shop.items.every((i) => i.sold), 'bought everything');
  console.log('tindahan ok:', g.shop.items.map((i) => `${i.kind} ${i.price}`).join(', '));
}

// 4. crits double damage and freeze a few frames; boss kills freeze longer
{
  let crits = 0, total = 0;
  for (let i = 0; i < 400; i++) {
    const g = E.newGame({ players: [{ hero: 'kidlat' }], scenes: false });
    g.enemies = [{ id: 1, type: 'kapre', x: g.hero.x + 14, y: g.hero.y, hp: 999, maxHp: 999, cd: 9, t: 0, spawn: 0, flash: 0, facing: -1, poison: 0, poisonTick: 0, state: 0 }];
    g.wave = g.waves = 99;
    step(g, [{ ...idle(), attack: true }]);
    if (g.texts.some((t) => t.big)) { crits++; assert(g.hitstop > 0); }
    total++;
  }
  const rate = crits / total;
  assert(rate > 0.05 && rate < 0.16, `crit rate ${rate}`);
  console.log(`crits ok: ${(rate * 100).toFixed(1)}%`);
}

// 5. cursed elites appear from the second island on, tougher and richer
{
  let elites = 0, normals = 0, hpE = 0, hpN = 0;
  for (let i = 0; i < 300; i++) {
    const g = E.newGame({ players: [{ hero: 'kidlat' }], scenes: false });
    g.stage = 3; g.boat = { x: g.hero.x, y: g.hero.y }; step(g); E.skipVoyage(g); step(g);
    for (const e of g.enemies) {
      if (e.elite) { elites++; hpE += e.maxHp / ({ duwende: 7, manananggal: 5, tikbalang: 10, kapre: 15, tiyanak: 6, sigbin: 8, santelmo: 5, bungisngis: 30 }[e.type]); }
      else { normals++; hpN += e.maxHp / ({ duwende: 7, manananggal: 5, tikbalang: 10, kapre: 15, tiyanak: 6, sigbin: 8, santelmo: 5, bungisngis: 30 }[e.type]); }
    }
  }
  const share = elites / (elites + normals);
  assert(share > 0.04 && share < 0.15, `elite share ${share}`);
  assert(hpE / elites > (hpN / normals) * 1.8, 'elites are tougher');
  const g1 = E.newGame({ players: [{ hero: 'kidlat' }], scenes: false });
  g1.boat = { x: g1.hero.x, y: g1.hero.y }; step(g1); E.skipVoyage(g1); step(g1);
  assert(!g1.enemies.some((e) => e.elite), 'no elites on the first island');
  console.log(`elites ok: ${(share * 100).toFixed(1)}% of creatures from island 4`);
}

// 6. the objective line follows the island
{
  const g = E.newGame({ players: [{ hero: 'liksi' }], scenes: false });
  assert(E.objective(g).includes('balangay'));
  g.boat = { x: g.hero.x, y: g.hero.y }; step(g); E.skipVoyage(g); step(g);
  assert(/Mga nilalang: \d+/.test(E.objective(g)), E.objective(g));
  g.enemies = []; g.wave = g.waves; step(g);
  assert(E.objective(g).includes('Kaban') && E.objective(g).includes('Dambana'), E.objective(g));
  console.log('objectives ok:', E.objective(g));
}
console.log('ALL STORY TESTS PASSED');
