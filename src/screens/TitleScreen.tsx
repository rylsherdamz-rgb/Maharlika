import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { IMG, ImgKey } from '../assets';
import { HEROES } from '../game/data';
import { CoverImage, PixelButton, PixelText, Sprite, useTicker } from '../ui';

export default function TitleScreen({ onStart, onStory, onCodex }: { onStart: () => void; onStory: () => void; onCodex: () => void }) {
  const { width, height } = useWindowDimensions();
  const t = useTicker(120);
  const logoW = Math.min(width * 0.5, 440);
  const bob = Math.round(Math.sin(t / 4) * 3);
  return (
    <Pressable style={styles.root} onPress={onStart}>
      <CoverImage name="screen_title_bg" />
      <View style={[styles.logoWrap, { top: height * 0.1 + bob }]}>
        <Image source={IMG.screen_logo} style={{ width: logoW, height: logoW / 5.15 }} resizeMode="stretch" fadeDuration={0} />
        <PixelText size={10} color="#9fe8d8" style={{ marginTop: 10 }}>
          GUARDIANS OF THE BARRIO
        </PixelText>
        <PixelText size={7} color="#9fbcb4" shadow={false} style={{ marginTop: 4, textAlign: 'center' }}>
          The Bakunawa rises to swallow the moon. Hold the night until dawn.
        </PixelText>
      </View>
      <View style={styles.menu}>
        <PixelButton label="STORY" onPress={onStory} color="#4a7a78" size={8} />
        <PixelButton label="KWENTO" onPress={onCodex} color="#4a7a78" size={8} />
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
        {t % 8 < 5 && <PixelText size={12} color="#ffba48">TAP TO KEEP WATCH</PixelText>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a181e' },
  logoWrap: { position: 'absolute', left: 24, width: '55%', alignItems: 'center' },
  parade: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  tap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  menu: { position: 'absolute', left: 24, bottom: 16, flexDirection: 'row', gap: 8 },
});
