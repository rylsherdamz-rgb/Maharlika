import type { ImgKey } from '../assets';
import type { HeroId } from './data';
import type { DialogueLine } from './story';

/**
 * Story told during a run: the people on each island, how each hero talks, what Haliya
 * remembers of earlier runs, and the title cards that announce a boss.
 *
 * The locals and their worries are written for the game; what they say about creatures follows
 * the folklore in story.ts.
 */

export interface Local {
  id: string; // sprite npc_<id>_0/1 and portrait portraits_<id>
  name: string;
  role: string;
  /** What they say as the party lands. */
  arrive: string[];
  /** What they say once the island is safe. */
  after: string;
}

/** One local per island theme. */
export const LOCALS: Record<string, Local> = {
  pulo1: {
    id: 'tonyo',
    name: 'MANG TONYO',
    role: 'Farmer of the punso fields',
    arrive: [
      'Careful where you step! The duwende are angry tonight. Someone kicked over a punso at the edge of my field, and nobody said "tabi-tabi po."',
      'They are small, but they come in crowds. And I saw fires floating over the rice. Those are no fireflies.',
    ],
    after: 'Salamat. I will leave rice by the punso tonight, as an apology.',
  },
  bohol: {
    id: 'pilar',
    name: 'ALING PILAR',
    role: 'Vendor of Carmen, Bohol',
    arrive: [
      'You came by boat? Then you did not see it. Something walks between the hills, backward, with its head between its legs.',
      'The sigbin. You will not see it until it is close. Keep your back to a hill and your eyes open.',
    ],
    after: 'The hills look like chocolate again, not like teeth. Ingat sa biyahe.',
  },
  pulo2: {
    id: 'sela',
    name: 'LOLA SELA',
    role: 'Old mananambal of Siquijor',
    arrive: [
      'I smelled you coming, child. Salt and seawater. Good. Keep the salt in your pocket tonight.',
      'The manananggal are hunting, and they have left their legs in the cogon. If you find them, salt them. They will not fly home.',
    ],
    after: 'Take this blessing of an old woman: may your wounds close before you notice them.',
  },
  sulu: {
    id: 'amil',
    name: 'DATU AMIL',
    role: 'Elder of the stilt village',
    arrive: [
      'Welcome to the Sulu Sea, maharlika. My people have not fished for three nights. The water is full of drifting fire.',
      'The santelmo burn over the reef and lead boats onto the coral. Clear them, and the village will remember your name.',
    ],
    after: 'The lamps on the water are ours again. Our boats will sail with yours to Albay.',
  },
  pulo3: {
    id: 'berto',
    name: 'KA BERTO',
    role: 'Guide on Mount Banahaw',
    arrive: [
      'Turn your shirt inside out before you take another step. I mean it. The tikbalang have been leading pilgrims in circles for days.',
      'And listen for laughing. If you hear a giant laugh up the trail, that is the bungisngis. Do not stand still when it laughs.',
    ],
    after: 'The trail goes where it should again. I will tell the pilgrims they can climb.',
  },
  ifugao: {
    id: 'dulnuan',
    name: 'APO DULNUAN',
    role: 'Elder of the rice terraces',
    arrive: [
      'Our ancestors carved these terraces by hand, and the bulul have guarded the rice ever since. Tonight even the bulul are afraid.',
      'Things walk the terrace walls and trample the young rice. Drive them off, and we will offer the first harvest in your name.',
    ],
    after: 'The bulul look less worried. So do I.',
  },
  taal: {
    id: 'celso',
    name: 'MANG CELSO',
    role: 'Fisherman of Taal Lake',
    arrive: [
      'The volcano is coughing ash and the lake smells of sulfur. My nets come up empty.',
      'Fires float out over the water every night, and something huge laughs inside the crater. Be careful near the vents.',
    ],
    after: 'Maybe the fish will come back now. The volcano never really sleeps, but tonight it rests.',
  },
  palawan: {
    id: 'tala',
    name: 'TALA',
    role: 'Tagbanua girl of the lagoon',
    arrive: [
      'You found the lagoon! Hardly anyone does. The forest here is older than any village.',
      'But the kapre in the old trees are restless, and I hear a baby crying where there are no houses. Do not go to the crying.',
    ],
    after: 'The forest is quiet again, the good kind of quiet. Thank you for listening to it.',
  },
  pulo4: {
    id: 'esteban',
    name: 'LAKAY ESTEBAN',
    role: 'Woodcutter of Ibalong',
    arrive: [
      'Ibalong. Even the old epics call this forest dangerous. I have cut wood here for sixty years and never seen it like this.',
      'Cigar smoke from every balete. A baby crying in the dark. Beyond these trees is the shore of Albay, and the serpent.',
    ],
    after: 'Go on, then. The whole of Albay is gathering its gongs for you.',
  },
};

/** The tindera who sets up her stall on some cleared islands. */
export const TINDERA = {
  id: 'nena',
  name: 'ALING NENA',
  greet: ['Bili na, bili na! Herbs, whetstones, charms. I sail wherever the fighting is; it is good for business.', 'Walk up to what you want. If your barya is enough, it is yours.'],
  short: 'Kulang ang barya! Come back with more coins.',
};

