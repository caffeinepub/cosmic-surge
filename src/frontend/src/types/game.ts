// ─── Screen / Route Types ──────────────────────────────────────────────────
export type GameScreen =
  | "home"
  | "game"
  | "level-complete"
  | "game-over"
  | "shop"
  | "plans"
  | "leaderboard";

// ─── Game Object Types ─────────────────────────────────────────────────────
export type EnemyType = "basic" | "fast" | "tank" | "shooter";

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export interface PlayerShip {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  shield: number; // hits before losing a life
  shieldMax: number;
  lives: number;
  invincibleTimer: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  isPlayer: boolean;
}

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  type: EnemyType;
  vx: number;
  vy: number;
  shootTimer: number;
  shootCooldown: number;
  points: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

// ─── Game State (mutable refs) ─────────────────────────────────────────────
export interface GameState {
  stars: Star[];
  player: PlayerShip;
  bullets: Bullet[];
  enemies: Enemy[];
  particles: Particle[];
  score: number;
  coinsEarned: number;
  level: number;
  keys: Record<string, boolean>;
  mouseX: number | null;
  shootTimer: number;
  shootCooldown: number;
  running: boolean;
  paused: boolean;
  waveCleared: boolean;
  // upgrades applied
  upgrades: {
    weaponPower: number; // 0-5
    shield: number; // 0-3
    speedBoost: number; // 0-3
    multiShot: number; // 0-3
    rapidFire: number; // 0-5
  };
}

// ─── Upgrade IDs ──────────────────────────────────────────────────────────
export const UPGRADE_NAMES: Record<number, keyof GameState["upgrades"]> = {
  1: "weaponPower",
  2: "shield",
  3: "speedBoost",
  4: "multiShot",
  5: "rapidFire",
};
