# MAHARLIKA: Ang Gabi ng Bakunawa

A pixel-art action roguelike for Android, built with React Native (Expo), set in a
Philippines that was never colonized.

> In 1521 Lapulapu turned back Magellan at Mactan, and in this history no one ever came back.
> Five centuries later the free islands of **Maharlika** face the **Bakunawa**, the sea serpent
> of Visayan myth that swallowed six of Bathala's seven moons and has risen for the last one.
> Haliya, the masked Bicolano goddess of moonlight, calls four maharlika to sail the islands and
> hold the serpent back while the people beat their gongs to drive it off.

![Brand sheet](assets/brand/brand_sheet.png)

The myths, gods and creatures come from documented Philippine folklore (Visayan, Bicolano and
Tagalog). The story bible in [`docs/STORY.md`](docs/STORY.md) lists every element and whether
it is folklore, history or invented for the game.

## How it plays

- **Islands, not rooms:** each stage is an island in the sea. You walk on land, shots fly over water.
  Clear the island, visit its **dambana** (shrine), then board the **balangay** to sail on.
- **Blessings of the gods:** each dambana offers three of eight Tagalog deities (Apolaki, Mayari,
  Tala, Anitun Tabu, Dumakulem, Lakapati, Aman Sinaya, Lakan Bakod). Pick one; they stack for the run.
- **One signature weapon per hero:** kampilan (melee, cuts enemy shots), pana (bow), agimat rod
  (piercing spirit orbs), sumpit (poison darts).
- **Dodge roll** for everyone; **skills charge with light** from fighting and catching fireflies.
- **Health beads and amulets:** amulets (anting-anting) absorb hits and recharge.

| Hero | From | Weapon | Skill |
|---|---|---|---|
| **Kidlat** | Mactan, maharlika warrior | Kampilan | Bagyo: blade whirl that clears shots |
| **Liksi** | Butuan, navigator | Pana | Ulan ng Pana: arrow storm |
| **Mayumi** | Panay, babaylan | Agimat rod | Anito Ring: spirit orbs |
| **Amihan** | Siquijor, mananambal | Sumpit | Tambal: heal and restore amulets |

Route: Port of Tondo → Punso Fields → Siquijor → Mount Banahaw → Ibalong Forests → Shore of Albay
(the Bakunawa). Illustrated prologue and ending, a dialogue before the boss, an epilogue per hero,
and the **Kwento** codex (Maharlika · Creatures · The Gods · The World) with sources.

## Controls

| Touch | Action |
|---|---|
| Left half | Floating joystick |
| Crossed blades (big diamond) | Hold to attack (auto-aims) |
| Wind (small diamond) | Dodge roll |
| Sun | Skill, when your light is full |
| Cards at a dambana | Choose a blessing |

Web build: `WASD` move, `Space` attack, `Shift` dodge, `K` skill, `1-3` choose a blessing, `Esc` pause.

## Running it

```bash
npm install
npx expo start              # scan the QR code with Expo Go on Android
npx eas-cli@latest build -p android --profile preview   # installable APK
```

Single-file web build:

```bash
npx expo export --platform web --output-dir dist
python3 tools/build_web_single.py dist maharlika.html
```

## Assets

Everything is drawn in [`tools/generate_assets.py`](tools/generate_assets.py) as pixel maps or
small procedural routines (Baybayin is rendered from Noto Sans Tagalog). Run
`python3 tools/generate_assets.py` (needs Pillow and `npm install`) to regenerate:

- heroes, creatures, the Bakunawa, Haliya, weapons, shots and the kampilan slash effect
- island maps (sea, surf, sand, themed ground and props such as punso, banana, balete, rocks,
  bronze lamp posts) with collision grids in `src/game/rooms.json`
- balangay, dambana, agung; HUD medallion, bead pips, eight deity emblems, touch controls
- title (Mayon, the eclipse, the Bakunawa and the fleet), select, defeat, dawn screens; logo
  and Baybayin logo; 8 story panels; 6 dialogue portraits; brand sheet; app icons

## Project layout

```
App.tsx                    screen flow: title → story → select → game → ending → result; codex
src/game/data.ts           heroes, weapons, creatures, the gods' blessings
src/game/story.ts          all story text, bios with sources, island names in Baybayin
src/game/engine.ts         simulation: islands, melee and ranged combat, dodge, light, blessings, AI
src/screens/               Title, Story, Codex, Select, Game, Result
src/ui.tsx                 palette, pixel and Baybayin text, buttons, panels
tools/generate_assets.py   all art
docs/STORY.md              story bible and sources
```