/** How each hero talks: a reply when landing, and a word before a boss. */
export const VOICE: Record<HeroId, { arrive: string[]; boss: string; shop: string }> = {
  kidlat: {
    arrive: ['Then point me at them. I did not sail all this way to stand on the beach.', 'Leave it to me. The kampilan is hungry tonight.', 'Mactan turned back an armada. A few creatures are nothing.'],
    boss: 'Big one. Good. Bigger ones fall harder.',
    shop: 'Do you have anything sharper?',
  },
  liksi: {
    arrive: ['I read the wind on the way in. We have until the moon is overhead.', 'Stay behind me and keep low. I can see them from here.', 'Every island has its own currents. This one feels wrong.'],
    boss: 'I have its range. Keep moving and I will keep shooting.',
    shop: 'Arrows first, souvenirs later.',
  },
  mayumi: {
    arrive: ['The anito here are frightened. I can hear them whispering.', 'I will speak to them gently first. If they will not listen, I will speak louder.', 'Something is pulling all the spirits of this island toward Albay.'],
    boss: 'You are far from home, old one. Let me send you back.',
    shop: 'Do you sell anything that the spirits like?',
  },
  amihan: {
    arrive: ['Hmm. I have treated worse than this. Mostly.', 'Bring me the wounded afterward. And do not step on the herbs.', 'Siquijor taught me which plants heal and which ones kill. Tonight I brought both.'],
    boss: 'Let us see what is wrong with you, big one. I have just the cure.',
    shop: 'Your herbs are wilted, Nena. I will take them anyway.',
  },
  banog: {
    arrive: ['The hills sent me. I will not turn back.', 'Stand behind the kalasag. It has held worse.', 'A bagani does not count the enemy. He counts the people behind him.'],
    boss: 'Come, then. My shield is waiting.',
    shop: 'Only what I need. The rest is for the village.',
  },
  dalisay: {
    arrive: ['Clear water, bad night. Let us fix one of those.', 'I can hold my breath for three minutes. That should be enough for this island.', 'The lantaka is loaded. Point and pray.'],
    boss: 'I have been deeper than you. You do not scare me.',
    shop: 'Pearls for whetstones? No? Barya, then.',
  },
};

const portraitOf = (h: HeroId) => `portraits_${h}` as ImgKey;
const nameOf = (h: HeroId) => h.toUpperCase();
const pickBy = <T,>(a: T[], seed: number) => a[Math.abs(seed) % a.length];

/** The landing scene on an island: the local speaks, and a hero answers. */
export function arrivalScene(theme: string, heroes: HeroId[], stage: number): DialogueLine[] {
  const local = LOCALS[theme];
  if (!local) return [];
  const speaker = heroes[stage % heroes.length];
  const lines: DialogueLine[] = local.arrive.map((text) => ({ speaker: local.name, portrait: `portraits_${local.id}` as ImgKey, side: 'right', text }));
  lines.push({ speaker: nameOf(speaker), portrait: portraitOf(speaker), side: 'left', text: pickBy(VOICE[speaker].arrive, stage) });
  return lines;
}

/** What the tindera and a hero say the first time her stall opens in a run. */
export function shopScene(hero: HeroId): DialogueLine[] {
  return [
    ...TINDERA.greet.map((text) => ({ speaker: TINDERA.name, portrait: 'portraits_nena' as ImgKey, side: 'right' as const, text })),
    { speaker: nameOf(hero), portrait: portraitOf(hero), side: 'left', text: VOICE[hero].shop },
  ];
}

/** A boss's title card, in the manner of the old games: name, then what it is. */
export const BOSS_CARDS: Record<string, { name: string; sub: string }> = {
  bakunawa: { name: 'BAKUNAWA', sub: 'Ang Kumakain ng Buwan · The Moon-Eater' },
  bungisngis: { name: 'BUNGISNGIS NG YUNGIB', sub: 'Ang Higanteng Tumatawa · The Laughing Giant' },
  tikbalang: { name: 'PUNONG TIKBALANG', sub: 'Pinuno ng mga Tikbalang · Chief of the Mountain' },
  kapre: { name: 'HARING KAPRE', sub: 'Hari ng Balete · King of the Old Trees' },
};

/** Haliya's last word after a won voyage: the first victory is not like the later ones. */
export function closingWord(wins: number, relics: number): { title: string; text: string } {
  if (wins <= 1)
    return {
      title: 'Ang Unang Liwanag · The First Light',
      text: 'Haliya takes off her mask for a moment, and the people on the shore see a tired, smiling face. "The serpent will rise again. It always does. But tonight the islands saw what a few free people can do." Then the mask is back, and she is gone into the moonlight.',
    };
  if (relics >= 4)
    return {
      title: 'Mga Mutya · The Charms',
      text: 'You have carried every mutya the old creatures guard. Haliya looks at them a long time. "Keep them close. One day the islands will need them all at once."',
    };
  return {
    title: 'Ang Bantay · The Watch',
    text: `Another moon returned: ${wins} now. In Albay they have started counting the eclipses by your voyages instead of by the years.`,
  };
}

