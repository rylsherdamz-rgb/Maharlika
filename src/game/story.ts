import type { ImgKey } from '../assets';
import type { EnemyType, HeroId } from './data';

/*
 * MAHARLIKA: story text.
 *
 * Alternate history: Lapulapu's victory at Mactan (27 April 1521) is the end of
 * it. No conqueror follows. Five centuries later the islands are Maharlika, a
 * free league of rajahnates, sultanates and barangays bound by the sea.
 *
 * The myths are real and kept close to their sources (see docs/STORY.md):
 * the Bakunawa and the seven moons (Visayan), Haliya the masked moon goddess
 * who fights the Bakunawa (Bicolano), the Tagalog deities who grant blessings,
 * and the creature lore of duwende, manananggal, tikbalang and kapre.
 * What is invented: the four heroes, Haliya calling them, and the route of
 * the journey that ties the myths together.
 */

export interface StoryPanel {
  art: ImgKey;
  title?: string;
  text: string;
}

export const INTRO: StoryPanel[] = [
  {
    art: 'story_01_mactan',
    title: 'Mactan, 27 April 1521',
    text: 'In the shallows of Mactan, Lapulapu and his warriors met the foreign ships and turned them back. Their captain, Magellan, fell in the surf. In our history, others came after. In this one, no one ever did.',
  },
  {
    art: 'story_02_maharlika',
    title: 'Maharlika',
    text: 'Five hundred years on, the islands are Maharlika: a free league of rajahnates, sultanates and barangays. Baybayin is written on every sign in Tondo, the balangay still sail between the islands, and the babaylan still keep the old rites.',
  },
  {
    art: 'story_03_legend',
    title: 'The Seven Moons',
    text: 'The Visayan elders tell it this way: Bathala hung seven moons in the sky. The Bakunawa, a sea serpent with a mouth as wide as a lake, rose from the deep and swallowed them one by one, until only one was left.',
  },
  {
    art: 'story_04_haliya',
    title: 'Haliya',
    text: 'In Bicol they tell of Haliya, the masked goddess of moonlight, sworn enemy of the Bakunawa and guardian of Bulan, the moon. Whenever the serpent rises, the people bang their gongs and pots so the noise drives it back, and Haliya fights beside them.',
  },
  {
    art: 'story_05_eclipse',
    title: 'The Moon Bleeds',
    text: 'Tonight the moon is turning red: the Bakunawa is rising for the last one. The creatures of the night have come out with it, duwende from their punso, manananggal from the groves, tikbalang from the mountains, kapre from the balete trees, and they are keeping the people from gathering on the shore.',
  },
  {
    art: 'story_06_call',
    title: 'Four Maharlika',
    text: 'On the docks of Tondo, Haliya calls four warriors. Sail the islands, clear the way, and reach the shore of Albay beneath Mayon. Hold back the serpent while the people make their noise, before the last moon is gone.',
  },
];

export const ENDING: StoryPanel[] = [
  {
    art: 'story_07_noise',
    title: 'The Noise',
    text: 'With the creatures driven off, the people pour onto the shore of Albay. Gongs, pots, drums and voices: the whole coast roars. Deafened and wounded, the Bakunawa opens its jaws and lets the moon go.',
  },
  {
    art: 'story_08_dawn',
    title: 'Dawn over Mayon',
    text: 'The moon climbs back into the sky, whole. By dawn the balangay are sailing home past Mayon, and Haliya, they say, has gone back to the moon to keep watch.',
  },
];

export const EPILOGUE: Record<HeroId, string> = {
  kidlat:
    'Kidlat cleaned his kampilan in the surf of Albay as his ancestors did at Mactan. He has decided the old songs need a new verse, and he intends to be in it.',
  liksi:
    'Liksi steered the lead balangay home by the stars, the way the old navigators of Butuan did, with a whole fleet following her lamp.',
  mayumi:
    'Mayumi stayed on the shore until morning, singing to the water. The old songs say the Bakunawa loved the moons. She thinks they are right, and that it is lonely down there.',
  amihan:
    'Amihan went home to Siquijor with her pouch empty and a hundred wounds mended. She slept for two days, and the island let her.',
};

export interface Bio {
  id: string;
  name: string;
  epithet: string;
  sprite: ImgKey;
  portrait?: ImgKey;
  facts: [string, string][];
  story: string[];
  quote?: string;
  source?: string;
}

