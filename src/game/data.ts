export type HeroId = 'kidlat' | 'liksi' | 'mayumi' | 'amihan' | 'banog' | 'dalisay';
export type WeaponId =
  | 'kampilan'
  | 'pana'
  | 'agimat'
  | 'sumpit'
  | 'kris'
  | 'bangkaw'
  | 'lingganay'
  | 'barang'
  | 'panabas'
  | 'balaraw'
  | 'baston'
  | 'buntot_pagi'
  | 'lantaka';
export type EnemyType = 'duwende' | 'manananggal' | 'tikbalang' | 'kapre' | 'tiyanak' | 'sigbin' | 'santelmo' | 'bungisngis' | 'bakunawa';
export type BulletSprite = 'shot_arrow' | 'shot_spirit' | 'shot_dart' | 'shot_spear' | 'shot_chime' | 'shot_beetle' | 'shot_cannon' | 'shot_enemy';
export type BoonId =
  | 'apolaki'
  | 'mayari'
  | 'tala'
  | 'anitun_tabu'
  | 'dumakulem'
  | 'lakapati'
  | 'aman_sinaya'
  | 'lakan_bakod';

export interface HeroDef {
  id: HeroId;
  name: string;
  title: string;
  home: string;
  lore: string;
  hp: number;
  armor: number;
  speed: number;
  /** Signature weapon first; the second is the alternate the player can take instead. */
  weapons: [WeaponId, WeaponId];
  skill: { name: string; desc: string };
  color: string;
}

/** Light (liwanag) fills as you deal damage and catch fireflies; a full lamp powers the skill. */
export const LIGHT_MAX = 100;

export const HEROES: HeroDef[] = [
  {
    id: 'kidlat',
    name: 'Kidlat',
    title: 'Maharlika of Mactan',
    home: 'Mactan, Sugbu',
    lore: 'Sworn to the warrior line that held the shallows in 1521.',
    hp: 8,
    armor: 5,
    speed: 76,
    weapons: ['kampilan', 'kris'],
    skill: { name: 'Bagyo', desc: 'Whirl the kampilan: strike all around and cut down shots' },
    color: '#d63a30',
  },
  {
    id: 'liksi',
    name: 'Liksi',
    title: 'Navigator of Butuan',
    home: 'Butuan, Agusan',
    lore: 'Reads the stars like her ancestors who sailed the first balangay.',
    hp: 5,
    armor: 3,
    speed: 82,
    weapons: ['pana', 'bangkaw'],
    skill: { name: 'Ulan ng Pana', desc: 'A storm of arrows in every direction' },
    color: '#62b24a',
  },
  {
    id: 'mayumi',
    name: 'Mayumi',
    title: 'Babaylan of Panay',
    home: 'Panay',
    lore: 'Speaks with the anito and carries their light.',
    hp: 5,
    armor: 4,
    speed: 70,
    weapons: ['agimat', 'lingganay'],
    skill: { name: 'Anito Ring', desc: 'Release a ring of piercing spirit orbs' },
    color: '#36a4a0',
  },
  {
    id: 'amihan',
    name: 'Amihan',
    title: 'Mananambal of Siquijor',
    home: 'Siquijor',
    lore: 'A healer of the island the whole archipelago whispers about.',
    hp: 6,
    armor: 4,
    speed: 74,
    weapons: ['sumpit', 'barang'],
    skill: { name: 'Tambal', desc: 'Heal 2 and restore every amulet' },
    color: '#f08428',
  },
  {
    id: 'banog',
    name: 'Banog',
    title: 'Bagani of Bukidnon',
    home: 'Bukidnon, Mindanao',
    lore: 'Earned the red tangkulo of a bagani defending the highland villages.',
    hp: 7,
    armor: 6,
    speed: 68,
    weapons: ['panabas', 'baston'],
    skill: { name: 'Kalasag', desc: 'Raise the shield: untouchable, and shots bounce back' },
    color: '#c0382c',
  },
  {
    id: 'dalisay',
    name: 'Dalisay',
    title: 'Pearl Diver of Sulu',
    home: 'Jolo, Sulu',
    lore: 'Dives the reefs on one breath and sails with the lantaka crews.',
    hp: 5,
    armor: 3,
    speed: 86,
    weapons: ['buntot_pagi', 'lantaka'],
    skill: { name: 'Daluyong', desc: 'A tidal surge: hurls foes back and washes away shots' },
    color: '#4270c4',
  },
];

