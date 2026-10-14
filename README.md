# MAHARLIKA: Ang Gabi ng Bakunawa

A pixel-art action roguelike for Android, built with React Native (Expo), set in a
Philippines that was never colonized.

> In 1521 Lapulapu turned back Magellan at Mactan, and in this history no one ever came back.
> Five centuries later the free islands of **Maharlika** face the **Bakunawa**, the sea serpent
> of Visayan myth that swallowed six of Bathala's seven moons and has risen for the last one.
> Haliya, the masked Bicolano goddess of moonlight, calls six maharlika to sail the islands and
> hold the serpent back while the people beat their gongs to drive it off.

![Brand sheet](assets/brand/brand_sheet.png)

The myths, gods and creatures come from documented Philippine folklore (Visayan, Bicolano and
Tagalog). The story bible in [`docs/STORY.md`](docs/STORY.md) lists every element and whether
it is folklore, history or invented for the game.

## How it plays

- **Modes:** *Paglalayag* (Voyage) to the Bakunawa, or *Walang Katapusan* (Endless): islands keep
  coming and get harder until the party falls; the furthest island is saved as your record.
- **Difficulty:** *Madali* (Easy, 4 islands), *Katamtaman* (Normal, 5 islands) or *Mahirap* (Hard,
  6 islands, tougher and faster creatures). Win a voyage once to unlock Mahirap. Progress is saved
  on the device.
- **2-player co-op on one device:** each player takes half of the touch screen (on web, P1 uses
  WASD and P2 the arrow keys). Heroes attack on their own in co-op. A fallen hero can be lifted
  back up by standing beside them; the run ends when both fall. Online play is planned in
  [`docs/ONLINE_MULTIPLAYER.md`](docs/ONLINE_MULTIPLAYER.md).
- **Antas (levels):** every banished creature gives XP to the whole party. Each level adds health,
  damage and a little speed (up to level 15).
- **Yungib (caves):** at least one island per voyage opens a cave once it is cleared. Three dark
  rooms lit only around the heroes, then a giant bungisngis guarding a big chest (a weapon and two
  whetstones). Climb out and the island is waiting with its boat.
- **Islands, not rooms:** each stage is an island in the sea. You walk on land, shots fly over water.
  Clear the island, open its **kaban** (chest), visit its **dambana** (shrine), then board the
  **balangay** to sail on.
- **Chests and loot:** every safe island has a kaban with gold, fireflies, sometimes herbs, and either
  a **weapon** (any of the 13; walk over it to swap, and your old one stays on the ground) or a
  **hasaan** whetstone (+20% damage per level, up to +5, kept when you change weapons).
- **Blessings of the gods:** each dambana offers three of eight Tagalog deities (Apolaki, Mayari,
  Tala, Anitun Tabu, Dumakulem, Lakapati, Aman Sinaya, Lakan Bakod). Pick one; they stack for the run.
- **Two weapons per hero, picked on the select screen:** kampilan or kris (melee, both cut enemy shots),
  pana or bangkaw (bow, or a piercing thrown spear), agimat rod or lingganay (piercing spirit orbs, or a
  three-way fan of bell chimes), sumpit or barang (poison darts, or homing spirit beetles), panabas or
  baston (huge slow cleaves, or quick knockback sticks), buntot pagi or lantaka (a poisoned stingray-tail
  whip, or an exploding bronze cannon). The balaraw dagger is found only in chests.
- **Eight folklore creatures** besides the Bakunawa, each with its own trick: duwende, manananggal,
  tikbalang, kapre, the **tiyanak** (cries like a baby until you come close), the **sigbin** (unseen
  until it is near), the **santelmo** (fire that floats over water) and the **bungisngis** (a laughing
  giant whose slam sends out a ring of shots).
- **Dodge roll** for everyone; **skills charge with light** from fighting and catching fireflies.
- **Health beads and amulets:** amulets (anting-anting) absorb hits and recharge.

