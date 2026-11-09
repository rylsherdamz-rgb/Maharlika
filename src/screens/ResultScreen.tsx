import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { BoonId, BOONS, HeroId } from '../game/data';
import { DEFEAT_LINES } from '../game/story';
import { fmtTime, RunOutcome } from '../lib/records';
import { COLORS, CoverImage, Panel, PixelButton, PixelText, Sprite, useTicker } from '../ui';

export interface RunStats {
  hero: HeroId;
  victory: boolean;
  stage: string;
  stageNum: number; // 0 = Tondo ... 5 = Albay
  kills: number;
  gongs: number;
  spent: number;
  coins: number;
  time: number;
  boons: BoonId[];
}

export default function ResultScreen({
  stats,
  outcome,
  onRetry,
  onMenu,
}: {
  stats: RunStats;
  outcome?: RunOutcome;
  onRetry: () => void;
  onMenu: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const t = useTicker(200);
  const textW = Math.min(width * 0.5, 400);
  const rows: [ImgKey, string, string][] = [
    ['ui_moon', 'REACHED', stats.stage],
    ['ui_skull', 'BANISHED', `${stats.kills}`],
    ['items_coin', 'PILONCITO', stats.spent > 0 ? `${stats.coins} (+${stats.spent} offered)` : `${stats.coins}`],
    ['ui_gem', 'TIME', fmtTime(stats.time)],
  ];
  if (stats.gongs > 0) rows.push(['deco_agung', 'GONGS RUNG', `${stats.gongs}`]);
  const badges: string[] = [];
  if (outcome?.firstWin) badges.push('FIRST VICTORY!');
  else if (outcome?.newBestTime) badges.push('NEW BEST TIME!');
  if (!stats.victory && outcome?.furtherThanEver) badges.push('FURTHEST YET!');
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
        <Sprite
          name={`heroes_${stats.hero}_${stats.victory ? t % 2 : 0}` as ImgKey}
          size={Math.min(96, height * 0.22)}
          style={!stats.victory ? { transform: [{ rotate: '90deg' }], opacity: 0.8 } : undefined}
        />
        <Panel style={styles.panel}>
          {badges.map((b) => (
            <PixelText key={b} size={10} color={COLORS.gold} style={{ marginBottom: 4, opacity: t % 4 === 0 ? 0.7 : 1 }}>
              {b}
            </PixelText>
          ))}
          {rows.map(([icon, label, value]) => (
            <View key={label} style={styles.row}>
              <Sprite name={icon} size={16} />
              <PixelText size={9} color={COLORS.dim} style={styles.label}>
                {label}
              </PixelText>
              <PixelText size={9}>{value}</PixelText>
            </View>
          ))}
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
  label: { marginLeft: 10, width: 96 },
  footer: { flexDirection: 'row' },
  apo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 8, maxWidth: 460, backgroundColor: 'rgba(8,18,24,0.88)', borderWidth: 2, borderColor: COLORS.edge },
  apoPortrait: { width: 44, height: 44 },
});
