import { useEffect, useState } from 'react';
import { Image, ImageStyle, Pressable, StyleProp, StyleSheet, Text, TextStyle, useWindowDimensions, View, ViewStyle } from 'react-native';
import { IMG, ImgKey } from './assets';
import { playSfx } from './audio';

export const FONT = 'PixelifySans_500Medium';
export const FONT_BOLD = 'PixelifySans_700Bold';
export const FONT_BAYBAYIN = 'NotoSansTagalog_400Regular';

// Maharlika palette: eclipse-night indigo, bronze and gold, sea teal, putong red.
export const COLORS = {
  bg: '#0e0c1c',
  panel: '#1a1630',
  panelLight: '#2a2444',
  border: '#d79a3c',
  text: '#fff6e4',
  dim: '#b2a8c4',
  gold: '#ffe882',
  red: '#d63a30',
  light: '#ffba48',
  armor: '#82eed6',
  edge: '#3a3050',
  sea: '#0c2c3e',
};

/** Baybayin script (Noto Sans Tagalog). */
export function BaybayinText({ children, size = 14, color = COLORS.light, style }: { children: React.ReactNode; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: FONT_BAYBAYIN, fontSize: size, lineHeight: size * 1.6, color }, styles.shadow, style]}>{children}</Text>;
}

export function PixelText({
  children,
  size = 10,
  color = COLORS.text,
  style,
  shadow = true,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  shadow?: boolean;
}) {
  return (
    <Text
      style={[
        {
          fontFamily: size >= 12 ? FONT_BOLD : FONT,
          fontSize: Math.round(size * 1.45),
          lineHeight: Math.round(size * 1.45 * 1.2),
          color,
        },
        shadow && styles.shadow,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Sprite({
  name,
  size,
  flip,
  tint,
  style,
}: {
  name: ImgKey;
  size: number;
  flip?: boolean;
  tint?: string;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={IMG[name]}
      style={[{ width: size, height: size }, flip && { transform: [{ scaleX: -1 }] }, tint ? { tintColor: tint } : null, style]}
      resizeMode="stretch"
      fadeDuration={0}
    />
  );
}

export function PixelButton({
  label,
  onPress,
  color = COLORS.border,
  style,
  size = 12,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
  size?: number;
}) {
  return (
    <Pressable
      onPress={() => {
        playSfx('click');
        onPress();
      }}
      style={({ pressed }) => [styles.btnOuter, { borderColor: color }, pressed && styles.pressed, style]}>
      {({ pressed }) => (
        <View style={[styles.btnInner, { backgroundColor: pressed ? COLORS.panelLight : COLORS.panel }]}>
          <PixelText size={size}>{label}</PixelText>
        </View>
      )}
    </Pressable>
  );
}

export function Panel({ children, style, color = COLORS.border }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; color?: string }) {
  return <View style={[styles.panel, { borderColor: color }, style]}>{children}</View>;
}

/** Full-screen 16:9 background art scaled to cover the screen, cropped evenly on both sides. */
export function CoverImage({ name }: { name: ImgKey }) {
  const { width, height } = useWindowDimensions();
  const s = Math.max(width / 16, height / 9);
  const w = 16 * s;
  const h = 9 * s;
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <Image
        source={IMG[name]}
        fadeDuration={0}
        resizeMode="stretch"
        style={{ position: 'absolute', width: w, height: h, left: (width - w) / 2, top: (height - h) / 2 }}
      />
    </View>
  );
}

/** Counter that increments every `ms` milliseconds — drives idle sprite animations. */
export function useTicker(ms: number) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((v) => v + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
}

const styles = StyleSheet.create({
  shadow: {
    textShadowColor: '#0a0814',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  btnOuter: {
    borderWidth: 3,
    backgroundColor: '#0a0814',
  },
  btnInner: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.4)',
  },
  pressed: { transform: [{ translateY: 2 }] },
  panel: {
    backgroundColor: 'rgba(18,14,32,0.9)',
    borderWidth: 3,
    padding: 10,
  },
});
