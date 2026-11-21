import { getSave, useSave } from './save';

/**
 * Tagalog for every line the player can read. English is the source: text is looked up by its
 * exact English wording, and anything without an entry (names, places, numbers) shows as is.
 * Placeholders such as {x} are filled by tr(text, { x: ... }).
 */
const TL: Record<string, string> = {
  // ------------------------------------------------------------ menus
  'ANG GABI NG BAKUNAWA': 'ANG GABI NG BAKUNAWA',
  'The islands were never conquered. Tonight a serpent comes for the last moon.':
    'Hindi kailanman nasakop ang mga pulo. Ngayong gabi, isang ahas-dagat ang darating para sa huling buwan.',
  STORY: 'PANIMULA',
  KWENTO: 'KWENTO',
  'ALAY {n}': 'ALAY {n}',
  'TAP TO SET SAIL': 'PINDUTIN PARA MAGLAYAG',
  'MUSIC ON': 'MUSIKA: BUKAS',
  'MUSIC OFF': 'MUSIKA: SARADO',
  'SOUND ON': 'TUNOG: BUKAS',
  'SOUND OFF': 'TUNOG: SARADO',
  'VIBRATE ON': 'YANIG: BUKAS',
  'VIBRATE OFF': 'YANIG: SARADO',
  BACK: 'BUMALIK',
  MENU: 'MENU',
  'PLAY AGAIN': 'MAGLARO MULI',
  RETRY: 'SUBUKAN MULI',
  'SET SAIL': 'MAGLAYAG',
  'CHOOSE YOUR MAHARLIKA': 'PUMILI NG IYONG MAHARLIKA',
  "{name}'S STORY": 'KUWENTO NI {name}',
  'BEST: {x}': 'PINAKAMALAYO: {x}',
  'DAWNS: {x}/{y}': 'BUKANG-LIWAYWAY: {x}/{y}',
  'PULANG BUWAN: ON': 'PULANG BUWAN: BUKAS',
  'PULANG BUWAN: OFF': 'PULANG BUWAN: SARADO',
  'CHOOSE A GUARDIAN': 'PUMILI NG TAGAPAGTANGGOL',
  RETURN: 'BUMALIK',
  'SEE THE WATCH': 'TINGNAN ANG BANTAY',
  Epilogue: 'Wakas',
  BEGIN: 'SIMULAN',
  TAP: 'PINDUTIN',
  'TAP TO {x}': 'PINDUTIN: {x}',
  'TAP TO CONTINUE': 'PINDUTIN PARA MAGPATULOY',
  'SKIP ›': 'LAKTAWAN ›',
  'TAP ▸': 'PINDUTIN ▸',
  PAUSED: 'NAKAHINTO',
  RESUME: 'ITULOY',
  'RETURN TO TONDO': 'BUMALIK SA TONDO',
  REACHED: 'NARATING',
  BANISHED: 'NAPALAYAS',
  BARYA: 'BARYA',
  TIME: 'ORAS',
  'NEW RECORD!': 'BAGONG REKORD!',
  'FURTHEST YET!': 'PINAKAMALAYO PA LANG!',
  SETTINGS: 'MGA SETTING',
  Language: 'Wika',
  Music: 'Musika',
  'Sound effects': 'Mga tunog',
  Vibration: 'Yanig',
  Controls: 'Kontrol',
  'Which side the attack buttons sit on': 'Kung saang gilid ang mga pindutan ng atake',
  ON: 'BUKAS',
  OFF: 'SARADO',
  ENGLISH: 'INGLES',
  TAGALOG: 'TAGALOG',
  RIGHT: 'KANAN',
  LEFT: 'KALIWA',
  Tutorial: 'Pagsasanay',
  'Play the lesson on the Tondo dock again next run': 'Ulitin ang aralin sa daungan ng Tondo sa susunod na laro',
  'The lesson will play on your next run': 'Lalabas ang aralin sa susunod mong laro',
  REPLAY: 'ULITIN',
  READY: 'HANDA',
  'All art and sound made in code': 'Lahat ng sining at tunog ay ginawa sa code',
  'ABANDON THIS RUN?': 'ITIGIL ANG LAKBAY NA ITO?',
  'Your barya from this run will still be kept.': 'Maiingatan pa rin ang barya mo sa lakbay na ito.',
  'YES, RETURN': 'OO, BUMALIK',
  'KEEP FIGHTING': 'LUMABAN PA',
  'LOW HEALTH': 'MAHINA NA',

  // ------------------------------------------------------------ alay (offerings)
  ALAY: 'ALAY',
  'Offer the barya you carry home to the old gods.': 'Ialay sa mga sinaunang diyos ang baryang naiuwi mo.',
  'NEW BLESSINGS': 'BAGONG BIYAYA',
  OFFERED: 'NAIALAY NA',
  'NEW COLORS': 'BAGONG KULAY',
  WEARING: 'SUOT',
  WEAR: 'ISUOT',
  'PULANG BUWAN': 'PULANG BUWAN',
  'The red moon is open to you. Turn it on when you choose your maharlika.':
    'Bukas na sa iyo ang pulang buwan. Buksan ito kapag pumipili ng maharlika.',
  'Win one dawn to open the red moon: tougher creatures, faster shots, half again the barya.':
    'Makamit ang isang bukang-liwayway para mabuksan ang pulang buwan: mas matitibay na nilalang, mas mabibilis na tira, at kalahati pang dagdag na barya.',

  // ------------------------------------------------------------ codex
  MAHARLIKA: 'MAHARLIKA',
  CREATURES: 'MGA NILALANG',
  'THE GODS': 'MGA DIYOS',
  'THE WORLD': 'ANG MUNDO',
  'From: {source}': 'Mula sa: {source}',
  Blessing: 'Biyaya',
  Effect: 'Epekto',
  '{deity}: {domain} in the Tagalog pantheon. At a dambana you may receive the blessing {name}.':
    '{deity}: {domain} sa panteon ng mga Tagalog. Sa isang dambana, maaari mong matanggap ang biyayang {name}.',
  Age: 'Edad',
  Home: 'Tahanan',
  Weapon: 'Sandata',
  Class: 'Uri',
  'Known for': 'Kilala sa',
  Role: 'Gampanin',
  From: 'Mula sa',
  Guards: 'Binabantayan',
  Enemy: 'Kaaway',
  Found: 'Matatagpuan',
  Behavior: 'Gawi',
  Weakness: 'Kahinaan',
  Counter: 'Panlaban',
  Sign: 'Palatandaan',
  Trick: 'Panlilinlang',
  Forms: 'Anyo',
  Power: 'Kapangyarihan',
  'Moons eaten': 'Buwang nilamon',
  Founded: 'Itinatag',
  Script: 'Panulat',
  'Capital port': 'Pangunahing daungan',
  Where: 'Saan',
  Leader: 'Pinuno',
  'Oldest found': 'Pinakamatandang natagpuan',
  Example: 'Halimbawa',

  // ------------------------------------------------------------ heroes (select + codex)
  'Maharlika of Mactan': 'Maharlika ng Mactan',
  'Navigator of Butuan': 'Nabigador ng Butuan',
  'Babaylan of Panay': 'Babaylan ng Panay',
  'Mananambal of Siquijor': 'Mananambal ng Siquijor',
  'Sworn to the warrior line that held the shallows in 1521.': 'Nanumpa sa angkan ng mandirigmang nagtanggol sa mababaw na dagat noong 1521.',
  'Reads the stars like her ancestors who sailed the first balangay.': 'Bumabasa ng mga bituin tulad ng kanyang mga ninunong naglayag sa unang balangay.',
  'Speaks with the anito and carries their light.': 'Nakikipag-usap sa mga anito at dala ang kanilang liwanag.',
  'A healer of the island the whole archipelago whispers about.': 'Manggagamot mula sa pulong ibinubulong ng buong kapuluan.',
  'Whirl the kampilan: strike all around and cut down shots': 'Iikot ang kampilan: tamaan ang paligid at hatiin ang mga tira',
  'A storm of arrows in every direction': 'Unos ng mga palaso sa lahat ng direksiyon',
  'Release a ring of piercing spirit orbs': 'Magpakawala ng singsing ng tumatagos na bolang-espiritu',
  'Heal 2 and restore every amulet': 'Magpagaling ng 2 at ibalik ang lahat ng anting-anting',
  'Long blade. Cuts through enemy shots.': 'Mahabang talim. Hinahati ang tira ng kaaway.',
  'Bow. Fast, accurate arrows.': 'Pana. Mabilis at tumpak na palaso.',
  'Spirit orbs that pass through foes.': 'Bolang-espiritu na tumatagos sa kaaway.',
  'Blowgun. Darts poison what they hit.': 'Sumpit. Nilalason ng palaso ang tinatamaan.',
  'Agimat Rod': 'Tungkod-Agimat',
  'Agimat rod': 'Tungkod-agimat',
  'Pana (bow)': 'Pana',
  'Sumpit (blowgun)': 'Sumpit',
  'Mactan, off Sugbu': 'Mactan, sa baybay ng Sugbu',
  'Maharlika, the warrior freemen': 'Maharlika, ang malayang mandirigma',
  'Butuan, on the Agusan river': 'Butuan, sa tabi ng ilog Agusan',
  'Never once getting lost': 'Hindi kailanman naliligaw',
  'Babaylan, healer and spirit-medium': 'Babaylan, manggagamot at tagapamagitan sa espiritu',
  'Mananambal, folk healer': 'Mananambal, katutubong manggagamot',
  'In Maharlika, the warriors of Mactan still train in the shallows where Lapulapu stood. Kidlat is the youngest ever sworn to that line, and he wears the red putong, the headcloth that marks a proven warrior, a little earlier than the elders would like.':
    'Sa Maharlika, nagsasanay pa rin ang mga mandirigma ng Mactan sa mababaw na dagat kung saan tumindig si Lapulapu. Si Kidlat ang pinakabatang nanumpa sa angkang iyon, at suot na niya ang pulang putong, ang panyong-ulo ng subok na mandirigma, nang mas maaga kaysa gusto ng matatanda.',
  'His weapon is the kampilan, the long single-edged sword of the south. In the hands of a careful fighter it can cut an arrow out of the air. Kidlat is not a careful fighter yet.':
    'Ang sandata niya ay ang kampilan, ang mahabang espadang may iisang talim mula sa timog. Sa kamay ng maingat na mandirigma, kaya nitong hatiin ang palaso sa ere. Hindi pa maingat na mandirigma si Kidlat.',
  'He is brave, quick to laugh and quicker to charge. He has never faced anything that was not human.':
    'Matapang siya, madaling tumawa at mas madaling sumugod. Hindi pa siya nakaharap ng anumang hindi tao.',
  'Mactan turned back the ships. We can turn back a fish.': 'Napaurong ng Mactan ang mga barko. Kaya nating paurungin ang isang isda.',
  'Butuan was building plank boats, the balangay, more than a thousand years before Mactan, and its navigators still steer by stars, swells and birds. Liksi learned all three before she learned to read baybayin.':
    'Gumagawa na ng balangay ang Butuan mahigit isang libong taon bago ang Mactan, at umaasa pa rin ang mga nabigador nito sa bituin, alon at ibon. Natutunan ni Liksi ang tatlong iyon bago pa siya natutong bumasa ng baybayin.',
  'She is the fastest archer in the river towns and the least patient sailor. She wears a salakot against sun and rain, and her shirt inside out on land at night, because everyone knows that is how you keep a tikbalang from leading you astray.':
    'Siya ang pinakamabilis na mamamana sa mga bayan sa ilog at ang pinakainip na mandaragat. Nakasalakot siya laban sa araw at ulan, at baligtad ang damit niya kapag nasa lupa sa gabi, dahil alam ng lahat na ganoon napipigilan ang tikbalang na iligaw ka.',
  'Big talk for something that lives in a puddle. Catch me if you can.': 'Ang yabang mo para sa nakatira sa lusak. Habulin mo ako kung kaya mo.',
  'The babaylan of the Visayas were healers, spirit-mediums and keepers of ritual, and in Maharlika they still sit on the councils. Mayumi was trained in Panay to speak with the anito, the spirits of ancestors and places.':
    'Ang mga babaylan ng Kabisayaan ay manggagamot, tagapamagitan sa espiritu at tagapag-ingat ng ritwal, at sa Maharlika ay nakaupo pa rin sila sa mga konseho. Sinanay si Mayumi sa Panay na makipag-usap sa mga anito, ang mga espiritu ng ninuno at ng mga lugar.',
  'For a month she has dreamed of a vast voice under the sea, counting moons. The old songs say the Bakunawa did not swallow the moons out of hunger, but because it loved them. She has begun to believe it.':
    'Isang buwan na niyang napapanaginipan ang isang malawak na tinig sa ilalim ng dagat na nagbibilang ng mga buwan. Sabi ng mga lumang awit, hindi nilamon ng Bakunawa ang mga buwan dahil sa gutom, kundi dahil minahal nito ang mga iyon. Nagsisimula na siyang maniwala.',
  'I hear you in my dreams, old one. You are not hungry. You are lonely.': 'Naririnig kita sa aking panaginip, matanda. Hindi ka gutom. Nag-iisa ka.',
  'Siquijor is the island the rest of the archipelago whispers about: home of the mananambal, the healers who brew their medicines in the forest. Amihan is one of them. She is named for the cool northeast wind.':
    'Ang Siquijor ang pulong ibinubulong ng buong kapuluan: tahanan ng mga mananambal, ang mga manggagamot na naglalaga ng gamot sa gubat. Isa sa kanila si Amihan. Ipinangalan siya sa malamig na hanging hilagang-silangan.',
  'She has set more bones than anyone in the Visayas and she knows what every plant on her island does, which is why her blowgun darts are the ones nobody wants to be hit by.':
    'Mas maraming buto na ang naayos niya kaysa sinuman sa Kabisayaan at alam niya ang bisa ng bawat halaman sa kanyang pulo, kaya ang mga palaso ng kanyang sumpit ang ayaw tamaan ng kahit sino.',
  'I have mended worse than you. Come, let us see how you heal.': 'Nakapagpagaling na ako ng mas malala sa iyo. Halika, tingnan natin kung paano ka gumaling.',
  'Masked goddess of moonlight': 'Nakamaskarang diyosa ng liwanag ng buwan',
  'Bicolano mythology': 'Mitolohiyang Bikolano',
  'Bulan, the moon': 'Bulan, ang buwan',
  'The Bakunawa': 'Ang Bakunawa',
  'In the mythology of Bicol, Haliya is the masked goddess of the moonlight and the sworn enemy of the Bakunawa. She guards Bulan, the moon, and the people honor her when the serpent threatens it.':
    'Sa mitolohiya ng Bikol, si Haliya ang nakamaskarang diyosa ng liwanag ng buwan at mahigpit na kaaway ng Bakunawa. Binabantayan niya si Bulan, ang buwan, at pinararangalan siya ng mga tao kapag nanganganib ito sa ahas-dagat.',
  'In this story she cannot drive the serpent back alone. She needs the people on the shore, and someone to clear their way.':
    'Sa kuwentong ito, hindi niya kayang itaboy nang mag-isa ang ahas-dagat. Kailangan niya ang mga tao sa dalampasigan, at may magbubukas ng kanilang daan.',
  'Make them loud, maharlika. The sea has never liked noise.': 'Paingayin mo sila, maharlika. Kailanman ay hindi nagustuhan ng dagat ang ingay.',

  // ------------------------------------------------------------ creatures
  'Dwellers of the punso': 'Mga naninirahan sa punso',
  'Punso Fields': 'Bukid ng Punso',
  'Hops straight at you': 'Tumatalon nang diretso sa iyo',
  'Small beings said to live in punso (anthills and earth mounds), under houses and in old trees. Pass a punso and you say "tabi-tabi po," excuse me, so you do not disturb them. Those who do are said to fall ill.':
    'Maliliit na nilalang na sinasabing nakatira sa punso, sa ilalim ng bahay at sa matatandang puno. Kapag dumaan ka sa punso, sinasabi mong "tabi-tabi po" para hindi sila maistorbo. Ang mga hindi nag-iingat ay sinasabing nagkakasakit.',
  'Pan-Philippine folk belief': 'Paniniwalang-bayan sa buong Pilipinas',
  'The one who separates': 'Ang humihiwalay',
  'Salt or ash on the half left behind': 'Asin o abo sa naiwang kalahati',
  'By night she severs her upper body from her legs and flies on bat-like wings. If someone finds the lower half and sprinkles it with salt or ash, she cannot rejoin it before sunrise.':
    'Sa gabi, inihihiwalay niya ang itaas na katawan sa kanyang mga binti at lumilipad sa pakpak na tulad ng sa paniki. Kapag may nakakita sa ibabang kalahati at binudburan ito ng asin o abo, hindi na siya makababalik dito bago sumikat ang araw.',
  'Visayan and Tagalog folklore': 'Kuwentong-bayang Bisaya at Tagalog',
  'Trickster of the mountains': 'Manlilinlang ng kabundukan',
  'Wear your shirt inside out': 'Isuot nang baligtad ang damit',
  'A tall creature with the head of a horse that haunts forests and mountain trails and leads travelers astray. Wearing your shirt inside out breaks its trick. Whoever pulls the special golden hairs from its mane can tame it.':
    'Isang matangkad na nilalang na may ulo ng kabayo na gumagala sa gubat at daang-bundok at inililigaw ang mga manlalakbay. Nasisira ang panlilinlang nito kapag binaligtad mo ang iyong damit. Ang makabunot ng mga gintong buhok sa kanyang kiling ay makapagpapaamo rito.',
  'Tagalog folklore': 'Kuwentong-bayang Tagalog',
  'Giant of the balete': 'Higante ng balete',
  'Ibalong forests': 'Kagubatan ng Ibalong',
  'Cigar smoke from an old tree': 'Usok ng tabako mula sa matandang puno',
  'A huge, hairy, dark giant who sits in big trees such as the balete, smoking an enormous cigar. Mostly a prankster who confuses travelers, but not one to anger.':
    'Isang malaki, mabalahibo at maitim na higanteng nakaupo sa malalaking puno tulad ng balete habang humihithit ng napakalaking tabako. Kadalasan ay pilyong nanlilito ng manlalakbay, pero hindi dapat galitin.',
  'The one that walks backward': 'Ang lumalakad nang paurong',
  'Siquijor, Mount Banahaw': 'Siquijor, Bundok Banahaw',
  'Fades into the dark, then lunges': 'Naglalaho sa dilim, saka sumusunggab',
  'A Visayan night creature like a hornless goat or a hound with huge ears. It is said to walk backward with its head lowered between its hind legs, to give off a foul smell, and to feed on the shadows of its victims. Some families were believed to keep one.':
    'Isang nilalang ng gabi sa Kabisayaan na parang kambing na walang sungay o asong may napakalaking tainga. Sinasabing lumalakad ito nang paurong habang nakababa ang ulo sa pagitan ng mga paa sa likod, mabaho ang amoy, at kumakain ng anino ng mga biktima nito. Pinaniniwalaang may mga pamilyang nag-aalaga nito.',
  'Visayan folklore': 'Kuwentong-bayang Bisaya',
  'The crying in the forest': 'Ang iyak sa gubat',
  'Fields and forests': 'Bukid at gubat',
  'Cries like a lost baby': 'Umiiyak na parang nawawalang sanggol',
  'A forest creature that takes the form of an abandoned infant and cries until a traveler picks it up. Then it shows its true face and attacks. Like the tikbalang, it can be confused by wearing your clothes inside out.':
    'Isang nilalang ng gubat na nag-aanyong iniwang sanggol at umiiyak hanggang may manlalakbay na bumuhat dito. Saka nito ipinapakita ang tunay na mukha at umaatake. Tulad ng tikbalang, nalilito ito kapag binaligtad mo ang iyong damit.',
  'Tagalog and Visayan folklore': 'Kuwentong-bayang Tagalog at Bisaya',
  'The shapeshifter': 'Ang nagbabagong-anyo',
  'Walks as a person, hunts as a beast': 'Lumalakad bilang tao, nangangaso bilang halimaw',
  'The most feared creature of Philippine folklore, especially in the Visayas. By day an aswang lives as an ordinary villager; by night it changes into a beast such as a dog, a pig or a great bird. It is said to have a long tongue and to be warded off by garlic, salt and the tail of a stingray.':
    'Ang pinakakinatatakutang nilalang sa kuwentong-bayan ng Pilipinas, lalo na sa Kabisayaan. Sa araw, namumuhay ang aswang bilang karaniwang taganayon; sa gabi, nagiging halimaw ito tulad ng aso, baboy o malaking ibon. Sinasabing mahaba ang dila nito at naitataboy ng bawang, asin at buntot ng pagi.',
  'Visayan folklore (told across the islands)': 'Kuwentong-bayang Bisaya (ikinukuwento sa buong kapuluan)',
  'Monster of the Ibalong': 'Halimaw ng Ibalong',
  'Ibalong Forests': 'Kagubatan ng Ibalong',
  'A gaze that turns flesh to stone': 'Titig na ginagawang bato ang laman',
  'In Ibalong, the epic of Bicol, Rabot is a terrible half-human, half-beast that turned people to stone; rocks around its den were said to be its victims. Handyong gave the hero Bantong a thousand warriors, but Bantong watched the monster, waited until it slept and cut it down alone.':
    'Sa Ibalong, ang epiko ng Bikol, si Rabot ay isang kakila-kilabot na kalahating tao at kalahating halimaw na ginagawang bato ang mga tao; ang mga bato sa paligid ng kanyang lungga ay sinasabing kanyang mga biktima. Binigyan ni Handyong ang bayaning si Bantong ng isang libong mandirigma, ngunit minasdan muna ni Bantong ang halimaw, hinintay itong makatulog, at pinatay itong mag-isa.',
  'Ibalong, the Bicolano epic': 'Ibalong, ang epikong Bikolano',
  'Eater of moons': 'Lumalamon ng buwan',
  'The sea off Albay': 'Ang dagat sa baybay ng Albay',
  'Six of seven': 'Anim sa pito',
  'A gigantic sea serpent believed to cause eclipses by swallowing the moon. In the Visayan telling, Bathala made seven moons and the Bakunawa swallowed six. People banged pots, pans and gongs to make it spit the moon back out.':
    'Isang dambuhalang ahas-dagat na pinaniniwalaang sanhi ng eklipse dahil nilalamon nito ang buwan. Sa bersiyong Bisaya, gumawa si Bathala ng pitong buwan at nilamon ng Bakunawa ang anim. Pinupukpok ng mga tao ang kaldero, kawali at gong para iluwa nito ang buwan.',
  'In Bicol, its great enemy is Haliya. Some versions say the serpent fell in love with the moons.':
    'Sa Bikol, ang mahigpit nitong kaaway ay si Haliya. Sa ilang bersiyon, umibig daw ang ahas-dagat sa mga buwan.',
  'Little warriors on the sand. The moon was mine before your kings had names.':
    'Maliliit na mandirigma sa buhangin. Akin na ang buwan bago pa nagkapangalan ang inyong mga hari.',
  'Visayan and Bicolano mythology': 'Mitolohiyang Bisaya at Bikolano',

  // ------------------------------------------------------------ world
  'The islands that stayed free': 'Ang mga pulong nanatiling malaya',
  'After Mactan, 1521 (this story)': 'Matapos ang Mactan, 1521 (sa kuwentong ito)',
  'In precolonial Tagalog society, the maharlika were the freeborn warrior class. Here the word names a whole country: a league of the polities that really existed in the 1500s (Tondo, Maynila, Sugbu, Butuan, Sulu, Maguindanao and more) that never fell to a colonizer.':
    'Sa lipunang Tagalog bago ang kolonyalismo, ang maharlika ay ang uring mandirigmang ipinanganak na malaya. Dito, pangalan ito ng isang buong bansa: isang liga ng mga pamayanang tunay na umiral noong 1500s (Tondo, Maynila, Sugbu, Butuan, Sulu, Maguindanao at iba pa) na hindi kailanman bumagsak sa mananakop.',
  'Its cities write in baybayin and trade by balangay as they always did. Its shrines still honor the anito and the old gods.':
    'Sumusulat sa baybayin ang mga lungsod nito at nakikipagkalakalan sa pamamagitan ng balangay gaya ng dati. Pinararangalan pa rin ng mga dambana nito ang mga anito at ang mga sinaunang diyos.',
  'The Battle of Mactan': 'Ang Labanan sa Mactan',
  '27 April 1521, history': '27 Abril 1521, kasaysayan',
  'Mactan, off Cebu': 'Mactan, sa baybay ng Cebu',
  'A real battle: Lapulapu, a chieftain of Mactan, defeated the Spanish expedition of Ferdinand Magellan, who was killed in the fighting. In real history, Spain returned in 1565 and colonized the islands. Maharlika imagines that it never did.':
    'Isang tunay na labanan: tinalo ni Lapulapu, isang pinuno ng Mactan, ang ekspedisyong Espanyol ni Ferdinand Magellan, na napatay sa labanan. Sa tunay na kasaysayan, bumalik ang Espanya noong 1565 at sinakop ang mga pulo. Iniisip ng Maharlika na hindi na ito bumalik.',
  'The Balangay': 'Ang Balangay',
  'Plank boats of Butuan': 'Mga bangkang tabla ng Butuan',
  'About 320 CE': 'Mga 320 CE',
  'Wooden plank boats excavated in Butuan, among the oldest watercraft found in Southeast Asia. The word barangay, for a community, comes from the balangay: a boatload of families who settled together.':
    'Mga bangkang gawa sa tablang kahoy na nahukay sa Butuan, kabilang sa pinakamatandang sasakyang-dagat na natagpuan sa Timog-Silangang Asya. Ang salitang barangay, para sa isang pamayanan, ay nagmula sa balangay: isang bangkang puno ng mga pamilyang sabay na nanirahan.',
  'The old script': 'Ang sinaunang panulat',
  'A precolonial writing system of the Tagalog and neighboring peoples, written in syllables. In Maharlika it was never replaced, so it is still on every shop sign and in every school.':
    'Isang sistema ng pagsulat ng mga Tagalog at kalapit na mamamayan bago ang kolonyalismo, isinusulat nang pantig-pantig. Sa Maharlika, hindi ito kailanman napalitan, kaya nasa bawat karatula ng tindahan at bawat paaralan pa rin ito.',
  'Tagalog mythology': 'Mitolohiyang Tagalog',

  // ------------------------------------------------------------ gods
  'God of the sun and of war': 'Diyos ng araw at ng digmaan',
  'Goddess of the moon': 'Diyosa ng buwan',
  'Goddess of the stars': 'Diyosa ng mga bituin',
  'Goddess of wind and rain': 'Diyosa ng hangin at ulan',
  'Guardian of the mountains': 'Tagapagbantay ng kabundukan',
  'Goddess of fertility and harvest': 'Diyosa ng pagkamayabong at ani',
  'Goddess of the sea': 'Diyosa ng dagat',
  'Protector of fences and harvests': 'Tagapagtanggol ng bakod at ani',
  'Supreme god and creator': 'Kataas-taasang diyos at manlilikha',
  'Goddess of the morning': 'Diyosa ng umaga',
  'God of the sea and of hunters': 'Diyos ng dagat at ng mga mangangaso',
  'Goddess of labor and good deeds': 'Diyosa ng paggawa at mabubuting gawa',
  '+25% damage': '+25% pinsala',
  'Shots pierce; the kampilan reaches further': 'Tumatagos ang mga tira; mas malayo ang abot ng kampilan',
  '+1 max health, and heal 1': '+1 pinakamataas na buhay, at magpagaling ng 1',
  'Move 15% faster; dodge recovers sooner': '15% mas mabilis kumilos; mas maagang makaiwas muli',
  '+2 amulets': '+2 anting-anting',
  'Heal 1 on each new island; foes drop herbs more often': 'Magpagaling ng 1 sa bawat bagong pulo; mas madalas maghulog ng halamang-gamot ang kaaway',
  'Attack 20% faster': '20% mas mabilis umatake',
  'Amulets recharge twice as fast': 'Dalawang beses na mas mabilis manumbalik ang anting-anting',
  'Once per run, survive a fatal blow with 2 health': 'Minsan bawat laro, makaligtas sa nakamamatay na tama nang may 2 buhay',
  'Start every island with your lamp half full': 'Simulan ang bawat pulo nang kalahating puno ang iyong ilawan',
  '15% of hits strike for double damage': '15% ng mga tama ay dobleng pinsala',
  'Half of the barya you pick up counts twice': 'Kalahati ng baryang napupulot mo ay dalawang beses na bilang',

  // ------------------------------------------------------------ in the run
  'PORT OF TONDO': 'DAUNGAN NG TONDO',
  'Haliya waits by the balangay.': 'Naghihintay si Haliya sa tabi ng balangay.',
  'PUNSO FIELDS': 'BUKID NG PUNSO',
  'Tabi-tabi po. The duwende do not want to be stepped on tonight.': 'Tabi-tabi po. Ayaw ng mga duwende na matapakan ngayong gabi.',
  'Salt and ash in every pocket. The manananggal fly here.': 'Asin at abo sa bawat bulsa. Dito lumilipad ang mga manananggal.',
  'MOUNT BANAHAW': 'BUNDOK BANAHAW',
  'Mount Banahaw': 'Bundok Banahaw',
  'Anito Ring': 'Singsing ng Anito',
  'Shirts inside out. The tikbalang are leading travelers astray.': 'Baligtarin ang damit. Inililigaw ng mga tikbalang ang mga manlalakbay.',
  'IBALONG FORESTS': 'KAGUBATAN NG IBALONG',
  'Cigar smoke drifts from the old balete. The kapre are awake.': 'May usok ng tabako mula sa matandang balete. Gising ang mga kapre.',
  'SHORE OF ALBAY': 'DALAMPASIGAN NG ALBAY',
  'Beneath Mayon, the sea is the color of blood.': 'Sa paanan ng Mayon, kasingpula ng dugo ang dagat.',
  'The balangay will carry you to the first island, maharlika.': 'Dadalhin ka ng balangay sa unang pulo, maharlika.',
  'Catch the alitaptap. Their light fills your lamp, and a full lamp wakes your power.':
    'Hulihin ang mga alitaptap. Pinupuno ng kanilang liwanag ang iyong ilawan, at ginigising ng punong ilawan ang iyong kapangyarihan.',
  'When the shots fly thick, dodge. Your amulets take the first blows, then mend.':
    'Kapag dumagsa ang mga tira, umiwas. Sinasalo ng iyong anting-anting ang mga unang tama, saka ito nanunumbalik.',
  'At each dambana, one of the old gods will bless you. Choose well.': 'Sa bawat dambana, bibiyayaan ka ng isa sa mga sinaunang diyos. Pumili nang mabuti.',
  'THE ISLAND IS SAFE': 'LIGTAS NA ANG PULO',
  'Visit the dambana, then sail on.': 'Dumalaw sa dambana, saka maglayag muli.',
  DAMBANA: 'DAMBANA',
  'An old god answers your offering. Choose one blessing.': 'Tumugon ang isang sinaunang diyos sa iyong alay. Pumili ng isang biyaya.',
  'By day a neighbor. By night, the beast.': 'Kapitbahay sa araw. Halimaw sa gabi.',
  'Do not meet its eyes. The Ibalong remembers.': 'Huwag salubungin ang kanyang tingin. Hindi nakalilimot ang Ibalong.',
  'Not yet, maharlika. Breathe.': 'Hindi pa, maharlika. Huminga ka.',
  LAMON: 'LAMON',
  'The serpent opens its jaws for the moon. Hold!': 'Ibinuka ng ahas-dagat ang panga para sa buwan. Kumapit!',
  'Not this moon, serpent. Not while I wear this mask.': 'Hindi ang buwang ito, ahas. Hindi habang suot ko ang maskarang ito.',
  'The moon has been swallowed before, and spat out. Rise, maharlika.': 'Nalamon na ang buwan noon, at iniluwa rin. Bumangon ka, maharlika.',
  'The tide turns. So will you.': 'Bumabaligtad ang alon. Ganoon ka rin.',
  'Even Mactan was not won in one wave. Again.': 'Kahit ang Mactan ay hindi napagwagian sa iisang alon. Muli.',
  'Drag on the right side of the screen to walk': 'I-drag ang kanang bahagi ng screen para maglakad',
  'Drag on the left side of the screen to walk': 'I-drag ang kaliwang bahagi ng screen para maglakad',
  'Hold the crossed blades to strike the practice duwende': 'Pindutin nang matagal ang magkakrus na talim para tamaan ang duwendeng pansanay',
  'Tap the wind to dodge roll through danger': 'Pindutin ang hangin para gumulong palayo sa panganib',
  'Your lamp is full! Tap the sun to use your skill': 'Puno na ang iyong ilawan! Pindutin ang araw para gamitin ang iyong galing',
  'Well done. Board the balangay to sail': 'Magaling. Sumakay sa balangay para maglayag',
  'Walk with W A S D or the arrow keys': 'Maglakad gamit ang W A S D o ang mga arrow key',
  'Hold SPACE to strike the practice duwende': 'Pindutin nang matagal ang SPACE para tamaan ang duwendeng pansanay',
  'Press SHIFT to dodge roll through danger': 'Pindutin ang SHIFT para gumulong palayo sa panganib',
  'Your lamp is full! Press K to use your skill': 'Puno na ang iyong ilawan! Pindutin ang K para gamitin ang iyong galing',

  // ------------------------------------------------------------ story panels
  'Mactan, 27 April 1521': 'Mactan, 27 Abril 1521',
  'In the shallows of Mactan, Lapulapu and his warriors met the foreign ships and turned them back. Their captain, Magellan, fell in the surf. In our history, others came after. In this one, no one ever did.':
    'Sa mababaw na dagat ng Mactan, hinarap ni Lapulapu at ng kanyang mga mandirigma ang mga dayuhang barko at pinaurong ang mga ito. Bumagsak sa alon ang kanilang kapitan na si Magellan. Sa ating kasaysayan, may iba pang dumating pagkatapos. Sa kuwentong ito, wala nang dumating kailanman.',
  'Five hundred years on, the islands are Maharlika: a free league of rajahnates, sultanates and barangays. Baybayin is written on every sign in Tondo, the balangay still sail between the islands, and the babaylan still keep the old rites.':
    'Limandaang taon makalipas, ang mga pulo ay Maharlika: isang malayang liga ng mga raha, sultanato at barangay. Nakasulat sa baybayin ang bawat karatula sa Tondo, naglalayag pa rin ang balangay sa pagitan ng mga pulo, at iniingatan pa rin ng mga babaylan ang mga sinaunang ritwal.',
  'The Seven Moons': 'Ang Pitong Buwan',
  'The Visayan elders tell it this way: Bathala hung seven moons in the sky. The Bakunawa, a sea serpent with a mouth as wide as a lake, rose from the deep and swallowed them one by one, until only one was left.':
    'Ganito ito ikinukuwento ng matatanda sa Kabisayaan: nagsabit si Bathala ng pitong buwan sa langit. Umahon mula sa kailaliman ang Bakunawa, isang ahas-dagat na kasinlapad ng lawa ang bibig, at nilamon ang mga ito isa-isa, hanggang isa na lamang ang natira.',
  'In Bicol they tell of Haliya, the masked goddess of moonlight, sworn enemy of the Bakunawa and guardian of Bulan, the moon. Whenever the serpent rises, the people bang their gongs and pots so the noise drives it back, and Haliya fights beside them.':
    'Sa Bikol, ikinukuwento nila si Haliya, ang nakamaskarang diyosa ng liwanag ng buwan, mahigpit na kaaway ng Bakunawa at tagapagbantay ni Bulan, ang buwan. Tuwing umaahon ang ahas-dagat, pinupukpok ng mga tao ang kanilang gong at kaldero para itaboy ito ng ingay, at lumalaban si Haliya sa tabi nila.',
  'The Moon Bleeds': 'Dumudugo ang Buwan',
  'Tonight the moon is turning red: the Bakunawa is rising for the last one. The creatures of the night have come out with it, duwende from their punso, manananggal from the groves, tikbalang from the mountains, kapre from the balete trees, and they are keeping the people from gathering on the shore.':
    'Ngayong gabi, namumula ang buwan: umaahon ang Bakunawa para sa huli. Lumabas kasama nito ang mga nilalang ng gabi, mga duwende mula sa punso, manananggal mula sa kakahuyan, tikbalang mula sa kabundukan, kapre mula sa mga balete, at pinipigilan nila ang mga tao na magtipon sa dalampasigan.',
  'Four Maharlika': 'Apat na Maharlika',
  'On the docks of Tondo, Haliya calls four warriors. Sail the islands, clear the way, and reach the shore of Albay beneath Mayon. Hold back the serpent while the people make their noise, before the last moon is gone.':
    'Sa daungan ng Tondo, tinawag ni Haliya ang apat na mandirigma. Maglayag sa mga pulo, buksan ang daan, at marating ang dalampasigan ng Albay sa paanan ng Mayon. Pigilan ang ahas-dagat habang nag-iingay ang mga tao, bago maglaho ang huling buwan.',
  'The Noise': 'Ang Ingay',
  'With the creatures driven off, the people pour onto the shore of Albay. Gongs, pots, drums and voices: the whole coast roars. Deafened and wounded, the Bakunawa opens its jaws and lets the moon go.':
    'Nang maitaboy ang mga nilalang, dumagsa ang mga tao sa dalampasigan ng Albay. Gong, kaldero, tambol at tinig: umuungal ang buong baybayin. Bingi at sugatan, ibinuka ng Bakunawa ang panga at pinakawalan ang buwan.',
  'Dawn over Mayon': 'Bukang-liwayway sa Mayon',
  'The moon climbs back into the sky, whole. By dawn the balangay are sailing home past Mayon, and Haliya, they say, has gone back to the moon to keep watch.':
    'Bumalik sa langit ang buwan, buo. Pagsapit ng bukang-liwayway, pauwi na ang mga balangay na dumaraan sa Mayon, at si Haliya, sabi nila, ay bumalik na sa buwan para magbantay.',
  'Kidlat cleaned his kampilan in the surf of Albay as his ancestors did at Mactan. He has decided the old songs need a new verse, and he intends to be in it.':
    'Nilinis ni Kidlat ang kanyang kampilan sa alon ng Albay gaya ng ginawa ng kanyang mga ninuno sa Mactan. Napagpasyahan niyang kailangan ng mga lumang awit ng bagong taludtod, at balak niyang mapasama roon.',
  'Liksi steered the lead balangay home by the stars, the way the old navigators of Butuan did, with a whole fleet following her lamp.':
    'Inugitan ni Liksi pauwi ang nangungunang balangay sa gabay ng mga bituin, gaya ng sinaunang mga nabigador ng Butuan, habang sumusunod ang buong plota sa kanyang ilawan.',
  'Mayumi stayed on the shore until morning, singing to the water. The old songs say the Bakunawa loved the moons. She thinks they are right, and that it is lonely down there.':
    'Nanatili si Mayumi sa dalampasigan hanggang umaga, umaawit sa tubig. Sabi ng mga lumang awit, minahal ng Bakunawa ang mga buwan. Sa tingin niya ay tama sila, at malungkot doon sa ilalim.',
  'Amihan went home to Siquijor with her pouch empty and a hundred wounds mended. She slept for two days, and the island let her.':
    'Umuwi si Amihan sa Siquijor nang ubos ang laman ng kanyang supot at isandaang sugat ang napagaling. Natulog siya nang dalawang araw, at hinayaan siya ng pulo.',

  // ------------------------------------------------------------ floating words
  'THE ISLAND IS SAFE ': 'LIGTAS NA ANG PULO',
  'TABI-TABI PO!': 'TABI-TABI PO!',
};

export type Lang = 'en' | 'tl';

/** Translate one piece of English text into the player's chosen language. */
const UPPER: Record<string, string> = {};
for (const [k, v] of Object.entries(TL)) UPPER[k.toUpperCase()] = v.toUpperCase();

export function tr(text: string, vars?: Record<string, string | number>, lang: Lang = getSave().lang) {
  // text shown in capitals (titles, labels) is looked up by its capitalized English too
  let out = lang === 'tl' ? (TL[text] ?? UPPER[text] ?? text) : text;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

/** React hook: the current language, re-rendering when it changes. */
export function useLang(): Lang {
  return useSave().lang;
}

/** Every English key that has a Tagalog line (used by the coverage check). */
export const TL_KEYS = Object.keys(TL);