export const GUARDIAN_BIOS: Record<HeroId, Bio> = {
  kidlat: {
    id: 'kidlat',
    name: 'Kidlat',
    epithet: 'Maharlika of Mactan',
    sprite: 'heroes_kidlat_0',
    portrait: 'portraits_kidlat',
    facts: [
      ['Age', '19'],
      ['Home', 'Mactan, off Sugbu'],
      ['Weapon', 'Kampilan'],
      ['Class', 'Maharlika, the warrior freemen'],
    ],
    story: [
      'In Maharlika, the warriors of Mactan still train in the shallows where Lapulapu stood. Kidlat is the youngest ever sworn to that line, and he wears the red putong, the headcloth that marks a proven warrior, a little earlier than the elders would like.',
      'His weapon is the kampilan, the long single-edged sword of the south. In the hands of a careful fighter it can cut an arrow out of the air. Kidlat is not a careful fighter yet.',
      'He is brave, quick to laugh and quicker to charge. He has never faced anything that was not human.',
    ],
    quote: 'Mactan turned back the ships. We can turn back a fish.',
  },
  liksi: {
    id: 'liksi',
    name: 'Liksi',
    epithet: 'Navigator of Butuan',
    sprite: 'heroes_liksi_0',
    portrait: 'portraits_liksi',
    facts: [
      ['Age', '16'],
      ['Home', 'Butuan, on the Agusan river'],
      ['Weapon', 'Pana (bow)'],
      ['Known for', 'Never once getting lost'],
    ],
    story: [
      'Butuan was building plank boats, the balangay, more than a thousand years before Mactan, and its navigators still steer by stars, swells and birds. Liksi learned all three before she learned to read baybayin.',
      'She is the fastest archer in the river towns and the least patient sailor. She wears a salakot against sun and rain, and her shirt inside out on land at night, because everyone knows that is how you keep a tikbalang from leading you astray.',
    ],
    quote: 'Big talk for something that lives in a puddle. Catch me if you can.',
  },
  mayumi: {
    id: 'mayumi',
    name: 'Mayumi',
    epithet: 'Babaylan of Panay',
    sprite: 'heroes_mayumi_0',
    portrait: 'portraits_mayumi',
    facts: [
      ['Age', '24'],
      ['Home', 'Panay'],
      ['Weapon', 'Agimat rod'],
      ['Role', 'Babaylan, healer and spirit-medium'],
    ],
    story: [
      'The babaylan of the Visayas were healers, spirit-mediums and keepers of ritual, and in Maharlika they still sit on the councils. Mayumi was trained in Panay to speak with the anito, the spirits of ancestors and places.',
      'For a month she has dreamed of a vast voice under the sea, counting moons. The old songs say the Bakunawa did not swallow the moons out of hunger, but because it loved them. She has begun to believe it.',
    ],
    quote: 'I hear you in my dreams, old one. You are not hungry. You are lonely.',
  },
  amihan: {
    id: 'amihan',
    name: 'Amihan',
    epithet: 'Mananambal of Siquijor',
    sprite: 'heroes_amihan_0',
    portrait: 'portraits_amihan',
    facts: [
      ['Age', '52'],
      ['Home', 'Siquijor'],
      ['Weapon', 'Sumpit (blowgun)'],
      ['Role', 'Mananambal, folk healer'],
    ],
    story: [
      'Siquijor is the island the rest of the archipelago whispers about: home of the mananambal, the healers who brew their medicines in the forest. Amihan is one of them. She is named for the cool northeast wind.',
      'She has set more bones than anyone in the Visayas and she knows what every plant on her island does, which is why her blowgun darts are the ones nobody wants to be hit by.',
    ],
    quote: 'I have mended worse than you. Come, let us see how you heal.',
  },
};

export const HALIYA_BIO: Bio = {
  id: 'haliya',
  name: 'Haliya',
  epithet: 'Masked goddess of moonlight',
  sprite: 'npc_haliya_0',
  portrait: 'portraits_haliya',
  facts: [
    ['From', 'Bicolano mythology'],
    ['Guards', 'Bulan, the moon'],
    ['Enemy', 'The Bakunawa'],
  ],
  story: [
    'In the mythology of Bicol, Haliya is the masked goddess of the moonlight and the sworn enemy of the Bakunawa. She guards Bulan, the moon, and the people honor her when the serpent threatens it.',
    'In this story she cannot drive the serpent back alone. She needs the people on the shore, and someone to clear their way.',
  ],
  quote: 'Make them loud, maharlika. The sea has never liked noise.',
  source: 'Bicolano mythology',
};

