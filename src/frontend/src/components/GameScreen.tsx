import { Button } from "@/components/ui/button";
import { Home, Pause, Play, ShoppingBag } from "lucide-react";
import React, { useState, useCallback } from "react";
import type { LevelConfig } from "../backend.d";
import type { GameState } from "../types/game";
import GameCanvas from "./GameCanvas";

interface GameScreenProps {
  level: number;
  lives: number;
  coins: number;
  levelConfig: LevelConfig | null | undefined;
  upgrades: GameState["upgrades"];
  onLevelComplete: (score: number, coinsEarned: number) => void;
  onGameOver: (score: number) => void;
  onHome: () => void;
  onShop: () => void;
}

export default function GameScreen({
  level,
  lives,
  coins,
  levelConfig,
  upgrades,
  onLevelComplete,
  onGameOver,
  onHome,
  onShop,
}: GameScreenProps) {
  const [score, setScore] = useState(0);
  const [livesCur] = useState(lives);
  const [coinsCur, setCoinsCur] = useState(0);
  const [paused, setPaused] = useState(false);

  const handleScoreUpdate = useCallback((s: number, c: number) => {
    setScore(s);
    setCoinsCur(c);
  }, []);

  const handleGameOver = useCallback(
    (finalScore: number) => {
      onGameOver(finalScore);
    },
    [onGameOver],
  );

  return (
    <div className="min-h-dvh flex flex-col items-center starfield py-3 px-2">
      {/* HUD */}
      <div className="w-full max-w-[480px] mb-3 flex items-center justify-between gap-2 px-1">
        <Button
          data-ocid="nav.home_button"
          variant="ghost"
          size="icon"
          onClick={onHome}
          className="h-8 w-8 text-muted-foreground hover:text-neon-cyan shrink-0"
        >
          <Home className="w-4 h-4" />
        </Button>

        <div className="flex gap-2 text-xs font-display font-bold flex-1 justify-center">
          <div
            data-ocid="hud.level_panel"
            className="space-card rounded-lg px-3 py-1.5 flex items-center gap-1.5"
          >
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
              LVL
            </span>
            <span className="text-neon-cyan text-sm">{level}</span>
          </div>
          <div
            data-ocid="hud.score_panel"
            className="space-card rounded-lg px-3 py-1.5 flex items-center gap-1.5"
          >
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
              SCR
            </span>
            <span className="text-neon-yellow text-sm">
              {score.toLocaleString()}
            </span>
          </div>
          <div
            data-ocid="hud.lives_panel"
            className="space-card rounded-lg px-3 py-1.5 flex items-center gap-1"
          >
            {["l1", "l2", "l3"].slice(0, Math.max(0, livesCur)).map((k) => (
              <span key={k} className="text-neon-magenta text-xs">
                ♥
              </span>
            ))}
            {["d1", "d2", "d3"].slice(0, Math.max(0, 3 - livesCur)).map((k) => (
              <span key={k} className="text-muted-foreground/30 text-xs">
                ♥
              </span>
            ))}
          </div>
          <div
            data-ocid="hud.coins_panel"
            className="space-card rounded-lg px-3 py-1.5 flex items-center gap-1.5"
          >
            <span className="text-neon-yellow text-xs">🪙</span>
            <span className="text-neon-yellow text-sm">{coins + coinsCur}</span>
          </div>
        </div>

        <Button
          data-ocid="game.pause_toggle"
          variant="ghost"
          size="icon"
          onClick={() => setPaused((p) => !p)}
          className="h-8 w-8 text-muted-foreground hover:text-neon-cyan shrink-0"
        >
          {paused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 flex items-start justify-center w-full">
        <GameCanvas
          level={level}
          initialLives={lives}
          levelConfig={levelConfig}
          upgrades={upgrades}
          onLevelComplete={onLevelComplete}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          paused={paused}
          onPauseChange={setPaused}
        />
      </div>

      {/* Bottom quick bar */}
      <div className="w-full max-w-[480px] mt-3 flex justify-between items-center px-1">
        <p className="text-xs text-muted-foreground/50 font-body">
          ← → or A/D to move
        </p>
        <Button
          data-ocid="nav.shop_button"
          variant="ghost"
          size="sm"
          onClick={onShop}
          className="text-xs text-muted-foreground hover:text-neon-cyan gap-1 h-7"
        >
          <ShoppingBag className="w-3 h-3" />
          Shop
        </Button>
      </div>
    </div>
  );
}
