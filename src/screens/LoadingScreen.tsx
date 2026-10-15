import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, CoverImage, PixelText } from '../ui';

/** Short folklore and play tips, Filipino first with the English under it. */
const TIPS: [string, string][] = [
  ['Tabi-tabi po.', 'Say "excuse me" when you pass a punso, so the duwende are not disturbed.'],
  ['Huwag sundan ang iyak.', 'Do not follow a baby crying in the forest. Strike the tiyanak first.'],
  ['Baliktarin ang damit.', 'Wear your shirt inside out and the tikbalang cannot lead you astray.'],
  ['Hanapin ang kaban.', 'Every safe island hides a chest. It may hold a new weapon or a whetstone.'],
  ['Ingay laban sa Bakunawa.', 'People beat gongs and pots during eclipses so the serpent would spit out the moon.'],
  ['Pito ang buwan noon.', 'Bathala made seven moons. The Bakunawa has swallowed six.'],
  ['Umiwas!', 'A dodge roll makes you untouchable for a moment. Roll through the shots.'],
];

/**
 * Loading screen: the coiled Bakunawa and a filling lamp. Waits for `ready`
 * and for at least `minMs`, so a tip can be read, then calls `onDone`.
 */
export default function LoadingScreen({ ready, onDone, minMs = 1400, fontsReady = true }: { ready: boolean; onDone: () => void; minMs?: number; fontsReady?: boolean }) {
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(start);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(id);
  }, []);
  const frac = Math.min(1, (now - start) / minMs) * (ready ? 1 : 0.85);
  const done = useRef(false);
  useEffect(() => {
    if (!done.current && ready && now - start >= minMs) {
      done.current = true; // fire once, even if the parent re-renders before switching screens
      onDone();
    }
  }, [ready, now, start, minMs, onDone]);

  return (
    <View style={styles.root}>
      <CoverImage name="screen_loading_bg" />
      <View style={styles.bottom}>
        {fontsReady && (
          <>
            <PixelText size={9} color={COLORS.light}>
              {`ALAM MO BA?  ·  Did you know?`}
            </PixelText>
            <PixelText size={11} color={COLORS.gold} style={styles.center}>
              {tip[0]}
            </PixelText>
            <PixelText size={7} color={COLORS.text} shadow={false} style={styles.center}>
              {tip[1]}
            </PixelText>
          </>
        )}
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${frac * 100}%` }]} />
        </View>
        {fontsReady && (
          <PixelText size={7} color={COLORS.dim} shadow={false}>
            {`NAGHAHANDA...  ·  Getting ready`}
          </PixelText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  bottom: { position: 'absolute', alignSelf: 'center', bottom: 14, maxWidth: 600, alignItems: 'center', gap: 4, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(8,6,18,0.82)', borderWidth: 2, borderColor: COLORS.edge },
  center: { textAlign: 'center', maxWidth: 520 },
  track: { width: 380, maxWidth: '100%', height: 10, marginTop: 6, backgroundColor: 'rgba(8,8,20,0.8)', borderWidth: 2, borderColor: COLORS.border },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: COLORS.light },
});