export interface WeaponDef {
  id: WeaponId;
  name: string;
  desc: string;
  melee: boolean;
  damage: number;
  rate: number; // seconds between attacks
  speed: number;
  spread: number;
  sprite?: BulletSprite;
  radius: number; // shot radius, or reach for melee
  pierce: boolean;
  poison?: number; // seconds of poison per hit
  count?: number; // shots per attack, fanned across `spread`
  homing?: boolean; // shots turn toward the nearest creature
  arc?: number; // melee swing arc in degrees (each side of the aim)
  explode?: number; // blast radius when the shot lands
  knock?: number; // melee knockback distance
}

/** Each whetstone (hasaan) adds a level; every level adds this much damage. */
export const WEAPON_LV_MAX = 5;
export const WEAPON_LV_BONUS = 0.2;

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  kampilan: { id: 'kampilan', name: 'Kampilan', desc: 'Long blade. Cuts through enemy shots.', melee: true, damage: 7, rate: 0.38, speed: 0, spread: 0, radius: 26, pierce: true },
  pana: { id: 'pana', name: 'Pana', desc: 'Bow. Fast, accurate arrows.', melee: false, damage: 3, rate: 0.24, speed: 300, spread: 0.04, sprite: 'shot_arrow', radius: 2.5, pierce: false },
  agimat: { id: 'agimat', name: 'Agimat Rod', desc: 'Spirit orbs that pass through foes.', melee: false, damage: 5, rate: 0.46, speed: 160, spread: 0.02, sprite: 'shot_spirit', radius: 4, pierce: true },
  sumpit: { id: 'sumpit', name: 'Sumpit', desc: 'Blowgun. Darts poison what they hit.', melee: false, damage: 1, rate: 0.2, speed: 280, spread: 0.06, sprite: 'shot_dart', radius: 2.5, pierce: false, poison: 2.4 },
  kris: { id: 'kris', name: 'Kris', desc: 'Wavy blade. Quick, close cuts; also parries shots.', melee: true, damage: 4, rate: 0.22, speed: 0, spread: 0, radius: 20, pierce: true, arc: 60 },
  bangkaw: { id: 'bangkaw', name: 'Bangkaw', desc: 'Throwing spear. Slow, heavy, runs through foes.', melee: false, damage: 7, rate: 0.55, speed: 230, spread: 0.02, sprite: 'shot_spear', radius: 3, pierce: true },
  lingganay: { id: 'lingganay', name: 'Lingganay', desc: 'Bronze bell. Rings out three chimes in a fan.', melee: false, damage: 3, rate: 0.5, speed: 170, spread: 0.32, sprite: 'shot_chime', radius: 3.5, pierce: false, count: 3 },
  panabas: { id: 'panabas', name: 'Panabas', desc: 'Heavy chopping blade. Slow, huge sweeping cuts.', melee: true, damage: 11, rate: 0.6, speed: 0, spread: 0, radius: 30, pierce: true, arc: 100 },
  balaraw: { id: 'balaraw', name: 'Balaraw', desc: 'Dagger. Very fast stabs at close range.', melee: true, damage: 3, rate: 0.13, speed: 0, spread: 0, radius: 16, pierce: true, arc: 50 },
  baston: { id: 'baston', name: 'Baston', desc: 'Arnis sticks. Quick strikes that knock foes back.', melee: true, damage: 4, rate: 0.2, speed: 0, spread: 0, radius: 22, pierce: true, arc: 80, knock: 12 },
  buntot_pagi: { id: 'buntot_pagi', name: 'Buntot Pagi', desc: 'Stingray-tail whip. Long, narrow lash; the barbs poison.', melee: true, damage: 3, rate: 0.32, speed: 0, spread: 0, radius: 40, pierce: true, arc: 22, poison: 2 },
  lantaka: { id: 'lantaka', name: 'Lantaka', desc: 'Bronze swivel cannon. Slow shots that explode.', melee: false, damage: 6, rate: 0.85, speed: 150, spread: 0.03, sprite: 'shot_cannon', radius: 3.5, pierce: false, explode: 24 },
  barang: { id: 'barang', name: 'Barang', desc: 'Spirit beetles that seek foes and poison them.', melee: false, damage: 2, rate: 0.42, speed: 120, spread: 0.3, sprite: 'shot_beetle', radius: 3, pierce: false, poison: 1.6, homing: true },
};

/** Everything a kaban (chest) can hold besides gold and herbs. */
export const LOOT_WEAPONS = Object.keys(WEAPONS) as WeaponId[];

