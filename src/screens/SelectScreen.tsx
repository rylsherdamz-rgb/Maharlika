import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ImgKey } from '../assets';
import { DIFFICULTIES, HEROES, HeroId, Mode, WeaponId, WEAPONS } from '../game/data';
import { Setup } from '../game/engine';
import { Progress } from '../save';
import { COLORS, CoverImage, Panel, PixelButton, PixelText, Sprite, useTicker } from '../ui';

const P_COLORS = ['#ffba48', '#82eed6'];

function StatRow({ icon, value, color }: { icon: ImgKey; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Sprite name={icon} size={14} />
      <PixelText size={9} color={color} style={{ marginLeft: 6 }}>
        {value}
      </PixelText>
    </View>
  );
}

/** A small toggle chip: Filipino label with the English under it. */
function Chip({ label, en, on, locked, onPress }: { label: string; en: string; on: boolean; locked?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={[styles.chip, on && styles.chipOn, locked && { opacity: 0.45 }]}
      accessibilityRole="button"
      accessibilityState={{ selected: on, disabled: locked }}
      accessibilityLabel={`${label}, ${en}${locked ? ', locked' : ''}`}
    >
      <PixelText size={7} color={on ? COLORS.bg : COLORS.text} shadow={false}>
        {label}
      </PixelText>
      <PixelText size={5} color={on ? COLORS.panel : COLORS.dim} shadow={false}>
        {locked ? 'Win to unlock' : en}
      </PixelText>
    </Pressable>
  );
}

