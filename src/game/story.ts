import type { ImgKey } from '../assets';
import type { EnemyType, HeroId } from './data';

/*
 * BANTAY — story bible.
 *
 * Barrio Hiraya sits where the rice fields meet the sea. Long ago Bathala hung
 * seven moons in the sky and the Bakunawa, a sea serpent, swallowed six. The
 * people saved the last one by beating the great bronze agung until the serpent
 * spat it out. Every thirty-three years, on the Night of the Red Tide, the
 * serpent rises again and the agung must sing. Tonight a storm has cracked it.
 */

export interface StoryPanel {
  art: ImgKey;
  title?: string;
  text: string;
}

export const INTRO: StoryPanel[] = [
  {
    art: 'story_01_barrio',
    title: 'Barrio Hiraya',
    text: 'Barrio Hiraya sits where the rice fields meet the sea. Its people fish by day, farm by dusk, and sleep under a single moon.',
  },
  {
    art: 'story_02_legend',
    title: 'The Seven Moons',
    text: 'The elders say Bathala once hung seven moons in the sky. Then the Bakunawa, a serpent as long as the coast, rose from the deep and swallowed six of them.',
  },
  {
    art: 'story_03_agung',
    title: 'The Agung',
    text: 'The last moon was saved when the people beat the great bronze agung until the serpent, deafened, spat it out. Ever since, the agung has hung on the shore, and the serpent has slept.',
  },
  {
    art: 'story_04_redtide',
    title: 'The Red Tide',
    text: 'Every thirty-three years comes the Night of the Red Tide. Tonight lightning struck the agung and split it. Its voice is gone, and the sea has turned the color of blood.',
  },
  {
    art: 'story_05_waking',
    title: 'The Night Wakes',
    text: 'With the agung silent, the creatures of the night are waking: duwende in the anthill fields, manananggal in the banana groves, tikbalang at the crossroads, kapre in the balete trees.',
  },
  {
    art: 'story_06_apo',
    title: 'The Four Bantay',
    text: 'Apo Dalisay held the watch at the last Red Tide. He is too old to hold it again, so he has called four guardians. Cross the four puroks. Reach the shore. Make the agung sing before the moon is gone.',
  },
];

export const ENDING: StoryPanel[] = [
  {
    art: 'story_07_sinking',
    title: 'The Serpent Falls Back',
    text: 'Wounded and spilling moonlight, the Bakunawa sinks into the red water. But it has not let go of the sky. Only the agung can make it do that.',
  },
  {
    art: 'story_08_dawn',
    title: 'Dawn over Hiraya',
    text: 'The guardians strike the cracked agung together. Its broken voice rolls across the sea, the serpent lets go of the moon, and the tide turns blue again.',
  },
];

/** Shown on the dawn panel after the ending, one per guardian. */
export const EPILOGUE: Record<HeroId, string> = {
  kidlat:
    'Kidlat struck the agung his grandfather once struck. Apo Dalisay said nothing. He only handed Kidlat the old sulo and told him to keep it lit for the next one.',
  liksi:
    'Liksi ran every dike in the barrio before sunrise, shouting that the moon was safe. People at the crossroads swear a tall horse-headed shadow ran beside her, laughing.',
  mayumi:
    'Mayumi stayed on the shore until morning, singing to the water. She says the Bakunawa never wanted to destroy the moons. It loved them, and it did not want to be alone.',
  amihan:
    'Amihan set three broken bones, brewed salabat for the whole barrio, and then, for the first time in thirty-three years, slept straight through the dawn.',
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
}

