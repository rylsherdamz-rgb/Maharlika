import { NotoSansTagalog_400Regular } from '@expo-google-fonts/noto-sans-tagalog';
import { PixelifySans_500Medium, PixelifySans_700Bold, useFonts } from '@expo-google-fonts/pixelify-sans';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { initAudio, playSfx, setMusic } from './src/audio';
import { HeroId } from './src/game/data';
import { ENDING, EPILOGUE, INTRO } from './src/game/story';
import { getSave, loadSave, recordRun, updateSave, useSave } from './src/save';
import OfferingsScreen from './src/screens/OfferingsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RunOptions } from './src/game/engine';
import CodexScreen from './src/screens/CodexScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen, { RunStats } from './src/screens/ResultScreen';
import SelectScreen from './src/screens/SelectScreen';
import StoryScreen from './src/screens/StoryScreen';
import TitleScreen from './src/screens/TitleScreen';

type Screen =
  | { name: 'title' }
  | { name: 'select' }
  | { name: 'game'; hero: HeroId; run: number; options: RunOptions }
  | { name: 'offerings' }
  | { name: 'settings' }
  | { name: 'result'; stats: RunStats }
  | { name: 'intro'; then: 'select' | 'title' }
  | { name: 'ending'; stats: RunStats }
  | { name: 'codex'; entry?: string; back: Screen };

export default function App() {
  return (
    <SafeAreaProvider>
      <Game />
    </SafeAreaProvider>
  );
}

/** Keeps menus clear of camera notches and rounded corners; the game screen handles its own. */
function Safe({ full, children }: { full: boolean; children: React.ReactNode }) {
  const ins = useSafeAreaInsets();
  if (full) return <>{children}</>;
  return <View style={{ flex: 1, paddingLeft: ins.left, paddingRight: ins.right, paddingBottom: ins.bottom }}>{children}</View>;
}

function Game() {
  const [fontsLoaded] = useFonts({ PixelifySans_500Medium, PixelifySans_700Bold, NotoSansTagalog_400Regular });
  const [screen, setScreen] = useState<Screen>({ name: 'title' });
  const [run, setRun] = useState(0);
  const [saveReady, setSaveReady] = useState(false);
  const seenIntro = useSave().seenIntro;

  useEffect(() => {
    loadSave().finally(() => {
      initAudio();
      setSaveReady(true);
    });
  }, []);

  // music follows the screen; the game screen picks its own track per island
  useEffect(() => {
    if (!saveReady || screen.name === 'game') return;
    if (screen.name === 'result') setMusic(screen.stats.victory ? 'title' : null);
    else setMusic('title');
  }, [saveReady, screen]);

  // Android back: step back through the menus; on the title, leave the app
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      switch (screen.name) {
        case 'title':
          return false;
        case 'game':
          return true; // the game screen handles it (pause)
        case 'codex':
          setScreen(screen.back);
          return true;
        case 'intro':
          updateSave({ seenIntro: true });
          setScreen(screen.then === 'select' ? { name: 'select' } : { name: 'title' });
          return true;
        case 'ending':
          setScreen({ name: 'result', stats: screen.stats });
          return true;
        default:
          setScreen({ name: 'title' });
          return true;
      }
    });
    return () => sub.remove();
  }, [screen]);

  const finish = (stats: RunStats) => {
    // Pulang Buwan pays half again in barya
    const coins = Math.round(stats.coins * (stats.hard ? 1.5 : 1));
    const newBest = recordRun({ hero: stats.hero, victory: stats.victory, reached: stats.reached, stage: stats.stage, kills: stats.kills, time: stats.time, coins, hard: stats.hard });
    const s = { ...stats, newBest };
    setScreen(s.victory ? { name: 'ending', stats: s } : { name: 'result', stats: s });
  };

  const start = (hero: HeroId) => {
    const sv = getSave();
    const options: RunOptions = {
      hard: sv.hard && sv.wins > 0,
      skin: sv.wearing.includes(hero),
      unlocked: sv.unlockedBoons,
      tutorial: !sv.tutorialDone,
    };
    setRun((r) => r + 1);
    setScreen({ name: 'game', hero, run: run + 1, options });
  };

  let content: React.ReactNode = null;
  if (fontsLoaded && saveReady) {
    switch (screen.name) {
      case 'title':
        content = (
          <TitleScreen
            onStart={() => {
              playSfx('tap');
              setScreen(seenIntro ? { name: 'select' } : { name: 'intro', then: 'select' });
            }}
            onStory={() => setScreen({ name: 'intro', then: 'title' })}
            onCodex={() => setScreen({ name: 'codex', back: { name: 'title' } })}
            onOfferings={() => setScreen({ name: 'offerings' })}
            onSettings={() => setScreen({ name: 'settings' })}
          />
        );
        break;
      case 'intro':
        content = (
          <StoryScreen
            panels={INTRO}
            doneLabel={screen.then === 'select' ? 'CHOOSE A GUARDIAN' : 'RETURN'}
            onDone={() => {
              updateSave({ seenIntro: true });
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
      case 'settings':
        content = <SettingsScreen onBack={() => setScreen({ name: 'title' })} />;
        break;
      case 'offerings':
        content = <OfferingsScreen onBack={() => setScreen({ name: 'title' })} />;
        break;
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
            options={screen.options}
            onEnd={finish}
            onQuit={(stats) => {
              recordRun({ hero: stats.hero, victory: false, reached: stats.reached, stage: stats.stage, kills: stats.kills, time: stats.time, coins: Math.round(stats.coins * (stats.hard ? 1.5 : 1)), hard: stats.hard });
              setScreen({ name: 'title' });
            }}
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
      <Safe full={screen.name === 'game'}>{content}</Safe>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e0c1c' },
});
