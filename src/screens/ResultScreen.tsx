import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { HeroId } from '../game/data';
import { COLORS, Panel, PixelButton, PixelText, Sprite, useTicker } from '../ui';

export interface RunStats {
  hero: HeroId;
  victory: boolean;
  stage: string;
  kills: number;
  coins: number;
  time: number;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function ResultScreen({
  stats,
  onRetry,
  onMenu,
}: {
  stats: RunStats;
  onRetry: () => void;
  onMenu: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const t = useTicker(200);
  const textW = Math.min(width * 0.55, 440);
  const rows: [ImgKey, string, string][] = [
    ['ui_star', 'STAGE', stats.stage],
    ['ui_skull', 'KILLS', `${stats.kills}`],
    ['items_coin', 'COINS', `${stats.coins}`],
    ['ui_gem', 'TIME', fmtTime(stats.time)],
  ];
  return (
    <View style={styles.root}>
      <Image
        source={stats.victory ? IMG.screen_victory_bg : IMG.screen_gameover_bg}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        fadeDuration={0}
      />
      <Image
        source={stats.victory ? IMG.screen_victory_text : IMG.screen_gameover_text}
        style={{ width: textW, height: textW * (24 / (stats.victory ? 146 : 164)), marginTop: height * 0.06 }}
        resizeMode="stretch"
        fadeDuration={0}
      />
      <View style={styles.middle}>
        <Sprite
          name={`heroes_${stats.hero}_${stats.victory ? t % 2 : 0}` as ImgKey}
          size={Math.min(96, height * 0.22)}
          style={!stats.victory ? { transform: [{ rotate: '90deg' }], opacity: 0.8 } : undefined}
        />
        <Panel style={styles.panel}>
          {rows.map(([icon, label, value]) => (
            <View key={label} style={styles.row}>
              <Sprite name={icon} size={16} />
              <PixelText size={9} color={COLORS.dim} style={styles.label}>
                {label}
              </PixelText>
              <PixelText size={9}>{value}</PixelText>
            </View>
          ))}
        </Panel>
      </View>
      <View style={styles.footer}>
        <PixelButton label="MENU" onPress={onMenu} color="#6c6488" size={10} />
        <PixelButton label={stats.victory ? 'PLAY AGAIN' : 'RETRY'} onPress={onRetry} color={COLORS.gold} style={{ marginLeft: 16 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', backgroundColor: COLORS.bg, paddingBottom: 16 },
  middle: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  panel: { marginLeft: 24, minWidth: 220 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  label: { marginLeft: 10, width: 80 },
  footer: { flexDirection: 'row' },
});