export const GUARDIAN_BIOS: Record<HeroId, Bio> = {
  kidlat: {
    id: 'kidlat',
    name: 'Kidlat Dalisay',
    epithet: 'The Barrio Watchman',
    sprite: 'heroes_kidlat_0',
    portrait: 'portraits_kidlat',
    facts: [
      ['Age', '19'],
      ['From', 'Purok Dagat, by the boats'],
      ['Carries', "His grandfather's sumpit"],
      ['Fears', 'Being only the grandson of a legend'],
    ],
    story: [
      'Kidlat grew up on the story of the last Red Tide: how his grandfather, Apo Dalisay, held the bamboo fence alone until dawn. He has heard it so many times he can tell it better than the old man can.',
      'Every night for six years he has walked the fence line with a sumpit, hoping for a monster and finding only stray dogs. He ties the red putong the way his grandfather does and pretends not to care when the fishermen laugh.',
      'He is brave, impatient and a little too loud. Tonight is the first night the monsters are real.',
    ],
    quote: 'My lolo turned you back once. Tonight it is my turn.',
  },
  liksi: {
    id: 'liksi',
    name: 'Liksi',
    epithet: 'The Rice-Field Scout',
    sprite: 'heroes_liksi_0',
    portrait: 'portraits_liksi',
    facts: [
      ['Age', '16'],
      ['From', 'The paddies of Purok Palay'],
      ['Carries', 'A lantaka from the old watchtower'],
      ['Known for', 'Never once getting lost'],
    ],
    story: [
      'Liksi carries messages between the puroks, barefoot along the paddy dikes. She is the fastest runner in Hiraya and the only person the carabao will follow.',
      'When she was seven, a tikbalang led her in circles through the rice for three days. The barrio held a wake. On the fourth morning she walked home laughing, with a braid of coarse black mane in her hand. She has never told anyone what happened.',
      'She wears her shirt inside out at night, just in case, and she knows every shortcut between the fields and the sea.',
    ],
    quote: 'Big talk for a fish. Catch me if you can.',
  },
  mayumi: {
    id: 'mayumi',
    name: 'Mayumi',
    epithet: 'The Babaylan',
    sprite: 'heroes_mayumi_0',
    portrait: 'portraits_mayumi',
    facts: [
      ['Age', '24'],
      ['From', 'The hut under the great balete'],
      ['Carries', 'An agimat rod of balete root'],
      ['Speaks with', 'The anito, the spirits of place'],
    ],
    story: [
      'Mayumi was the apprentice of Ina Hilaya, the old babaylan, who died last monsoon. She inherited the beads, the rod and the sampaguita that never wilts, but not the old woman\'s certainty.',
      'For a month now she has dreamed of a voice under the sea, enormous and sad, counting moons. She has told no one, because she is afraid of what it means that she understands it.',
      'Her spirit orbs pierce through anything that walks at night. She would rather not have to use them.',
    ],
    quote: 'I hear you in my dreams, old one. You are not hungry. You are lonely.',
  },
  amihan: {
    id: 'amihan',
    name: 'Amihan Salazar',
    epithet: 'The Herbalist',
    sprite: 'heroes_amihan_0',
    portrait: 'portraits_amihan',
    facts: [
      ['Age', '52'],
      ['From', 'The house with the herb garden'],
      ['Carries', 'A tirador and a pouch of lagundi'],
      ['Named for', 'The cool northeast wind'],
    ],
    story: [
      'Amihan has set every broken bone in Hiraya and rubbed every sore back. She is a manghihilot, a healer of hands and herbs, and the widow of a fisherman who did not come home.',
      'She was nineteen at the last Red Tide. She remembers a young Dalisay bleeding on the fence and a girl who ran out with nothing but a cloth and a pot of hot water. She was that girl.',
      'She joins the watch because healers belong where the wounds are, and because somebody has to keep these children alive.',
    ],
    quote: 'I have mended worse than you. Come, let us see how you heal.',
  },
};

export const APO_BIO: Bio = {
  id: 'apo',
  name: 'Apo Dalisay',
  epithet: 'Hero of the Last Red Tide',
  sprite: 'npc_apo_0',
  portrait: 'portraits_apo',
  facts: [
    ['Age', '71'],
    ['Role', 'Elder of the watch'],
    ['Carries', 'A cane and the oldest sulo in Hiraya'],
  ],
  story: [
    'Thirty-three years ago, Dalisay held the bamboo fence alone until dawn while the barrio beat the agung. He walks with a cane now and his putong has faded to pink.',
    'He tells the story too often and too loudly, and he is terrified that his grandson will try to live up to it.',
  ],
  quote: 'Light first, then courage. In that order, apo.',
};

export const CREATURE_BIOS: Record<EnemyType, Bio> = {
  duwende: {
    id: 'duwende',
    name: 'Duwende',
    epithet: 'Anthill dwellers',
    sprite: 'enemies_duwende_0',
    facts: [['Found', 'Anthill Field'], ['Behavior', 'Hops straight at you']],
    story: [
      'Little old folk who live inside anthills and under houses. Say "tabi-tabi po" (excuse me) when you pass, and they leave you alone. Step on their homes and they curse you with boils.',
      'The Red Tide sours their tempers. Tonight they want everyone off their lawn.',
    ],
  },
  manananggal: {
    id: 'manananggal',
    name: 'Manananggal',
    epithet: 'The self-segmenter',
    sprite: 'enemies_manananggal_0',
    facts: [['Found', 'Banana Grove'], ['Weakness', 'Salt on the half left behind']],
    story: [
      'By day, a quiet neighbor. By night, she splits at the waist, leaves her legs hidden among the banana leaves, and flies on leathery wings.',
      'Fast and erratic. The guardians have no time to look for the other half tonight.',
    ],
  },
  tikbalang: {
    id: 'tikbalang',
    name: 'Tikbalang',
    epithet: 'Trickster of the crossroads',
    sprite: 'enemies_tikbalang_0',
    facts: [['Found', 'The Crossroads'], ['Behavior', 'Keeps its distance, throws embers']],
    story: [
      'Horse-headed and long-limbed, the tikbalang leads travelers in circles until they drop. Wear your shirt inside out and it cannot fool you.',
      'Whoever pulls the three golden hairs from its mane can tame it. Nobody has, as far as anyone admits.',
    ],
  },
  kapre: {
    id: 'kapre',
    name: 'Kapre',
    epithet: 'Giant of the balete',
    sprite: 'enemies_kapre_0',
    facts: [['Found', 'Balete Grove'], ['Behavior', 'Slow, fires a three-way spread']],
    story: [
      'Huge, hairy and patient, the kapre sits in old balete trees smoking cigars as long as your arm. Usually it only plays pranks.',
      'The Red Tide wakes it from its smoke-dreams in a very bad mood.',
    ],
  },
  bakunawa: {
    id: 'bakunawa',
    name: 'Bakunawa',
    epithet: 'Eater of moons',
    sprite: 'enemies_bakunawa_0',
    portrait: 'portraits_bakunawa',
    facts: [['Found', 'The Shore'], ['Moons eaten', 'Six of seven']],
    story: [
      'A sea serpent as long as the coast, with a mouth the size of a lake. It swallowed six of Bathala\'s seven moons, and every thirty-three years it comes back for the last.',
      'Only the voice of the agung makes it let go. The old songs say it fell in love with the moons. Nobody asked it.',
    ],
    quote: 'Small fires. The moon was mine before your people had names.',
  },
};