export default function SelectScreen({
  progress,
  onBack,
  onStart,
  onStory,
}: {
  progress: Progress;
  onBack: () => void;
  onStart: (setup: Setup) => void;
  onStory: (id: HeroId) => void;
}) {
  const { width, height } = useWindowDimensions();
  const [mode, setMode] = useState<Mode>('voyage');
  const [players, setPlayers] = useState<1 | 2>(1);
  const [difficulty, setDifficulty] = useState<0 | 1 | 2>(1);
  // which player is choosing now, and what P1 already chose
  const [slot, setSlot] = useState(0);
  const [first, setFirst] = useState<{ hero: HeroId; weapon: WeaponId } | null>(null);
  const [sel, setSel] = useState<HeroId>('kidlat');
  // remembers the weapon chosen for each maharlika while browsing
  const [arms, setArms] = useState<Record<HeroId, number>>({ kidlat: 0, liksi: 0, mayumi: 0, amihan: 0, banog: 0, dalisay: 0 });
  const t = useTicker(150);
  const hero = HEROES.find((h) => h.id === sel)!;
  const weaponId = hero.weapons[arms[sel]];
  const cardW = Math.min(100, (width * 0.56) / HEROES.length - 8);
  const spriteSize = Math.min(cardW - 16, height * 0.15);
  const diff = DIFFICULTIES[difficulty];

  const confirm = () => {
    const choice = { hero: sel, weapon: weaponId };
    if (players === 2 && slot === 0) {
      setFirst(choice);
      setSlot(1);
      // P2 starts on a different hero so the pair is easy to tell apart
      setSel(HEROES.find((h) => h.id !== sel)!.id);
      return;
    }
    onStart({ players: players === 2 && first ? [first, choice] : [choice], mode, difficulty });
  };
  const back = () => {
    if (slot === 1) {
      setSlot(0);
      if (first) setSel(first.hero);
      setFirst(null);
    } else onBack();
  };

  const actionLabel = players === 2 && slot === 0 ? 'SUSUNOD · P2 NEXT' : 'LAYAG · SET SAIL';
  const sub =
    mode === 'endless'
      ? `Sail until you fall. Best: island ${progress.bestEndless || '-'}`
      : `${diff.desc}${progress.wins ? `  ·  Voyages won: ${progress.wins}` : ''}`;

  return (
    <View style={styles.root}>
      <CoverImage name="screen_select_bg" />
      <View style={styles.top}>
        <View>
          <PixelText size={11} color={COLORS.gold}>
            {players === 2 ? `P${slot + 1}: PUMILI NG MAHARLIKA` : 'PUMILI NG MAHARLIKA'}
          </PixelText>
          <PixelText size={6} color={players === 2 ? P_COLORS[slot] : COLORS.dim} shadow={false}>
            {players === 2 ? `Player ${slot + 1}, choose your hero and weapon` : 'Choose your hero and weapon'}
          </PixelText>
        </View>
        <View style={styles.chips}>
          <Chip label="PAGLALAYAG" en="Voyage" on={mode === 'voyage'} onPress={() => setMode('voyage')} />
          <Chip label="WALANG KATAPUSAN" en="Endless" on={mode === 'endless'} onPress={() => setMode('endless')} />
          <View style={styles.sep} />
          <Chip label="1P" en="Solo" on={players === 1} onPress={() => (setPlayers(1), setSlot(0), setFirst(null))} />
          <Chip label="2P" en="Co-op" on={players === 2} onPress={() => setPlayers(2)} />
          <View style={styles.sep} />
          {DIFFICULTIES.map((d) => (
            <Chip key={d.id} label={d.name} en={d.en} on={difficulty === d.id} locked={d.id === 2 && !progress.hardUnlocked} onPress={() => setDifficulty(d.id)} />
          ))}
        </View>
      </View>
      <PixelText size={6} color={COLORS.text} shadow={false} style={styles.sub}>
        {sub}
      </PixelText>
      <View style={styles.body}>
        <View style={styles.cards}>
          {HEROES.map((h) => {
            const active = h.id === sel;
            const takenByP1 = slot === 1 && first?.hero === h.id;
            return (
              <Pressable key={h.id} onPress={() => setSel(h.id)}>
                <Panel
                  color={active ? (players === 2 ? P_COLORS[slot] : h.color) : COLORS.edge}
                  style={[styles.card, { width: cardW }, active && { transform: [{ translateY: -6 }] }]}
                >
                  {takenByP1 && (
                    <PixelText size={6} color={P_COLORS[0]} style={styles.badge}>
                      P1
                    </PixelText>
                  )}
                  <Sprite name={`heroes_${h.id}_${active ? `walk_${t % 4}` : `idle_${Math.floor(t / 4) % 2}`}` as ImgKey} size={spriteSize} />
                  <PixelText size={7} color={active ? h.color : COLORS.dim} style={{ marginTop: 2 }}>
                    {h.name.toUpperCase()}
                  </PixelText>
                </Panel>
              </Pressable>
            );
          })}
        </View>
        <Panel color={hero.color} style={[styles.info, { width: Math.min(270, width * 0.34) }]}>
          <PixelText size={11} color={hero.color}>
            {hero.name.toUpperCase()}
          </PixelText>
          <PixelText size={6} color={COLORS.dim}>
            {`${hero.title} · ${hero.home}`}
          </PixelText>
          <View style={styles.statLine}>
            <StatRow icon="ui_heart" value={hero.hp} color="#ff8a7a" />
            <StatRow icon="ui_shield" value={hero.armor} color={COLORS.armor} />
          </View>
          <View style={styles.skill}>
            <Sprite name="ui_star" size={12} />
            <View style={{ marginLeft: 6, flex: 1 }}>
              <PixelText size={7} color={COLORS.gold}>
                {hero.skill.name}
              </PixelText>
              <PixelText size={6} color={COLORS.text} shadow={false}>
                {hero.skill.desc}
              </PixelText>
            </View>
          </View>
          <PixelText size={6} color={COLORS.dim} shadow={false} style={{ marginBottom: 3 }}>
            PUMILI NG SANDATA · Choose a weapon
          </PixelText>
          <View style={styles.weapons}>
            {hero.weapons.map((w, i) => {
              const on = arms[sel] === i;
              return (
                <Pressable
                  key={w}
                  onPress={() => setArms((a) => ({ ...a, [sel]: i }))}
                  style={[styles.weapon, { borderColor: on ? hero.color : COLORS.edge, backgroundColor: on ? COLORS.panelLight : 'transparent' }]}
                >
                  <Sprite name={`weapons_${w}` as ImgKey} size={24} />
                  <PixelText size={6} color={on ? COLORS.light : COLORS.dim}>
                    {WEAPONS[w].name.toUpperCase()}
                  </PixelText>
                </Pressable>
              );
            })}
          </View>
          <PixelText size={6} color={COLORS.text} shadow={false} style={{ marginTop: 3, opacity: 0.85 }}>
            {WEAPONS[weaponId].desc}
          </PixelText>
        </Panel>
      </View>
      <View style={styles.footer}>
        <PixelButton label="BALIK · BACK" onPress={back} color="#5a4a78" size={9} />
        <PixelButton label={`KWENTO NI ${hero.name.toUpperCase()}`} onPress={() => onStory(sel)} color="#5a4a78" size={9} style={{ marginLeft: 12 }} />
        <PixelButton label={actionLabel} onPress={confirm} color={players === 2 ? P_COLORS[slot] : hero.color} size={11} style={{ marginLeft: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16, paddingVertical: 8 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 4 },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderWidth: 2, borderColor: COLORS.edge, backgroundColor: 'rgba(18,14,32,0.9)', alignItems: 'center' },
  chipOn: { backgroundColor: COLORS.light, borderColor: COLORS.gold },
  sep: { width: 6 },
  sub: { textAlign: 'right', marginTop: 2, opacity: 0.85 },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  cards: { flexDirection: 'row', alignItems: 'flex-end', marginRight: 12 },
  card: { alignItems: 'center', marginHorizontal: 3, paddingHorizontal: 3, paddingVertical: 6 },
  badge: { position: 'absolute', top: 2, left: 4 },
  info: { paddingVertical: 8 },
  statLine: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  stat: { flexDirection: 'row', alignItems: 'center' },
  skill: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  weapons: { flexDirection: 'row', gap: 6 },
  weapon: { flex: 1, alignItems: 'center', borderWidth: 2, paddingVertical: 3 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
});
