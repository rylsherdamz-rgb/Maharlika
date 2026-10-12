export type HeroId = 'knight' | 'rogue' | 'wizard' | 'priestess';
export type WeaponId = 'pistol' | 'shotgun' | 'rifle' | 'staff';
export type EnemyType = 'slime' | 'bat' | 'goblin' | 'skeleton' | 'boss';
export type BulletSprite = 'bullet_player' | 'bullet_enemy' | 'bullet_magic' | 'bullet_pellet';

export interface HeroDef {
  id: HeroId;
  name: string;
  title: string;
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
    id: 'knight',
    name: 'Knight',
    title: 'Steel Vanguard',
    hp: 7,
    armor: 5,
    energy: 180,
    speed: 72,
    weapons: ['rifle', 'pistol'],
    skill: { name: 'Dual Wield', desc: 'Fire twice as fast for 5s', cooldown: 12 },
    color: '#78b4ff',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    title: 'Shadow Blade',
    hp: 5,
    armor: 4,
    energy: 200,
    speed: 84,
    weapons: ['shotgun', 'pistol'],
    skill: { name: 'Shadow Roll', desc: 'Dash and dodge all damage', cooldown: 3 },
    color: '#62cc5c',
  },
  {
    id: 'wizard',
    name: 'Wizard',
    title: 'Arcane Sage',
    hp: 4,
    armor: 3,
    energy: 260,
    speed: 70,
    weapons: ['staff', 'pistol'],
    skill: { name: 'Frost Nova', desc: 'Blast a ring of magic orbs', cooldown: 8 },
    color: '#9c54d6',
  },
  {
    id: 'priestess',
    name: 'Priestess',
    title: 'Dawn Healer',
    hp: 6,
    armor: 4,
    energy: 220,
    speed: 74,
    weapons: ['pistol', 'rifle'],
    skill: { name: 'Holy Light', desc: 'Heal 2 HP and restore armor', cooldown: 15 },
    color: '#fcd854',
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
  pistol: { id: 'pistol', name: 'Old Pistol', damage: 3, rate: 0.3, speed: 230, energy: 0, spread: 0.06, pellets: 1, sprite: 'bullet_player', radius: 2.5, pierce: false },
  shotgun: { id: 'shotgun', name: 'Boomstick', damage: 2, rate: 0.6, speed: 210, energy: 2, spread: 0.45, pellets: 5, sprite: 'bullet_pellet', radius: 2, pierce: false },
  rifle: { id: 'rifle', name: 'Storm Rifle', damage: 2, rate: 0.12, speed: 270, energy: 0.5, spread: 0.12, pellets: 1, sprite: 'bullet_player', radius: 2.5, pierce: false },
  staff: { id: 'staff', name: 'Moon Staff', damage: 6, rate: 0.5, speed: 160, energy: 3, spread: 0.02, pellets: 1, sprite: 'bullet_magic', radius: 4, pierce: true },
};

export interface EnemyDef {
  hp: number;
  speed: number;
  radius: number;
  contact: number;
  size: number; // render size in world px
  coins: number;
}

export const ENEMIES: Record<EnemyType, EnemyDef> = {
  slime: { hp: 7, speed: 26, radius: 6, contact: 1, size: 16, coins: 1 },
  bat: { hp: 4, speed: 52, radius: 5, contact: 1, size: 16, coins: 1 },
  goblin: { hp: 9, speed: 28, radius: 6, contact: 1, size: 16, coins: 2 },
  skeleton: { hp: 13, speed: 20, radius: 6, contact: 1, size: 16, coins: 2 },
  boss: { hp: 360, speed: 22, radius: 13, contact: 2, size: 32, coins: 30 },
};
