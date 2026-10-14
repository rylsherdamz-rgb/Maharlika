import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { IMG } from '../assets';
import { BOONS, HEROES } from '../game/data';
import { Bio, CREATURE_BIOS, DEITY_SOURCE, GUARDIAN_BIOS, HALIYA_BIO, WORLD_BIOS } from '../game/story';
import { BaybayinText, COLORS, CoverImage, Panel, PixelButton, PixelText, Sprite } from '../ui';

const BAYBAYIN = /[\u1700-\u171f]/;

type Tab = 'guardians' | 'creatures' | 'gods' | 'world';

const DEITY_BIOS: Bio[] = Object.values(BOONS).map((b) => ({
  id: b.id,
  name: b.deity,
  epithet: b.domain,
  sprite: `ui_boon_${b.id}` as Bio['sprite'],
  facts: [['Blessing', b.name], ['Effect', b.desc]],
  story: [`${b.deity}: ${b.domain.toLowerCase()} in the Tagalog pantheon. At a dambana you may receive the blessing ${b.name}.`],
  source: DEITY_SOURCE,
}));

const TABS: { id: Tab; label: string; en: string; entries: Bio[] }[] = [
  { id: 'guardians', label: 'MAHARLIKA', en: 'Heroes', entries: [...HEROES.map((h) => GUARDIAN_BIOS[h.id]), HALIYA_BIO] },
  { id: 'creatures', label: 'NILALANG', en: 'Creatures', entries: Object.values(CREATURE_BIOS) },
  { id: 'gods', label: 'MGA DIYOS', en: 'The Gods', entries: DEITY_BIOS },
  { id: 'world', label: 'DAIGDIG', en: 'The World', entries: WORLD_BIOS },
];

export function codexTabFor(id: string): Tab {
  return TABS.find((t) => t.entries.some((e) => e.id === id))?.id ?? 'guardians';
}

/** Alamat ("legends"): readable bios for every guardian, creature, god and place. */
export default function CodexScreen({ initial, onBack }: { initial?: string; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>(initial ? codexTabFor(initial) : 'guardians');
  const entries = TABS.find((t) => t.id === tab)!.entries;
  const [sel, setSel] = useState<string>(initial ?? entries[0].id);
  const bio = entries.find((e) => e.id === sel) ?? entries[0];
  const wide = bio.portrait?.startsWith('story_');

  return (
    <View style={styles.root}>
      <CoverImage name="screen_select_bg" />
      <View style={styles.shade} />
      <View style={styles.header}>
        <View>
          <PixelText size={14} color={COLORS.gold}>
            ALAMAT
          </PixelText>
          <PixelText size={7} color={COLORS.light} shadow={false}>
            Legends
          </PixelText>
        </View>
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => {
                setTab(t.id);
                setSel(t.entries[0].id);
              }}
              style={[styles.tab, t.id === tab && styles.tabOn]}
            >
              <PixelText size={8} color={t.id === tab ? COLORS.bg : COLORS.dim} shadow={false} style={{ textAlign: 'center' }}>
                {t.label}
              </PixelText>
              <PixelText size={6} color={t.id === tab ? COLORS.panel : COLORS.dim} shadow={false} style={{ textAlign: 'center', opacity: 0.85 }}>
                {t.en}
              </PixelText>
            </Pressable>
          ))}
        </View>
        <PixelButton label="BALIK · BACK" onPress={onBack} color="#5a4a78" size={8} />
      </View>

      <View style={styles.body}>
        <ScrollView style={styles.list} contentContainerStyle={{ gap: 4 }}>
          {entries.map((e) => (
            <Pressable key={e.id} onPress={() => setSel(e.id)} style={[styles.item, e.id === bio.id && styles.itemOn]}>
              <Sprite name={e.sprite} size={28} />
              <PixelText size={8} color={e.id === bio.id ? COLORS.light : COLORS.text} style={{ marginLeft: 8, flex: 1 }}>
                {e.name}
              </PixelText>
            </Pressable>
          ))}
        </ScrollView>

        <Panel style={styles.detail} color={COLORS.edge}>
          <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={styles.top}>
              {bio.portrait ? (
                <Image
                  source={IMG[bio.portrait]}
                  fadeDuration={0}
                  resizeMode="stretch"
                  style={wide ? styles.wideArt : styles.portrait}
                />
              ) : (
                <View style={styles.portraitFrame}>
                  <Sprite name={bio.sprite} size={72} />
                </View>
              )}
              <View style={styles.titleCol}>
                <PixelText size={13} color={COLORS.gold}>
                  {bio.name}
                </PixelText>
                <PixelText size={8} color={COLORS.armor} style={{ marginBottom: 6 }}>
                  {bio.epithet}
                </PixelText>
                {bio.facts.map(([k, v]) => (
                  <View key={k} style={styles.fact}>
                    <PixelText size={7} color={COLORS.dim} shadow={false} style={styles.factKey}>
                      {k.toUpperCase()}
                    </PixelText>
                    {BAYBAYIN.test(v) ? (
                      <BaybayinText size={14} style={{ flex: 1 }}>
                        {v.replace(/[^\u1700-\u171f ]/g, '').trim()}
                      </BaybayinText>
                    ) : (
                      <PixelText size={7} shadow={false} style={{ flex: 1 }}>
                        {v}
                      </PixelText>
                    )}
                  </View>
                ))}
              </View>
            </View>
            {bio.story.map((p, k) => (
              <PixelText key={k} size={8} shadow={false} style={styles.para}>
                {p}
              </PixelText>
            ))}
            {bio.source && (
              <PixelText size={7} color={COLORS.armor} shadow={false} style={{ marginTop: 8 }}>
                {`From: ${bio.source}`}
              </PixelText>
            )}
            {bio.quote && (
              <PixelText size={8} color={COLORS.light} shadow={false} style={styles.quote}>
                “{bio.quote}”
              </PixelText>
            )}
          </ScrollView>
        </Panel>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20, paddingVertical: 12 },
  shade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(6,14,18,0.55)' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  tabs: { flexDirection: 'row', gap: 6 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderColor: COLORS.edge, backgroundColor: COLORS.panel },
  tabOn: { backgroundColor: COLORS.light, borderColor: COLORS.light },
  body: { flex: 1, flexDirection: 'row', gap: 12 },
  list: { width: 190, flexGrow: 0 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 6, backgroundColor: 'rgba(16,38,44,0.85)', borderWidth: 2, borderColor: 'transparent' },
  itemOn: { borderColor: COLORS.light },
  detail: { flex: 1, padding: 12 },
  top: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  portrait: { width: 96, height: 96, backgroundColor: COLORS.panelLight, borderWidth: 2, borderColor: COLORS.border },
  portraitFrame: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.panelLight, borderWidth: 2, borderColor: COLORS.border },
  wideArt: { width: 171, height: 96, borderWidth: 2, borderColor: COLORS.border },
  titleCol: { flex: 1 },
  fact: { flexDirection: 'row', marginVertical: 1 },
  factKey: { width: 86 },
  para: { marginTop: 6 },
  quote: { marginTop: 8, fontStyle: 'italic' },
});
