export type HeroId = 'kidlat' | 'liksi' | 'mayumi' | 'amihan';
export type WeaponId = 'tirador' | 'sumpit' | 'lantaka' | 'agimat';
export type EnemyType = 'duwende' | 'manananggal' | 'tikbalang' | 'kapre' | 'bakunawa';
export type BulletSprite = 'shot_pebble' | 'shot_dart' | 'shot_scatter' | 'shot_spirit' | 'shot_enemy';

export interface HeroDef {
  id: HeroId;
  name: string;
  title: string;
  lore: string;
  hp: number;
  armor: number;
  energy: number;
  speed: number;
  weapons: [WeaponId, WeaponId];
  skill: { name: string; desc: string; cooldown: number };
  color: string;
}

export const HEROES: HeroDef[] = [
  {
    id: 'kidlat',
    name: 'Kidlat',
    title: 'The Barrio Watchman',
    lore: 'Has kept the night watch since he could hold a sumpit.',
    hp: 7,
    armor: 5,
    energy: 180,
    speed: 72,
    weapons: ['sumpit', 'tirador'],
    skill: { name: 'Lightning Rush', desc: 'Shoot twice as fast for 5s', cooldown: 12 },
    color: '#d63a30',
  },
  {
    id: 'liksi',
    name: 'Liksi',
    title: 'The Rice-Field Scout',
    lore: 'Runs the paddy dikes faster than any tikbalang.',
    hp: 5,
    armor: 4,
    energy: 200,
    speed: 84,
    weapons: ['lantaka', 'tirador'],
    skill: { name: 'Hop', desc: 'Dash and dodge all damage', cooldown: 3 },
    color: '#62b24a',
  },
  {
    id: 'mayumi',
    name: 'Mayumi',
    title: 'The Babaylan',
    lore: 'Speaks with the anito and carries their light.',
    hp: 5,
    armor: 4,
    energy: 260,
    speed: 70,
    weapons: ['agimat', 'tirador'],
    skill: { name: 'Anito Ring', desc: 'Release a ring of spirit orbs', cooldown: 8 },
    color: '#36a4a0',
  },
  {
    id: 'amihan',
    name: 'Amihan',
    title: 'The Herbalist',
    lore: 'Her herbs mend wounds that no one else can.',
    hp: 6,
    armor: 4,
    energy: 220,
    speed: 74,
    weapons: ['tirador', 'sumpit'],
    skill: { name: 'Hilot', desc: 'Heal 2 HP and restore your amulets', cooldown: 15 },
    color: '#f08428',
  },
];

export interface WeaponDef {
  id: WeaponId;
  name: string;
  damage: number;
  rate: number; // seconds between shots
  speed: number;
  energy: number;
  spread: number; // radians of random deviation
  pellets: number;
  sprite: BulletSprite;
  radius: number;
  pierce: boolean;
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  tirador: { id: 'tirador', name: 'Tirador', damage: 3, rate: 0.3, speed: 230, energy: 0, spread: 0.06, pellets: 1, sprite: 'shot_pebble', radius: 2.5, pierce: false },
  lantaka: { id: 'lantaka', name: 'Lantaka', damage: 2, rate: 0.6, speed: 210, energy: 2, spread: 0.45, pellets: 5, sprite: 'shot_scatter', radius: 2, pierce: false },
  sumpit: { id: 'sumpit', name: 'Sumpit', damage: 2, rate: 0.12, speed: 270, energy: 0.5, spread: 0.12, pellets: 1, sprite: 'shot_dart', radius: 2.5, pierce: false },
  agimat: { id: 'agimat', name: 'Agimat Rod', damage: 6, rate: 0.5, speed: 160, energy: 3, spread: 0.02, pellets: 1, sprite: 'shot_spirit', radius: 4, pierce: true },
};

export interface EnemyDef {
  name: string;
  hp: number;
  speed: number;
  radius: number;
  contact: number;
  size: number; // render size in world px
  coins: number;
}

export const ENEMIES: Record<EnemyType, EnemyDef> = {
  duwende: { name: 'Duwende', hp: 7, speed: 26, radius: 6, contact: 1, size: 16, coins: 1 },
  manananggal: { name: 'Manananggal', hp: 4, speed: 52, radius: 5, contact: 1, size: 16, coins: 1 },
  tikbalang: { name: 'Tikbalang', hp: 9, speed: 28, radius: 6, contact: 1, size: 16, coins: 2 },
  kapre: { name: 'Kapre', hp: 13, speed: 20, radius: 6, contact: 1, size: 16, coins: 2 },
  bakunawa: { name: 'Bakunawa', hp: 360, speed: 22, radius: 13, contact: 2, size: 32, coins: 30 },
};

export const BOSS_NAME = 'BAKUNAWA';
