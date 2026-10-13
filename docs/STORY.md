# Bantay: Story Bible

## Premise

**Barrio Hiraya** sits where the rice fields meet the sea, a village of nipa huts on stilts,
coconut palms, paddies and outrigger *bangka*. Its people fish by day, farm by dusk and sleep
under a single moon.

The elders say **Bathala** once hung seven moons in the sky. The **Bakunawa**, a sea serpent as
long as the coast, rose and swallowed six. The people saved the last one by beating the great
bronze **agung** (gong) until the deafened serpent spat it out. Since then the agung has hung on
the shore and the serpent has slept.

Every **thirty-three years** comes the **Night of the Red Tide**: the sea turns red, the moon
dims, and the creatures of the night grow bold. The agung must sing again before dawn.

**Tonight, lightning has split the agung.** Its voice is gone, the creatures are waking, and
four guardians (*bantay*) must cross the barrio's four puroks (village zones), reach the shore,
drive the Bakunawa back, and make the cracked agung sing.

## Timeline

| When | What happened |
|---|---|
| Long ago | Bathala hangs seven moons. The Bakunawa swallows six. The agung saves the seventh. |
| 33 years ago | The last Red Tide. Young **Dalisay** holds the bamboo fence alone until dawn; a 19-year-old **Amihan** runs out to bind his wounds. |
| Last monsoon | **Ina Hilaya**, the old babaylan, dies. **Mayumi** inherits her beads and rod. |
| One month ago | Mayumi begins dreaming of a sad voice under the sea, counting moons. |
| Tonight | A storm cracks the agung. The sea turns red. Apo Dalisay calls the watch. |

## Structure of a run

| Act | Place | Beat | Creatures |
|---|---|---|---|
| Prologue | Story panels | The legend, the cracked agung, the four are called | none |
| 0 | **The Plaza** | Apo Dalisay gives advice beside the spirit gate | none |
| 1 | **Purok 1 · Anthill Field** | "Tabi-tabi po." The duwende are angry | duwende, manananggal |
| 2 | **Purok 2 · Banana Grove** | Something left its lower half among the leaves | manananggal, duwende |
| 3 | **Purok 3 · The Crossroads** | Shirts inside out; the tikbalang lead travelers astray | tikbalang, duwende, manananggal |
| 4 | **Purok 4 · Balete Grove** | Cigar smoke; the kapre are awake | kapre, tikbalang, manananggal, duwende |
| Finale | **The Shore · Red Tide** | Face-off dialogue, then the Bakunawa | Bakunawa (summons manananggal) |
| Ending | Story panels | The serpent sinks; the agung sings; dawn; guardian epilogue | none |

Defeat ends on the swallowed-moon screen, with a line of encouragement from Apo Dalisay.

## The guardians

### Kidlat Dalisay, the Barrio Watchman (19)
Grandson of Apo Dalisay. Grew up on the story of the last Red Tide and can tell it better than
the old man. For six years he has walked the fence line with a sumpit, finding only stray dogs.
Brave, impatient, too loud; afraid of being only the grandson of a legend.
*Skill: Lightning Rush.* **Face-off:** "My lolo turned you back once. Tonight it is my turn."
**Epilogue:** He strikes the agung his grandfather once struck; Apo hands him the old sulo.

### Liksi, the Rice-Field Scout (16)
Message runner of the puroks, the fastest in Hiraya, the only one the carabao follow. At seven
a tikbalang led her in circles for three days; the barrio held her wake; she walked home
laughing with a braid of its mane, and has never said what happened. Cheeky and fearless.
*Skill: Hop.* **Face-off:** "Big talk for a fish. Catch me if you can."
**Epilogue:** She runs every dike shouting the moon is safe, and a horse-headed shadow runs beside her.

### Mayumi, the Babaylan (24)
Apprentice of the late Ina Hilaya, who left her the beads, the balete-root agimat rod and a
sampaguita that never wilts, but not the old woman's certainty. She dreams of the serpent and
understands it, and is afraid of what that means.
*Skill: Anito Ring.* **Face-off:** "I hear you in my dreams, old one. You are not hungry. You are lonely."
**Epilogue:** She sings to the sea until morning. The Bakunawa loved the moons; it did not want to be alone.

### Amihan Salazar, the Herbalist (52)
Manghihilot (healer of hands and herbs) and widow of a fisherman who never came home. She was
the girl who bound young Dalisay's wounds at the last Red Tide. Dry, practical and fierce; she
joins because healers belong where the wounds are.
*Skill: Hilot.* **Face-off:** "I have mended worse than you. Come, let us see how you heal."
**Epilogue:** Three bones set, salabat for everyone, and her first sleep through dawn in 33 years.

### Apo Dalisay, Hero of the Last Red Tide (71), mentor
Held the fence alone 33 years ago. Walks with a cane; his red putong has faded to pink. Tells
the story too often, and is terrified his grandson will try to live up to it.
*"Light first, then courage. In that order, apo."*

## The creatures

| Creature | Folklore | In the game |
|---|---|---|
| **Duwende** | Little folk of anthills; say "tabi-tabi po" or be cursed | Hops straight at you |
| **Manananggal** | Splits at the waist, flies on leathery wings; salt the half left behind | Fast, erratic flyer |
| **Tikbalang** | Horse-headed trickster of crossroads; foiled by inside-out shirts | Keeps distance, throws embers |
| **Kapre** | Cigar-smoking giant of the balete tree | Slow, three-way spread |
| **Bakunawa** | Moon-eating sea serpent; driven off by noise | Boss: moon-shard rings, aimed fans, summons; enrages at half health |

## Themes

- **Inheritance.** Every guardian carries something handed down: a sumpit, a rod, a story, a scar.
- **Light first, then courage.** The game's resource is literally light (fireflies, lamps, the moon).
- **The monster's side.** The Bakunawa is not simply evil. It loved the moons, and the ending lets Mayumi say so.
- **Community.** The agung is struck by everyone together; the dawn panel puts the whole barrio on the beach.

## Where it lives in the code

- `src/game/story.ts`: every line of text (panels, bios, stage names, Apo lines, boss dialogue, epilogues).
- `src/screens/StoryScreen.tsx`: intro and ending cutscenes.
- `src/screens/CodexScreen.tsx`: the in-game **Kwento** codex.
- `tools/generate_assets.py`: story panel art, portraits, Apo Dalisay, the agung.
