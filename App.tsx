import { NotoSansTagalog_400Regular } from '@expo-google-fonts/noto-sans-tagalog';
import { PixelifySans_500Medium, PixelifySans_700Bold, useFonts } from '@expo-google-fonts/pixelify-sans';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Setup } from './src/game/engine';
import { initAudio, playMusic, setMusicOn, setSfxOn } from './src/audio';
import { loadProgress, NEW_PROGRESS, Progress, saveProgress } from './src/save';
import { ENDING, EPILOGUE, INTRO } from './src/game/story';
import CodexScreen from './src/screens/CodexScreen';
import GameScreen from './src/screens/GameScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ResultScreen, { RunStats } from './src/screens/ResultScreen';
import SelectScreen from './src/screens/SelectScreen';
import StoryScreen from './src/screens/StoryScreen';
import TitleScreen from './src/screens/TitleScreen';

type Screen =
  | { name: 'boot' }
  | { name: 'sailing'; setup: Setup }
  | { name: 'title' }
  | { name: 'select' }
  | { name: 'game'; setup: Setup; run: number }
  | { name: 'result'; stats: RunStats; best?: number }
  | { name: 'intro'; then: 'select' | 'title' }
  | { name: 'ending'; stats: RunStats }
  | { name: 'codex'; entry?: string; back: Screen };

export default function App() {
  const [fontsLoaded] = useFonts({ PixelifySans_500Medium, PixelifySans_700Bold, NotoSansTagalog_400Regular });
  const [screen, setScreen] = useState<Screen>({ name: 'boot' });
  const [run, setRun] = useState(0);
  const [seenIntro, setSeenIntro] = useState(false);
  const [progress, setProgress] = useState<Progress>(NEW_PROGRESS);
  const [progressReady, setProgressReady] = useState(false);
  useEffect(() => {
    initAudio();
    loadProgress().then((p) => {
      setProgress(p);
      setMusicOn(p.musicOn);
      setSfxOn(p.sfxOn);
      setProgressReady(true);
    });
  }, []);
  // menus, stories and results share the title theme; the game picks its own music
  useEffect(() => {
    if (['title', 'select', 'codex', 'intro', 'ending', 'result'].includes(screen.name)) playMusic('title');
  }, [screen.name]);
  const saveSound = (s: { musicOn: boolean; sfxOn: boolean }) => {
    setProgress((p) => {
      const next = { ...p, ...s };
      saveProgress(next);
      return next;
    });
  };

  const start = (setup: Setup) => setScreen({ name: 'sailing', setup });
  const launch = (setup: Setup) => {
    setRun((r) => r + 1);
    setScreen({ name: 'game', setup, run: run + 1 });
  };
  /** Record a finished run: wins unlock Mahirap, endless keeps the best island. */
  const finish = (stats: RunStats) => {
    const best = progress.bestEndless;
    const next: Progress = {
      ...progress,
      wins: progress.wins + (stats.victory ? 1 : 0),
      hardUnlocked: progress.hardUnlocked || stats.victory,
      bestEndless: stats.setup.mode === 'endless' ? Math.max(best, stats.island) : best,
      relics: [...new Set([...progress.relics, ...stats.relics])],
    };
    setProgress(next);
    saveProgress(next);
    setScreen(stats.victory ? { name: 'ending', stats } : { name: 'result', stats, best });
  };

  let content: React.ReactNode = null;
  if (screen.name === 'boot') {
    // shown from the first frame, before the fonts are in, until the fonts are ready
    content = <LoadingScreen ready={fontsLoaded && progressReady} fontsReady={fontsLoaded} onDone={() => setScreen({ name: 'title' })} />;
  } else if (fontsLoaded) {
    switch (screen.name) {
      case 'sailing': {
        const { setup } = screen;
        content = <LoadingScreen ready minMs={1100} onDone={() => launch(setup)} />;
        break;
      }
      case 'title':
        content = (
          <TitleScreen
            sound={{ musicOn: progress.musicOn, sfxOn: progress.sfxOn }}
            onSound={(s) => {
              setMusicOn(s.musicOn);
              setSfxOn(s.sfxOn);
              saveSound(s);
            }}
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
        // one epilogue panel per hero in the party
        const panels = [
          ...ENDING,
          ...stats.heroes.map((h) => ({ art: ENDING[ENDING.length - 1].art, title: `Epilogue · ${h[0].toUpperCase()}${h.slice(1)}`, text: EPILOGUE[h] })),
        ];
        content = <StoryScreen panels={panels} doneLabel="SEE THE WATCH" onDone={() => setScreen({ name: 'result', stats })} />;
        break;
      }
      case 'codex':
        content = <CodexScreen initial={screen.entry} found={progress.relics} onBack={() => setScreen(screen.back)} />;
        break;
      case 'select':
        content = (
          <SelectScreen
            progress={progress}
            onBack={() => setScreen({ name: 'title' })}
            onStart={start}
            onStory={(id) => setScreen({ name: 'codex', entry: id, back: { name: 'select' } })}
          />
        );
        break;
      case 'game':
        content = (
          <GameScreen
            key={screen.run}
            setup={screen.setup}
            onEnd={finish}
            onSoundChange={saveSound}
            onQuit={() => setScreen({ name: 'title' })}
          />
        );
        break;
      case 'result':
        content = (
          <ResultScreen
            stats={screen.stats}
            best={screen.best}
            onRetry={() => start(screen.stats.setup)}
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