export interface EnemyDef {
  name: string;
  hp: number;
  speed: number;
  radius: number;
  contact: number;
  size: number;
  coins: number;
}

export const ENEMIES: Record<EnemyType, EnemyDef> = {
  duwende: { name: 'Duwende', hp: 7, speed: 26, radius: 6, contact: 1, size: 16, coins: 1 },
  manananggal: { name: 'Manananggal', hp: 5, speed: 52, radius: 5, contact: 1, size: 16, coins: 1 },
  tikbalang: { name: 'Tikbalang', hp: 10, speed: 30, radius: 6, contact: 1, size: 16, coins: 2 },
  kapre: { name: 'Kapre', hp: 15, speed: 20, radius: 6, contact: 1, size: 16, coins: 2 },
  tiyanak: { name: 'Tiyanak', hp: 6, speed: 36, radius: 5, contact: 1, size: 16, coins: 1 },
  sigbin: { name: 'Sigbin', hp: 8, speed: 46, radius: 6, contact: 1, size: 16, coins: 2 },
  santelmo: { name: 'Santelmo', hp: 5, speed: 44, radius: 5, contact: 1, size: 14, coins: 1 },
  bungisngis: { name: 'Bungisngis', hp: 30, speed: 16, radius: 8, contact: 2, size: 22, coins: 4 },
  bakunawa: { name: 'Bakunawa', hp: 380, speed: 22, radius: 13, contact: 2, size: 32, coins: 30 },
};

export const BOSS_NAME = 'BAKUNAWA';

export interface BoonDef {
  id: BoonId;
  deity: string;
  domain: string;
  name: string;
  desc: string;
}

/** Blessings granted at the dambana (shrines). The deities are from the Tagalog pantheon. */
export const BOONS: Record<BoonId, BoonDef> = {
  apolaki: { id: 'apolaki', deity: 'Apolaki', domain: 'God of the sun and of war', name: 'Init ng Araw', desc: '+25% damage' },
  mayari: { id: 'mayari', deity: 'Mayari', domain: 'Goddess of the moon', name: 'Talim ng Buwan', desc: 'Shots pierce; blades reach further' },
  tala: { id: 'tala', deity: 'Tala', domain: 'Goddess of the stars', name: 'Bituing Gabay', desc: '+1 max health, and heal 1' },
  anitun_tabu: { id: 'anitun_tabu', deity: 'Anitun Tabu', domain: 'Goddess of wind and rain', name: 'Hanging Mabilis', desc: 'Move 15% faster; dodge recovers sooner' },
  dumakulem: { id: 'dumakulem', deity: 'Dumakulem', domain: 'Guardian of the mountains', name: 'Bundok na Kalasag', desc: '+2 amulets' },
  lakapati: { id: 'lakapati', deity: 'Lakapati', domain: 'Goddess of fertility and harvest', name: 'Ani', desc: 'Heal 1 on each new island; foes drop herbs more often' },
  aman_sinaya: { id: 'aman_sinaya', deity: 'Aman Sinaya', domain: 'Goddess of the sea', name: 'Alon', desc: 'Attack 20% faster' },
  lakan_bakod: { id: 'lakan_bakod', deity: 'Lakan Bakod', domain: 'Protector of fences and harvests', name: 'Bakod', desc: 'Amulets recharge twice as fast' },
};

// ---------------------------------------------------------------- modes, difficulty, levels
export type Mode = 'voyage' | 'endless';

export interface Difficulty {
  id: 0 | 1 | 2;
  name: string; // Filipino
  en: string;
  desc: string;
  hp: number; // creature health multiplier
  extra: number; // creatures added to each wave
  shot: number; // creature shot speed multiplier
  legs: number; // islands in a voyage before the shore of Albay
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 0, name: 'MADALI', en: 'Easy', desc: '4 islands. Weaker creatures, slower shots.', hp: 0.75, extra: -1, shot: 0.85, legs: 4 },
  { id: 1, name: 'KATAMTAMAN', en: 'Normal', desc: '5 islands. The voyage as it was meant.', hp: 1, extra: 0, shot: 1, legs: 5 },
  { id: 2, name: 'MAHIRAP', en: 'Hard', desc: '6 islands. Tougher, faster, more of them. Win once to unlock.', hp: 1.35, extra: 2, shot: 1.2, legs: 6 },
];

/** Hero levels (antas): XP from every banished creature, shared by the whole party. */
export const LEVEL_MAX = 15;
export const xpToNext = (lv: number) => 18 + lv * 14;
