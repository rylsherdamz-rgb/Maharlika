# BANTAY: Guardians of the Barrio

A pixel-art roguelike shooter for Android, built with React Native (Expo), set in a
Philippine barrio at night.

> The Bakunawa, the great sea serpent, has risen to swallow the moon. While the
> village sleeps, its *bantay* (guardians) hold the night against the creatures
> that come with it, purok by purok, until dawn.

![Brand sheet](assets/brand/brand_sheet.png)

## The guardians

| Guardian | Role | HP | Amulets | Light | Skill |
|---|---|---|---|---|---|
| **Kidlat** | The Barrio Watchman, red putong and bamboo vest | 7 | 5 | 180 | **Lightning Rush**: shoot twice as fast for 5s |
| **Liksi** | The Rice-Field Scout, salakot and banana-leaf cloak | 5 | 4 | 200 | **Hop**: dash and dodge all damage |
| **Mayumi** | The Babaylan, spirit priestess with sampaguita and beads | 5 | 3 | 260 | **Anito Ring**: ring of piercing spirit orbs |
| **Amihan** | The Herbalist, striped tapis | 6 | 4 | 220 | **Hilot**: heal 2 HP and restore amulets |

- **Amulets** (anting-anting) absorb hits first and recharge after 3s without damage.
- **Light** powers the stronger weapons. The tirador is free. Fireflies (alitaptap)
  restore light; when it runs out the guardian switches to the tirador automatically.

## Weapons

| Weapon | What it is | Cost |
|---|---|---|
| **Tirador** | Slingshot, steady pebbles | free |
| **Sumpit** | Bamboo blowgun, rapid darts | 0.5 light |
| **Lantaka** | Brass swivel cannon, 5-shot scatter | 2 light |
| **Agimat Rod** | Amulet rod, piercing spirit orbs | 3 light |

## The creatures

- **Duwende**: hopping house-dwarf, rushes you.
- **Manananggal**: flying half-body with leathery wings, fast and erratic.
- **Tikbalang**: horse-headed trickster that keeps its distance and throws embers.
- **Kapre**: cigar-smoking tree giant, fires a three-way spread.
- **Bakunawa** (boss): fires rings of moon shards and aimed fans, summons manananggal,
  and enrages at half health.

Enemies path around obstacles using a flow field, so nothing gets stuck behind a pot.

## A run

The plaza, then 4 random puroks (village zones) with 2 waves each, getting harder as you go,
then the shore where the Bakunawa waits. Making a purok safe opens a spirit gate and drops a
baul (chest) with a new weapon or supplies.

## Controls

| Touch | Action |
|---|---|
| Left half of the screen | Floating joystick: move |
| Amber diamond | Hold to shoot (auto-aims at the nearest creature in sight) |
| Teal diamond | Guardian skill |
| Swap | Switch weapons, or pick up the weapon you're standing on |
| Pause (top right) | Pause / abandon the watch |

Web build: `WASD`/arrows move, `Space`/`J` shoot, `K` skill, `Q`/`L` swap, `Esc` pause.

## Brand

- **Name:** Bantay ("guard, watch" in Filipino). Tagline: *Guardians of the Barrio*.
- **Palette:** moonlit teal night (`#0a181e`, `#185c68`, `#36a4a0`), spirit green (`#82eed6`),
  lantern amber (`#ffba48`), flame (`#f08428`), putong red (`#d63a30`), bamboo (`#ccc466`),
  leaf (`#62b24a`), narra wood (`#985e34`).
- **Type:** Pixelify Sans for UI; a custom chunky extruded pixel face for the logo and titles.
- **Signature image:** the Bakunawa coiling around the full moon over nipa huts and palms.
- **Shapes:** diamond-cut buttons, after the woven banig mat motif.

## Running it

```bash
npm install
npx expo start            # scan the QR code with Expo Go on Android
npx expo start --android  # or launch on a connected device / emulator
npx eas-cli@latest build -p android --profile preview   # installable APK
```

Single-file web build (what the shareable preview page uses):

```bash
npx expo export --platform web --output-dir dist
python3 tools/build_web_single.py dist bantay.html
```

## Assets

All art is drawn as pixel maps in [`tools/generate_assets.py`](tools/generate_assets.py)
and rendered with nearest-neighbour upscaling. Edit a map and run
`python3 tools/generate_assets.py` (needs Pillow) to regenerate:

- `assets/sprites/`: guardians (2-frame walk), creatures and the Bakunawa, weapons, shots,
  items (barya, alitaptap, herbs, gasera, baul), spirit gate, tiles (ground, bamboo fence,
  hedge, palayok, balete stump, sulo)
- `assets/ui/`: HUD icons and diamond touch controls
- `assets/screens/`: title (Bakunawa and the moon), bahay kubo select room, eclipsed-moon
  defeat, dawn over the rice terraces, logo and titles
- `assets/rooms/`: pre-rendered maps, with matching collision grids in `src/game/rooms.json`
- `assets/brand/brand_sheet.png`, app icon, adaptive icon layers, splash, `src/assets.ts`,
  `assets/preview.png`

## Project layout

```
App.tsx                  screen state machine (title → select → game → result)
src/game/data.ts         guardians, weapons, creature stats
src/game/engine.ts       simulation: movement, collision, flow-field AI, shots, pickups, run flow
src/screens/             Title, Select, Game (renderer + multi-touch controls + HUD), Result
src/ui.tsx               brand palette, pixel text, buttons, panels, sprite helper
tools/generate_assets.py all art
tools/build_web_single.py single-file web build
```
