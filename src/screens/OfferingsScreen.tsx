import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { playSfx } from '../audio';
import { ImgKey } from '../assets';
import { BOONS, HEROES, SKIN_COST, UNLOCKABLE_BOONS } from '../game/data';
import { spend, updateSave, useSave } from '../save';
import { COLORS, CoverImage, Panel, PixelButton, PixelText, Sprite } from '../ui';

/** Alay ("offering"): spend barya from your runs on new blessings and hero colors. */
export default function OfferingsScreen({ onBack }: { onBack: () => void }) {
  const save = useSave();

  const buy = (cost: number, patch: Parameters<typeof spend>[1]) => {
    if (spend(cost, patch)) playSfx('boon');
    else playSfx('block');
  };

  return (
    <View style={styles.root}>
      <CoverImage name="screen_select_bg" />
      <View style={styles.shade} />
      <View style={styles.header}>
        <PixelText size={14} color={COLORS.gold}>
          ALAY
        </PixelText>
        <PixelText size={7} color={COLORS.dim} shadow={false} style={{ marginLeft: 12, flex: 1 }}>
          Offer the barya you carry home to the old gods.
        </PixelText>
        <Sprite name="items_coin" size={20} />
        <PixelText size={12} color={COLORS.gold}>
          {save.barya}
        </PixelText>
      </View>

      <View style={styles.body}>
        <Panel style={styles.col}>
          <PixelText size={9} color={COLORS.light} style={{ marginBottom: 6 }}>
            NEW BLESSINGS
          </PixelText>
          <ScrollView>
            {UNLOCKABLE_BOONS.map(({ id, cost }) => {
              const b = BOONS[id];
              const owned = save.unlockedBoons.includes(id);
              return (
                <View key={id} style={styles.row}>
                  <Sprite name={`ui_boon_${id}` as ImgKey} size={28} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <PixelText size={8} color={owned ? COLORS.gold : COLORS.text}>
                      {b.deity}
                    </PixelText>
                    <PixelText size={6} color={COLORS.dim} shadow={false}>
                      {b.desc}
                    </PixelText>
                  </View>
                  {owned ? (
                    <PixelText size={7} color={COLORS.armor}>
                      OFFERED
                    </PixelText>
                  ) : (
                    <Price cost={cost} can={save.barya >= cost} onPress={() => buy(cost, { unlockedBoons: [...save.unlockedBoons, id] })} />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </Panel>

        <Panel style={styles.col}>
          <PixelText size={9} color={COLORS.light} style={{ marginBottom: 6 }}>
            NEW COLORS
          </PixelText>
          <ScrollView>
            {HEROES.map((h) => {
              const owned = save.skins.includes(h.id);
              const worn = save.wearing.includes(h.id);
              return (
                <View key={h.id} style={styles.row}>
                  <Sprite name={`heroes_${h.id}_alt_0` as ImgKey} size={28} />
                  <PixelText size={8} style={{ flex: 1, marginLeft: 8 }}>
                    {h.name}
                  </PixelText>
                  {owned ? (
                    <Pressable
                      onPress={() => {
                        playSfx('tap');
                        updateSave({ wearing: worn ? save.wearing.filter((x) => x !== h.id) : [...save.wearing, h.id] });
                      }}
                      style={[styles.chip, { borderColor: worn ? COLORS.gold : COLORS.edge }]}
                    >
                      <PixelText size={7} color={worn ? COLORS.gold : COLORS.dim} shadow={false}>
                        {worn ? 'WEARING' : 'WEAR'}
                      </PixelText>
                    </Pressable>
                  ) : (
                    <Price cost={SKIN_COST} can={save.barya >= SKIN_COST} onPress={() => buy(SKIN_COST, { skins: [...save.skins, h.id], wearing: [...save.wearing, h.id] })} />
                  )}
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.moon}>
            <PixelText size={8} color={save.wins > 0 ? '#ff8a7a' : COLORS.dim}>
              PULANG BUWAN
            </PixelText>
            <PixelText size={6} color={COLORS.dim} shadow={false}>
              {save.wins > 0
                ? 'The red moon is open to you. Turn it on when you choose your maharlika.'
                : 'Win one dawn to open the red moon: tougher creatures, faster shots, half again the barya.'}
            </PixelText>
          </View>
        </Panel>
      </View>

      <View style={styles.footer}>
        <PixelButton label="BACK" onPress={onBack} color="#5a4a78" size={10} />
      </View>
    </View>
  );
}

function Price({ cost, can, onPress }: { cost: number; can: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, { borderColor: can ? COLORS.gold : COLORS.edge, opacity: can ? 1 : 0.6 }]}>
      <Sprite name="items_coin" size={14} />
      <PixelText size={8} color={can ? COLORS.gold : COLORS.dim} shadow={false}>
        {cost}
      </PixelText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 14 },
  shade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(8,6,16,0.6)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  body: { flex: 1, flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 2, borderWidth: 2, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: COLORS.panel },
  moon: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.edge },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
});
