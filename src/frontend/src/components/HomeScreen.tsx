import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Coins,
  Crown,
  Play,
  ShoppingBag,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import type { PlayerProfile } from "../backend.d";
import { UserPlan } from "../backend.d";

interface HomeScreenProps {
  profile: PlayerProfile;
  onPlay: () => void;
  onShop: () => void;
  onPlans: () => void;
  onLeaderboard: () => void;
}

const PLAN_COLORS: Record<UserPlan, string> = {
  [UserPlan.free]: "text-muted-foreground",
  [UserPlan.pro]: "text-neon-cyan",
  [UserPlan.elite]: "text-neon-yellow",
};

const PLAN_LABELS: Record<UserPlan, string> = {
  [UserPlan.free]: "Free",
  [UserPlan.pro]: "Pro",
  [UserPlan.elite]: "Elite",
};

export default function HomeScreen({
  profile,
  onPlay,
  onShop,
  onPlans,
  onLeaderboard,
}: HomeScreenProps) {
  const plan = profile.plan;

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center starfield overflow-hidden px-4 py-8">
      {/* Animated bg rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="absolute w-[600px] h-[600px] rounded-full border border-primary/5 animate-spin"
          style={{ animationDuration: "30s" }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full border border-accent/5 animate-spin"
          style={{ animationDuration: "20s", animationDirection: "reverse" }}
        />
        <div
          className="absolute w-[200px] h-[200px] rounded-full border border-neon-cyan/10 animate-spin"
          style={{ animationDuration: "10s" }}
        />
      </div>

      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex justify-between items-center mb-8 space-card rounded-xl px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-neon-yellow" />
          <span className="font-body text-sm text-muted-foreground">Level</span>
          <span className="font-display font-bold text-neon-cyan">
            {Number(profile.level)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-neon-yellow" />
          <span className="font-body text-sm text-muted-foreground">Coins</span>
          <span className="font-display font-bold text-neon-yellow">
            {Number(profile.coins)}
          </span>
        </div>
        <Badge
          className={`${PLAN_COLORS[plan]} bg-space-surface border-border/50 text-xs font-display`}
        >
          <Crown className="w-3 h-3 mr-1" />
          {PLAN_LABELS[plan]}
        </Badge>
      </motion.div>

      {/* Logo / Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="text-center mb-12"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="text-8xl mb-4 select-none"
        >
          🚀
        </motion.div>
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight glow-cyan text-neon-cyan leading-none mb-2">
          COSMIC
        </h1>
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight glow-magenta text-neon-magenta leading-none">
          SURGE
        </h1>
        <p className="font-body text-muted-foreground mt-4 text-sm tracking-widest uppercase">
          2000+ Levels · Space Shooter
        </p>
      </motion.div>

      {/* Stats mini row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-6 mb-10"
      >
        {[
          {
            label: "Best Score",
            value: Number(profile.highScore).toLocaleString(),
            color: "text-neon-yellow",
          },
          {
            label: "Total Score",
            value: Number(profile.totalScore).toLocaleString(),
            color: "text-neon-green",
          },
          {
            label: "Lives",
            value: Number(profile.lives),
            color: "text-neon-magenta",
          },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className={`font-display font-bold text-lg ${stat.color}`}>
              {stat.value}
            </p>
            <p className="font-body text-xs text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button
          data-ocid="game.play_button"
          onClick={onPlay}
          size="lg"
          className="w-full font-display font-bold text-lg tracking-wider bg-neon-cyan text-space-deep hover:bg-neon-cyan/90 border-0 shadow-neon-cyan transition-all duration-200 hover:scale-105 h-14"
          style={{
            background: "oklch(0.82 0.2 200)",
            color: "oklch(0.06 0.015 270)",
          }}
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          PLAY LEVEL {Number(profile.level)}
        </Button>

        <div className="grid grid-cols-3 gap-2">
          <Button
            data-ocid="nav.shop_button"
            onClick={onShop}
            variant="outline"
            className="font-display font-semibold text-sm border-border/50 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all"
          >
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            Shop
          </Button>
          <Button
            data-ocid="nav.plans_button"
            onClick={onPlans}
            variant="outline"
            className="font-display font-semibold text-sm border-border/50 hover:border-neon-yellow/50 hover:text-neon-yellow transition-all"
          >
            <Crown className="w-4 h-4 mr-1.5" />
            Plans
          </Button>
          <Button
            data-ocid="nav.leaderboard_button"
            onClick={onLeaderboard}
            variant="outline"
            className="font-display font-semibold text-sm border-border/50 hover:border-neon-magenta/50 hover:text-neon-magenta transition-all"
          >
            <Trophy className="w-4 h-4 mr-1.5" />
            Ranks
          </Button>
        </div>
      </motion.div>

      {/* Coins display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-2 text-muted-foreground text-sm"
      >
        <Coins className="w-4 h-4 text-neon-yellow" />
        <span className="font-body">
          {Number(profile.coins)} coins available
        </span>
      </motion.div>

      {/* Controls hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4 text-xs text-muted-foreground/60 font-body text-center"
      >
        ← → Arrow Keys / A D / Mouse to move • Auto-shoots
      </motion.p>
    </div>
  );
}
