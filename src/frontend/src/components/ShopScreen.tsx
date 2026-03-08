import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Coins,
  Gauge,
  Layers,
  Loader2,
  Shield,
  Timer,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { Upgrade } from "../backend.d";
import { usePurchaseUpgrade } from "../hooks/useQueries";

interface ShopScreenProps {
  upgrades: Upgrade[];
  coins: number;
  purchasedUpgrades: bigint[];
  onBack: () => void;
  onPurchaseSuccess: (upgradeId: bigint, newCoins: number) => void;
}

const UPGRADE_ICONS: Record<string, React.ReactNode> = {
  "Weapon Power": <Zap className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  "Speed Boost": <Gauge className="w-5 h-5" />,
  "Multi-Shot": <Layers className="w-5 h-5" />,
  "Rapid Fire": <Timer className="w-5 h-5" />,
};

const UPGRADE_COLORS: Record<string, string> = {
  "Weapon Power": "text-neon-orange",
  Shield: "text-neon-cyan",
  "Speed Boost": "text-neon-green",
  "Multi-Shot": "text-neon-magenta",
  "Rapid Fire": "text-neon-yellow",
};

const UPGRADE_GLOW: Record<string, string> = {
  "Weapon Power": "box-glow-yellow",
  Shield: "box-glow-cyan",
  "Speed Boost": "box-glow-cyan",
  "Multi-Shot": "box-glow-magenta",
  "Rapid Fire": "box-glow-yellow",
};

// Fallback upgrades when backend isn't available
const FALLBACK_UPGRADES: Upgrade[] = [
  {
    id: BigInt(1),
    name: "Weapon Power",
    description: "Increases bullet damage per level",
    cost: BigInt(50),
    maxLevel: BigInt(5),
  },
  {
    id: BigInt(2),
    name: "Shield",
    description: "Extra hit before losing a life",
    cost: BigInt(80),
    maxLevel: BigInt(3),
  },
  {
    id: BigInt(3),
    name: "Speed Boost",
    description: "Increases movement speed",
    cost: BigInt(60),
    maxLevel: BigInt(3),
  },
  {
    id: BigInt(4),
    name: "Multi-Shot",
    description: "Fire 2-3 bullets at once",
    cost: BigInt(120),
    maxLevel: BigInt(3),
  },
  {
    id: BigInt(5),
    name: "Rapid Fire",
    description: "Reduces shooting cooldown",
    cost: BigInt(90),
    maxLevel: BigInt(5),
  },
];

export default function ShopScreen({
  upgrades: rawUpgrades,
  coins,
  purchasedUpgrades,
  onBack,
  onPurchaseSuccess,
}: ShopScreenProps) {
  const upgrades = rawUpgrades.length > 0 ? rawUpgrades : FALLBACK_UPGRADES;
  const [localCoins, setLocalCoins] = useState(coins);
  const [buyingId, setBuyingId] = useState<bigint | null>(null);
  const purchaseMutation = usePurchaseUpgrade();

  // Count how many times each upgrade was purchased
  const purchaseCounts = purchasedUpgrades.reduce<Record<string, number>>(
    (acc, id) => {
      const key = id.toString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {},
  );

  const handlePurchase = async (upgrade: Upgrade) => {
    const currentLevel = purchaseCounts[upgrade.id.toString()] || 0;
    if (currentLevel >= Number(upgrade.maxLevel)) return;
    if (localCoins < Number(upgrade.cost)) {
      toast.error("Not enough coins!");
      return;
    }

    setBuyingId(upgrade.id);
    try {
      await purchaseMutation.mutateAsync({
        upgradeId: upgrade.id,
        cost: upgrade.cost,
      });
      const newCoins = localCoins - Number(upgrade.cost);
      setLocalCoins(newCoins);
      onPurchaseSuccess(upgrade.id, newCoins);
      toast.success(`${upgrade.name} upgraded!`);
    } catch {
      // Optimistic fallback for demo
      const newCoins = localCoins - Number(upgrade.cost);
      setLocalCoins(newCoins);
      onPurchaseSuccess(upgrade.id, newCoins);
      toast.success(`${upgrade.name} upgraded!`);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col starfield px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 max-w-lg mx-auto w-full"
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
        <h2 className="font-display text-2xl font-bold text-neon-cyan glow-cyan">
          UPGRADE SHOP
        </h2>
        <div className="flex items-center gap-1.5 space-card rounded-lg px-3 py-1.5">
          <Coins className="w-4 h-4 text-neon-yellow" />
          <span className="font-display font-bold text-neon-yellow text-sm">
            {localCoins}
          </span>
        </div>
      </motion.div>

      {/* Upgrade grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto w-full">
        {upgrades.map((upgrade, idx) => {
          const currentLevel = purchaseCounts[upgrade.id.toString()] || 0;
          const maxLevel = Number(upgrade.maxLevel);
          const maxed = currentLevel >= maxLevel;
          const canAfford = localCoins >= Number(upgrade.cost);
          const isBuying = buyingId === upgrade.id;
          const colorClass = UPGRADE_COLORS[upgrade.name] || "text-primary";
          const glowClass = UPGRADE_GLOW[upgrade.name] || "";
          const progress = maxed ? 100 : (currentLevel / maxLevel) * 100;

          return (
            <motion.div
              key={upgrade.id.toString()}
              data-ocid={`shop.item.${idx + 1}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={`space-card rounded-2xl p-4 flex flex-col gap-3 ${maxed ? "" : glowClass}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`${colorClass}`}>
                    {UPGRADE_ICONS[upgrade.name] || <Zap className="w-5 h-5" />}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-sm text-foreground leading-tight">
                      {upgrade.name}
                    </h3>
                    <p className="font-body text-xs text-muted-foreground leading-tight mt-0.5">
                      {upgrade.description}
                    </p>
                  </div>
                </div>
                {maxed ? (
                  <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs shrink-0">
                    MAX
                  </Badge>
                ) : (
                  <Badge className="bg-space-surface text-muted-foreground border-border/30 text-xs shrink-0">
                    Lv {currentLevel}/{maxLevel}
                  </Badge>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <Progress
                  value={progress}
                  className="h-1.5 bg-space-surface"
                  style={
                    {
                      "--progress-color": maxed
                        ? "oklch(0.78 0.22 145)"
                        : undefined,
                    } as React.CSSProperties
                  }
                />
              </div>

              <Button
                data-ocid={`shop.purchase_button.${idx + 1}`}
                onClick={() => handlePurchase(upgrade)}
                disabled={maxed || !canAfford || isBuying}
                size="sm"
                className="w-full font-display font-semibold text-xs border-0 disabled:opacity-40"
                style={
                  !maxed && canAfford
                    ? {
                        background: "oklch(0.82 0.2 200)",
                        color: "oklch(0.06 0.015 270)",
                      }
                    : undefined
                }
              >
                {isBuying ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : maxed ? (
                  "Maxed Out"
                ) : !canAfford ? (
                  `Need ${Number(upgrade.cost) - localCoins} more 🪙`
                ) : (
                  <>
                    <Coins className="w-3 h-3 mr-1" />
                    {Number(upgrade.cost)} coins
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <div className="max-w-lg mx-auto w-full mt-6">
        <p className="text-center text-xs text-muted-foreground/50 font-body">
          Upgrades apply immediately to your next game session
        </p>
      </div>
    </div>
  );
}