// ---------------------------------------------------------------- Haliya remembers
/** What the game remembers of earlier runs, for Haliya's greeting. */
export interface Memory {
  runs: number;
  deaths: number;
  wins: number;
  lastReached: string | null; // where the last run ended, e.g. 'SIQUIJOR'
  lastVictory: boolean;
  heroesPlayed: HeroId[];
  relicsFound: number;
  cavesCleared: number;
  seen: string[]; // ids of one-time lines already heard
}

export const NEW_MEMORY: Memory = { runs: 0, deaths: 0, wins: 0, lastReached: null, lastVictory: false, heroesPlayed: [], relicsFound: 0, cavesCleared: 0, seen: [] };

interface Remark {
  id: string;
  when: (m: Memory, heroes: HeroId[], coop: boolean) => boolean;
  text: (m: Memory, heroes: HeroId[]) => string;
  once?: boolean;
}

const H = (h: HeroId) => h[0].toUpperCase() + h.slice(1);

/**
 * Haliya's opening words, most specific first. One-time remarks are spent once heard; the rest
 * are fallbacks. Only the first match is used, so each run opens with something new when it can.
 */
const REMARKS: Remark[] = [
  { id: 'first', once: true, when: (m) => m.runs === 0, text: () => 'So you are the ones the sea sent me. Listen well: six moons are gone, and the seventh is bleeding. Clear the islands, reach Albay, and hold the serpent while the people make their noise.' },
  { id: 'first_death', once: true, when: (m) => m.deaths === 1 && !m.lastVictory, text: (m) => `You fell at ${m.lastReached ?? 'sea'}. Do not be ashamed. The moon has been swallowed before and spat back out. So have I.` },
  { id: 'first_win', once: true, when: (m) => m.wins === 1, text: () => 'You came back. Even after the moon was saved. The serpent will rise again, it always does, and I am glad it will find you waiting.' },
  { id: 'coop', once: true, when: (m, _h, coop) => coop, text: (_m, h) => `Two of you this time, ${H(h[0])} and ${H(h[1])}. Good. The Bakunawa has never liked a crowd.` },
  { id: 'new_banog', once: true, when: (m, h) => m.runs > 0 && h.includes('banog') && !m.heroesPlayed.includes('banog'), text: () => 'A bagani from the Bukidnon hills. I watched your people hold the ridges for a hundred years, Banog. Hold this one for me.' },
  { id: 'new_dalisay', once: true, when: (m, h) => m.runs > 0 && h.includes('dalisay') && !m.heroesPlayed.includes('dalisay'), text: () => 'A diver of Sulu. You know the sea better than any of them, Dalisay. You know what lives under it, too.' },
  { id: 'new_hero', once: false, when: (m, h) => m.runs > 0 && !m.heroesPlayed.includes(h[0]), text: (_m, h) => `${H(h[0])}. I have not seen you on these docks before. The others spoke of you.` },
  { id: 'first_relic', once: true, when: (m) => m.relicsFound > 0, text: () => 'You carry a mutya. Treat it kindly. Whatever it belonged to is still looking for it.' },
  { id: 'first_cave', once: true, when: (m) => m.cavesCleared > 0, text: () => 'You went under an island and came back. Most do not. What is down there is older than the serpent.' },
  { id: 'many_deaths', once: true, when: (m) => m.deaths >= 5, text: (m) => `Five falls, and still you come back to these docks. That is the whole secret, maharlika. The serpent is patient. Be more patient.` },
  { id: 'veteran', once: true, when: (m) => m.wins >= 3, text: () => 'Three times you have given the moon back. The people of Albay sing about you now. Badly, but they sing.' },
  { id: 'died_shore', once: false, when: (m) => !m.lastVictory && m.lastReached === 'ALBAY', text: () => 'So close. The serpent was bleeding when you fell, I saw it. Once more.' },
  { id: 'died', once: false, when: (m) => m.deaths > 0 && !m.lastVictory && !!m.lastReached, text: (m) => `${m.lastReached} again? Remember what hurt you there, and dodge it this time.` },
  { id: 'won', once: false, when: (m) => m.lastVictory, text: () => 'The moon is still full from your last voyage. Let us keep it that way.' },
  { id: 'default', once: false, when: () => true, text: () => 'The balangay is ready. The moon is not getting any brighter, maharlika.' },
];

/** Haliya's greeting at the docks, and the id of the remark she used (to mark it heard). */
export function haliyaGreeting(m: Memory, heroes: HeroId[]): { lines: DialogueLine[]; remark: string } {
  const coop = heroes.length > 1;
  const r = REMARKS.find((x) => (!x.once || !m.seen.includes(x.id)) && x.when(m, heroes, coop))!;
  return {
    remark: r.id,
    lines: [
      { speaker: 'HALIYA', portrait: 'portraits_haliya', side: 'right', text: r.text(m, heroes) },
      { speaker: nameOf(heroes[0]), portrait: portraitOf(heroes[0]), side: 'left', text: pickBy(VOICE[heroes[0]].arrive, m.runs) },
    ],
  };
}