| Hero | From | Weapons | Skill |
|---|---|---|---|
| **Kidlat** | Mactan, maharlika warrior | Kampilan / Kris | Bagyo: blade whirl that clears shots |
| **Liksi** | Butuan, navigator | Pana / Bangkaw | Ulan ng Pana: arrow storm |
| **Mayumi** | Panay, babaylan | Agimat rod / Lingganay | Anito Ring: spirit orbs |
| **Amihan** | Siquijor, mananambal | Sumpit / Barang | Tambal: heal and restore amulets |
| **Banog** | Bukidnon, bagani warrior | Panabas / Baston | Kalasag: shield up, untouchable, shots bounce back |
| **Dalisay** | Sulu, pearl diver | Buntot Pagi / Lantaka | Daluyong: tidal surge that hurls foes back |

Every guardian is fully animated: idle breathing, a 4-step walk, a two-beat attack, a 4-frame
dodge roll and a hurt recoil. Effects include footstep dust, hit sparks, a puff of smoke for each
banished creature, lantaka blasts, healing crosses, chest and whetstone glints, the kalasag ring and
the daluyong wave.

![Animation sheet](assets/brand/animation_sheet.png)

The home screen menu is in Filipino with the English beside each item (Laro · Play, Simula · Prologue,
Alamat · Legends, Paano Maglaro · How to Play) and a one-line hint on every option and a How to Play guide covering the controls and the goal of a run.
A loading screen (the Bakunawa coiled around the last moon) shows a folklore tip in Filipino and
English at start-up and each time you set sail.

Route: Port of Tondo → Punso Fields → **Siquijor or the Sulu Sea** → **Mount Banahaw or the Ifugao
Terraces** → Ibalong Forests → Shore of Albay (the Bakunawa). Each run picks one island per leg, and
each island has two maps. Illustrated prologue and ending, a dialogue before the boss, an epilogue per hero,
and the **Alamat** (Legends) codex (Maharlika · Nilalang · Mga Diyos · Daigdig: heroes, creatures, gods, world) with sources.

## Controls

| Touch | Action |
|---|---|
| Left half | Floating joystick |
| Crossed blades (big diamond) | Hold to attack (auto-aims) |
| Wind (small diamond) | Dodge roll |
| Sun | Skill, when your light is full |
| Cards at a dambana | Choose a blessing |

Web build: `WASD` move, `Space` attack, `Shift` dodge, `K` skill, `1-3` choose a blessing, `Esc` pause.
Co-op P2: arrow keys move, `Enter` attack, `/` dodge, `.` skill.
On the home screen, `Enter` plays and `H` opens How to Play.

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

- six heroes in five poses (idle, walk, attack, roll, hurt), eight creatures, the Bakunawa, Haliya,
  13 weapons, shots, the kaban chest and hasaan whetstone; effects (slash, dust, hit, boom, poof,
  sparkle, heal, shield and wave rings); `assets/brand/animation_sheet.png`
- three cave maps (rock walls, stalagmites, glowing crystals, underground pools), the cave mouth,
  the steps, and the darkness that surrounds the heroes underground
- island maps (sea, surf, sand, themed ground and props such as punso, banana, balete, rocks,
  bronze lamp posts, coral, stilt houses, rice and bulul, terrace walls) for six island themes, with
  collision grids in `src/game/rooms.json`
- balangay, dambana, agung; HUD medallion, bead pips, eight deity emblems, touch controls
- title (Mayon, the eclipse, the Bakunawa and the fleet), select, defeat, dawn screens; logo
  and Baybayin logo; loading screen; 8 story panels; 8 dialogue portraits; brand sheet; the app icon
  (a red crescent moon, the Bakunawa's coil and a kampilan) with Android adaptive and monochrome layers

## Project layout

```
App.tsx                    screen flow: loading → title → story → select → game → ending → result; codex
src/game/data.ts           heroes, weapons, creatures, the gods' blessings
src/game/story.ts          all story text, bios with sources, island names in Baybayin
src/game/engine.ts         simulation: islands, melee and ranged combat, dodge, light, blessings, AI
src/screens/               Loading, Title, Story, Codex, Select (mode, players, difficulty), Game, Result
src/save.ts                saved progress: wins, Mahirap unlock, endless record
src/ui.tsx                 palette, pixel and Baybayin text, buttons, panels
tools/generate_assets.py   all art
docs/STORY.md              story bible and sources
docs/ONLINE_MULTIPLAYER.md plan for online co-op
```
