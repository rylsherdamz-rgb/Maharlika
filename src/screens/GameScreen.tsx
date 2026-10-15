import { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { audioSettings, playMusic, playSfx, setMusicOn, setSfxOn } from '../audio';
import { BOONS, ENEMIES, LIGHT_MAX, RELICS, WEAPONS, xpToNext } from '../game/data';
import { advanceDialog, alive, bossName, chooseBoon, DODGE_TIME, FX_FRAMES, FX_LIFE, Game, Hero, Input, newGame, REVIVE_TIME, ROOM_H, ROOM_W, Setup, sigbinVisible, stageLabel, update } from '../game/engine';
import { BaybayinText, COLORS, Panel, PixelButton, PixelText, Sprite } from '../ui';
import { RunStats } from './ResultScreen';

type Control = 'stick' | 'attack' | 'skill' | 'dodge' | 'pause';
type Btn = { x: number; y: number; r: number };
type Stick = { ox: number; oy: number; kx: number; ky: number };
const STICK_R = 44;
const SEA = '#0c2c3e';
/** Player colors for co-op markers, HUDs and controls. */
const P_COLORS = ['#ffba48', '#82eed6'];
const newInput = (): Input => ({ mx: 0, my: 0, attack: false, skill: false, dodge: false });

/** A row of diamond beads: filled up to `value`, empty up to `max`. */
function Pips({ value, max, full, empty }: { value: number; max: number; full: ImgKey; empty: ImgKey }) {
  return (
    <View style={styles.pips}>
      {Array.from({ length: max }, (_, i) => (
        <Sprite key={i} name={i < value ? full : empty} size={12} />
      ))}
    </View>
  );
}

/** One player's HUD: medallion, health and amulet beads, light, weapon and level. */
function HeroHud({ h, right, label }: { h: Hero; right?: boolean; label?: string }) {
  const lightFrac = h.light / LIGHT_MAX;
  const ready = h.light >= LIGHT_MAX;
  const weapon = WEAPONS[h.weapon];
  return (
    <View pointerEvents="none" style={[styles.hud, right ? { right: 8, flexDirection: 'row-reverse' } : { left: 8 }, h.down && { opacity: 0.5 }]}>
      <View style={styles.medal}>
        <Image source={IMG.ui_medallion} fadeDuration={0} style={styles.medalFrame} />
        <Image source={IMG[`portraits_${h.def.id}` as ImgKey]} fadeDuration={0} style={styles.medalPortrait} />
        {label && (
          <PixelText size={7} color={P_COLORS[h.idx]} style={styles.medalLabel}>
            {label}
          </PixelText>
        )}
      </View>
      <View style={{ marginHorizontal: 6, gap: 3, alignItems: right ? 'flex-end' : 'flex-start' }}>
        <Pips value={h.hp} max={h.maxHp} full="ui_pip_hp" empty="ui_pip_hp_empty" />
        <Pips value={h.armor} max={h.maxArmor} full="ui_pip_armor" empty="ui_pip_armor_empty" />
        <View style={[styles.lamp, right && { flexDirection: 'row-reverse' }]}>
          <Sprite name="ui_energy" size={12} />
          <View style={styles.lampTrack}>
            <View style={[styles.lampFill, { width: `${lightFrac * 100}%`, backgroundColor: ready ? COLORS.gold : COLORS.light }]} />
          </View>
        </View>
        <View style={[styles.lamp, right && { flexDirection: 'row-reverse' }]}>
          <PixelText size={7} color={COLORS.gold}>
            {`ANTAS ${h.lv}`}
          </PixelText>
          <View style={[styles.lampTrack, { width: 52, height: 5 }]}>
            <View style={[styles.lampFill, { width: `${Math.min(1, h.xp / xpToNext(h.lv)) * 100}%`, backgroundColor: COLORS.armor }]} />
          </View>
        </View>
        <View style={[styles.lamp, right && { flexDirection: 'row-reverse' }]}>
          <Sprite name={`weapons_${h.weapon}` as ImgKey} size={18} />
          <PixelText size={7} color={COLORS.light}>
            {`${weapon.name.toUpperCase()}${h.weaponLv ? ` +${h.weaponLv}` : ''}`}
          </PixelText>
        </View>
      </View>
    </View>
  );
}

/** Which pose the hero is in this frame: roll, hurt, attack, walk or idle. */
function heroFrame(h: Hero, time: number) {
  if (h.down) return 'hurt_0';
  if (h.dash > 0) return `roll_${Math.min(3, Math.floor(((DODGE_TIME - h.dash) / DODGE_TIME) * 4))}`;
  if (h.sinceHit < 0.25) return 'hurt_0';
  if (h.atkAnim > 0) return h.atkAnim > 0.08 ? 'attack_1' : 'attack_0';
  if (h.moving) return `walk_${Math.floor(h.walk * 10) % 4}`;
  return `idle_${Math.floor(time * 2) % 2}`;
}

export default function GameScreen({
  setup,
  onEnd,
  onQuit,
  onSoundChange,
}: {
  setup: Setup;
  onEnd: (s: RunStats) => void;
  onQuit: () => void;
  /** Called when music or effects are switched in the pause menu, so the choice can be saved. */
  onSoundChange?: (s: { musicOn: boolean; sfxOn: boolean }) => void;
}) {
  const { width: W, height: H } = useWindowDimensions();
  const gameRef = useRef<Game>(null as unknown as Game);
  if (!gameRef.current) gameRef.current = newGame(setup);
  const coop = gameRef.current.heroes.length > 1;
  const inputs = useRef<Input[]>(gameRef.current.heroes.map(newInput)).current;
  const keys = useRef(gameRef.current.heroes.map(() => ({ mx: 0, my: 0, attack: false }))).current;
  const touches = useRef(new Map<number, { c: Control; p: number }>()).current;
  const [sticks, setSticks] = useState<(Stick | null)[]>(() => inputs.map(() => null));
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [sound, setSound] = useState(audioSettings);
  const [, setFrame] = useState(0);
  const endRef = useRef({ onEnd, done: false });
  endRef.current.onEnd = onEnd;

  // controls layout (screen space). Solo: stick on the left, buttons on the right.
  // Co-op: each player owns half the screen, attacks on their own, and has dodge and skill in their corner.
  const pauseBtn: Btn = coop ? { x: W / 2, y: 24, r: 20 } : { x: W - 28, y: 26, r: 22 };
  const attackBtn: Btn = { x: W - 80, y: H - 80, r: 48 };
  const dodgeBtns: Btn[] = coop ? [{ x: 46, y: H - 50, r: 28 }, { x: W - 46, y: H - 50, r: 28 }] : [{ x: W - 178, y: H - 50, r: 30 }];
  const skillBtns: Btn[] = coop ? [{ x: 46, y: H - 124, r: 28 }, { x: W - 46, y: H - 124, r: 28 }] : [{ x: W - 66, y: H - 182, r: 34 }];

  const setStick = (p: number, v: Stick | null | ((s: Stick | null) => Stick | null)) =>
    setSticks((all) => all.map((s, i) => (i === p ? (typeof v === 'function' ? v(s) : v) : s)));

  const setPause = (p: boolean) => {
    pausedRef.current = p;
    setPaused(p);
    if (p) {
      touches.clear();
      for (const i of inputs) {
        i.attack = false;
        i.mx = i.my = 0;
      }
      setSticks(inputs.map(() => null));
    }
  };

  // ------------------------------------------------------------ game loop
  useEffect(() => {
    let raf = 0;
    let last = Date.now();
    const loop = () => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = gameRef.current;
      if (!pausedRef.current) {
        const frame = inputs.map((inp, i) => ({ ...inp, mx: inp.mx + keys[i].mx, my: inp.my + keys[i].my, attack: inp.attack || keys[i].attack }));
        update(g, frame, dt);
        frame.forEach((f, i) => {
          inputs[i].skill = f.skill;
          inputs[i].dodge = f.dodge;
        });
        // sounds of this frame, and music that follows the fight: island, cave, or a boss
        for (const id of g.sfx) playSfx(id);
        g.sfx.length = 0;
        playMusic(g.result ? null : g.enemies.some((e) => e.type === 'bakunawa' || e.boss) ? 'boss' : g.cave ? 'cave' : 'island');
        if (g.result && !endRef.current.done) playSfx(g.result === 'victory' ? 'victory' : 'defeat');
        if (g.result && !endRef.current.done) {
          endRef.current.done = true;
          setTimeout(
            () =>
              endRef.current.onEnd({
                setup,
                heroes: g.heroes.map((h) => h.def.id),
                victory: g.result === 'victory',
                island: g.stage,
                level: Math.max(...g.heroes.map((h) => h.lv)),
                caves: g.caves,
                relics: [...g.relics],
                stage: stageLabel(g),
                kills: g.kills,
                coins: g.coins,
                time: g.time,
                boons: [...g.boons],
              }),
            g.result === 'victory' ? 1200 : 900,
          );
        }
      }
      setFrame((f) => (f + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ------------------------------------------------------------ keyboard (web build)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const down = new Set<string>();
    // solo: WASD or arrows. Co-op: P1 on WASD, P2 on the arrow keys.
    const axis = (pos: string[], neg: string[]) => (pos.some((k) => down.has(k)) ? 1 : 0) - (neg.some((k) => down.has(k)) ? 1 : 0);
    const sync = () => {
      const p1Arrows = coop ? [] : ['arrowright', 'arrowleft', 'arrowdown', 'arrowup'];
      keys[0].mx = axis(['d', ...p1Arrows.slice(0, 1)], ['a', ...p1Arrows.slice(1, 2)]);
      keys[0].my = axis(['s', ...p1Arrows.slice(2, 3)], ['w', ...p1Arrows.slice(3, 4)]);
      keys[0].attack = down.has('j') || down.has(' ');
      if (coop) {
        keys[1].mx = axis(['arrowright'], ['arrowleft']);
        keys[1].my = axis(['arrowdown'], ['arrowup']);
        keys[1].attack = down.has('enter');
      }
    };
    const kd = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const g = gameRef.current;
      if (!down.has(k) && !pausedRef.current) {
        if (g.dialog && (k === ' ' || k === 'enter' || k === 'j')) {
          advanceDialog(g);
          down.add(k);
          return;
        }
        if (g.choice && ['1', '2', '3'].includes(k)) {
          const id = g.choice[Number(k) - 1];
          if (id) chooseBoon(g, id);
        }
        if (k === 'k') inputs[0].skill = true;
        if (k === 'shift' || k === 'l') inputs[0].dodge = true;
        if (coop && k === '.') inputs[1].skill = true;
        if (coop && k === '/') inputs[1].dodge = true;
      }
      if (!down.has(k) && (k === 'escape' || k === 'p')) setPause(!pausedRef.current);
      down.add(k);
      sync();
    };
    const ku = (e: KeyboardEvent) => {
      down.delete(e.key.toLowerCase());
      sync();
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, []);

  // ------------------------------------------------------------ multi-touch
  const hit = (b: { x: number; y: number; r: number }, x: number, y: number) => Math.hypot(x - b.x, y - b.y) < b.r + 10;

  const onTouchStart = (e: GestureResponderEvent) => {
    const g = gameRef.current;
    if (pausedRef.current || g.choice) return;
    if (g.dialog) {
      advanceDialog(g);
      return;
    }
    for (const t of e.nativeEvent.changedTouches) {
      const { pageX: x, pageY: y } = t;
      const id = Number(t.identifier);
      // which player this touch belongs to: in co-op, by screen half
      const p = coop && x >= W / 2 ? 1 : 0;
      const hasStick = [...touches.values()].some((v) => v.c === 'stick' && v.p === p);
      let c: Control | null = null;
      if (hit(pauseBtn, x, y)) c = 'pause';
      else if (!coop && hit(attackBtn, x, y)) c = 'attack';
      else if (hit(skillBtns[p], x, y)) c = 'skill';
      else if (hit(dodgeBtns[p], x, y)) c = 'dodge';
      else if ((coop || x < W * 0.5) && !hasStick) c = 'stick';
      if (!c) continue;
      touches.set(id, { c, p });
      if (c === 'attack') inputs[p].attack = true;
      if (c === 'skill') inputs[p].skill = true;
      if (c === 'dodge') inputs[p].dodge = true;
      if (c === 'pause') setPause(true);
      if (c === 'stick') setStick(p, { ox: x, oy: y, kx: x, ky: y });
    }
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    for (const t of e.nativeEvent.changedTouches) {
      const v = touches.get(Number(t.identifier));
      if (v?.c !== 'stick') continue;
      setStick(v.p, (s) => {
        if (!s) return s;
        let dx = t.pageX - s.ox;
        let dy = t.pageY - s.oy;
        const d = Math.hypot(dx, dy);
        if (d > STICK_R) {
          dx = (dx / d) * STICK_R;
          dy = (dy / d) * STICK_R;
        }
        inputs[v.p].mx = dx / STICK_R;
        inputs[v.p].my = dy / STICK_R;
        return { ...s, kx: s.ox + dx, ky: s.oy + dy };
      });
    }
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    for (const t of e.nativeEvent.changedTouches) {
      const id = Number(t.identifier);
      const v = touches.get(id);
      touches.delete(id);
      if (v?.c === 'attack') inputs[v.p].attack = false;
      if (v?.c === 'stick') {
        inputs[v.p].mx = inputs[v.p].my = 0;
        setStick(v.p, null);
      }
    }
  };

  // ------------------------------------------------------------ render
  const g = gameRef.current;
  const s = Math.min(W / ROOM_W, H / ROOM_H);
  const shake = g.shake > 0 ? (Math.random() - 0.5) * 6 * g.shake * s : 0;
  const ox = (W - ROOM_W * s) / 2 + shake;
  const oy = (H - ROOM_H * s) / 2 + shake;
  const anim = Math.floor(g.time * 5) % 2;

  const img = (key: string, x: number, y: number, w: number, hgt: number, extra?: object, k?: string | number) => (
    <Image
      key={k ?? key}
      source={IMG[key as ImgKey]}
      fadeDuration={0}
      resizeMode="stretch"
      style={[{ position: 'absolute', left: (x - w / 2) * s, top: (y - hgt / 2) * s, width: w * s, height: hgt * s }, extra]}
    />
  );
  const sprite = (key: string, x: number, y: number, size: number, extra?: object, k?: string | number) => img(key, x, y, size, size, extra, k);
  const shadow = (x: number, y: number, w: number, k: string) => (
    <View
      key={k}
      style={{ position: 'absolute', left: (x - w / 2) * s, top: (y - 1.5) * s, width: w * s, height: 3 * s, borderRadius: 2 * s, backgroundColor: 'rgba(0,0,0,0.35)' }}
    />
  );

  const layers: { y: number; node: React.ReactNode[] }[] = [];
  const bossLayer: { y: number; node: React.ReactNode[] }[] = [];

  // heroes, weapons and blade effects
  for (const hero of g.heroes) {
    const k = `h${hero.idx}`;
    const weapon = WEAPONS[hero.weapon];
    if (hero.down) {
      // fallen: lying down, with how far a teammate has got lifting them up
      const frac = hero.revive / REVIVE_TIME;
      layers.push({
        y: hero.y,
        node: [
          sprite(`heroes_${hero.def.id}_hurt_0`, hero.x, hero.y + 3, 16, { transform: [{ rotate: '90deg' }], opacity: 0.7 }, `${k}down`),
          <View key={`${k}rv`} style={[styles.reviveTrack, { left: (hero.x - 10) * s, top: (hero.y - 12) * s, width: 20 * s, height: 2.5 * s }]}>
            <View style={[styles.lampFill, { width: `${frac * 100}%`, backgroundColor: COLORS.armor }]} />
          </View>,
        ],
      });
      continue;
    }
    const blink = hero.invuln > 0 && hero.dash <= 0 && Math.floor(g.time * 20) % 2 === 0;
    // blades sweep through their arc while a swing shows; ranged weapons kick back on each shot
    let aim = hero.aim;
    if (weapon.melee && hero.swing > 0) {
      const p = 1 - hero.swing / 0.14;
      aim = hero.swingAim + ((p * 2 - 1) * (weapon.arc ?? 75) * Math.PI) / 180;
    }
    const deg = (aim * 180) / Math.PI;
    const reach = (weapon.melee ? 7 : 5) - (weapon.melee ? 0 : hero.atkAnim * 12);
    const wx = hero.x + Math.cos(aim) * reach;
    const wy = hero.y + 3 + Math.sin(aim) * reach;
    const nodes: React.ReactNode[] = [
      shadow(hero.x, hero.y + 8, 10, `${k}s`),
      sprite(`heroes_${hero.def.id}_${heroFrame(hero, g.time)}`, hero.x, hero.y, 16, { transform: [{ scaleX: hero.facing }], opacity: blink ? 0.35 : 1 }, `${k}b`),
    ];
    if (coop) {
      nodes.push(
        <PixelText key={`${k}tag`} size={Math.max(6, 2.4 * s)} color={P_COLORS[hero.idx]} style={{ position: 'absolute', left: hero.x * s - 20, width: 40, textAlign: 'center', top: (hero.y - 16) * s }}>
          {`P${hero.idx + 1}`}
        </PixelText>,
      );
    }
    if (hero.dash <= 0) nodes.push(sprite(`weapons_${weapon.id}`, wx, wy, 14, { transform: [{ rotate: `${deg}deg` }, { scaleY: hero.facing }] }, `${k}w`));
    if (hero.swing > 0) {
      const sa = (hero.swingAim * 180) / Math.PI;
      nodes.push(sprite('fx_slash_0', hero.x + Math.cos(hero.swingAim) * 8, hero.y + 3 + Math.sin(hero.swingAim) * 8, 34, { transform: [{ rotate: `${sa}deg` }], opacity: Math.min(1, hero.swing * 10) }, `${k}slash`));
    }
    if (hero.shield > 0) {
      const pulse = 30 + Math.sin(g.time * 12) * 2;
      nodes.push(sprite('fx_ring_shield', hero.x, hero.y + 2, pulse, { opacity: hero.shield < 0.6 && Math.floor(g.time * 10) % 2 ? 0.3 : 0.9 }, `${k}shield`));
    }
    if (hero.spin > 0) {
      for (let i = 0; i < 4; i++) {
        nodes.push(sprite('fx_slash_1', hero.x, hero.y + 3, 70, { transform: [{ rotate: `${g.time * 1400 + i * 90}deg` }] }, `${k}spin${i}`));
      }
    }
    layers.push({ y: hero.y, node: nodes });
  }

  // the way down into a cave, and the steps on inside it
  for (const [spot, key, label] of [
    [g.caveDoor, 'deco_yungib', 'YUNGIB'],
    [g.exit, 'deco_hagdan', g.cave && g.cave.depth >= 3 ? 'PALABAS' : 'PABABA'],
  ] as const) {
    if (!spot) continue;
    const glow = 0.25 + 0.2 * Math.sin(g.time * 3);
    layers.push({
      y: spot.y - 8,
      node: [
        <View key={`${key}g`} style={{ position: 'absolute', left: (spot.x - 12) * s, top: (spot.y - 4) * s, width: 24 * s, height: 14 * s, borderRadius: 12 * s, backgroundColor: `rgba(130,238,214,${glow})` }} />,
        sprite(key, spot.x, spot.y, 18, undefined, key),
        <PixelText key={`${key}t`} size={Math.max(6, 2.6 * s)} color={COLORS.armor} style={{ position: 'absolute', left: spot.x * s - 50, width: 100, textAlign: 'center', top: (spot.y - 17) * s }}>
          {label}
        </PixelText>,
      ],
    });
  }

  for (const e of g.enemies) {
    const def = ENEMIES[e.type];
    const size = def.size * (e.scale ?? 1);
    const spawning = e.spawn > 0;
    const tint = e.flash > 0 ? '#ffffff' : e.poison > 0 && Math.floor(g.time * 6) % 2 === 0 ? '#9be36d' : undefined;
    // creature-specific looks: the tiyanak's disguise, the bungisngis mid-laugh,
    // the sigbin walking backward and only half there until it is close
    let key = `enemies_${e.type}_${anim}`;
    if (e.type === 'tiyanak' && e.state === 0) key = 'enemies_tiyanak_baby';
    if (e.type === 'bungisngis' && e.state === 1) key = 'enemies_bungisngis_1';
    const flip = e.type === 'sigbin' ? e.facing : -e.facing;
    const hidden = !sigbinVisible(g, e);
    const floating = e.type === 'santelmo';
    let opacity = spawning ? 0.4 + 0.4 * Math.sin(g.time * 30) : 1;
    if (hidden) opacity = 0.12 + 0.08 * Math.sin(g.time * 9 + e.id);
    const bob = floating ? Math.sin(g.time * 4 + e.id) * 2 : 0;
    // bosses are drawn above the cave darkness so the biggest threat is always in view
    (e.boss ? bossLayer : layers).push({
      y: e.y,
      node: [
        !hidden && shadow(e.x, e.y + size / 2 + (floating ? 4 : 0), size * (floating ? 0.4 : 0.6), `es${e.id}`),
        sprite(key, e.x, e.y + bob, size, {
          transform: [{ scaleX: flip }, { scale: spawning ? 1 - e.spawn * 0.6 : 1 }],
          opacity,
          tintColor: tint,
        }, `e${e.id}`),
      ],
    });
  }

  if (g.shrine) {
    const glow = g.shrine.used ? 0 : 0.35 + 0.25 * Math.sin(g.time * 4);
    layers.push({
      y: g.shrine.y,
      node: [
        <View
          key="shrineGlow"
          style={{ position: 'absolute', left: (g.shrine.x - 14) * s, top: (g.shrine.y - 6) * s, width: 28 * s, height: 20 * s, borderRadius: 14 * s, backgroundColor: `rgba(255,220,130,${glow})` }}
        />,
        sprite('deco_dambana', g.shrine.x, g.shrine.y, 16, g.shrine.used ? { opacity: 0.7 } : undefined, 'shrine'),
      ],
    });
  }

  if (g.npc) {
    layers.push({
      y: g.npc.y,
      node: [
        shadow(g.npc.x, g.npc.y + 8, 10, 'npcs'),
        sprite(`npc_haliya_${Math.floor(g.time * 1.5) % 2}`, g.npc.x, g.npc.y, 16, { transform: [{ scaleX: g.hero.x < g.npc.x ? -1 : 1 }] }, 'npc'),
      ],
    });
  }

  for (const p of g.pickups) {
    const bob = Math.sin(p.t * 4 + p.id) * 1.5;
    if (p.kind === 'weapon') {
      // a weapon on the ground: glowing, slowly turning, with its name above it
      const glow = 0.25 + 0.15 * Math.sin(p.t * 5);
      layers.push({
        y: p.y - 4,
        node: [
          <View key={`pg${p.id}`} style={{ position: 'absolute', left: (p.x - 8) * s, top: (p.y - 4) * s, width: 16 * s, height: 10 * s, borderRadius: 8 * s, backgroundColor: `rgba(255,200,110,${glow})` }} />,
          sprite(`weapons_${p.weapon}`, p.x, p.y + bob, 14, { transform: [{ rotate: `${Math.sin(p.t * 2) * 25 - 30}deg` }], opacity: p.armed ? 1 : 0.6 }, `p${p.id}`),
          <PixelText key={`pn${p.id}`} size={Math.max(6, 2.6 * s)} color={COLORS.light} shadow style={{ position: 'absolute', left: p.x * s - 60, width: 120, textAlign: 'center', top: (p.y - 15) * s }}>
            {WEAPONS[p.weapon!].name.toUpperCase()}
          </PixelText>,
        ],
      });
      continue;
    }
    if (p.kind === 'relic') {
      // a boss's mutya: a bright, pulsing glow and its name
      const glow = 0.35 + 0.25 * Math.sin(p.t * 6);
      layers.push({
        y: p.y + 20,
        node: [
          <View key={`rg${p.id}`} style={{ position: 'absolute', left: (p.x - 11) * s, top: (p.y - 9) * s, width: 22 * s, height: 18 * s, borderRadius: 11 * s, backgroundColor: `rgba(130,238,214,${glow})` }} />,
          sprite(`relics_${p.relic}`, p.x, p.y + bob * 1.5, 16, undefined, `p${p.id}`),
          <PixelText key={`rn${p.id}`} size={Math.max(6, 2.6 * s)} color={COLORS.armor} style={{ position: 'absolute', left: p.x * s - 80, width: 160, textAlign: 'center', top: (p.y - 20) * s }}>
            {RELICS[p.relic!].name.toUpperCase()}
          </PixelText>,
        ],
      });
      continue;
    }
    layers.push({ y: p.y - 4, node: [sprite(`items_${p.kind}`, p.x, p.y + bob, 16, undefined, `p${p.id}`)] });
  }
  if (g.chest) {
    const c = g.chest;
    const glow = c.open ? 0 : 0.25 + 0.2 * Math.sin(g.time * 3);
    layers.push({
      y: c.y,
      node: [
        <View key="chestGlow" style={{ position: 'absolute', left: (c.x - 12) * s, top: (c.y - 2) * s, width: 24 * s, height: 12 * s, borderRadius: 12 * s, backgroundColor: `rgba(255,232,130,${glow})` }} />,
        shadow(c.x, c.y + 7, 12, 'chestS'),
        sprite(`deco_chest_${c.open ? 1 : 0}`, c.x, c.y, 16, undefined, 'chest'),
      ],
    });
  }
  for (const f of g.fx) {
    const p = Math.min(1, f.t / FX_LIFE[f.kind]);
    if (f.kind === 'wave') {
      const size = 16 + p * (f.size ?? 120);
      layers.push({ y: 9999, node: [sprite('fx_ring_wave', f.x, f.y, size, { opacity: 1 - p }, `fx${f.id}`)] });
      continue;
    }
    const n = FX_FRAMES[f.kind];
    const frame = Math.min(n - 1, Math.floor(p * n));
    const big = f.kind === 'boom' || f.kind === 'poof';
    const size = f.kind === 'boom' ? (f.size ?? 24) : big ? 18 : 8;
    const y = f.kind === 'heal' ? f.y - p * 8 : f.y;
    layers.push({ y: f.kind === 'dust' ? f.y - 9 : f.y + 20, node: [sprite(`fx_${f.kind}_${frame}`, f.x, y, size, undefined, `fx${f.id}`)] });
  }
  layers.sort((a, b) => a.y - b.y);

  const boss = g.enemies.find((e) => e.type === 'bakunawa' || e.boss);

  // caves are dark: a pool of light around the party, black beyond it
  let darkness: React.ReactNode = null;
  if (g.cave) {
    const standing = alive(g).length ? alive(g) : g.heroes;
    const cx = standing.reduce((a, o) => a + o.x, 0) / standing.length;
    const cy = standing.reduce((a, o) => a + o.y, 0) / standing.length;
    const spread = Math.max(...standing.map((o) => Math.hypot(o.x - cx, o.y - cy)));
    // the clear middle of the light pool is a fifth of its size; keep every hero inside it
    const half = Math.max(200, (spread + 30) / 0.2);
    const l = (cx - half) * s;
    const t = (cy - half) * s;
    const size = half * 2 * s;
    const black = 'rgba(4,2,10,0.94)';
    darkness = (
      <>
        <Image source={IMG.fx_darkness} fadeDuration={0} resizeMode="stretch" style={{ position: 'absolute', left: l, top: t, width: size, height: size }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.max(0, t), backgroundColor: black }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: t + size, bottom: 0, backgroundColor: black }} />
        <View style={{ position: 'absolute', left: 0, width: Math.max(0, l), top: t, height: size, backgroundColor: black }} />
        <View style={{ position: 'absolute', left: l + size, right: 0, top: t, height: size, backgroundColor: black }} />
      </>
    );
  }

  return (
    <View style={styles.root} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
      {/* world */}
      <View pointerEvents="none" style={{ position: 'absolute', left: ox, top: oy, width: ROOM_W * s, height: ROOM_H * s, overflow: 'hidden' }}>
        <Image source={IMG[`rooms_${g.room}` as ImgKey]} style={{ width: ROOM_W * s, height: ROOM_H * s }} resizeMode="stretch" fadeDuration={0} />
        {g.boat && img(`deco_balangay_${Math.floor(g.time * 2) % 2}`, g.boat.x + 14, g.boat.y - 2, 32, 20, undefined, 'boat')}
        {layers.map((l) => l.node)}
        {/* shots and numbers stay readable above the cave darkness */}
        {darkness}
        {bossLayer.map((l) => l.node)}
        {g.bullets.map((b) => {
          const rot = b.sprite === 'shot_arrow' || b.sprite === 'shot_dart' || b.sprite === 'shot_spear' || b.sprite === 'shot_beetle';
          const deg = (Math.atan2(b.vy, b.vx) * 180) / Math.PI;
          // shots the kalasag turned back keep the enemy sprite, tinted gold
          const turned = b.fromHero && b.sprite === 'shot_enemy' ? { tintColor: COLORS.gold } : undefined;
          return sprite(`projectiles_${b.sprite}`, b.x, b.y, b.r > 3 ? 10 : rot ? 9 : 7, rot ? { transform: [{ rotate: `${deg}deg` }] } : turned, `b${b.id}`);
        })}
        {g.texts.map((t) => (
          <PixelText
            key={`t${t.id}`}
            size={Math.max(7, 4 * s)}
            color={t.color}
            style={{ position: 'absolute', left: t.x * s - 50, width: 100, textAlign: 'center', top: t.y * s - 6, opacity: Math.min(1, t.t * 2) }}
          >
            {t.text}
          </PixelText>
        ))}
      </View>

      {g.banner && (
        <View pointerEvents="none" style={[styles.banner, { top: H * 0.26 }]}>
          {g.banner.baybayin && <BaybayinText size={18} color={COLORS.light}>{g.banner.baybayin}</BaybayinText>}
          <PixelText size={16} color={COLORS.gold}>
            {g.banner.text}
          </PixelText>
          {g.banner.sub && (
            <PixelText size={9} color={COLORS.text} style={{ marginTop: 4, maxWidth: W * 0.6, textAlign: 'center' }}>
              {g.banner.sub}
            </PixelText>
          )}
        </View>
      )}

      {g.npc?.talking && !g.dialog && (
        <View pointerEvents="none" style={[styles.bubble, { left: ox + g.npc.x * s - 100, top: oy + (g.npc.y - 12) * s - 56, width: 210 }]}>
          <PixelText size={7} color={COLORS.light} shadow={false}>
            HALIYA
          </PixelText>
          <PixelText size={7} shadow={false}>
            {g.npc.line}
          </PixelText>
        </View>
      )}

      {/* HUDs: one per player */}
      <HeroHud h={g.heroes[0]} label={coop ? 'P1' : undefined} />
      {coop && <HeroHud h={g.heroes[1]} right label="P2" />}
      {g.boons.length + g.relics.length > 0 && (
        <View pointerEvents="none" style={[styles.pips, styles.boons]}>
          {g.relics.map((r) => (
            <Sprite key={r} name={`relics_${r}` as ImgKey} size={16} />
          ))}
          {g.boons.map((b) => (
            <Sprite key={b} name={`ui_boon_${b}` as ImgKey} size={16} />
          ))}
        </View>
      )}
      <View style={coop ? styles.topCenter : styles.topRight} pointerEvents="none">
        <Sprite name="items_coin" size={20} />
        <PixelText size={10} color={COLORS.gold} style={{ marginRight: 14 }}>
          {g.coins}
        </PixelText>
        <PixelText size={9} style={{ marginRight: coop ? 0 : 52 }}>
          {g.cave ? stageLabel(g) : g.mode === 'endless' ? `${stageLabel(g)}  ISLA ${g.stage}` : `${stageLabel(g)}  ${g.stage}/${g.route.length - 1}`}
        </PixelText>
      </View>
      {button('ui_btn_pause', pauseBtn)}

      {boss && (
        <View pointerEvents="none" style={[styles.bossBar, { left: W * 0.3, width: W * 0.4, top: coop ? 66 : 10 }]}>
          <PixelText size={8} color="#ff8a7a">
            {bossName(boss)}
          </PixelText>
          <View style={styles.bossTrack}>
            <View style={[styles.lampFill, { width: `${(boss.hp / boss.maxHp) * 100}%`, backgroundColor: COLORS.red }]} />
          </View>
        </View>
      )}

      {/* controls */}
      {sticks.map((st, p) =>
        st ? (
          <View key={`stick${p}`} pointerEvents="none" style={styles.abs}>
            <Image source={IMG.ui_joystick_base} fadeDuration={0} style={[styles.abs, { left: st.ox - 60, top: st.oy - 60, width: 120, height: 120 }]} />
            <Image source={IMG.ui_joystick_knob} fadeDuration={0} style={[styles.abs, { left: st.kx - 26, top: st.ky - 26, width: 52, height: 52, tintColor: coop ? P_COLORS[p] : undefined }]} />
          </View>
        ) : (
          <View key={`stick${p}`} pointerEvents="none" style={[styles.abs, p === 0 ? { left: coop ? 100 : 40 } : { right: 100 }, { bottom: 30, opacity: 0.3 }]}>
            <Image source={IMG.ui_joystick_base} fadeDuration={0} style={{ width: 120, height: 120 }} />
          </View>
        ),
      )}
      {!coop && button('ui_btn_attack', attackBtn, inputs[0].attack ? 0.75 : 1)}
      {g.heroes.map((hero) => {
        const ready = hero.light >= LIGHT_MAX;
        const sk = skillBtns[hero.idx];
        return (
          <View key={`ctl${hero.idx}`} pointerEvents="none" style={styles.abs}>
            {button('ui_btn_dodge', dodgeBtns[hero.idx], hero.dodgeCd > 0 || hero.down ? 0.45 : 1, 1, `dodge${hero.idx}`)}
            {button('ui_btn_skill', sk, ready && !hero.down ? 1 : 0.4, ready ? 1 + 0.06 * Math.sin(g.time * 8) : 1, `skill${hero.idx}`)}
            {!ready && (
              <View style={[styles.abs, { left: sk.x - 24, top: sk.y - 8, width: 48, alignItems: 'center' }]}>
                <PixelText size={coop ? 7 : 9}>{`${Math.floor((hero.light / LIGHT_MAX) * 100)}%`}</PixelText>
              </View>
            )}
            <View style={[styles.abs, { left: sk.x - 50, top: sk.y + sk.r, width: 100, alignItems: 'center' }]}>
              <PixelText size={coop ? 6 : 7} color={ready ? COLORS.gold : COLORS.dim}>
                {hero.def.skill.name.toUpperCase()}
              </PixelText>
            </View>
          </View>
        );
      })}

      {/* the dambana: choose a blessing */}
      {g.choice && (
        <View style={styles.overlay}>
          <BaybayinText size={20} color={COLORS.light}>ᜇᜋ᜔ᜊᜈ</BaybayinText>
          <PixelText size={14} color={COLORS.gold}>
            DAMBANA
          </PixelText>
          <PixelText size={8} color={COLORS.text} style={{ marginBottom: 12 }}>
            {coop ? 'An old god answers your offering. Choose one blessing for you both.' : 'An old god answers your offering. Choose one blessing.'}
          </PixelText>
          <View style={styles.cards}>
            {g.choice.map((id, i) => {
              // anyone in the party may choose; blessings apply to everyone
              const b = BOONS[id];
              return (
                <Pressable key={id} onPress={() => chooseBoon(g, id)} style={({ pressed }) => [styles.card, pressed && { borderColor: COLORS.gold }]}>
                  <Sprite name={`ui_boon_${id}` as ImgKey} size={48} />
                  <PixelText size={11} color={COLORS.gold} style={{ marginTop: 6 }}>
                    {b.deity}
                  </PixelText>
                  <PixelText size={7} color={COLORS.dim} shadow={false} style={{ textAlign: 'center' }}>
                    {b.domain}
                  </PixelText>
                  <PixelText size={8} color={COLORS.light} style={{ marginTop: 6 }}>
                    {b.name}
                  </PixelText>
                  <PixelText size={7} shadow={false} style={{ textAlign: 'center' }}>
                    {b.desc}
                  </PixelText>
                  {Platform.OS === 'web' && (
                    <PixelText size={7} color={COLORS.dim} shadow={false} style={{ marginTop: 4 }}>
                      {`[${i + 1}]`}
                    </PixelText>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {g.dialog && (() => {
        const line = g.dialog.lines[g.dialog.i];
        const left = line.side === 'left';
        const enemy = line.speaker === 'BAKUNAWA';
        return (
          <View pointerEvents="none" style={styles.dialogWrap}>
            <View style={[styles.dialog, { flexDirection: left ? 'row' : 'row-reverse' }]}>
              <Image source={IMG[line.portrait]} fadeDuration={0} resizeMode="stretch" style={styles.dialogPortrait} />
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <PixelText size={11} color={enemy ? '#ff8a7a' : COLORS.light} style={{ textAlign: left ? 'left' : 'right' }}>
                  {line.speaker}
                </PixelText>
                <PixelText size={9} shadow={false} style={{ textAlign: left ? 'left' : 'right' }}>
                  {line.text}
                </PixelText>
                <PixelText size={7} color={COLORS.dim} shadow={false} style={{ marginTop: 4, textAlign: left ? 'right' : 'left' }}>
                  TAP ▸
                </PixelText>
              </View>
            </View>
          </View>
        );
      })()}

      {paused && (
        <View style={styles.overlay}>
          <Panel style={{ alignItems: 'center', padding: 24 }}>
            <PixelText size={16} color={COLORS.gold} style={{ marginBottom: 18 }}>
              PAUSED
            </PixelText>
            <PixelButton label="RESUME" onPress={() => setPause(false)} style={{ marginBottom: 10, width: 200 }} />
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <PixelButton
                label={`MUSIKA: ${sound.musicOn ? 'ON' : 'OFF'}`}
                size={8}
                color="#5a4a78"
                onPress={() => {
                  setMusicOn(!sound.musicOn);
                  onSoundChange?.({ ...audioSettings() });
                  setSound({ ...audioSettings() });
                }}
              />
              <PixelButton
                label={`TUNOG: ${sound.sfxOn ? 'ON' : 'OFF'}`}
                size={8}
                color="#5a4a78"
                onPress={() => {
                  setSfxOn(!sound.sfxOn);
                  onSoundChange?.({ ...audioSettings() });
                  setSound({ ...audioSettings() });
                }}
              />
            </View>
            <PixelButton label="RETURN TO TONDO" onPress={onQuit} color="#5a4a78" style={{ width: 200 }} />
          </Panel>
        </View>
      )}
    </View>
  );

  function button(key: ImgKey, b: Btn, opacity = 1, scale = 1, k?: string) {
    return (
      <Image
        key={k ?? key}
        source={IMG[key]}
        fadeDuration={0}
        style={[styles.abs, { left: b.x - b.r, top: b.y - b.r, width: b.r * 2, height: b.r * 2, opacity, transform: [{ scale }] }]}
      />
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SEA },
  abs: { position: 'absolute' },
  banner: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  hud: { position: 'absolute', top: 8, flexDirection: 'row', alignItems: 'flex-start' },
  medalLabel: { position: 'absolute', bottom: -4, left: 0, right: 0, textAlign: 'center' },
  boons: { position: 'absolute', left: 8, top: 104 },
  topCenter: { position: 'absolute', top: 44, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  reviveTrack: { position: 'absolute', backgroundColor: 'rgba(8,18,24,0.85)' },
  medal: { width: 56, height: 56 },
  medalFrame: { position: 'absolute', width: 56, height: 56 },
  medalPortrait: { position: 'absolute', left: 12, top: 10, width: 32, height: 32 },
  pips: { flexDirection: 'row', gap: 2 },
  lamp: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lampTrack: { width: 84, height: 8, backgroundColor: 'rgba(8,18,24,0.8)', borderWidth: 1, borderColor: '#7a5a2a' },
  lampFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  topRight: { position: 'absolute', right: 8, top: 16, flexDirection: 'row', alignItems: 'center' },
  bossBar: { position: 'absolute', top: 10, alignItems: 'center' },
  bossTrack: { height: 10, alignSelf: 'stretch', backgroundColor: '#0c161c', borderWidth: 2, borderColor: '#7e1e22', marginTop: 2 },
  bubble: { position: 'absolute', padding: 6, backgroundColor: 'rgba(8,18,24,0.92)', borderWidth: 2, borderColor: '#ffe882' },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(5,10,18,0.78)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  cards: { flexDirection: 'row', gap: 12 },
  card: { width: 170, alignItems: 'center', padding: 12, backgroundColor: 'rgba(20,16,34,0.95)', borderWidth: 3, borderColor: '#b07a30' },
  dialogWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end', padding: 16, backgroundColor: 'rgba(5,12,16,0.45)' },
  dialog: { alignItems: 'center', padding: 12, backgroundColor: 'rgba(8,18,24,0.95)', borderWidth: 3, borderColor: '#ffba48' },
  dialogPortrait: { width: 84, height: 84, borderWidth: 2, borderColor: '#2c4a50', backgroundColor: '#1c3a40' },
});
