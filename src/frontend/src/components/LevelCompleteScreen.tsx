import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingBag, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { UserPlan } from "../backend.d";

interface LevelCompleteScreenProps {
  level: number;
  score: number;
  coins: number;
  totalCoins: number;
  plan: UserPlan;
  onNext: () => void;
  onShop: () => void;
  onHome: () => void;
  onPlans: () => void;
}

export default function LevelCompleteScreen({
  level,
  score,
  coins,
  totalCoins,
  plan,
  onNext,
  onShop,
  onHome,
  onPlans,
}: LevelCompleteScreenProps) {
  const completedLevel = level;
  const nextLevel = level + 1;
  const isProLimit = completedLevel >= 500 && plan === UserPlan.pro;
  const isFreeLimit = completedLevel >= 50 && plan === UserPlan.free;
  const needsUpsell = isProLimit || isFreeLimit;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center starfield px-4 py-8">
      {/* Stars burst */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-7xl mb-6 select-none"
      >
        ⭐
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <p className="font-body text-muted-foreground text-sm tracking-widest uppercase mb-2">
          Level Cleared!
        </p>
        <h2 className="font-display text-6xl font-extrabold text-neon-cyan glow-cyan">
          {completedLevel}
        </h2>
      </motion.div>

      {/* Score / Coins */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="space-card rounded-2xl p-6 w-full max-w-xs mb-8 grid grid-cols-2 gap-4"
      >
        <div className="text-center">
          <Trophy className="w-6 h-6 text-neon-yellow mx-auto mb-2" />
          <p className="font-display text-2xl font-bold text-neon-yellow">
            {score.toLocaleString()}
          </p>
          <p className="font-body text-xs text-muted-foreground mt-1">Score</p>
        </div>
        <div className="text-center">
          <Star className="w-6 h-6 text-neon-green mx-auto mb-2" />
          <p className="font-display text-2xl font-bold text-neon-green">
            +{coins}
          </p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Coins Earned
          </p>
        </div>
        <div className="col-span-2 border-t border-border/30 pt-3 text-center">
          <p className="font-body text-sm text-muted-foreground">
            Total coins:{" "}
            <span className="text-neon-yellow font-bold">{totalCoins}</span>
          </p>
        </div>
      </motion.div>

      {/* Upsell if at plan limit */}
      {needsUpsell && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xs mb-6 rounded-xl border border-neon-yellow/30 bg-neon-yellow/5 p-4 text-center"
        >
          <p className="font-display font-bold text-neon-yellow text-sm mb-1">
            {isFreeLimit ? "🚀 Upgrade to Pro!" : "👑 Upgrade to Elite!"}
          </p>
          <p className="font-body text-xs text-muted-foreground mb-3">
            {isFreeLimit
              ? "Free plan ends at level 50. Go Pro for 500 levels!"
              : "Pro plan ends at level 500. Go Elite for 2000+ levels!"}
          </p>
          <Button
            data-ocid="nav.plans_button"
            onClick={onPlans}
            size="sm"
            className="font-display font-bold bg-neon-yellow text-space-deep hover:bg-neon-yellow/90 border-0"
            style={{
              background: "oklch(0.88 0.2 90)",
              color: "oklch(0.06 0.015 270)",
            }}
          >
            View Plans
          </Button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        {!needsUpsell && (
          <Button
            data-ocid="level_complete.next_button"
            onClick={onNext}
            size="lg"
            className="w-full font-display font-bold text-lg h-14 border-0"
            style={{
              background: "oklch(0.82 0.2 200)",
              color: "oklch(0.06 0.015 270)",
            }}
          >
            Level {nextLevel}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        )}
        <Button
          data-ocid="level_complete.shop_button"
          onClick={onShop}
          variant="outline"
          size="lg"
          className="w-full font-display font-semibold border-border/50 hover:border-neon-cyan/50"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Upgrade Shop
        </Button>
        <Button
          data-ocid="nav.home_button"
          onClick={onHome}
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground"
        >
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
