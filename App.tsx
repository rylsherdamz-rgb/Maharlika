import { PixelifySans_500Medium, PixelifySans_700Bold, useFonts } from '@expo-google-fonts/pixelify-sans';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HeroId } from './src/game/data';
import GameScreen from './src/screens/GameScreen';
import ResultScreen, { RunStats } from './src/screens/ResultScreen';
import SelectScreen from './src/screens/SelectScreen';
import TitleScreen from './src/screens/TitleScreen';

type Screen =
  | { name: 'title' }
  | { name: 'select' }
  | { name: 'game'; hero: HeroId; run: number }
  | { name: 'result'; stats: RunStats };

export default function App() {
  const [fontsLoaded] = useFonts({ PixelifySans_500Medium, PixelifySans_700Bold });
  const [screen, setScreen] = useState<Screen>({ name: 'title' });
  const [run, setRun] = useState(0);

  const start = (hero: HeroId) => {
    setRun((r) => r + 1);
    setScreen({ name: 'game', hero, run: run + 1 });
  };

  let content: React.ReactNode = null;
  if (fontsLoaded) {
    switch (screen.name) {
      case 'title':
        content = <TitleScreen onStart={() => setScreen({ name: 'select' })} />;
        break;
      case 'select':
        content = <SelectScreen onBack={() => setScreen({ name: 'title' })} onPick={start} />;
        break;
      case 'game':
        content = (
          <GameScreen
            key={screen.run}
            heroId={screen.hero}
            onEnd={(stats) => setScreen({ name: 'result', stats })}
            onQuit={() => setScreen({ name: 'title' })}
          />
        );
        break;
      case 'result':
        content = (
          <ResultScreen
            stats={screen.stats}
            onRetry={() => start(screen.stats.hero)}
            onMenu={() => setScreen({ name: 'title' })}
          />
        );
        break;
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a181e' },
});