export const WORLD_BIOS: Bio[] = [
  {
    id: 'hiraya',
    name: 'Barrio Hiraya',
    epithet: 'Where the fields meet the sea',
    sprite: 'npc_apo_0',
    portrait: 'story_01_barrio',
    facts: [['Puroks', 'Five, counting the shore'], ['Known for', 'Rice, fish and stubbornness']],
    story: [
      'A barrio of nipa huts on stilts, rice paddies, coconut palms and outrigger bangka. Its name means a dream, or a wish that comes true.',
    ],
  },
  {
    id: 'agung',
    name: 'The Agung',
    epithet: 'The bronze voice of the shore',
    sprite: 'deco_agung',
    portrait: 'story_03_agung',
    facts: [['Condition', 'Cracked by lightning'], ['Rung', 'Once every 33 years']],
    story: [
      'A bronze gong as wide as a bangka, hung in a frame of bamboo on the shore. Its sound is the only thing the Bakunawa fears. Tonight it is split from rim to boss.',
    ],
  },
  {
    id: 'redtide',
    name: 'The Red Tide',
    epithet: 'The night the serpent rises',
    sprite: 'ui_moon',
    portrait: 'story_04_redtide',
    facts: [['Comes', 'Every thirty-three years'], ['Last', 'When Apo Dalisay was 38']],
    story: [
      'The sea turns red, the moon dims, and the creatures of the night grow bold. Every child in Hiraya is taught to count the years.',
    ],
  },
];

export interface StageInfo {
  title: string;
  line: string;
  pool: EnemyType[];
}

/** Puroks in order. The route is always fields → grove → crossroads → balete, then the shore. */
export const STAGES: StageInfo[] = [
  { title: 'PUROK 1 · ANTHILL FIELD', line: 'Tabi-tabi po. The duwende do not want to be stepped on tonight.', pool: ['duwende', 'duwende', 'duwende', 'manananggal'] },
  { title: 'PUROK 2 · BANANA GROVE', line: 'Something has left its lower half among the banana leaves.', pool: ['manananggal', 'manananggal', 'duwende', 'duwende'] },
  { title: 'PUROK 3 · THE CROSSROADS', line: 'Shirts inside out. The tikbalang are leading travelers astray.', pool: ['tikbalang', 'tikbalang', 'duwende', 'manananggal'] },
  { title: 'PUROK 4 · BALETE GROVE', line: 'Cigar smoke drifts from the old balete. The kapre are awake.', pool: ['kapre', 'kapre', 'tikbalang', 'manananggal', 'duwende'] },
];

export const PLAZA = {
  title: 'THE PLAZA',
  line: 'Apo Dalisay waits by the spirit gate.',
};
export const SHORE = {
  title: 'THE SHORE · RED TIDE',
  line: 'The agung hangs silent. The sea is the color of blood.',
};

export const APO_LINES = [
  'The spirit gate will take you to the first purok, apo.',
  'Light first, then courage. Catch the alitaptap; they keep your weapons fed.',
  'Your anting-anting will take the first blows. Give it a moment and it mends.',
  'Thirty-three years ago I held that fence alone. You are four. Go!',
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
    { speaker: 'BAKUNAWA', portrait: 'portraits_bakunawa', side: 'right', text: 'Small fires on the sand. Step aside. The moon was mine before your people had names.' },
    { speaker: g.name.split(' ')[0].toUpperCase(), portrait: g.portrait!, side: 'left', text: g.quote! },
    { speaker: 'BAKUNAWA', portrait: 'portraits_bakunawa', side: 'right', text: 'Then burn, little lights, until the dark swallows you too.' },
  ];
}

export const DEFEAT_LINES = [
  'The moon was swallowed once before, and spat out. Get up, bantay.',
  'Rest your bones. The tide turns again, and so will you.',
  'Even I fell, my first night. Try again, apo.',
];
