import React, { useRef, useEffect, useCallback } from "react";
import type { LevelConfig } from "../backend.d";
import {
  buildEnemyConfig,
  computeLevelCoins,
  computeShootCooldown,
  handleShooting,
  initStars,
  render,
  resolveCollisions,
  updateBullets,
  updateEnemies,
  updateParticles,
  updatePlayer,
  updateStars,
} from "../game/engine";
import type { GameState } from "../types/game";

interface GameCanvasProps {
  level: number;
  initialLives: number;
  levelConfig: LevelConfig | null | undefined;
  upgrades: GameState["upgrades"];
  onLevelComplete: (score: number, coinsEarned: number) => void;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number, coins: number) => void;
  paused: boolean;
  onPauseChange: (paused: boolean) => void;
}

const CANVAS_W = 480;
const CANVAS_H = 700;
const STAR_COUNT = 150;

export default function GameCanvas({
  level,
  initialLives,
  levelConfig,
  upgrades,
  onLevelComplete,
  onGameOver,
  onScoreUpdate,
  paused,
  onPauseChange,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const animFrameId = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const onLevelCompleteRef = useRef(onLevelComplete);
  const onGameOverRef = useRef(onGameOver);
  const onScoreUpdateRef = useRef(onScoreUpdate);
  const pausedRef = useRef(paused);

  // Keep callback refs fresh
  useEffect(() => {
    onLevelCompleteRef.current = onLevelComplete;
  }, [onLevelComplete]);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);
  useEffect(() => {
    onScoreUpdateRef.current = onScoreUpdate;
  }, [onScoreUpdate]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // ── Init game state ─────────────────────────────────────────────────────
  const initState = useCallback(() => {
    const shieldMax = Math.max(0, upgrades.shield);
    const enemies = buildEnemyConfig(level, levelConfig, CANVAS_W, CANVAS_H);

    stateRef.current = {
      stars: initStars(STAR_COUNT, CANVAS_W, CANVAS_H),
      player: {
        x: CANVAS_W / 2 - 18,
        y: CANVAS_H - 90,
        width: 36,
        height: 42,
        speed: 5,
        shield: shieldMax,
        shieldMax: shieldMax || 1,
        lives: initialLives,
        invincibleTimer: 0,
      },
      bullets: [],
      enemies,
      particles: [],
      score: 0,
      coinsEarned: 0,
      level,
      keys: {},
      mouseX: null,
      shootTimer: 0,
      shootCooldown: computeShootCooldown(upgrades.rapidFire),
      running: true,
      paused: false,
      waveCleared: false,
      upgrades,
    };
  }, [level, initialLives, levelConfig, upgrades]);

  // ── Input listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current) stateRef.current.keys[e.key] = true;
      if (e.key === " " || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
      }
      if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        onPauseChange(!pausedRef.current);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (stateRef.current) stateRef.current.keys[e.key] = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !stateRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      stateRef.current.mouseX = (e.clientX - rect.left) * scaleX;
    };
    const onTouchMove = (e: TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !stateRef.current) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      stateRef.current.mouseX = (e.touches[0].clientX - rect.left) * scaleX;
    };
    const onMouseLeave = () => {
      if (stateRef.current) stateRef.current.mouseX = null;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("touchmove", onTouchMove, { passive: false });
      canvas.addEventListener("mouseleave", onMouseLeave);
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (canvas) {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("touchmove", onTouchMove);
        canvas.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [onPauseChange]);

  // ── Game loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    initState();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let finished = false;

    const loop = (timestamp: number) => {
      if (finished) return;
      const dt = Math.min(timestamp - (lastTimeRef.current || timestamp), 50);
      lastTimeRef.current = timestamp;

      const state = stateRef.current;
      if (!state) {
        animFrameId.current = requestAnimationFrame(loop);
        return;
      }

      if (!pausedRef.current && state.running) {
        // Update stars
        updateStars(state.stars, dt, CANVAS_H);

        // Update player
        updatePlayer(state, dt, CANVAS_W, CANVAS_H);

        // Shooting
        const newPlayerBullets = handleShooting(state, dt);
        state.bullets = [...state.bullets, ...newPlayerBullets];

        // Update enemies
        const { newBullets: newEnemyBullets } = updateEnemies(
          state.enemies,
          dt,
          CANVAS_W,
          level,
        );
        state.bullets = [...state.bullets, ...newEnemyBullets];

        // Update bullets
        state.bullets = updateBullets(state.bullets, dt);

        // Collisions
        const result = resolveCollisions(state, CANVAS_W);
        state.bullets = result.remainingBullets;
        state.enemies = result.remainingEnemies;
        state.score += result.scoreGained;
        state.coinsEarned += result.coinsGained;
        state.particles = [...state.particles, ...result.newParticles];

        if (result.playerHit) {
          if (state.player.shield > 0) {
            state.player.shield -= 1;
            state.player.invincibleTimer = 800;
          } else {
            state.player.lives -= 1;
            state.player.invincibleTimer = 1500;
            state.player.shield = state.player.shieldMax;
            if (state.player.lives <= 0) {
              finished = true;
              state.running = false;
              onGameOverRef.current(state.score);
              render(ctx, state, CANVAS_W, CANVAS_H);
              return;
            }
          }
        }

        // Update particles
        state.particles = updateParticles(state.particles, dt);

        // Score callback (throttle to every ~200ms via score changes)
        onScoreUpdateRef.current(state.score, state.coinsEarned);

        // Wave cleared?
        if (state.enemies.length === 0 && !state.waveCleared) {
          state.waveCleared = true;
          state.running = false;
          finished = true;
          const totalCoins = computeLevelCoins(level, state.score);
          onLevelCompleteRef.current(state.score, totalCoins);
          render(ctx, state, CANVAS_W, CANVAS_H);
          return;
        }
      }

      render(ctx, state, CANVAS_W, CANVAS_H);

      // Pause overlay
      if (pausedRef.current) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 48px 'Bricolage Grotesque', sans-serif";
        ctx.textAlign = "center";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00e5ff";
        ctx.fillText("PAUSED", CANVAS_W / 2, CANVAS_H / 2);
        ctx.shadowBlur = 0;
        ctx.font = "18px 'Outfit', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText(
          "Press P or ESC to resume",
          CANVAS_W / 2,
          CANVAS_H / 2 + 44,
        );
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      finished = true;
      cancelAnimationFrame(animFrameId.current);
    };
  }, [level, initState]);

  return (
    <canvas
      ref={canvasRef}
      data-ocid="game.canvas_target"
      width={CANVAS_W}
      height={CANVAS_H}
      tabIndex={0}
      className="w-full max-w-[480px] rounded-lg outline-none cursor-none"
      style={{
        imageRendering: "pixelated",
        boxShadow:
          "0 0 40px oklch(0.75 0.18 200 / 0.3), 0 0 80px oklch(0.75 0.18 200 / 0.1)",
      }}
    />
  );
}