export const CREATURE_BIOS: Record<EnemyType, Bio> = {
  duwende: {
    id: 'duwende',
    name: 'Duwende',
    epithet: 'Dwellers of the punso',
    sprite: 'enemies_duwende_0',
    facts: [['Found', 'Punso Fields'], ['Behavior', 'Hops straight at you']],
    story: [
      'Small beings said to live in punso (anthills and earth mounds), under houses and in old trees. Pass a punso and you say "tabi-tabi po," excuse me, so you do not disturb them. Those who do are said to fall ill.',
    ],
    source: 'Pan-Philippine folk belief',
  },
  manananggal: {
    id: 'manananggal',
    name: 'Manananggal',
    epithet: 'The one who separates',
    sprite: 'enemies_manananggal_0',
    facts: [['Found', 'Siquijor'], ['Weakness', 'Salt or ash on the half left behind']],
    story: [
      'By night she severs her upper body from her legs and flies on bat-like wings. If someone finds the lower half and sprinkles it with salt or ash, she cannot rejoin it before sunrise.',
    ],
    source: 'Visayan and Tagalog folklore',
  },
  tikbalang: {
    id: 'tikbalang',
    name: 'Tikbalang',
    epithet: 'Trickster of the mountains',
    sprite: 'enemies_tikbalang_0',
    facts: [['Found', 'Mount Banahaw'], ['Counter', 'Wear your shirt inside out']],
    story: [
      'A tall creature with the head of a horse that haunts forests and mountain trails and leads travelers astray. Wearing your shirt inside out breaks its trick. Whoever pulls the special golden hairs from its mane can tame it.',
    ],
    source: 'Tagalog folklore',
  },
  kapre: {
    id: 'kapre',
    name: 'Kapre',
    epithet: 'Giant of the balete',
    sprite: 'enemies_kapre_0',
    facts: [['Found', 'Ibalong forests'], ['Sign', 'Cigar smoke from an old tree']],
    story: [
      'A huge, hairy, dark giant who sits in big trees such as the balete, smoking an enormous cigar. Mostly a prankster who confuses travelers, but not one to anger.',
    ],
    source: 'Tagalog folklore',
  },
  bakunawa: {
    id: 'bakunawa',
    name: 'Bakunawa',
    epithet: 'Eater of moons',
    sprite: 'enemies_bakunawa_0',
    portrait: 'portraits_bakunawa',
    facts: [['Found', 'The sea off Albay'], ['Moons eaten', 'Six of seven']],
    story: [
      'A gigantic sea serpent believed to cause eclipses by swallowing the moon. In the Visayan telling, Bathala made seven moons and the Bakunawa swallowed six. People banged pots, pans and gongs to make it spit the moon back out.',
      'In Bicol, its great enemy is Haliya. Some versions say the serpent fell in love with the moons.',
    ],
    quote: 'Little warriors on the sand. The moon was mine before your kings had names.',
    source: 'Visayan and Bicolano mythology',
  },
};

