import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { BoonId, BOONS, DIFFICULTIES, HeroId, RelicId, RELICS } from '../game/data';
import { Setup } from '../game/engine';
import { DEFEAT_LINES } from '../game/story';
import { COLORS, CoverImage, Panel, PixelButton, PixelText, Sprite, useTicker } from '../ui';

export interface RunStats {
  setup: Setup;
  heroes: HeroId[];
  victory: boolean;
  island: number; // islands reached (the endless score)
  level: number; // highest antas in the party
  caves: number;
  relics: RelicId[];
  stage: string;
  kills: number;
  coins: number;
  time: number;
  boons: BoonId[];
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function ResultScreen({
  stats,
  best,
  onRetry,
  onMenu,
}: {
  stats: RunStats;
  /** Endless mode: the best island before this run, to show a new record. */
  best?: number;
  onRetry: () => void;
  onMenu: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const t = useTicker(200);
  const textW = Math.min(width * 0.5, 400);
  const endless = stats.setup.mode === 'endless';
  const record = endless && best !== undefined && stats.island > best;
  const rows: [ImgKey, string, string][] = [
    ['ui_moon', 'NARATING', endless ? `Isla ${stats.island}${record ? '  BAGONG RECORD!' : ''}` : stats.stage],
    ['ui_star', 'ANTAS', `${stats.level}`],
    ['ui_skull', 'NAPAALIS', `${stats.kills}`],
    ['items_coin', 'BARYA', `${stats.coins}`],
    ['ui_gem', 'ORAS', fmtTime(stats.time)],
  ];
  if (stats.caves) rows.splice(2, 0, ['deco_yungib', 'YUNGIB', `${stats.caves}`]);
  const tag = `${endless ? 'WALANG KATAPUSAN' : 'PAGLALAYAG'} · ${DIFFICULTIES[stats.setup.difficulty ?? 1].name}${stats.heroes.length > 1 ? ' · 2P' : ''}`;
  return (
    <View style={styles.root}>
      <CoverImage name={stats.victory ? 'screen_victory_bg' : 'screen_gameover_bg'} />
      <Image
        source={stats.victory ? IMG.screen_victory_text : IMG.screen_gameover_text}
        style={{ width: textW, height: textW / 5.96, marginTop: height * 0.06 }}
        resizeMode="stretch"
        fadeDuration={0}
      />
      <View style={styles.middle}>
        {stats.heroes.map((id, i) => (
          <Sprite
            key={i}
            name={`heroes_${id}_${stats.victory ? `attack_${(t + i) % 2}` : 'hurt_0'}` as ImgKey}
            size={Math.min(stats.heroes.length > 1 ? 72 : 96, height * 0.2)}
            style={!stats.victory ? { transform: [{ rotate: '90deg' }], opacity: 0.8 } : undefined}
          />
        ))}
        <Panel style={styles.panel}>
          <PixelText size={7} color={COLORS.light} shadow={false} style={{ marginBottom: 4 }}>
            {tag}
          </PixelText>
          {rows.map(([icon, label, value]) => (
            <View key={label} style={styles.row}>
              <Sprite name={icon} size={16} />
              <PixelText size={9} color={COLORS.dim} style={styles.label}>
                {label}
              </PixelText>
              <PixelText size={9}>{value}</PixelText>
            </View>
          ))}
          {stats.relics.length > 0 && (
            <View style={[styles.row, { flexWrap: 'wrap', gap: 4, marginTop: 4 }]}>
              {stats.relics.map((r) => (
                <View key={r} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6 }}>
                  <Sprite name={`relics_${r}` as ImgKey} size={18} />
                  <PixelText size={7} color={COLORS.armor} shadow={false} style={{ marginLeft: 3 }}>
                    {RELICS[r].name}
                  </PixelText>
                </View>
              ))}
            </View>
          )}
          {stats.boons.length > 0 && (
            <View style={[styles.row, { flexWrap: 'wrap', gap: 4, marginTop: 6 }]}>
              {stats.boons.map((b) => (
                <View key={b} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6 }}>
                  <Sprite name={`ui_boon_${b}` as ImgKey} size={16} />
                  <PixelText size={7} color={COLORS.gold} shadow={false} style={{ marginLeft: 3 }}>
                    {BOONS[b].deity}
                  </PixelText>
                </View>
              ))}
            </View>
          )}
        </Panel>
      </View>
      {!stats.victory && (
        <View style={styles.apo}>
          <Image source={IMG.portraits_haliya} fadeDuration={0} resizeMode="stretch" style={styles.apoPortrait} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <PixelText size={8} color={COLORS.light}>
              HALIYA
            </PixelText>
            <PixelText size={8} shadow={false}>
              {DEFEAT_LINES[Math.floor(stats.time) % DEFEAT_LINES.length]}
            </PixelText>
          </View>
        </View>
      )}
      <View style={styles.footer}>
        <PixelButton label="MENU" onPress={onMenu} color="#5a4a78" size={10} />
        <PixelButton label={stats.victory ? 'MULI · PLAY AGAIN' : 'ULITIN · RETRY'} onPress={onRetry} color={COLORS.gold} style={{ marginLeft: 16 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', backgroundColor: COLORS.bg, paddingBottom: 16 },
  middle: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  panel: { marginLeft: 24, minWidth: 220 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  label: { marginLeft: 10, width: 96 },
  footer: { flexDirection: 'row' },
  apo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 8, maxWidth: 460, backgroundColor: 'rgba(8,18,24,0.88)', borderWidth: 2, borderColor: COLORS.edge },
  apoPortrait: { width: 44, height: 44 },
});
