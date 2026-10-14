import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { HEROES } from '../game/data';
import { COLORS, CoverImage, Panel, PixelButton, PixelText, Sprite, useTicker } from '../ui';

/** A menu entry: icon, Filipino name with its English translation beside it, and a one-line hint. */
function MenuItem({ icon, label, en, hint, onPress, primary }: { icon: ImgKey; label: string; en: string; hint: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, primary && styles.itemPrimary, pressed && styles.itemPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${label} (${en}). ${hint}`}
    >
      <Sprite name={icon} size={primary ? 30 : 22} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <View style={styles.labelRow}>
          <PixelText size={primary ? 13 : 10} color={primary ? COLORS.gold : COLORS.text}>
            {label}
          </PixelText>
          <PixelText size={primary ? 8 : 7} color={COLORS.light} shadow={false}>
            {en}
          </PixelText>
        </View>
        <PixelText size={6} color={COLORS.dim} shadow={false}>
          {hint}
        </PixelText>
      </View>
      <PixelText size={primary ? 12 : 9} color={primary ? COLORS.gold : COLORS.dim}>
        ▸
      </PixelText>
    </Pressable>
  );
}

const HOW_TO: { icon: ImgKey; title: string; text: string }[] = [
  { icon: 'ui_joystick_knob', title: 'MOVE', text: 'Drag anywhere on the left half of the screen.' },
  { icon: 'ui_btn_attack', title: 'ATTACK', text: 'Hold the crossed blades. You aim at the nearest foe by yourself.' },
  { icon: 'ui_btn_dodge', title: 'DODGE', text: 'Tap the wind to roll through shots and claws.' },
  { icon: 'ui_btn_skill', title: 'SKILL', text: 'Fight and catch fireflies to fill your light, then tap the sun.' },
  { icon: 'deco_dambana', title: 'DAMBANA', text: 'Clear an island, touch its shrine and pick one blessing. Then board the boat.' },
];

export default function TitleScreen({ onStart, onStory, onCodex }: { onStart: () => void; onStory: () => void; onCodex: () => void }) {
  const { width, height } = useWindowDimensions();
  const t = useTicker(120);
  const [help, setHelp] = useState(false);
  const logoW = Math.min(width * 0.46, 430);
  const bob = Math.round(Math.sin(t / 4) * 3);
  const heroSize = Math.min(56, height * 0.13);

  // web build: Enter plays, H toggles the guide, Esc closes it
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const kd = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'enter' && !help) onStart();
      if (k === 'h') setHelp((v) => !v);
      if (k === 'escape') setHelp(false);
    };
    window.addEventListener('keydown', kd);
    return () => window.removeEventListener('keydown', kd);
  }, [help, onStart]);

  return (
    <View style={styles.root}>
      <CoverImage name="screen_title_bg" />
      <View style={styles.shade} pointerEvents="none" />

      <View style={[styles.logoWrap, { top: height * 0.08 + bob, width: logoW + 24 }]} pointerEvents="none">
        <Image source={IMG.screen_logo} style={{ width: logoW, height: logoW / 7.7 }} resizeMode="stretch" fadeDuration={0} />
        <Image source={IMG.screen_logo_baybayin} style={{ width: logoW * 0.36, height: (logoW * 0.36) / 3.76, marginTop: 8 }} resizeMode="stretch" fadeDuration={0} />
        <PixelText size={10} color={COLORS.light} style={{ marginTop: 8 }}>
          ANG GABI NG BAKUNAWA
        </PixelText>
        <PixelText size={7} color="#d8cce4" shadow={false} style={{ marginTop: 4, textAlign: 'center' }}>
          The islands were never conquered. Tonight a serpent comes for the last moon.
        </PixelText>
      </View>

      {/* the four maharlika, walking in place and striking in turn */}
      <View style={[styles.parade, { width: logoW + 24, bottom: height * 0.12 }]} pointerEvents="none">
        {HEROES.map((h, i) => {
          const striking = Math.floor(t / 6) % HEROES.length === i;
          const frame = striking ? `attack_${Math.floor(t / 3) % 2}` : `walk_${(t + i) % 4}`;
          return (
            <View key={h.id} style={{ alignItems: 'center', marginHorizontal: 4 }}>
              <Sprite name={`heroes_${h.id}_${frame}` as ImgKey} size={heroSize} />
              <PixelText size={6} color={h.color} shadow={false}>
                {h.name.toUpperCase()}
              </PixelText>
            </View>
          );
        })}
      </View>

      <Panel style={[styles.menu, { width: Math.min(270, width * 0.38), top: height * 0.1, bottom: height * 0.08 }]}>
        <MenuItem icon="deco_balangay_0" label="LARO" en="Play" hint="Choose a maharlika and a weapon, then set sail" onPress={onStart} primary />
        <MenuItem icon="ui_moon" label="SIMULA" en="Prologue" hint="Watch how the story begins" onPress={onStory} />
        <MenuItem icon="ui_star" label="ALAMAT" en="Legends" hint="Heroes, creatures, gods and places, with sources" onPress={onCodex} />
        <MenuItem icon="ui_btn_attack" label="PAANO MAGLARO" en="How to Play" hint="Controls and the goal of a run" onPress={() => setHelp(true)} />
        {Platform.OS === 'web' && (
          <PixelText size={6} color={COLORS.dim} shadow={false} style={{ textAlign: 'center', marginTop: 2 }}>
            ENTER laro (play) · H paano maglaro (how to play)
          </PixelText>
        )}
      </Panel>

      {help && (
        <View style={styles.overlay}>
          <Panel style={[styles.help, { maxWidth: Math.min(560, width - 32), maxHeight: height - 24 }]}>
            <PixelText size={13} color={COLORS.gold} style={{ textAlign: 'center' }}>
              PAANO MAGLARO
            </PixelText>
            <PixelText size={8} color={COLORS.light} shadow={false} style={{ textAlign: 'center' }}>
              How to Play
            </PixelText>
            <PixelText size={7} color={COLORS.text} shadow={false} style={{ textAlign: 'center', marginBottom: 8 }}>
              Sail six islands, from Tondo to the shore of Albay, and drive off the Bakunawa.
            </PixelText>
            <View style={styles.helpGrid}>
              {HOW_TO.map((r) => (
                <View key={r.title} style={styles.helpRow}>
                  <Sprite name={r.icon} size={28} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <PixelText size={8} color={COLORS.light}>
                      {r.title}
                    </PixelText>
                    <PixelText size={6} color={COLORS.text} shadow={false}>
                      {r.text}
                    </PixelText>
                  </View>
                </View>
              ))}
            </View>
            {Platform.OS === 'web' && (
              <PixelText size={6} color={COLORS.dim} shadow={false} style={{ textAlign: 'center', marginTop: 6 }}>
                Keyboard: WASD move · Space attack · Shift dodge · K skill · 1-3 blessing · Esc pause
              </PixelText>
            )}
            <PixelButton label="SIGE · GOT IT" onPress={() => setHelp(false)} size={10} style={{ alignSelf: 'center', marginTop: 10 }} />
          </Panel>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  shade: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '45%', backgroundColor: 'rgba(8,6,18,0.35)' },
  logoWrap: { position: 'absolute', left: 16, alignItems: 'center' },
  parade: { position: 'absolute', left: 16, flexDirection: 'row', justifyContent: 'center' },
  menu: { position: 'absolute', right: 20, justifyContent: 'center', gap: 6, paddingVertical: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 6 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: COLORS.edge,
    backgroundColor: COLORS.panel,
  },
  itemPrimary: { borderColor: COLORS.border, backgroundColor: '#3a2a1c', paddingVertical: 10 },
  itemPressed: { backgroundColor: COLORS.panelLight, transform: [{ translateY: 2 }] },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(5,6,16,0.82)', alignItems: 'center', justifyContent: 'center', padding: 12 },
  help: { padding: 14 },
  helpGrid: { gap: 6 },
  helpRow: { flexDirection: 'row', alignItems: 'center' },
});
