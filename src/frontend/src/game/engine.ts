import type { LevelConfig } from "../backend.d";
import type {
  Bullet,
  Enemy,
  EnemyType,
  GameState,
  Particle,
  Star,
} from "../types/game";

// ─── Canvas color literals (cannot use CSS vars here) ────────────────────
export const COLORS = {
  cyan: "#00e5ff",
  magenta: "#ff00aa",
  yellow: "#ffe800",
  green: "#00ff88",
  orange: "#ff8c00",
  white: "#ffffff",
  dimWhite: "rgba(255,255,255,0.6)",
  red: "#ff3366",
  // Enemies
  basic: "#7b68ee",
  fast: "#00e5ff",
  tank: "#ff8c00",
  shooter: "#ff3366",
  // Background
  bg: "#0a0a14",
};

// ─── Star field init ───────────────────────────────────────────────────────
export function initStars(count: number, w: number, h: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 2 + 0.3,
    speed: Math.random() * 0.8 + 0.2,
    opacity: Math.random() * 0.8 + 0.2,
  }));
}

// ─── Level → enemy config ──────────────────────────────────────────────────
export function buildEnemyConfig(
  level: number,
  serverConfig: LevelConfig | null | undefined,
  canvasW: number,
  _canvasH: number,
): Enemy[] {
  const count = serverConfig
    ? Number(serverConfig.enemyCount)
    : Math.min(5 + Math.floor(level * 0.8), 40);
  const speedMult = serverConfig
    ? serverConfig.speedMultiplier
    : 1 + level * 0.04;
  const typesStr = serverConfig ? serverConfig.enemyTypes : "basic";
  const types = typesStr.split(",").map((t) => t.trim()) as EnemyType[];

  const enemies: Enemy[] = [];
  const cols = Math.min(count, 10);
  const _rows = Math.ceil(count / cols);
  const gapX = canvasW / (cols + 1);

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const type = types[i % types.length] as EnemyType;

    let hp = 1;
    let pts = 100;
    let spd = 1.2 * speedMult;
    let clr = COLORS.basic;

    switch (type) {
      case "fast":
        hp = 1;
        pts = 150;
        spd = 2.5 * speedMult;
        clr = COLORS.fast;
        break;
      case "tank":
        hp = 4;
        pts = 300;
        spd = 0.6 * speedMult;
        clr = COLORS.orange;
        break;
      case "shooter":
        hp = 2;
        pts = 250;
        spd = 1.0 * speedMult;
        clr = COLORS.shooter;
        break;
      default:
        hp = 1;
        pts = 100;
        spd = 1.2 * speedMult;
        clr = COLORS.basic;
    }

    enemies.push({
      x: gapX * (col + 1) - 16,
      y: 60 + row * 70,
      width: 32,
      height: 28,
      hp,
      maxHp: hp,
      type,
      vx: spd,
      vy: 0.3 * speedMult,
      shootTimer: Math.random() * 200,
      shootCooldown: type === "shooter" ? 90 + Math.random() * 60 : 9999,
      points: pts,
      color: clr,
    });
  }
  return enemies;
}

// ─── Update starfield ─────────────────────────────────────────────────────
export function updateStars(stars: Star[], dt: number, h: number): void {
  for (const s of stars) {
    s.y += s.speed * dt * 0.06;
    if (s.y > h) {
      s.y = 0;
      s.x = Math.random() * 1000;
    }
  }
}

// ─── Update player ────────────────────────────────────────────────────────
export function updatePlayer(
  state: GameState,
  dt: number,
  canvasW: number,
  _canvasH: number,
): void {
  const p = state.player;
  const baseSpeed = 4 + state.upgrades.speedBoost * 0.8;
  const speed = baseSpeed * (dt / 16);

  if (state.keys.ArrowLeft || state.keys.a || state.keys.A) {
    p.x -= speed;
  }
  if (state.keys.ArrowRight || state.keys.d || state.keys.D) {
    p.x += speed;
  }

  // Mouse follow
  if (state.mouseX !== null) {
    const diff = state.mouseX - (p.x + p.width / 2);
    const move =
      Math.sign(diff) * Math.min(Math.abs(diff) * 0.12, baseSpeed * (dt / 16));
    p.x += move;
  }

  // Clamp
  p.x = Math.max(0, Math.min(canvasW - p.width, p.x));

  // Invincibility timer
  if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
}