export const WORLD_BIOS: Bio[] = [
  {
    id: 'maharlika',
    name: 'Maharlika',
    epithet: 'The islands that stayed free',
    sprite: 'deco_balangay_0',
    portrait: 'story_02_maharlika',
    facts: [['Founded', 'After Mactan, 1521 (this story)'], ['Script', 'Baybayin'], ['Capital port', 'Tondo']],
    story: [
      'In precolonial Tagalog society, the maharlika were the freeborn warrior class. Here the word names a whole country: a league of the polities that really existed in the 1500s (Tondo, Maynila, Sugbu, Butuan, Sulu, Maguindanao and more) that never fell to a colonizer.',
      'Its cities write in baybayin and trade by balangay as they always did. Its shrines still honor the anito and the old gods.',
    ],
  },
  {
    id: 'mactan',
    name: 'The Battle of Mactan',
    epithet: '27 April 1521, history',
    sprite: 'weapons_kampilan',
    portrait: 'story_01_mactan',
    facts: [['Where', 'Mactan, off Cebu'], ['Leader', 'Lapulapu']],
    story: [
      'A real battle: Lapulapu, a chieftain of Mactan, defeated the Spanish expedition of Ferdinand Magellan, who was killed in the fighting. In real history, Spain returned in 1565 and colonized the islands. Maharlika imagines that it never did.',
    ],
  },
  {
    id: 'balangay',
    name: 'The Balangay',
    epithet: 'Plank boats of Butuan',
    sprite: 'deco_balangay_0',
    portrait: 'story_06_call',
    facts: [['Oldest found', 'About 320 CE'], ['Where', 'Butuan, Agusan del Norte']],
    story: [
      'Wooden plank boats excavated in Butuan, among the oldest watercraft found in Southeast Asia. The word barangay, for a community, comes from the balangay: a boatload of families who settled together.',
    ],
  },
  {
    id: 'baybayin',
    name: 'Baybayin',
    epithet: 'The old script',
    sprite: 'ui_star',
    facts: [['Example', 'ᜋᜑᜇ᜔ᜎᜒᜃ  (Maharlika)']],
    story: [
      'A precolonial writing system of the Tagalog and neighboring peoples, written in syllables. In Maharlika it was never replaced, so it is still on every shop sign and in every school.',
    ],
  },
];

export const DEITY_SOURCE = 'Tagalog mythology';

export interface StageInfo {
  title: string;
  baybayin: string;
  line: string;
  pool: EnemyType[];
}

export const STAGES: StageInfo[] = [
  { title: 'PUNSO FIELDS', baybayin: 'ᜉᜓᜈ᜔ᜐᜓ', line: 'Tabi-tabi po. The duwende do not want to be stepped on tonight.', pool: ['duwende', 'duwende', 'duwende', 'manananggal'] },
  { title: 'SIQUIJOR', baybayin: 'ᜐᜒᜃᜒᜑᜓᜇ᜔', line: 'Salt and ash in every pocket. The manananggal fly here.', pool: ['manananggal', 'manananggal', 'duwende', 'duwende'] },
  { title: 'MOUNT BANAHAW', baybayin: 'ᜊᜈᜑᜏ᜔', line: 'Shirts inside out. The tikbalang are leading travelers astray.', pool: ['tikbalang', 'tikbalang', 'duwende', 'manananggal'] },
  { title: 'IBALONG FORESTS', baybayin: 'ᜁᜊᜎᜓᜅ᜔', line: 'Cigar smoke drifts from the old balete. The kapre are awake.', pool: ['kapre', 'kapre', 'tikbalang', 'manananggal', 'duwende'] },
];

export const PORT = { title: 'PORT OF TONDO', baybayin: 'ᜆᜓᜈ᜔ᜇᜓ', line: 'Haliya waits by the balangay.' };
export const SHORE = { title: 'SHORE OF ALBAY', baybayin: 'ᜀᜎ᜔ᜊᜌ᜔', line: 'Beneath Mayon, the sea is the color of blood.' };

export const HALIYA_LINES = [
  'The balangay will carry you to the first island, maharlika.',
  'Catch the alitaptap. Their light fills your lamp, and a full lamp wakes your power.',
  'When the shots fly thick, dodge. Your amulets take the first blows, then mend.',
  'At each dambana, one of the old gods will bless you. Choose well.',
];

export interface DialogueLine {
  speaker: string;
  portrait: ImgKey;
  text: string;
  side: 'left' | 'right';
}

export function bossDialogue(hero: HeroId): DialogueLine[] {
  const g = GUARDIAN_BIOS[hero];
  return [
    { speaker: 'BAKUNAWA', portrait: 'portraits_bakunawa', side: 'right', text: CREATURE_BIOS.bakunawa.quote! },
    { speaker: 'HALIYA', portrait: 'portraits_haliya', side: 'left', text: 'Not this moon, serpent. Not while I wear this mask.' },
    { speaker: g.name.toUpperCase(), portrait: g.portrait!, side: 'left', text: g.quote! },
  ];
}

export const DEFEAT_LINES = [
  'The moon has been swallowed before, and spat out. Rise, maharlika.',
  'The tide turns. So will you.',
  'Even Mactan was not won in one wave. Again.',
];
