import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Loader2, Trophy } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import type { PlayerProfile } from "../backend.d";
import { UserPlan } from "../backend.d";
import { useLeaderboard } from "../hooks/useQueries";

interface LeaderboardScreenProps {
  onBack: () => void;
}

const RANK_COLORS = [
  "text-neon-yellow",
  "text-muted-foreground",
  "text-neon-orange",
];
const RANK_LABELS = ["🥇", "🥈", "🥉"];

const PLAN_BADGE: Record<UserPlan, { label: string; className: string }> = {
  [UserPlan.free]: {
    label: "Free",
    className: "bg-space-surface text-muted-foreground border-border/30",
  },
  [UserPlan.pro]: {
    label: "Pro",
    className: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
  },
  [UserPlan.elite]: {
    label: "Elite",
    className: "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30",
  },
};

// Fallback mock leaderboard
const MOCK_LEADERBOARD: PlayerProfile[] = [
  {
    coins: BigInt(2400),
    plan: UserPlan.elite,
    level: BigInt(1847),
    lives: BigInt(3),
    totalScore: BigInt(4820500),
    highScore: BigInt(480200),
    purchasedUpgrades: [],
  },
  {
    coins: BigInt(1800),
    plan: UserPlan.elite,
    level: BigInt(1523),
    lives: BigInt(3),
    totalScore: BigInt(3651000),
    highScore: BigInt(365100),
    purchasedUpgrades: [],
  },
  {
    coins: BigInt(960),
    plan: UserPlan.pro,
    level: BigInt(498),
    lives: BigInt(3),
    totalScore: BigInt(1242000),
    highScore: BigInt(184200),
    purchasedUpgrades: [],
  },
  {
    coins: BigInt(720),
    plan: UserPlan.pro,
    level: BigInt(350),
    lives: BigInt(3),
    totalScore: BigInt(882000),
    highScore: BigInt(142000),
    purchasedUpgrades: [],
  },
  {
    coins: BigInt(480),
    plan: UserPlan.pro,
    level: BigInt(210),
    lives: BigInt(2),
    totalScore: BigInt(524000),
    highScore: BigInt(98000),
    purchasedUpgrades: [],
  },
  {
    coins: BigInt(320),
    plan: UserPlan.free,
    level: BigInt(48),
    lives: BigInt(3),
    totalScore: BigInt(122000),
    highScore: BigInt(42000),
    purchasedUpgrades: [],
  },
  {
    coins: BigInt(200),
    plan: UserPlan.free,
    level: BigInt(35),
    lives: BigInt(3),
    totalScore: BigInt(87500),
    highScore: BigInt(31000),
    purchasedUpgrades: [],
  },
  {
    coins: BigInt(140),
    plan: UserPlan.free,
    level: BigInt(22),
    lives: BigInt(2),
    totalScore: BigInt(54000),
    highScore: BigInt(22000),
    purchasedUpgrades: [],
  },
  {
    coins: BigInt(80),
    plan: UserPlan.free,
    level: BigInt(14),
    lives: BigInt(3),
    totalScore: BigInt(32000),
    highScore: BigInt(14000),
    purchasedUpgrades: [],
  },
  {
    coins: BigInt(50),
    plan: UserPlan.free,
    level: BigInt(8),
    lives: BigInt(3),
    totalScore: BigInt(18000),
    highScore: BigInt(8000),
    purchasedUpgrades: [],
  },
];

const PILOT_NAMES = [
  "VoidWalker X",
  "NovaBurst",
  "QuantumAce",
  "StellarFury",
  "CosmicHawk",
  "NebulaStrike",
  "OrionBlast",
  "DarkMatterZ",
  "AstroViper",
  "GalacticRogue",
];

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { data: entries, isLoading } = useLeaderboard();
  const board = (
    entries && entries.length > 0 ? entries : MOCK_LEADERBOARD
  ).slice(0, 10);

  return (
    <div className="min-h-dvh flex flex-col starfield px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6 max-w-lg mx-auto w-full"
      >
        <Button
          data-ocid="nav.home_button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-neon-cyan"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="font-display text-2xl font-bold text-neon-magenta glow-magenta">
            LEADERBOARD
          </h2>
          <p className="font-body text-xs text-muted-foreground">
            Top pilots across the galaxy
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div
          data-ocid="leaderboard.list"
          className="flex flex-col items-center justify-center flex-1 gap-3"
        >
          <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
          <p className="font-body text-sm text-muted-foreground">
            Fetching rankings…
          </p>
        </div>
      ) : (
        <div
          data-ocid="leaderboard.list"
          className="flex flex-col gap-2 max-w-lg mx-auto w-full"
        >
          {board.map((player, idx) => {
            const rankLabel = idx < 3 ? RANK_LABELS[idx] : `#${idx + 1}`;
            const rankColor =
              idx < 3 ? RANK_COLORS[idx] : "text-muted-foreground";
            const planInfo =
              PLAN_BADGE[player.plan] || PLAN_BADGE[UserPlan.free];
            const name = PILOT_NAMES[idx] || `Pilot ${idx + 1}`;

            return (
              <motion.div
                key={name}
                data-ocid={`leaderboard.item.${idx + 1}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`space-card rounded-xl px-4 py-3 flex items-center gap-3 ${
                  idx === 0 ? "box-glow-yellow" : ""
                }`}
              >
                {/* Rank */}
                <div
                  className={`w-8 text-center font-display font-bold text-lg ${rankColor}`}
                >
                  {rankLabel}
                </div>

                {/* Name + plan */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-sm text-foreground truncate">
                      {name}
                    </span>
                    {player.plan === UserPlan.elite && (
                      <Crown className="w-3.5 h-3.5 text-neon-yellow shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-body text-xs text-muted-foreground">
                      Lv {Number(player.level)}
                    </span>
                    <Badge
                      className={`${planInfo.className} text-[10px] px-1.5 py-0`}
                    >
                      {planInfo.label}
                    </Badge>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-sm text-neon-yellow">
                    {Number(player.highScore).toLocaleString()}
                  </p>
                  <p className="font-body text-[10px] text-muted-foreground">
                    best score
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center mt-6"
      >
        <div className="flex items-center gap-2 text-muted-foreground/50 text-xs font-body">
          <Trophy className="w-3 h-3" />
          <span>Play more levels to climb the ranks</span>
        </div>
      </motion.div>
    </div>
  );
}
