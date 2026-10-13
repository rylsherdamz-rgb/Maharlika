import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { StoryPanel } from '../game/story';
import { COLORS, CoverImage, PixelText } from '../ui';

const CHARS_PER_SEC = 55;

/** Plays illustrated story panels: typewriter text, tap to finish/advance, skip to leave. */
export default function StoryScreen({
  panels,
  onDone,
  doneLabel = 'BEGIN',
}: {
  panels: StoryPanel[];
  onDone: () => void;
  doneLabel?: string;
}) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const panel = panels[i];
  const full = panel.text.length;

  useEffect(() => {
    setShown(0);
    const start = Date.now();
    const id = setInterval(() => {
      const n = Math.floor(((Date.now() - start) / 1000) * CHARS_PER_SEC);
      setShown(n);
      if (n >= full) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [i, full]);

  const next = () => {
    if (shown < full) setShown(full);
    else if (i < panels.length - 1) setI(i + 1);
    else onDone();
  };

  const last = i === panels.length - 1;
  return (
    <Pressable style={styles.root} onPress={next}>
      <CoverImage name={panel.art} />
      <View style={styles.box}>
        {panel.title && (
          <PixelText size={11} color={COLORS.light} style={{ marginBottom: 4 }}>
            {panel.title.toUpperCase()}
          </PixelText>
        )}
        <PixelText size={9} shadow={false} style={{ minHeight: 48 }}>
          {panel.text.slice(0, shown)}
        </PixelText>
        <View style={styles.footer}>
          <View style={styles.dots}>
            {panels.map((_, k) => (
              <View key={k} style={[styles.dot, k === i && styles.dotOn]} />
            ))}
          </View>
          <PixelText size={8} color={COLORS.dim}>
            {shown < full ? 'TAP' : last ? `TAP TO ${doneLabel}` : 'TAP TO CONTINUE'}
          </PixelText>
        </View>
      </View>
      <Pressable style={styles.skip} onPress={onDone} hitSlop={10}>
        <PixelText size={9} color={COLORS.dim}>
          SKIP ›
        </PixelText>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'flex-end' },
  box: {
    marginHorizontal: 24,
    marginBottom: 14,
    padding: 12,
    backgroundColor: 'rgba(8,18,24,0.9)',
    borderWidth: 3,
    borderColor: COLORS.border,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, backgroundColor: COLORS.edge, transform: [{ rotate: '45deg' }] },
  dotOn: { backgroundColor: COLORS.light },
  skip: { position: 'absolute', top: 12, right: 16, padding: 6, backgroundColor: 'rgba(8,18,24,0.7)' },
});
