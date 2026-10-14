import { NotoSansTagalog_400Regular } from '@expo-google-fonts/noto-sans-tagalog';
import { PixelifySans_500Medium, PixelifySans_700Bold, useFonts } from '@expo-google-fonts/pixelify-sans';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HeroId, WeaponId } from './src/game/data';
import { ENDING, EPILOGUE, INTRO } from './src/game/story';
import CodexScreen from './src/screens/CodexScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen, { RunStats } from './src/screens/ResultScreen';
import SelectScreen from './src/screens/SelectScreen';
import StoryScreen from './src/screens/StoryScreen';
import TitleScreen from './src/screens/TitleScreen';

type Screen =
  | { name: 'title' }
  | { name: 'select' }
  | { name: 'game'; hero: HeroId; weapon: WeaponId; run: number }
  | { name: 'result'; stats: RunStats }
  | { name: 'intro'; then: 'select' | 'title' }
  | { name: 'ending'; stats: RunStats }
  | { name: 'codex'; entry?: string; back: Screen };

export default function App() {
  const [fontsLoaded] = useFonts({ PixelifySans_500Medium, PixelifySans_700Bold, NotoSansTagalog_400Regular });
  const [screen, setScreen] = useState<Screen>({ name: 'title' });
  const [run, setRun] = useState(0);
  const [seenIntro, setSeenIntro] = useState(false);

  const start = (hero: HeroId, weapon: WeaponId) => {
    setRun((r) => r + 1);
    setScreen({ name: 'game', hero, weapon, run: run + 1 });
  };

  let content: React.ReactNode = null;
  if (fontsLoaded) {
    switch (screen.name) {
      case 'title':
        content = (
          <TitleScreen
            onStart={() => setScreen(seenIntro ? { name: 'select' } : { name: 'intro', then: 'select' })}
            onStory={() => setScreen({ name: 'intro', then: 'title' })}
            onCodex={() => setScreen({ name: 'codex', back: { name: 'title' } })}
          />
        );
        break;
      case 'intro':
        content = (
          <StoryScreen
            panels={INTRO}
            doneLabel={screen.then === 'select' ? 'CHOOSE A GUARDIAN' : 'RETURN'}
            onDone={() => {
              setSeenIntro(true);
              setScreen(screen.then === 'select' ? { name: 'select' } : { name: 'title' });
            }}
          />
        );
        break;
      case 'ending': {
        const stats = screen.stats;
        const panels = [...ENDING, { art: ENDING[ENDING.length - 1].art, title: 'Epilogue', text: EPILOGUE[stats.hero] }];
        content = <StoryScreen panels={panels} doneLabel="SEE THE WATCH" onDone={() => setScreen({ name: 'result', stats })} />;
        break;
      }
      case 'codex':
        content = <CodexScreen initial={screen.entry} onBack={() => setScreen(screen.back)} />;
        break;
      case 'select':
        content = (
          <SelectScreen
            onBack={() => setScreen({ name: 'title' })}
            onPick={start}
            onStory={(id) => setScreen({ name: 'codex', entry: id, back: { name: 'select' } })}
          />
        );
        break;
      case 'game':
        content = (
          <GameScreen
            key={screen.run}
            heroId={screen.hero}
            weaponId={screen.weapon}
            onEnd={(stats) => setScreen(stats.victory ? { name: 'ending', stats } : { name: 'result', stats })}
            onQuit={() => setScreen({ name: 'title' })}
          />
        );
        break;
      case 'result':
        content = (
          <ResultScreen
            stats={screen.stats}
            onRetry={() => start(screen.stats.hero, screen.stats.weapon)}
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
  root: { flex: 1, backgroundColor: '#0e0c1c' },
});
