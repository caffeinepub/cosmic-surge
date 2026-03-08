import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Crown, Rocket, Star, Zap } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { UserPlan } from "../backend.d";

interface PlansScreenProps {
  currentPlan: UserPlan;
  onBack: () => void;
}

const PLANS = [
  {
    id: UserPlan.free,
    name: "Explorer",
    price: "Free",
    period: "forever",
    icon: <Rocket className="w-6 h-6" />,
    color: "text-muted-foreground",
    borderColor: "border-border/40",
    bgGlow: "",
    levels: "Levels 1–50",
    badge: null,
    features: [
      "50 playable levels",
      "Basic upgrades",
      "5 upgrade slots",
      "Leaderboard access",
      "Standard enemies",
    ],
    ocid: "plans.free_button",
    cta: "Current Free Plan",
    ctaStyle: {},
  },
  {
    id: UserPlan.pro,
    name: "Commander",
    price: "$4.99",
    period: "/ month",
    icon: <Star className="w-6 h-6" />,
    color: "text-neon-cyan",
    borderColor: "border-neon-cyan/40",
    bgGlow: "box-glow-cyan",
    levels: "Levels 1–500",
    badge: "POPULAR",
    features: [
      "500 playable levels",
      "All upgrades unlocked",
      "10× upgrade slots",
      "Priority leaderboard",
      "Advanced enemy types",
      "Bonus coins ×2",
    ],
    ocid: "plans.pro_button",
    cta: "Go Commander",
    ctaStyle: {
      background: "oklch(0.82 0.2 200)",
      color: "oklch(0.06 0.015 270)",
    },
  },
  {
    id: UserPlan.elite,
    name: "Admiral",
    price: "$9.99",
    period: "/ month",
    icon: <Crown className="w-6 h-6" />,
    color: "text-neon-yellow",
    borderColor: "border-neon-yellow/40",
    bgGlow: "box-glow-yellow",
    levels: "All 2000+ Levels",
    badge: "ELITE",
    features: [
      "2000+ playable levels",
      "All upgrades maxed free",
      "Unlimited upgrade slots",
      "Global leaderboard rank",
      "Boss levels & secrets",
      "Bonus coins ×5",
      "Exclusive ships & skins",
    ],
    ocid: "plans.elite_button",
    cta: "Go Admiral",
    ctaStyle: {
      background: "oklch(0.88 0.2 90)",
      color: "oklch(0.06 0.015 270)",
    },
  },
];

export default function PlansScreen({ currentPlan, onBack }: PlansScreenProps) {
  return (
    <div className="min-h-dvh flex flex-col starfield px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8 max-w-2xl mx-auto w-full"
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
          <h2 className="font-display text-2xl font-bold text-neon-yellow glow-yellow">
            BATTLE RANKS
          </h2>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Unlock more levels and power with premium plans
          </p>
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto w-full justify-center">
        {PLANS.map((plan, idx) => {
          const isActive = currentPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative space-card rounded-2xl p-5 flex flex-col flex-1 border ${plan.borderColor} ${plan.bgGlow}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge
                    className={`font-display text-xs font-bold px-3 ${
                      plan.id === UserPlan.pro
                        ? "bg-neon-cyan text-space-deep"
                        : "bg-neon-yellow text-space-deep"
                    }`}
                    style={
                      plan.id === UserPlan.pro
                        ? {
                            background: "oklch(0.82 0.2 200)",
                            color: "oklch(0.06 0.015 270)",
                          }
                        : {
                            background: "oklch(0.88 0.2 90)",
                            color: "oklch(0.06 0.015 270)",
                          }
                    }
                  >
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-2 mb-1">
                <span className={plan.color}>{plan.icon}</span>
                <h3 className={`font-display text-lg font-bold ${plan.color}`}>
                  {plan.name}
                </h3>
                {isActive && (
                  <Badge className="ml-auto bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                    Active
                  </Badge>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-3xl font-extrabold text-foreground">
                  {plan.price}
                </span>
                <span className="font-body text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              {/* Level range */}
              <div className="flex items-center gap-1.5 mb-4">
                <Zap className="w-3 h-3 text-neon-yellow" />
                <span className="font-body text-xs text-neon-yellow font-semibold">
                  {plan.levels}
                </span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2 mb-6 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.color}`}
                    />
                    <span className="font-body text-xs text-muted-foreground leading-tight">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                data-ocid={plan.ocid}
                disabled={isActive && plan.id === UserPlan.free}
                size="sm"
                className="w-full font-display font-bold text-sm border-0 disabled:opacity-50"
                style={isActive ? {} : plan.ctaStyle}
              >
                {isActive ? "✓ Current Plan" : plan.cta}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground/50 font-body mt-6 max-w-sm mx-auto"
      >
        Premium plans are UI placeholders — connect Stripe to activate real
        payments. Cancel anytime.
      </motion.p>
    </div>
  );
}
