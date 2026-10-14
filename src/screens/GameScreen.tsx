import { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { BOONS, BOSS_NAME, ENEMIES, HeroId, LIGHT_MAX, WeaponId, WEAPONS } from '../game/data';
import { advanceDialog, chooseBoon, DODGE_TIME, FX_LIFE, Game, Hero, Input, newGame, ROOM_H, ROOM_W, stageLabel, update } from '../game/engine';
import { BaybayinText, COLORS, Panel, PixelButton, PixelText, Sprite } from '../ui';
import { RunStats } from './ResultScreen';

type Control = 'stick' | 'attack' | 'skill' | 'dodge' | 'pause';
const STICK_R = 44;
const SEA = '#0c2c3e';

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

/** Which pose the hero is in this frame: roll, hurt, attack, walk or idle. */
function heroFrame(h: Hero, time: number) {
  if (h.dash > 0) return `roll_${Math.min(3, Math.floor(((DODGE_TIME - h.dash) / DODGE_TIME) * 4))}`;
  if (h.sinceHit < 0.25) return 'hurt_0';
  if (h.atkAnim > 0) return h.atkAnim > 0.08 ? 'attack_1' : 'attack_0';
  if (h.moving) return `walk_${Math.floor(h.walk * 10) % 4}`;
  return `idle_${Math.floor(time * 2) % 2}`;
}

export default function GameScreen({
  heroId,
  weaponId,
  onEnd,
  onQuit,
}: {
  heroId: HeroId;
  weaponId?: WeaponId;
  onEnd: (s: RunStats) => void;
  onQuit: () => void;
}) {
  const { width: W, height: H } = useWindowDimensions();
  const gameRef = useRef<Game>(null as unknown as Game);
  if (!gameRef.current) gameRef.current = newGame(heroId, weaponId);
  const input = useRef<Input>({ mx: 0, my: 0, attack: false, skill: false, dodge: false }).current;
  const keys = useRef({ mx: 0, my: 0, attack: false }).current;
  const touches = useRef(new Map<number, Control>()).current;
  const [stick, setStick] = useState<{ ox: number; oy: number; kx: number; ky: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [, setFrame] = useState(0);
  const endRef = useRef({ onEnd, done: false });
  endRef.current.onEnd = onEnd;

  // controls layout (screen space)
  const attackBtn = { x: W - 80, y: H - 80, r: 48 };
  const dodgeBtn = { x: W - 178, y: H - 50, r: 30 };
  const skillBtn = { x: W - 66, y: H - 182, r: 34 };
  const pauseBtn = { x: W - 28, y: 26, r: 22 };

  const setPause = (p: boolean) => {
    pausedRef.current = p;
    setPaused(p);
    if (p) {
      touches.clear();
      input.attack = false;
      input.mx = input.my = 0;
      setStick(null);
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
        const frameInput = { ...input, mx: input.mx + keys.mx, my: input.my + keys.my, attack: input.attack || keys.attack };
        update(g, frameInput, dt);
        input.skill = frameInput.skill;
        input.dodge = frameInput.dodge;
        if (g.result && !endRef.current.done) {
          endRef.current.done = true;
          setTimeout(
            () =>
              endRef.current.onEnd({
                hero: heroId,
                weapon: g.hero.weapon,
                victory: g.result === 'victory',
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
    const sync = () => {
      keys.mx = (down.has('d') || down.has('arrowright') ? 1 : 0) - (down.has('a') || down.has('arrowleft') ? 1 : 0);
      keys.my = (down.has('s') || down.has('arrowdown') ? 1 : 0) - (down.has('w') || down.has('arrowup') ? 1 : 0);
      keys.attack = down.has('j') || down.has(' ');
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
        if (k === 'k') input.skill = true;
        if (k === 'shift' || k === 'l') input.dodge = true;
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
      let c: Control | null = null;
      if (hit(pauseBtn, x, y)) c = 'pause';
      else if (hit(attackBtn, x, y)) c = 'attack';
      else if (hit(skillBtn, x, y)) c = 'skill';
      else if (hit(dodgeBtn, x, y)) c = 'dodge';
      else if (x < W * 0.5 && ![...touches.values()].includes('stick')) c = 'stick';
      if (!c) continue;
      touches.set(id, c);
      if (c === 'attack') input.attack = true;
      if (c === 'skill') input.skill = true;
      if (c === 'dodge') input.dodge = true;
      if (c === 'pause') setPause(true);
      if (c === 'stick') setStick({ ox: x, oy: y, kx: x, ky: y });
    }
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    for (const t of e.nativeEvent.changedTouches) {
      if (touches.get(Number(t.identifier)) !== 'stick') continue;
      setStick((s) => {
        if (!s) return s;
        let dx = t.pageX - s.ox;
        let dy = t.pageY - s.oy;
        const d = Math.hypot(dx, dy);
        if (d > STICK_R) {
          dx = (dx / d) * STICK_R;
          dy = (dy / d) * STICK_R;
        }
        input.mx = dx / STICK_R;
        input.my = dy / STICK_R;
        return { ...s, kx: s.ox + dx, ky: s.oy + dy };
      });
    }
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    for (const t of e.nativeEvent.changedTouches) {
      const id = Number(t.identifier);
      const c = touches.get(id);
      touches.delete(id);
      if (c === 'attack') input.attack = false;
      if (c === 'stick') {
        input.mx = input.my = 0;
        setStick(null);
      }
    }
  };

  // ------------------------------------------------------------ render
  const g = gameRef.current;
  const h = g.hero;
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
  const weapon = WEAPONS[h.weapon];

  // hero, weapon and blade effects
  {
    const blink = h.invuln > 0 && h.dash <= 0 && Math.floor(g.time * 20) % 2 === 0;
    // blades sweep through their arc while a swing shows; ranged weapons kick back on each shot
    let aim = h.aim;
    if (weapon.melee && h.swing > 0) {
      const p = 1 - h.swing / 0.14;
      aim = h.swingAim + ((p * 2 - 1) * (weapon.arc ?? 75) * Math.PI) / 180;
    }
    const deg = (aim * 180) / Math.PI;
    const reach = (weapon.melee ? 7 : 5) - (weapon.melee ? 0 : h.atkAnim * 12);
    const wx = h.x + Math.cos(aim) * reach;
    const wy = h.y + 3 + Math.sin(aim) * reach;
    const nodes: React.ReactNode[] = [
      shadow(h.x, h.y + 8, 10, 'hs'),
      sprite(`heroes_${h.def.id}_${heroFrame(h, g.time)}`, h.x, h.y, 16, { transform: [{ scaleX: h.facing }], opacity: blink ? 0.35 : 1 }, 'hero'),
    ];
    if (h.dash <= 0) nodes.push(sprite(`weapons_${weapon.id}`, wx, wy, 14, { transform: [{ rotate: `${deg}deg` }, { scaleY: h.facing }] }, 'weapon'));
    if (h.swing > 0) {
      const sa = (h.swingAim * 180) / Math.PI;
      nodes.push(sprite('fx_slash_0', h.x + Math.cos(h.swingAim) * 8, h.y + 3 + Math.sin(h.swingAim) * 8, 34, { transform: [{ rotate: `${sa}deg` }], opacity: Math.min(1, h.swing * 10) }, 'slash'));
    }
    if (h.spin > 0) {
      for (let i = 0; i < 4; i++) {
        nodes.push(sprite('fx_slash_1', h.x, h.y + 3, 70, { transform: [{ rotate: `${g.time * 1400 + i * 90}deg` }] }, `spin${i}`));
      }
    }
    layers.push({ y: h.y, node: nodes });
  }

  for (const e of g.enemies) {
    const def = ENEMIES[e.type];
    const spawning = e.spawn > 0;
    const tint = e.flash > 0 ? '#ffffff' : e.poison > 0 && Math.floor(g.time * 6) % 2 === 0 ? '#9be36d' : undefined;
    layers.push({
      y: e.y,
      node: [
        shadow(e.x, e.y + def.size / 2, def.size * 0.6, `es${e.id}`),
        sprite(`enemies_${e.type}_${anim}`, e.x, e.y, def.size, {
          transform: [{ scaleX: -e.facing }, { scale: spawning ? 1 - e.spawn * 0.6 : 1 }],
          opacity: spawning ? 0.4 + 0.4 * Math.sin(g.time * 30) : 1,
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
        sprite(`npc_haliya_${Math.floor(g.time * 1.5) % 2}`, g.npc.x, g.npc.y, 16, { transform: [{ scaleX: h.x < g.npc.x ? -1 : 1 }] }, 'npc'),
      ],
    });
  }

  for (const p of g.pickups) {
    const bob = Math.sin(p.t * 4 + p.id) * 1.5;
    layers.push({ y: p.y - 4, node: [sprite(`items_${p.kind}`, p.x, p.y + bob, 16, undefined, `p${p.id}`)] });
  }
  for (const f of g.fx) {
    const life = FX_LIFE[f.kind];
    const frame = Math.min(f.kind === 'dust' ? 2 : 1, Math.floor((f.t / life) * (f.kind === 'dust' ? 3 : 2)));
    layers.push({ y: f.kind === 'dust' ? f.y - 9 : f.y + 20, node: [sprite(`fx_${f.kind}_${frame}`, f.x, f.y, 8, undefined, `fx${f.id}`)] });
  }
  layers.sort((a, b) => a.y - b.y);

  const boss = g.enemies.find((e) => e.type === 'bakunawa');
  const lightFrac = h.light / LIGHT_MAX;
  const ready = h.light >= LIGHT_MAX;

  return (
    <View style={styles.root} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
      {/* world */}
      <View pointerEvents="none" style={{ position: 'absolute', left: ox, top: oy, width: ROOM_W * s, height: ROOM_H * s, overflow: 'hidden' }}>
        <Image source={IMG[`rooms_${g.room}` as ImgKey]} style={{ width: ROOM_W * s, height: ROOM_H * s }} resizeMode="stretch" fadeDuration={0} />
        {g.boat && img(`deco_balangay_${Math.floor(g.time * 2) % 2}`, g.boat.x + 14, g.boat.y - 2, 32, 20, undefined, 'boat')}
        {layers.map((l) => l.node)}
        {g.bullets.map((b) => {
          const rot = b.sprite === 'shot_arrow' || b.sprite === 'shot_dart' || b.sprite === 'shot_spear' || b.sprite === 'shot_beetle';
          const deg = (Math.atan2(b.vy, b.vx) * 180) / Math.PI;
          return sprite(`projectiles_${b.sprite}`, b.x, b.y, b.r > 3 ? 10 : rot ? 9 : 7, rot ? { transform: [{ rotate: `${deg}deg` }] } : undefined, `b${b.id}`);
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

      {/* HUD: portrait medallion with bead rows */}
      <View pointerEvents="none" style={styles.hud}>
        <View style={styles.medal}>
          <Image source={IMG.ui_medallion} fadeDuration={0} style={styles.medalFrame} />
          <Image source={IMG[`portraits_${h.def.id}` as ImgKey]} fadeDuration={0} style={styles.medalPortrait} />
        </View>
        <View style={{ marginLeft: 6, gap: 3 }}>
          <Pips value={h.hp} max={h.maxHp} full="ui_pip_hp" empty="ui_pip_hp_empty" />
          <Pips value={h.armor} max={h.maxArmor} full="ui_pip_armor" empty="ui_pip_armor_empty" />
          <View style={styles.lamp}>
            <Sprite name="ui_energy" size={12} />
            <View style={styles.lampTrack}>
              <View style={[styles.lampFill, { width: `${lightFrac * 100}%`, backgroundColor: ready ? COLORS.gold : COLORS.light }]} />
            </View>
          </View>
          {g.boons.length > 0 && (
            <View style={styles.pips}>
              {g.boons.map((b) => (
                <Sprite key={b} name={`ui_boon_${b}` as ImgKey} size={16} />
              ))}
            </View>
          )}
        </View>
      </View>
      <View style={styles.topRight} pointerEvents="none">
        <Sprite name="items_coin" size={20} />
        <PixelText size={10} color={COLORS.gold} style={{ marginRight: 14 }}>
          {g.coins}
        </PixelText>
        <PixelText size={9} style={{ marginRight: 52 }}>
          {`${stageLabel(g)}  ${g.stage}/${g.route.length - 1}`}
        </PixelText>
      </View>
      {button('ui_btn_pause', pauseBtn)}

      {boss && (
        <View pointerEvents="none" style={[styles.bossBar, { left: W * 0.3, width: W * 0.4 }]}>
          <PixelText size={8} color="#ff8a7a">
            {BOSS_NAME}
          </PixelText>
          <View style={styles.bossTrack}>
            <View style={[styles.lampFill, { width: `${(boss.hp / boss.maxHp) * 100}%`, backgroundColor: COLORS.red }]} />
          </View>
        </View>
      )}

      {/* controls */}
      {stick ? (
        <>
          <Image source={IMG.ui_joystick_base} fadeDuration={0} style={[styles.abs, { left: stick.ox - 60, top: stick.oy - 60, width: 120, height: 120 }]} />
          <Image source={IMG.ui_joystick_knob} fadeDuration={0} style={[styles.abs, { left: stick.kx - 26, top: stick.ky - 26, width: 52, height: 52 }]} />
        </>
      ) : (
        <View pointerEvents="none" style={[styles.abs, { left: 40, bottom: 30, opacity: 0.3 }]}>
          <Image source={IMG.ui_joystick_base} fadeDuration={0} style={{ width: 120, height: 120 }} />
        </View>
      )}
      {button('ui_btn_attack', attackBtn, input.attack ? 0.75 : 1)}
      {button('ui_btn_dodge', dodgeBtn, h.dodgeCd > 0 ? 0.45 : 1)}
      {button('ui_btn_skill', skillBtn, ready ? 1 : 0.4, ready ? 1 + 0.06 * Math.sin(g.time * 8) : 1)}
      {!ready && (
        <View pointerEvents="none" style={[styles.abs, { left: skillBtn.x - 24, top: skillBtn.y - 8, width: 48, alignItems: 'center' }]}>
          <PixelText size={9}>{`${Math.floor(lightFrac * 100)}%`}</PixelText>
        </View>
      )}
      <View pointerEvents="none" style={[styles.abs, { left: skillBtn.x - 50, top: skillBtn.y + skillBtn.r, width: 100, alignItems: 'center' }]}>
        <PixelText size={7} color={ready ? COLORS.gold : COLORS.dim}>
          {h.def.skill.name.toUpperCase()}
        </PixelText>
      </View>

      {/* the dambana: choose a blessing */}
      {g.choice && (
        <View style={styles.overlay}>
          <BaybayinText size={20} color={COLORS.light}>ᜇᜋ᜔ᜊᜈ</BaybayinText>
          <PixelText size={14} color={COLORS.gold}>
            DAMBANA
          </PixelText>
          <PixelText size={8} color={COLORS.text} style={{ marginBottom: 12 }}>
            An old god answers your offering. Choose one blessing.
          </PixelText>
          <View style={styles.cards}>
            {g.choice.map((id, i) => {
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
            <PixelButton label="RETURN TO TONDO" onPress={onQuit} color="#5a4a78" style={{ width: 200 }} />
          </Panel>
        </View>
      )}
    </View>
  );

  function button(key: ImgKey, b: { x: number; y: number; r: number }, opacity = 1, scale = 1) {
    return (
      <Image
        key={key}
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
  hud: { position: 'absolute', left: 8, top: 8, flexDirection: 'row', alignItems: 'flex-start' },
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