// ─── Player shooting ──────────────────────────────────────────────────────
export function handleShooting(state: GameState, dt: number): Bullet[] {
  state.shootTimer -= dt;
  const newBullets: Bullet[] = [];

  if (state.shootTimer <= 0) {
    state.shootTimer = state.shootCooldown;
    const damage = 1 + state.upgrades.weaponPower;
    const cx = state.player.x + state.player.width / 2;
    const cy = state.player.y;

    const multiShot = state.upgrades.multiShot;

    if (multiShot === 0) {
      newBullets.push(makeBullet(cx, cy, 0, -12, damage, true));
    } else if (multiShot === 1) {
      newBullets.push(makeBullet(cx - 8, cy, 0, -12, damage, true));
      newBullets.push(makeBullet(cx + 8, cy, 0, -12, damage, true));
    } else {
      newBullets.push(makeBullet(cx, cy, 0, -13, damage, true));
      newBullets.push(makeBullet(cx - 10, cy + 4, -1, -12, damage, true));
      newBullets.push(makeBullet(cx + 10, cy + 4, 1, -12, damage, true));
    }
  }
  return newBullets;
}

function makeBullet(
  x: number,
  y: number,
  vx: number,
  vy: number,
  damage: number,
  isPlayer: boolean,
): Bullet {
  return {
    x,
    y,
    vx,
    vy,
    width: 4,
    height: isPlayer ? 14 : 10,
    damage,
    isPlayer,
  };
}

// ─── Update enemies ────────────────────────────────────────────────────────
export function updateEnemies(
  enemies: Enemy[],
  dt: number,
  canvasW: number,
  level: number,
): { newBullets: Bullet[]; reachedBottom: boolean } {
  const newBullets: Bullet[] = [];
  let reachedBottom = false;
  let edgeHit = false;

  for (const e of enemies) {
    e.x += e.vx * (dt / 16);
    e.y += e.vy * (dt / 16) * 0.1;

    if (e.type === "fast") {
      e.vy = Math.sin(Date.now() * 0.003 + e.x) * 1.5;
    }

    // Bounce off walls
    if (e.x <= 0 || e.x + e.width >= canvasW) {
      edgeHit = true;
    }

    if (e.y > 700) reachedBottom = true;

    // Shooter AI
    if (level >= 10 && e.type === "shooter") {
      e.shootTimer -= dt;
      if (e.shootTimer <= 0) {
        e.shootTimer = e.shootCooldown;
        newBullets.push(
          makeBullet(e.x + e.width / 2, e.y + e.height, 0, 5, 1, false),
        );
      }
    }
  }

  // Reverse horizontal direction on edge hit
  if (edgeHit) {
    for (const e of enemies) {
      e.vx *= -1;
      e.y += 8;
    }
  }

  return { newBullets, reachedBottom };
}

// ─── Update bullets ────────────────────────────────────────────────────────
export function updateBullets(bullets: Bullet[], dt: number): Bullet[] {
  return bullets
    .map((b) => ({
      ...b,
      x: b.x + b.vx * (dt / 16),
      y: b.y + b.vy * (dt / 16),
    }))
    .filter((b) => b.y > -20 && b.y < 750 && b.x > -20 && b.x < 1200);
}

// ─── Collision detection ───────────────────────────────────────────────────
function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export interface CollisionResult {
  killedEnemies: Enemy[];
  scoreGained: number;
  coinsGained: number;
  playerHit: boolean;
  remainingBullets: Bullet[];
  remainingEnemies: Enemy[];
  newParticles: Particle[];
}

