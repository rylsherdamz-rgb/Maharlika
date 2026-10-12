import { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Image, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { BOSS_NAME, ENEMIES, HeroId, WEAPONS, WeaponId } from '../game/data';
import { Game, Input, newGame, ROOM_H, ROOM_W, stageLabel, update } from '../game/engine';
import { COLORS, Panel, PixelButton, PixelText, Sprite } from '../ui';
import { RunStats } from './ResultScreen';

type Control = 'stick' | 'fire' | 'skill' | 'swap' | 'pause';
const STICK_R = 44;

function Bar({ icon, value, max, color }: { icon: ImgKey; value: number; max: number; color: string }) {
  return (
    <View style={styles.barRow}>
      <Sprite name={icon} size={14} />
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.max(0, Math.min(1, value / max)) * 100}%`, backgroundColor: color }]} />
        <PixelText size={7} style={styles.barText}>
          {`${Math.floor(value)}/${max}`}
        </PixelText>
      </View>
    </View>
  );
}

export default function GameScreen({ heroId, onEnd, onQuit }: { heroId: HeroId; onEnd: (s: RunStats) => void; onQuit: () => void }) {
  const { width: W, height: H } = useWindowDimensions();
  const gameRef = useRef<Game>(null as unknown as Game);
  if (!gameRef.current) gameRef.current = newGame(heroId);
  const input = useRef<Input>({ mx: 0, my: 0, fire: false, skill: false, swap: false }).current;
  const keys = useRef({ mx: 0, my: 0 }).current;
  const touches = useRef(new Map<number, Control>()).current;
  const [stick, setStick] = useState<{ ox: number; oy: number; kx: number; ky: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [, setFrame] = useState(0);
  const endRef = useRef({ onEnd, done: false });
  endRef.current.onEnd = onEnd;

  // controls layout (screen space)
  const fireBtn = { x: W - 78, y: H - 78, r: 46 };
  const skillBtn = { x: W - 168, y: H - 46, r: 32 };
  const swapBtn = { x: W - 62, y: H - 172, r: 28 };
  const pauseBtn = { x: W - 28, y: 26, r: 22 };

  const setPause = (p: boolean) => {
    pausedRef.current = p;
    setPaused(p);
    if (p) {
      touches.clear();
      input.fire = false;
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
        const frameInput = { ...input, mx: input.mx + keys.mx, my: input.my + keys.my };
        update(g, frameInput, dt);
        input.skill = frameInput.skill;
        input.swap = frameInput.swap;
        if (g.result && !endRef.current.done) {
          endRef.current.done = true;
          setTimeout(
            () =>
              endRef.current.onEnd({
                hero: heroId,
                victory: g.result === 'victory',
                stage: stageLabel(g),
                kills: g.kills,
                coins: g.coins,
                time: g.time,
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

  // ------------------------------------------------------------ keyboard (web / emulator debugging)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const down = new Set<string>();
    const sync = () => {
      keys.mx = (down.has('d') || down.has('arrowright') ? 1 : 0) - (down.has('a') || down.has('arrowleft') ? 1 : 0);
      keys.my = (down.has('s') || down.has('arrowdown') ? 1 : 0) - (down.has('w') || down.has('arrowup') ? 1 : 0);
      input.fire = down.has('j') || down.has(' ');
    };
    const kd = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!down.has(k)) {
        if (k === 'k') input.skill = true;
        if (k === 'l' || k === 'q') input.swap = true;
        if (k === 'escape' || k === 'p') setPause(!pausedRef.current);
      }
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
    if (pausedRef.current) return;
    for (const t of e.nativeEvent.changedTouches) {
      const { pageX: x, pageY: y } = t;
      const id = Number(t.identifier);
      let c: Control | null = null;
      if (hit(pauseBtn, x, y)) c = 'pause';
      else if (hit(fireBtn, x, y)) c = 'fire';
      else if (hit(skillBtn, x, y)) c = 'skill';
      else if (hit(swapBtn, x, y)) c = 'swap';
      else if (x < W * 0.5 && ![...touches.values()].includes('stick')) c = 'stick';
      if (!c) continue;
      touches.set(id, c);
      if (c === 'fire') input.fire = true;
      if (c === 'skill') input.skill = true;
      if (c === 'swap') input.swap = true;
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
      if (c === 'fire') input.fire = false;
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

  const sprite = (key: string, x: number, y: number, size: number, extra?: object, k?: string | number) => (
    <Image
      key={k ?? key}
      source={IMG[key as ImgKey]}
      fadeDuration={0}
      resizeMode="stretch"
      style={[{ position: 'absolute', left: (x - size / 2) * s, top: (y - size / 2) * s, width: size * s, height: size * s }, extra]}
    />
  );
  const shadow = (x: number, y: number, w: number, k: string) => (
    <View
      key={k}
      style={{
        position: 'absolute',
        left: (x - w / 2) * s,
        top: (y - 1.5) * s,
        width: w * s,
        height: 3 * s,
        borderRadius: 2 * s,
        backgroundColor: 'rgba(0,0,0,0.35)',
      }}
    />
  );

  const layers: { y: number; node: React.ReactNode[] }[] = [];

  // hero + weapon
  {
    const frame = h.moving ? Math.floor(h.walk * 8) % 2 : 0;
    const blink = h.invuln > 0 && Math.floor(g.time * 20) % 2 === 0;
    const bob = h.moving ? 0 : Math.round(Math.sin(g.time * 3) * 0.6);
    const w = h.weapons[h.cur];
    const deg = (h.aim * 180) / Math.PI;
    const wx = h.x + Math.cos(h.aim) * 5;
    const wy = h.y + 3 + Math.sin(h.aim) * 5;
    layers.push({
      y: h.y,
      node: [
        shadow(h.x, h.y + 8, 10, 'hs'),
        sprite(`heroes_${h.def.id}_${frame}`, h.x, h.y + bob, 16, {
          transform: [{ scaleX: h.facing }],
          opacity: blink ? 0.35 : h.dash > 0 ? 0.6 : 1,
        }, 'hero'),
        sprite(`weapons_${w}`, wx, wy, 14, { transform: [{ rotate: `${deg}deg` }, { scaleY: h.facing }] }, 'weapon'),
        h.buff > 0 ? sprite(`weapons_${w}`, wx - 3, wy + 2, 14, { opacity: 0.6, transform: [{ rotate: `${deg}deg` }, { scaleY: h.facing }] }, 'weapon2') : null,
      ],
    });
  }

  for (const e of g.enemies) {
    const def = ENEMIES[e.type];
    const spawning = e.spawn > 0;
    layers.push({
      y: e.y,
      node: [
        shadow(e.x, e.y + def.size / 2, def.size * 0.6, `es${e.id}`),
        sprite(`enemies_${e.type}_${anim}`, e.x, e.y, def.size, {
          transform: [{ scaleX: -e.facing }, { scale: spawning ? 1 - e.spawn * 0.6 : 1 }],
          opacity: spawning ? 0.4 + 0.4 * Math.sin(g.time * 30) : 1,
          tintColor: e.flash > 0 ? '#ffffff' : undefined,
        }, `e${e.id}`),
      ],
    });
  }

  if (g.chest) {
    layers.push({ y: g.chest.y, node: [sprite(g.chest.open ? 'items_chest_open' : 'items_chest_closed', g.chest.x, g.chest.y, 16, undefined, 'chest')] });
  }

  for (const p of g.pickups) {
    const bob = Math.sin(p.t * 4 + p.id) * 1.5;
    const isWeapon = p.kind in WEAPONS;
    layers.push({
      y: p.y - 4,
      node: [
        sprite(isWeapon ? `weapons_${p.kind}` : `items_${p.kind}`, p.x, p.y + bob, 16, isWeapon && g.nearWeapon === p ? { tintColor: '#ffe882' } : undefined, `p${p.id}`),
      ],
    });
  }
  layers.sort((a, b) => a.y - b.y);

  const boss = g.enemies.find((e) => e.type === 'bakunawa');
  const weapon = WEAPONS[h.weapons[h.cur] as WeaponId];

  return (
    <View style={styles.root} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
      {/* world */}
      <View pointerEvents="none" style={{ position: 'absolute', left: ox, top: oy, width: ROOM_W * s, height: ROOM_H * s, overflow: 'hidden' }}>
        <Image source={IMG[`rooms_${g.room}` as ImgKey]} style={{ width: ROOM_W * s, height: ROOM_H * s }} resizeMode="stretch" fadeDuration={0} />
        {g.portal && sprite(`items_gate_${Math.floor(g.time * 8) % 4}`, g.portal.x, g.portal.y, 20, undefined, 'portal')}
        {layers.map((l) => l.node)}
        {g.bullets.map((b) =>
          sprite(`projectiles_${b.sprite}`, b.x, b.y, b.r > 3 ? 10 : 7, undefined, `b${b.id}`),
        )}
        {g.texts.map((t) => (
          <PixelText
            key={`t${t.id}`}
            size={Math.max(7, 4 * s)}
            color={t.color}
            style={{ position: 'absolute', left: t.x * s - 40, width: 80, textAlign: 'center', top: t.y * s - 6, opacity: Math.min(1, t.t * 2) }}
          >
            {t.text}
          </PixelText>
        ))}
      </View>

      {/* banner */}
      {g.banner && (
        <View pointerEvents="none" style={[styles.banner, { top: H * 0.3 }]}>
          <PixelText size={16} color={COLORS.gold}>
            {g.banner.text}
          </PixelText>
        </View>
      )}

      {/* HUD */}
      <Panel style={styles.hud} color={COLORS.edge}>
        <Bar icon="ui_heart" value={h.hp} max={h.def.hp} color={COLORS.red} />
        <Bar icon="ui_shield" value={h.armor} max={h.def.armor} color={COLORS.armor} />
        <Bar icon="ui_energy" value={h.energy} max={h.def.energy} color={COLORS.light} />
      </Panel>
      <View style={styles.topRight} pointerEvents="none">
        <Sprite name="items_coin" size={20} />
        <PixelText size={10} color={COLORS.gold} style={{ marginRight: 14 }}>
          {g.coins}
        </PixelText>
        <PixelText size={10} style={{ marginRight: 52 }}>
          {stageLabel(g)}
        </PixelText>
      </View>
      {sprite2('ui_btn_pause', pauseBtn)}

      {boss && (
        <View pointerEvents="none" style={[styles.bossBar, { left: W * 0.3, width: W * 0.4 }]}>
          <PixelText size={8} color="#ff8a7a">
            {BOSS_NAME}
          </PixelText>
          <View style={styles.bossTrack}>
            <View style={[styles.barFill, { width: `${(boss.hp / boss.maxHp) * 100}%`, backgroundColor: COLORS.red }]} />
          </View>
        </View>
      )}

      {/* controls */}
      {stick && (
        <>
          <Image source={IMG.ui_joystick_base} fadeDuration={0} style={[styles.abs, { left: stick.ox - 60, top: stick.oy - 60, width: 120, height: 120 }]} />
          <Image source={IMG.ui_joystick_knob} fadeDuration={0} style={[styles.abs, { left: stick.kx - 26, top: stick.ky - 26, width: 52, height: 52 }]} />
        </>
      )}
      {!stick && (
        <View pointerEvents="none" style={[styles.abs, { left: 40, bottom: 30, opacity: 0.35 }]}>
          <Image source={IMG.ui_joystick_base} fadeDuration={0} style={{ width: 120, height: 120 }} />
        </View>
      )}
      {sprite2('ui_btn_fire', fireBtn, input.fire ? 0.75 : 1)}
      {sprite2('ui_btn_swap', swapBtn)}
      <View pointerEvents="none" style={[styles.abs, { left: swapBtn.x - 86, top: swapBtn.y - 22, alignItems: 'center', width: 60 }]}>
        <Sprite name={`weapons_${weapon.id}` as ImgKey} size={36} />
        <PixelText size={7} color={weapon.energy > h.energy ? COLORS.red : COLORS.light}>
          {weapon.energy > 0 ? `${weapon.energy}` : '0'}
        </PixelText>
      </View>
      {sprite2('ui_btn_skill', skillBtn, h.skillCd > 0 ? 0.45 : 1)}
      {h.skillCd > 0 && (
        <View pointerEvents="none" style={[styles.abs, { left: skillBtn.x - 20, top: skillBtn.y - 8, width: 40, alignItems: 'center' }]}>
          <PixelText size={10}>{Math.ceil(h.skillCd)}</PixelText>
        </View>
      )}
      {g.nearWeapon && (
        <View pointerEvents="none" style={[styles.hint, { bottom: 14, left: W * 0.25, width: W * 0.5 }]}>
          <PixelText size={8} color={COLORS.gold}>
            {`TAP SWAP: ${WEAPONS[g.nearWeapon.kind as WeaponId].name}`}
          </PixelText>
        </View>
      )}

      {paused && (
        <View style={styles.pause}>
          <Panel style={{ alignItems: 'center', padding: 24 }}>
            <PixelText size={16} color={COLORS.gold} style={{ marginBottom: 18 }}>
              PAUSED
            </PixelText>
            <PixelButton label="RESUME" onPress={() => setPause(false)} style={{ marginBottom: 10, width: 180 }} />
            <PixelButton label="ABANDON WATCH" onPress={onQuit} color="#4a7a78" style={{ width: 180 }} />
          </Panel>
        </View>
      )}
    </View>
  );

  function sprite2(key: ImgKey, b: { x: number; y: number; r: number }, opacity = 1) {
    return (
      <Image
        key={key}
        source={IMG[key]}
        fadeDuration={0}
        style={[styles.abs, { left: b.x - b.r, top: b.y - b.r, width: b.r * 2, height: b.r * 2, opacity }]}
      />
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050c10' },
  abs: { position: 'absolute' },
  banner: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  hud: { position: 'absolute', left: 8, top: 8, padding: 6, width: 150 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  barTrack: { flex: 1, height: 12, marginLeft: 6, backgroundColor: '#0c161c', borderWidth: 1, borderColor: '#2c4a50', justifyContent: 'center' },
  barFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  barText: { textAlign: 'center', fontSize: 7, lineHeight: 10 },
  topRight: { position: 'absolute', right: 8, top: 16, flexDirection: 'row', alignItems: 'center' },
  bossBar: { position: 'absolute', top: 10, alignItems: 'center' },
  bossTrack: { height: 10, alignSelf: 'stretch', backgroundColor: '#0c161c', borderWidth: 2, borderColor: '#7e1e22', marginTop: 2 },
  hint: { position: 'absolute', alignItems: 'center' },
  pause: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(5,12,16,0.72)', alignItems: 'center', justifyContent: 'center' },
});
