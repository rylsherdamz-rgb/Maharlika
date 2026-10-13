export type HeroId = 'kidlat' | 'liksi' | 'mayumi' | 'amihan';
export type WeaponId = 'kampilan' | 'pana' | 'agimat' | 'sumpit';
export type EnemyType = 'duwende' | 'manananggal' | 'tikbalang' | 'kapre' | 'bakunawa';
export type BulletSprite = 'shot_arrow' | 'shot_spirit' | 'shot_dart' | 'shot_enemy';
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
  weapon: WeaponId;
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
    weapon: 'kampilan',
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
    weapon: 'pana',
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
    weapon: 'agimat',
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
    weapon: 'sumpit',
    skill: { name: 'Tambal', desc: 'Heal 2 and restore every amulet' },
    color: '#f08428',
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
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  kampilan: { id: 'kampilan', name: 'Kampilan', desc: 'Long blade. Cuts through enemy shots.', melee: true, damage: 7, rate: 0.38, speed: 0, spread: 0, radius: 26, pierce: true },
  pana: { id: 'pana', name: 'Pana', desc: 'Bow. Fast, accurate arrows.', melee: false, damage: 3, rate: 0.24, speed: 300, spread: 0.04, sprite: 'shot_arrow', radius: 2.5, pierce: false },
  agimat: { id: 'agimat', name: 'Agimat Rod', desc: 'Spirit orbs that pass through foes.', melee: false, damage: 5, rate: 0.46, speed: 160, spread: 0.02, sprite: 'shot_spirit', radius: 4, pierce: true },
  sumpit: { id: 'sumpit', name: 'Sumpit', desc: 'Blowgun. Darts poison what they hit.', melee: false, damage: 1, rate: 0.2, speed: 280, spread: 0.06, sprite: 'shot_dart', radius: 2.5, pierce: false, poison: 2.4 },
};

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
  mayari: { id: 'mayari', deity: 'Mayari', domain: 'Goddess of the moon', name: 'Talim ng Buwan', desc: 'Shots pierce; the kampilan reaches further' },
  tala: { id: 'tala', deity: 'Tala', domain: 'Goddess of the stars', name: 'Bituing Gabay', desc: '+1 max health, and heal 1' },
  anitun_tabu: { id: 'anitun_tabu', deity: 'Anitun Tabu', domain: 'Goddess of wind and rain', name: 'Hanging Mabilis', desc: 'Move 15% faster; dodge recovers sooner' },
  dumakulem: { id: 'dumakulem', deity: 'Dumakulem', domain: 'Guardian of the mountains', name: 'Bundok na Kalasag', desc: '+2 amulets' },
  lakapati: { id: 'lakapati', deity: 'Lakapati', domain: 'Goddess of fertility and harvest', name: 'Ani', desc: 'Heal 1 on each new island; foes drop herbs more often' },
  aman_sinaya: { id: 'aman_sinaya', deity: 'Aman Sinaya', domain: 'Goddess of the sea', name: 'Alon', desc: 'Attack 20% faster' },
  lakan_bakod: { id: 'lakan_bakod', deity: 'Lakan Bakod', domain: 'Protector of fences and harvests', name: 'Bakod', desc: 'Amulets recharge twice as fast' },
};
