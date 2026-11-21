import Constants from 'expo-constants';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { playSfx, syncMusic } from '../audio';
import { tr } from '../i18n';
import { SaveData, updateSave, useSave } from '../save';
import { COLORS, CoverImage, Panel, PixelButton, PixelText } from '../ui';

type Choice<T> = { value: T; label: string };

/** One row: a label on the left, a segmented choice on the right. */
function Row<T>({ label, hint, value, choices, onPick }: { label: string; hint?: string; value: T; choices: Choice<T>[]; onPick: (v: T) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <PixelText size={9}>{label}</PixelText>
        {hint && (
          <PixelText size={7} color={COLORS.dim} shadow={false}>
            {hint}
          </PixelText>
        )}
      </View>
      <View style={styles.seg}>
        {choices.map((c) => {
          const on = c.value === value;
          return (
            <Pressable
              key={String(c.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                if (on) return;
                playSfx('tap');
                onPick(c.value);
              }}
              hitSlop={6}
              style={[styles.segBtn, on && styles.segOn]}
            >
              <PixelText size={8} color={on ? COLORS.bg : COLORS.dim} shadow={false}>
                {c.label}
              </PixelText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const ONOFF: Choice<boolean>[] = [
  { value: true, label: 'ON' },
  { value: false, label: 'OFF' },
];

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
  const save = useSave();
  const set = (patch: Partial<SaveData>) => updateSave(patch);
  const version = Constants.expoConfig?.version ?? '';

  return (
    <View style={styles.root}>
      <CoverImage name="screen_select_bg" />
      <View style={styles.shade} />
      <PixelText size={14} color={COLORS.gold} style={{ marginBottom: 8 }}>
        SETTINGS
      </PixelText>
      <Panel style={styles.panel}>
        <ScrollView>
          <Row<'en' | 'tl'>
            label="Language"
            value={save.lang}
            choices={[
              { value: 'en', label: 'ENGLISH' },
              { value: 'tl', label: 'TAGALOG' },
            ]}
            onPick={(lang) => set({ lang })}
          />
          <Row
            label="Music"
            value={save.music}
            choices={ONOFF}
            onPick={(music) => {
              set({ music });
              syncMusic();
            }}
          />
          <Row label="Sound effects" value={save.sfx} choices={ONOFF} onPick={(sfx) => set({ sfx })} />
          {Platform.OS !== 'web' && <Row label="Vibration" value={save.haptics} choices={ONOFF} onPick={(haptics) => set({ haptics })} />}
          <Row
            label="Controls"
            hint="Which side the attack buttons sit on"
            value={save.lefty}
            choices={[
              { value: false, label: 'RIGHT' },
              { value: true, label: 'LEFT' },
            ]}
            onPick={(lefty) => set({ lefty })}
          />
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <PixelText size={9}>Tutorial</PixelText>
              <PixelText size={7} color={COLORS.dim} shadow={false}>
                {save.tutorialDone ? 'Play the lesson on the Tondo dock again next run' : 'The lesson will play on your next run'}
              </PixelText>
            </View>
            <PixelButton label={save.tutorialDone ? 'REPLAY' : 'READY'} size={8} color="#5a4a78" onPress={() => set({ tutorialDone: false })} />
          </View>
        </ScrollView>
      </Panel>
      <View style={styles.footer}>
        <PixelButton label="BACK" onPress={onBack} color="#5a4a78" size={10} />
      </View>
      <PixelText size={7} color={COLORS.dim} shadow={false} style={styles.version}>
        {`MAHARLIKA ${version} · ${tr('All art and sound made in code')}`}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 14, alignItems: 'center' },
  shade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(8,6,16,0.6)' },
  panel: { flex: 1, width: '100%', maxWidth: 560 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  seg: { flexDirection: 'row', borderWidth: 2, borderColor: COLORS.edge },
  segBtn: { paddingHorizontal: 10, paddingVertical: 5, minWidth: 56, alignItems: 'center' },
  segOn: { backgroundColor: COLORS.gold },
  footer: { flexDirection: 'row', marginTop: 8 },
  version: { position: 'absolute', right: 10, bottom: 6 },
});
