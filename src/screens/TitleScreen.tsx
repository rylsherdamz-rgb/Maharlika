import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { HEROES } from '../game/data';
import { PixelText, Sprite, useTicker } from '../ui';

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  const { width, height } = useWindowDimensions();
  const t = useTicker(120);
  const logoW = Math.min(width * 0.7, 560);
  const bob = Math.round(Math.sin(t / 4) * 3);
  return (
    <Pressable style={styles.root} onPress={onStart}>
      <Image source={IMG.screen_title_bg} style={StyleSheet.absoluteFill} resizeMode="cover" fadeDuration={0} />
      <View style={[styles.logoWrap, { top: height * 0.1 + bob }]}>
        <Image source={IMG.screen_logo} style={{ width: logoW, height: logoW * (24 / 182) }} resizeMode="stretch" fadeDuration={0} />
        <PixelText size={10} color="#c8b8f0" style={{ marginTop: 12 }}>
          A PIXEL DUNGEON ROGUELIKE
        </PixelText>
      </View>
      {/* heroes marching across the bottom */}
      <View style={[styles.parade, { bottom: height * 0.11 }]}>
        {HEROES.map((h, i) => (
          <Sprite
            key={h.id}
            name={`heroes_${h.id}_${(t + i) % 2}` as ImgKey}
            size={Math.min(64, height * 0.14)}
            style={{ marginHorizontal: 6 }}
          />
        ))}
      </View>
      <View style={[styles.tap, { bottom: height * 0.03 }]}>
        {t % 8 < 5 && <PixelText size={12} color="#fcd854">TAP TO START</PixelText>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0820' },
  logoWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  parade: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  tap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
