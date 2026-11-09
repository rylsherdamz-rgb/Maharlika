import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import type { GameEvent } from '../game/engine';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

/** A short buzz for each game event; does nothing on the web build. */
export function buzz(e: GameEvent) {
  if (!enabled) return;
  const run = () => {
    switch (e) {
      case 'hurt':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'gong':
      case 'surface':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      case 'skill':
      case 'elite':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      case 'boon':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'buy':
        return Haptics.selectionAsync();
    }
  };
  run()?.catch(() => {});
}