export function resolveCollisions(
  state: GameState,
  canvasW: number,
): CollisionResult {
  const { bullets, enemies, player } = state;
  const deadEnemies = new Set<Enemy>();
  const deadBullets = new Set<Bullet>();
  const newParticles: Particle[] = [];
  let scoreGained = 0;
  let coinsGained = 0;
  let playerHit = false;

  // Player bullets vs enemies
  for (const b of bullets) {
    if (!b.isPlayer) continue;
    for (const e of enemies) {
      if (deadEnemies.has(e)) continue;
      if (
        rectsOverlap(b.x, b.y, b.width, b.height, e.x, e.y, e.width, e.height)
      ) {
        e.hp -= b.damage;
        deadBullets.add(b);
        if (e.hp <= 0) {
          deadEnemies.add(e);
          scoreGained += e.points;
          coinsGained += Math.floor(e.points / 50);
          spawnExplosion(
            newParticles,
            e.x + e.width / 2,
            e.y + e.height / 2,
            e.color,
            canvasW,
          );
        }
        break;
      }
    }
  }

  // Enemy bullets vs player
  if (player.invincibleTimer <= 0) {
    for (const b of bullets) {
      if (b.isPlayer) continue;
      if (
        rectsOverlap(
          b.x,
          b.y,
          b.width,
          b.height,
          player.x + 4,
          player.y + 4,
          player.width - 8,
          player.height - 8,
        )
      ) {
        deadBullets.add(b);
        playerHit = true;
        spawnExplosion(
          newParticles,
          player.x + player.width / 2,
          player.y,
          COLORS.cyan,
          canvasW,
        );
        break;
      }
    }
  }

  // Enemies touching player
  if (player.invincibleTimer <= 0 && !playerHit) {
    for (const e of enemies) {
      if (deadEnemies.has(e)) continue;
      if (
        rectsOverlap(
          e.x,
          e.y,
          e.width,
          e.height,
          player.x + 4,
          player.y + 4,
          player.width - 8,
          player.height - 8,
        )
      ) {
        deadEnemies.add(e);
        playerHit = true;
        scoreGained += e.points;
        spawnExplosion(newParticles, e.x + e.width / 2, e.y, e.color, canvasW);
        break;
      }
    }
  }

  return {
    killedEnemies: [...deadEnemies],
    scoreGained,
    coinsGained,
    playerHit,
    remainingBullets: bullets.filter((b) => !deadBullets.has(b)),
    remainingEnemies: enemies.filter((e) => !deadEnemies.has(e)),
    newParticles,
  };
}

// ─── Particles ────────────────────────────────────────────────────────────
function spawnExplosion(
  particles: Particle[],
  x: number,
  y: number,
  color: string,
  _canvasW: number,
): void {
  const count = 8 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      size: Math.random() * 4 + 1,
      color,
    });
  }
}

export function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * (dt / 16),
      y: p.y + p.vy * (dt / 16),
      vx: p.vx * 0.96,
      vy: p.vy * 0.96,
      life: p.life - 0.035 * (dt / 16),
    }))
    .filter((p) => p.life > 0);
}

