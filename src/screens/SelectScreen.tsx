import { useState } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { HEROES, HeroId, WeaponId, WEAPONS } from '../game/data';
import { COLORS, CoverImage, Panel, PixelButton, PixelText, Sprite, useTicker } from '../ui';

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

export default function SelectScreen({
  onBack,
  onPick,
  onStory,
}: {
  onBack: () => void;
  onPick: (id: HeroId, weapon: WeaponId) => void;
  onStory: (id: HeroId) => void;
}) {
  const { width, height } = useWindowDimensions();
  const [sel, setSel] = useState<HeroId>('kidlat');
  // remembers the weapon chosen for each maharlika while browsing
  const [arms, setArms] = useState<Record<HeroId, number>>({ kidlat: 0, liksi: 0, mayumi: 0, amihan: 0, banog: 0, dalisay: 0 });
  const t = useTicker(150);
  const hero = HEROES.find((h) => h.id === sel)!;
  const weaponId = hero.weapons[arms[sel]];
  const cardW = Math.min(110, (width * 0.56) / HEROES.length - 8);
  const spriteSize = Math.min(cardW - 16, height * 0.2);

  return (
    <View style={styles.root}>
      <CoverImage name="screen_select_bg" />
      <PixelText size={14} color={COLORS.gold} style={styles.heading}>
        PUMILI NG MAHARLIKA · Choose your hero
      </PixelText>
      <View style={styles.body}>
        <View style={styles.cards}>
          {HEROES.map((h) => {
            const active = h.id === sel;
            return (
              <Pressable key={h.id} onPress={() => setSel(h.id)}>
                <Panel
                  color={active ? h.color : COLORS.edge}
                  style={[styles.card, { width: cardW }, active && { transform: [{ translateY: -6 }] }]}
                >
                  <Sprite name={`heroes_${h.id}_${active ? `walk_${t % 4}` : `idle_${Math.floor(t / 4) % 2}`}` as ImgKey} size={spriteSize} />
                  <PixelText size={8} color={active ? h.color : COLORS.dim} style={{ marginTop: 4 }}>
                    {h.name.toUpperCase()}
                  </PixelText>
                </Panel>
              </Pressable>
            );
          })}
        </View>
        <Panel color={hero.color} style={[styles.info, { width: Math.min(280, width * 0.34) }]}>
          <PixelText size={12} color={hero.color}>
            {hero.name.toUpperCase()}
          </PixelText>
          <PixelText size={7} color={COLORS.dim}>
            {`${hero.title} · ${hero.home}`}
          </PixelText>
          <PixelText size={6} color={COLORS.text} shadow={false} style={{ marginBottom: 8, opacity: 0.85 }}>
            {hero.lore}
          </PixelText>
          <View style={styles.statLine}>
            <StatRow icon="ui_heart" value={hero.hp} color="#ff8a7a" />
            <StatRow icon="ui_shield" value={hero.armor} color={COLORS.armor} />
          </View>
          <View style={styles.skill}>
            <Sprite name="ui_star" size={14} />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <PixelText size={8} color={COLORS.gold}>
                {hero.skill.name}
              </PixelText>
              <PixelText size={7} color={COLORS.text} shadow={false}>
                {hero.skill.desc}
              </PixelText>
            </View>
          </View>
          <PixelText size={7} color={COLORS.dim} shadow={false} style={{ marginBottom: 4 }}>
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
                  <Sprite name={`weapons_${w}` as ImgKey} size={28} />
                  <PixelText size={7} color={on ? COLORS.light : COLORS.dim}>
                    {WEAPONS[w].name.toUpperCase()}
                  </PixelText>
                </Pressable>
              );
            })}
          </View>
          <PixelText size={6} color={COLORS.text} shadow={false} style={{ marginTop: 4, opacity: 0.85 }}>
            {WEAPONS[weaponId].desc}
          </PixelText>
        </Panel>
      </View>
      <View style={styles.footer}>
        <PixelButton label="BALIK · BACK" onPress={onBack} color="#5a4a78" size={10} />
        <PixelButton label={`KWENTO NI ${hero.name.toUpperCase()}`} onPress={() => onStory(sel)} color="#5a4a78" size={10} style={{ marginLeft: 16 }} />
        <PixelButton label="LAYAG · SET SAIL" onPress={() => onPick(sel, weaponId)} color={hero.color} style={{ marginLeft: 16 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 24, paddingVertical: 14 },
  heading: { textAlign: 'center' },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  cards: { flexDirection: 'row', alignItems: 'flex-end', marginRight: 16 },
  card: { alignItems: 'center', marginHorizontal: 4, paddingHorizontal: 4 },
  info: {},
  statLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stat: { flexDirection: 'row', alignItems: 'center' },
  skill: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  weapons: { flexDirection: 'row', gap: 6 },
  weapon: { flex: 1, alignItems: 'center', borderWidth: 2, paddingVertical: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
});
