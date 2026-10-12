# Soul Night

A pixel-art roguelike dungeon shooter for Android, built with React Native (Expo).
Pick a hero, blast through the dungeon room by room, grab weapons from chests and
defeat the **Shadow Lord**.

![Asset sheet](assets/preview.png)

## Gameplay

- **4 heroes**, each with their own stats, starting weapons and skill:
  | Hero | HP | Armor | Energy | Skill |
  |---|---|---|---|---|
  | Knight | 7 | 5 | 180 | **Dual Wield**: fire twice as fast for 5s |
  | Rogue | 5 | 4 | 200 | **Shadow Roll**: dash and dodge all damage |
  | Wizard | 4 | 3 | 260 | **Frost Nova**: ring of piercing magic orbs |
  | Priestess | 6 | 4 | 220 | **Holy Light**: heal 2 HP and restore armor |
- **Armor** soaks hits first and regenerates after 3s without damage.
- **Energy** powers weapons (the pistol is free). Enemies drop energy orbs and coins.
  When you run dry, the hero switches to the free pistol automatically.
- **Weapons:** Old Pistol, Boomstick (shotgun), Storm Rifle, Moon Staff (piercing).
- **Enemies:** Slime, Bat, Goblin (shooter), Skeleton (3-way spread), plus the
  **Shadow Lord** boss (radial bursts, aimed fans, summons bats, enrages at 50% HP).
- **Run structure:** start room → 4 random combat rooms (2 waves each, harder as you go)
  → boss. Clearing a room opens a portal and drops a chest.

## Controls

| Touch | Action |
|---|---|
| Left half of the screen | Floating joystick: move |
| Red button | Hold to fire (auto-aims at the nearest visible enemy) |
| Blue star | Hero skill |
| Swap | Switch weapons, or pick up the weapon you're standing on |
| Pause (top right) | Pause / quit run |

Web build (debugging): `WASD`/arrows move, `Space`/`J` fire, `K` skill, `Q`/`L` swap, `Esc` pause.

## Running it

```bash
npm install
npx expo start          # scan the QR code with Expo Go on Android
npx expo start --android  # or launch on a connected device / emulator
```

Build an installable APK with EAS:

```bash
npx eas-cli@latest build -p android --profile preview
```

## Assets

All art is drawn as pixel maps in [`tools/generate_assets.py`](tools/generate_assets.py)
and rendered with nearest-neighbour upscaling. To change a sprite, edit its map and run:

```bash
python3 tools/generate_assets.py   # needs Pillow
```

This regenerates:

- `assets/sprites/`: heroes (2-frame walk), enemies + boss, weapons, projectiles, items, chests, portal, tiles
- `assets/ui/`: HUD icons, joystick, action buttons
- `assets/screens/`: title / hero select / game over / victory backgrounds and pixel-font logos
- `assets/rooms/`: pre-rendered dungeon rooms, with matching collision grids in `src/game/rooms.json`
- App icon, adaptive icon layers, splash, `src/assets.ts` (typed image registry) and `assets/preview.png`

## Project layout

```
App.tsx                  screen state machine (title → select → game → result)
src/game/data.ts         heroes, weapons, enemy stats
src/game/engine.ts       game simulation: movement, collision, AI, bullets, pickups, room flow
src/screens/             Title, Select, Game (renderer + multi-touch controls + HUD), Result
src/ui.tsx               pixel text, buttons, panels, sprite helper
tools/generate_assets.py all art
```