// ─── Rendering ────────────────────────────────────────────────────────────
export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasW: number,
  canvasH: number,
): void {
  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Stars
  for (const s of state.stars) {
    ctx.globalAlpha = s.opacity;
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1;

  // Particles
  for (const p of state.particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Enemies
  for (const e of state.enemies) {
    drawEnemy(ctx, e);
  }

  // Bullets
  for (const b of state.bullets) {
    if (b.isPlayer) {
      // Neon cyan player bullet
      ctx.shadowBlur = 12;
      ctx.shadowColor = COLORS.cyan;
      ctx.fillStyle = COLORS.cyan;
      ctx.beginPath();
      ctx.roundRect(b.x - b.width / 2, b.y, b.width, b.height, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Red enemy bullet
      ctx.shadowBlur = 8;
      ctx.shadowColor = COLORS.red;
      ctx.fillStyle = COLORS.red;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Player ship
  const p = state.player;
  if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer / 80) % 2 === 0) {
    // Flashing when invincible
  } else {
    drawPlayerShip(ctx, p);
  }

  // Shield bar (if shielded)
  if (state.upgrades.shield > 0) {
    const sw = p.width;
    const sh = 4;
    const sx = p.x;
    const sy = p.y + p.height + 6;
    ctx.fillStyle = "rgba(0,229,255,0.2)";
    ctx.fillRect(sx, sy, sw, sh);
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(sx, sy, sw * (p.shield / p.shieldMax), sh);
  }
}

function drawPlayerShip(
  ctx: CanvasRenderingContext2D,
  p: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
): void {
  const cx = p.x + p.width / 2;
  const cy = p.y;
  const w = p.width;
  const h = p.height;

  ctx.shadowBlur = 20;
  ctx.shadowColor = COLORS.cyan;

  // Main body
  ctx.fillStyle = COLORS.cyan;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - w / 2, cy + h);
  ctx.lineTo(cx - w / 4, cy + h * 0.7);
  ctx.lineTo(cx, cy + h * 0.4);
  ctx.lineTo(cx + w / 4, cy + h * 0.7);
  ctx.lineTo(cx + w / 2, cy + h);
  ctx.closePath();
  ctx.fill();

  // Cockpit highlight
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.35, w * 0.1, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Engine glow
  ctx.shadowColor = COLORS.magenta;
  ctx.fillStyle = COLORS.magenta;
  ctx.beginPath();
  ctx.ellipse(cx, cy + h + 4, w * 0.15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy): void {
  const cx = e.x + e.width / 2;
  const cy = e.y + e.height / 2;

  ctx.shadowBlur = 10;
  ctx.shadowColor = e.color;

  switch (e.type) {
    case "basic": {
      ctx.fillStyle = e.color;
      // Inverted triangle ship
      ctx.beginPath();
      ctx.moveTo(cx, e.y + e.height);
      ctx.lineTo(e.x, e.y);
      ctx.lineTo(e.x + e.width, e.y);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "fast": {
      ctx.fillStyle = e.color;
      // Diamond shape
      ctx.beginPath();
      ctx.moveTo(cx, e.y);
      ctx.lineTo(e.x + e.width, cy);
      ctx.lineTo(cx, e.y + e.height);
      ctx.lineTo(e.x, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "tank": {
      ctx.fillStyle = e.color;
      // Wide hexagon
      ctx.beginPath();
      const hw = e.width / 2;
      const _hh = e.height / 2;
      ctx.moveTo(cx - hw * 0.5, e.y);
      ctx.lineTo(cx + hw * 0.5, e.y);
      ctx.lineTo(cx + hw, cy);
      ctx.lineTo(cx + hw * 0.5, e.y + e.height);
      ctx.lineTo(cx - hw * 0.5, e.y + e.height);
      ctx.lineTo(cx - hw, cy);
      ctx.closePath();
      ctx.fill();
      // HP bar
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(e.x, e.y - 8, e.width, 4);
      ctx.fillStyle = COLORS.green;
      ctx.fillRect(e.x, e.y - 8, e.width * (e.hp / e.maxHp), 4);
      break;
    }
    case "shooter": {
      ctx.fillStyle = e.color;
      // X cross shape
      const t = 5;
      ctx.beginPath();
      ctx.rect(cx - t, e.y, t * 2, e.height);
      ctx.fill();
      ctx.beginPath();
      ctx.rect(e.x, cy - t, e.width, t * 2);
      ctx.fill();
      break;
    }
  }

  ctx.shadowBlur = 0;
}

// ─── Compute shoot cooldown from upgrades ─────────────────────────────────
export function computeShootCooldown(rapidFire: number): number {
  // Base 400ms, reduced by 50ms per rapid fire level
  return Math.max(100, 400 - rapidFire * 60);
}

// ─── Level complete coin formula ─────────────────────────────────────────
export function computeLevelCoins(level: number, score: number): number {
  return 10 + level * 2 + Math.floor(score / 200);
}
