import { useState } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { HEROES, HeroId, WEAPONS } from '../game/data';
import { COLORS, Panel, PixelButton, PixelText, Sprite, useTicker } from '../ui';

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

export default function SelectScreen({ onBack, onPick }: { onBack: () => void; onPick: (id: HeroId) => void }) {
  const { width, height } = useWindowDimensions();
  const [sel, setSel] = useState<HeroId>('knight');
  const t = useTicker(180);
  const hero = HEROES.find((h) => h.id === sel)!;
  const cardW = Math.min(130, (width * 0.55) / 4);
  const spriteSize = Math.min(cardW - 16, height * 0.2);

  return (
    <View style={styles.root}>
      <Image source={IMG.screen_select_bg} style={StyleSheet.absoluteFill} resizeMode="cover" fadeDuration={0} />
      <PixelText size={14} color={COLORS.gold} style={styles.heading}>
        CHOOSE YOUR HERO
      </PixelText>
      <View style={styles.body}>
        <View style={styles.cards}>
          {HEROES.map((h) => {
            const active = h.id === sel;
            return (
              <Pressable key={h.id} onPress={() => setSel(h.id)}>
                <Panel
                  color={active ? h.color : '#3c3458'}
                  style={[styles.card, { width: cardW }, active && { transform: [{ translateY: -6 }] }]}
                >
                  <Sprite name={`heroes_${h.id}_${active ? t % 2 : 0}` as ImgKey} size={spriteSize} />
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
          <PixelText size={7} color={COLORS.dim} style={{ marginBottom: 8 }}>
            {hero.title}
          </PixelText>
          <View style={styles.statLine}>
            <StatRow icon="ui_heart" value={hero.hp} color="#ff7a7a" />
            <StatRow icon="ui_shield" value={hero.armor} color={COLORS.armor} />
            <StatRow icon="ui_energy" value={hero.energy} color="#78b4ff" />
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
          <View style={styles.weapons}>
            {hero.weapons.map((w) => (
              <View key={w} style={styles.weapon}>
                <Sprite name={`weapons_${w}` as ImgKey} size={32} />
                <PixelText size={6} color={COLORS.dim} shadow={false}>
                  {WEAPONS[w].name}
                </PixelText>
              </View>
            ))}
          </View>
        </Panel>
      </View>
      <View style={styles.footer}>
        <PixelButton label="BACK" onPress={onBack} color="#6c6488" size={10} />
        <PixelButton label="START RUN" onPress={() => onPick(sel)} color={hero.color} style={{ marginLeft: 16 }} />
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
  weapons: { flexDirection: 'row', justifyContent: 'space-around' },
  weapon: { alignItems: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
});
