// Combat: put each hero alone on an island with one creature and let auto-aim fight it out.
const E = require('../../.sim/game/engine.js');
const { WEAPONS } = require('../../.sim/game/data.js');
const types = ['tiyanak', 'sigbin', 'santelmo', 'bungisngis', 'duwende', 'kapre'];
const loadouts = [['kidlat', 'kampilan'], ['liksi', 'pana'], ['banog', 'panabas'], ['banog', 'baston'], ['dalisay', 'buntot_pagi'], ['dalisay', 'lantaka'], ['kidlat', 'balaraw']];
const idle = { mx: 0, my: 0, attack: false, skill: false, dodge: false };
for (const [hero, weapon] of loadouts) {
  const row = [];
  for (const type of types) {
    let killed = 0, taken = 0, secs = 0, flags = new Set();
    for (let trial = 0; trial < 8; trial++) {
      const g = E.newGame(hero, weapon);
      g.hero.weapon = weapon;
      g.dialog = null;
      g.boat = { x: g.hero.x, y: g.hero.y }; // sail to island 1
      E.update(g, idle, 0.016);
      g.dialog = null;
      g.enemies = [];
      g.wave = g.waves = 99;
      g.hero.hp = g.hero.maxHp = 99;
      const start = g.hero.hp + g.hero.armor;
      g.enemies.push({ id: 9999, type, x: g.hero.x + 80, y: g.hero.y, hp: 12, maxHp: 12, cd: 1, t: 0, spawn: 0, flash: 0, facing: -1, poison: 0, poisonTick: 0, state: 0 });
      let t = 0;
      while (t < 25 && g.enemies.some((e) => e.id === 9999) && !g.result) {
        const e = g.enemies.find((e) => e.id === 9999);
        if (e.state === 1) flags.add('state1');
        const dx = e.x - g.hero.x, dy = e.y - g.hero.y, d = Math.hypot(dx, dy) || 1;
        const melee = WEAPONS[weapon].melee;
        const want = melee ? (d > 16 ? 1 : 0) : d > 60 ? 0.7 : 0;
        E.update(g, { mx: (dx / d) * want, my: (dy / d) * want, attack: true, skill: false, dodge: false }, 1 / 60);
        if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) throw new Error(`NaN position for ${type}`);
        t += 1 / 60;
      }
      if (!g.enemies.some((e) => e.id === 9999)) killed++;
      secs += t;
      taken += start - (g.hero.hp + g.hero.armor);
    }
    row.push(`${type} ${killed}/8 ${(secs / 8).toFixed(1)}s -${(taken / 8).toFixed(1)}${flags.size ? '*' : ''}`);
  }
  console.log(`${hero}/${weapon}: ${row.join(' | ')}`);
}
