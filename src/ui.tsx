import { useEffect, useState } from 'react';
import { Image, ImageStyle, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { IMG, ImgKey } from './assets';

export const FONT = 'PressStart2P_400Regular';

export const COLORS = {
  bg: '#0c0820',
  panel: '#1c1430',
  panelLight: '#2e2248',
  border: '#9c54d6',
  text: '#f4eedc',
  dim: '#a49cbc',
  gold: '#fcd854',
  red: '#dc3440',
  blue: '#487ae8',
  armor: '#b2bcd0',
};

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
          fontFamily: FONT,
          fontSize: size,
          lineHeight: size * 1.5,
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
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btnOuter, { borderColor: color }, pressed && styles.pressed, style]}>
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
    textShadowColor: '#140f20',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  btnOuter: {
    borderWidth: 3,
    backgroundColor: '#140f20',
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
    backgroundColor: 'rgba(20,15,36,0.88)',
    borderWidth: 3,
    padding: 10,
  },
});
