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
 * and the creature lore of duwende, manananggal, tikbalang, kapre, tiyanak, sigbin,
 * santelmo and bungisngis.
 * What is invented: the six heroes, Haliya calling them, and the route of
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
    text: 'Tonight the moon is turning red: the Bakunawa is rising for the last one. The creatures of the night have come out with it, duwende from their punso, manananggal from the groves, tikbalang from the mountains, kapre from the balete trees, sigbin and tiyanak and the wandering santelmo, and they are keeping the people from gathering on the shore.',
  },
  {
    art: 'story_06_call',
    title: 'Six Maharlika',
    text: 'On the docks of Tondo, Haliya calls six warriors, from Mactan, Butuan, Panay, Siquijor, Bukidnon and Sulu. Sail the islands, clear the way, and reach the shore of Albay beneath Mayon. Hold back the serpent while the people make their noise, before the last moon is gone.',
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
  banog:
    'Banog walked back up into the Bukidnon hills with a dented kalasag and a new story for the elders. They let him tell it twice.',
  dalisay:
    'Dalisay dove the reef off Albay at sunrise and came up with a pearl the color of the returned moon. She says it is for Haliya. Nobody has seen her give it away yet.',
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
    sprite: 'heroes_kidlat_idle_0',
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
    sprite: 'heroes_liksi_idle_0',
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
    sprite: 'heroes_mayumi_idle_0',
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
    sprite: 'heroes_amihan_idle_0',
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
  banog: {
    id: 'banog',
    name: 'Banog',
    epithet: 'Bagani of Bukidnon',
    sprite: 'heroes_banog_idle_0',
    portrait: 'portraits_banog',
    facts: [
      ['Age', '27'],
      ['Home', 'Bukidnon, Mindanao'],
      ['Weapons', 'Panabas or baston'],
      ['Role', 'Bagani, highland warrior'],
    ],
    story: [
      'Among the Manobo and other highland peoples of Mindanao, a bagani was a warrior who had proven himself in defense of the community, and wore a red headcloth to show it. Banog earned his young. He is named for the hawk-eagle that circles the Bukidnon ridges.',
      'He is slow to speak and slower to retreat. When the shots fly, he raises his kalasag and walks forward through them.',
    ],
    quote: 'The hills sent me. The hills do not send people who turn back.',
  },
  dalisay: {
    id: 'dalisay',
    name: 'Dalisay',
    epithet: 'Pearl Diver of Sulu',
    sprite: 'heroes_dalisay_idle_0',
    portrait: 'portraits_dalisay',
    facts: [
      ['Age', '21'],
      ['Home', 'Jolo, Sulu'],
      ['Weapons', 'Buntot pagi or lantaka'],
      ['Role', 'Pearl diver and gunner'],
    ],
    story: [
      'Sulu was famous across Asia for its pearls, brought up by divers who could stay under for minutes on one breath. Dalisay is the best of her village, and when she is not diving she crews the lantaka, the bronze swivel guns of the Sulu boats.',
      'Her name means "pure." She says the sea taught her two things: hold your breath, and let the wave do the work.',
    ],
    quote: 'I have been deeper than you, serpent. It did not frighten me either.',
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
  tiyanak: {
    id: 'tiyanak',
    name: 'Tiyanak',
    epithet: 'The crying in the forest',
    sprite: 'enemies_tiyanak_baby',
    facts: [['Found', 'Ibalong forests'], ['Behavior', 'Cries until you come close, then lunges'], ['Tip', 'Hit it first to break the disguise']],
    story: [
      'A forest creature that takes the shape of a crying infant to lure travelers. Whoever picks the baby up sees it change into its true form, small and fanged, and attack.',
      'Travelers are told not to follow a baby crying deep in the woods. Some tellings say loud noise or turning your clothes inside out drives it away.',
    ],
    source: 'Tagalog folklore',
  },
  sigbin: {
    id: 'sigbin',
    name: 'Sigbin',
    epithet: 'The one that walks backward',
    sprite: 'enemies_sigbin_0',
    facts: [['Found', 'Siquijor'], ['Behavior', 'Unseen at a distance; bites, then backs off'], ['Tip', 'You can only aim at it up close']],
    story: [
      'A creature like a hornless goat or a dog with long ears, said to walk backward with its head hung low between its hind legs. It can make itself invisible and is said to drink blood from a person\'s shadow.',
      'Some families, called sigbinan, are said to keep one. It is part of the folklore of Bohol, Siquijor and the other Visayan islands.',
    ],
    source: 'Visayan folklore',
  },
  santelmo: {
    id: 'santelmo',
    name: 'Santelmo',
    epithet: 'The wandering fire',
    sprite: 'enemies_santelmo_0',
    facts: [['Found', 'Punso Fields, Mount Banahaw'], ['Behavior', 'Floats over water and walls; casts sparks in a cross']],
    story: [
      'A ball of fire seen at night drifting over fields, forests and the sea. It is often said to be the soul of someone who drowned or died far from home, and following it leads you astray.',
      'The name comes from San Telmo (Saint Elmo) through Spanish. In this history the islands were never colonized, but the game keeps the name people know today.',
    ],
    source: 'Pan-Philippine folklore; the name is Spanish in origin',
  },
  bungisngis: {
    id: 'bungisngis',
    name: 'Bungisngis',
    epithet: 'The laughing giant',
    sprite: 'enemies_bungisngis_0',
    facts: [['Found', 'Mount Banahaw'], ['Behavior', 'Slow; laughs, then slams out a ring of shots'], ['Tip', 'When it laughs, get out of the way']],
    story: [
      'A one-eyed giant of the forests, huge and very strong, whose upper lip is so big it can cover its face. Its name comes from the word for grinning or giggling, because it is always laughing.',
      'In the tales it is strong but slow-witted, and clever people get the better of it.',
    ],
    source: 'Tagalog and Visayan folklore',
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
    id: 'arms',
    name: 'Arms of the Islands',
    epithet: 'Thirteen weapons, two per maharlika and more in chests',
    sprite: 'weapons_kris',
    facts: [
      ['Kidlat', 'Kampilan or kris'],
      ['Liksi', 'Pana or bangkaw'],
      ['Mayumi', 'Agimat rod or lingganay'],
      ['Amihan', 'Sumpit or barang'],
      ['Banog', 'Panabas or baston'],
      ['Dalisay', 'Buntot pagi or lantaka'],
      ['In chests', 'Any of them, plus the balaraw'],
    ],
    story: [
      'The kris, the wavy-bladed sword of Mindanao, Sulu and the wider Malay world, and the bangkaw, a Visayan spear that could be thrown or thrust, are real weapons of the islands, as are the kampilan, the pana (bow) and the sumpit (blowgun).',
      'The panabas (a heavy chopping blade of Mindanao), the balaraw (dagger), the baston (rattan sticks of arnis, the national martial art), the buntot pagi (a whip made from a stingray tail) and the lantaka (bronze swivel cannon) are all real.',
      'Barang is Visayan folklore: sorcery said to send insects, often beetles, against a victim, and Siquijor is the island most associated with it. The lingganay, a bronze bell, is named after a real word for bell; a babaylan ringing it to scatter spirits is invented for this game, as is the agimat rod.',
    ],
    source: 'Philippine history and Visayan folklore; the bell and the rod are invented for the game',
  },
  {
    id: 'sulu',
    name: 'The Sulu Sea',
    epithet: 'Pearls, reefs and stilt villages',
    sprite: 'tiles_stilt',
    facts: [['Where', 'Between Mindanao, Palawan and Borneo'], ['Known for', 'Pearls, trade, the lantaka']],
    story: [
      'For centuries the Sulu Sea was a crossroads of trade between the islands, Borneo and China, and its pearls were famous. Many coastal families still live in houses on stilts over the shallows.',
      'The lantaka, a small bronze swivel cannon, was mounted on Sulu and other Moro boats. In this game it is Dalisay\'s weapon.',
    ],
    source: 'History',
  },
  {
    id: 'ifugao',
    name: 'Ifugao Rice Terraces',
    epithet: 'Stairways to the sky',
    sprite: 'tiles_bulul',
    facts: [['Where', 'Cordillera, northern Luzon'], ['Age', 'Hundreds of years at least'], ['Guardian', 'The bulul']],
    story: [
      'The Ifugao carved terraced rice fields into the mountains of the Cordillera, fed by forest water through channels and walls built by hand. They are a UNESCO World Heritage Site.',
      'The bulul are carved wooden figures, usually seated, that the Ifugao keep to guard and increase the rice harvest. They are part of a living tradition.',
    ],
    source: 'History and Ifugao tradition',
  },
  {
    id: 'taal',
    name: 'Taal Volcano',
    epithet: 'A volcano in a lake',
    sprite: 'tiles_lavarock',
    facts: [['Where', 'Batangas, Luzon'], ['Known for', 'An island volcano inside a lake, with a lake inside its crater']],
    story: [
      'Taal is one of the most active volcanoes in the Philippines: a volcano island sitting in Taal Lake, with its own crater lake. Its eruptions have reshaped the land around it many times.',
    ],
    source: 'Geography',
  },
  {
    id: 'bohol',
    name: 'The Chocolate Hills',
    epithet: 'Bohol',
    sprite: 'tiles_burol',
    facts: [['Where', 'Bohol, Visayas'], ['Count', 'More than 1,200 hills']],
    story: [
      'More than a thousand rounded limestone hills covered in grass, which turns brown in the dry season. A Boholano legend tells of two giants who fought for days, throwing rocks and sand, and left the hills behind.',
      'Bohol is also one of the islands where the sigbin is most talked about.',
    ],
    source: 'Geography; the giants are a Boholano legend',
  },
  {
    id: 'palawan',
    name: 'Palawan',
    epithet: 'Karst and lagoons',
    sprite: 'tiles_karst',
    facts: [['Where', 'Between the Sulu and South China Seas'], ['Known for', 'Limestone karst, lagoons, an underground river']],
    story: [
      'Sheer limestone cliffs and towers rise straight out of clear lagoons around El Nido and Coron. Puerto Princesa has an underground river that runs for kilometers under a karst mountain, a UNESCO World Heritage Site.',
    ],
    source: 'Geography',
  },
  {
    id: 'kaban',
    name: 'Kaban and Hasaan',
    epithet: 'Chests and whetstones',
    sprite: 'deco_chest_0',
    facts: [['Kaban', 'A chest: gold, herbs, a weapon or a whetstone'], ['Hasaan', 'Whetstone: +20% damage, up to +5']],
    story: [
      'Once an island is safe, a kaban (chest) appears on it. Walk into it to open it. It may hold any of the thirteen weapons of the islands: walk over one to take it up and leave your old one on the ground in case you change your mind.',
      'A hasaan (whetstone) sharpens whatever you carry, and the edge stays with you when you change weapons.',
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

/** Island themes, keyed by the room name without its _a/_b map suffix. */
export const STAGES: Record<string, StageInfo> = {
  pulo1: { title: 'PUNSO FIELDS', baybayin: 'ᜉᜓᜈ᜔ᜐᜓ', line: 'Tabi-tabi po. The duwende do not want to be stepped on tonight.', pool: ['duwende', 'duwende', 'duwende', 'manananggal', 'santelmo'] },
  pulo2: { title: 'SIQUIJOR', baybayin: 'ᜐᜒᜃᜒᜑᜓᜇ᜔', line: 'Salt and ash in every pocket. Something walks backward in the dark.', pool: ['manananggal', 'manananggal', 'sigbin', 'sigbin', 'duwende'] },
  sulu: { title: 'SULU SEA', baybayin: 'ᜐᜓᜎᜓ', line: 'Stilt houses over the reef. Fires drift on the water, and nobody is fishing.', pool: ['santelmo', 'santelmo', 'manananggal', 'sigbin', 'duwende'] },
  pulo3: { title: 'MOUNT BANAHAW', baybayin: 'ᜊᜈᜑᜏ᜔', line: 'Shirts inside out. Laughter echoes from the high trail.', pool: ['tikbalang', 'tikbalang', 'bungisngis', 'santelmo', 'duwende'] },
  ifugao: { title: 'IFUGAO TERRACES', baybayin: 'ᜁᜉᜓᜄᜏ᜔', line: 'The bulul guard the rice. Tonight something walks the terrace walls.', pool: ['tikbalang', 'bungisngis', 'duwende', 'duwende', 'tiyanak'] },
  bohol: { title: 'CHOCOLATE HILLS', baybayin: 'ᜊᜓᜑᜓᜎ᜔', line: 'Bohol. Hundreds of round hills, and something walking backward between them.', pool: ['sigbin', 'sigbin', 'duwende', 'duwende', 'santelmo'] },
  taal: { title: 'BULKANG TAAL', baybayin: 'ᜆᜀᜎ᜔', line: 'A volcano inside a lake. Ash falls, the vents hiss, and fires drift over the water.', pool: ['santelmo', 'santelmo', 'tikbalang', 'bungisngis', 'duwende'] },
  palawan: { title: 'PALAWAN', baybayin: 'ᜉᜎᜏᜈ᜔', line: 'Limestone towers over an emerald lagoon. The forest here is very old.', pool: ['kapre', 'manananggal', 'tiyanak', 'tiyanak', 'duwende'] },
  pulo4: { title: 'IBALONG FORESTS', baybayin: 'ᜁᜊᜎᜓᜅ᜔', line: 'Cigar smoke from the old balete, and a baby crying where no baby should be.', pool: ['kapre', 'kapre', 'tiyanak', 'tiyanak', 'tikbalang', 'manananggal'] },
};

/** The four legs of the voyage; each run picks one island per leg. */
export const ROUTE_SLOTS: string[][] = [['pulo1', 'bohol'], ['pulo2', 'sulu'], ['pulo3', 'ifugao', 'taal'], ['pulo4', 'palawan']];

export const CAVE = { title: 'YUNGIB', baybayin: 'ᜌᜓᜅᜒᜊ᜔', line: 'A cave under the island. Something laughs in the dark below.' };
export const ENDLESS = { title: 'WALANG KATAPUSAN', baybayin: 'ᜏᜎᜅ᜔ ᜃᜆᜉᜓᜐᜈ᜔', line: 'Endless islands. How far can you sail before the night takes you?' };

export const PORT = { title: 'PORT OF TONDO', baybayin: 'ᜆᜓᜈ᜔ᜇᜓ', line: 'Haliya waits by the balangay.' };
export const SHORE = { title: 'SHORE OF ALBAY', baybayin: 'ᜀᜎ᜔ᜊᜌ᜔', line: 'Beneath Mayon, the sea is the color of blood.' };

export const HALIYA_LINES = [
  'The balangay will carry you to the first island, maharlika.',
  'Catch the alitaptap. Their light fills your lamp, and a full lamp wakes your power.',
  'When the shots fly thick, dodge. Your amulets take the first blows, then mend.',
  'At each dambana, one of the old gods will bless you. Choose well.',
  'If you hear a baby crying in the forest, do not go to it. Strike first.',
  'The sigbin walks backward and hides from the eye. You will only see it when it is close.',
  'When an island is safe, look for the kaban. A whetstone keeps its edge whatever weapon you carry.',
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
