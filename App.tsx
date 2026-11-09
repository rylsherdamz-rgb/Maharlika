import { NotoSansTagalog_400Regular } from '@expo-google-fonts/noto-sans-tagalog';
import { PixelifySans_500Medium, PixelifySans_700Bold, useFonts } from '@expo-google-fonts/pixelify-sans';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HeroId } from './src/game/data';
import { ENDING, EPILOGUE, INTRO } from './src/game/story';
import CodexScreen from './src/screens/CodexScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen, { RunStats } from './src/screens/ResultScreen';
import SelectScreen from './src/screens/SelectScreen';
import StoryScreen from './src/screens/StoryScreen';
import TitleScreen from './src/screens/TitleScreen';
import { emptyRecords, loadRecords, recordRun, Records, RunOutcome, saveRecords } from './src/lib/records';

type Screen =
  | { name: 'title' }
  | { name: 'select' }
  | { name: 'game'; hero: HeroId; run: number }
  | { name: 'result'; stats: RunStats; outcome?: RunOutcome }
  | { name: 'intro'; then: 'select' | 'title' }
  | { name: 'ending'; stats: RunStats; outcome?: RunOutcome }
  | { name: 'codex'; entry?: string; back: Screen };

export default function App() {
  const [fontsLoaded] = useFonts({ PixelifySans_500Medium, PixelifySans_700Bold, NotoSansTagalog_400Regular });
  const [screen, setScreen] = useState<Screen>({ name: 'title' });
  const [run, setRun] = useState(0);
  const [seenIntro, setSeenIntro] = useState(false);
  const [records, setRecords] = useState<Records>(emptyRecords);
  const recordsRef = useRef(records);
  recordsRef.current = records;

  useEffect(() => {
    loadRecords().then((r) => {
      setRecords(r);
      // anyone who has finished a run has already seen the prologue
      if (Object.values(r.heroes).some((h) => h.runs > 0)) setSeenIntro(true);
    });
  }, []);

  const finishRun = (stats: RunStats) => {
    const { records: next, outcome } = recordRun(recordsRef.current, stats);
    setRecords(next);
    saveRecords(next);
    setScreen(stats.victory ? { name: 'ending', stats, outcome } : { name: 'result', stats, outcome });
  };

  const start = (hero: HeroId) => {
    setRun((r) => r + 1);
    setScreen({ name: 'game', hero, run: run + 1 });
  };

  let content: React.ReactNode = null;
  if (fontsLoaded) {
    switch (screen.name) {
      case 'title':
        content = (
          <TitleScreen
            records={records}
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
        const outcome = screen.outcome;
        content = <StoryScreen panels={panels} doneLabel="SEE THE WATCH" onDone={() => setScreen({ name: 'result', stats, outcome })} />;
        break;
      }
      case 'codex':
        content = <CodexScreen initial={screen.entry} onBack={() => setScreen(screen.back)} />;
        break;
      case 'select':
        content = (
          <SelectScreen
            records={records}
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
            onEnd={finishRun}
            onQuit={() => setScreen({ name: 'title' })}
          />
        );
        break;
      case 'result':
        content = (
          <ResultScreen
            stats={screen.stats}
            outcome={screen.outcome}
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
  root: { flex: 1, backgroundColor: '#0e0c1c' },
});
