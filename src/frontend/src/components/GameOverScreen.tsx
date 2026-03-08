import { Button } from "@/components/ui/button";
import { Home, RotateCcw, Trophy } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  level: number;
  onRetry: () => void;
  onHome: () => void;
}

export default function GameOverScreen({
  score,
  highScore,
  level,
  onRetry,
  onHome,
}: GameOverScreenProps) {
  const isNewHigh = score >= highScore && score > 0;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center starfield px-4 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-8xl mb-6 select-none"
      >
        💥
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <h2 className="font-display text-5xl font-extrabold text-neon-magenta glow-magenta tracking-wider mb-2">
          GAME OVER
        </h2>
        <p className="font-body text-muted-foreground text-sm">
          Reached Level {level}
        </p>
      </motion.div>

      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="space-card rounded-2xl p-6 w-full max-w-xs mb-8"
      >
        <div className="text-center mb-4">
          {isNewHigh && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-xs font-bold text-neon-yellow tracking-widest uppercase mb-2 animate-pulse-glow"
            >
              🏆 New High Score!
            </motion.div>
          )}
          <p className="font-display text-5xl font-extrabold text-neon-yellow glow-yellow">
            {score.toLocaleString()}
          </p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Final Score
          </p>
        </div>

        <div className="border-t border-border/30 pt-4 flex justify-between">
          <div className="text-center">
            <Trophy className="w-5 h-5 text-neon-yellow mx-auto mb-1" />
            <p className="font-display font-bold text-sm text-neon-yellow">
              {highScore.toLocaleString()}
            </p>
            <p className="font-body text-xs text-muted-foreground">Best</p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-sm text-neon-cyan mt-6">
              {level}
            </p>
            <p className="font-body text-xs text-muted-foreground">Level</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button
          data-ocid="gameover.retry_button"
          onClick={onRetry}
          size="lg"
          className="w-full font-display font-bold text-lg h-14 border-0"
          style={{
            background: "oklch(0.72 0.27 330)",
            color: "oklch(0.97 0.01 270)",
          }}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Try Again
        </Button>
        <Button
          data-ocid="gameover.home_button"
          onClick={onHome}
          variant="outline"
          size="lg"
          className="w-full font-display font-semibold border-border/50 hover:border-neon-cyan/50"
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
      </motion.div>
    </div>
  );
}
