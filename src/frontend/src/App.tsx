import { Toaster } from "@/components/ui/sonner";
import React, { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { UserPlan } from "./backend.d";
import GameOverScreen from "./components/GameOverScreen";
import GameScreen from "./components/GameScreen";
import HomeScreen from "./components/HomeScreen";
import LeaderboardScreen from "./components/LeaderboardScreen";
import LevelCompleteScreen from "./components/LevelCompleteScreen";
import PlansScreen from "./components/PlansScreen";
import ShopScreen from "./components/ShopScreen";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  DEFAULT_PROFILE,
  useLevelConfig,
  useProfile,
  useSaveProgress,
  useUpgrades,
} from "./hooks/useQueries";
import type { GameScreen as GameScreenName } from "./types/game";
import type { GameState } from "./types/game";

// ─── Derive upgrade levels from purchasedUpgrades array ──────────────────
function deriveUpgradeLevels(
  purchasedUpgrades: bigint[],
): GameState["upgrades"] {
  const counts: Record<string, number> = {};
  for (const id of purchasedUpgrades) {
    const key = id.toString();
    counts[key] = (counts[key] || 0) + 1;
  }
  return {
    weaponPower: counts["1"] || 0,
    shield: counts["2"] || 0,
    speedBoost: counts["3"] || 0,
    multiShot: counts["4"] || 0,
    rapidFire: counts["5"] || 0,
  };
}

// ─── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<GameScreenName>("home");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentScore, setCurrentScore] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [localCoins, setLocalCoins] = useState<number | null>(null);
  const [localPurchases, setLocalPurchases] = useState<bigint[]>([]);

  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: profile = DEFAULT_PROFILE } = useProfile();
  const { data: upgrades = [] } = useUpgrades();
  const { data: levelConfig } = useLevelConfig(currentLevel);
  const saveProgressMutation = useSaveProgress();

  // Merge backend profile with local optimistic state
  const effectiveCoins =
    localCoins !== null ? localCoins : Number(profile.coins);
  const effectiveLevel = Math.max(currentLevel, Number(profile.level));

  const allPurchases = useMemo(
    () => [...profile.purchasedUpgrades, ...localPurchases],
    [profile.purchasedUpgrades, localPurchases],
  );

  const upgradeState = useMemo(
    () => deriveUpgradeLevels(allPurchases),
    [allPurchases],
  );

  // ─── Save progress to backend ───────────────────────────────────────────
  const persistProgress = useCallback(
    async (level: number, score: number, coins: number) => {
      if (!isAuthenticated) {
        toast.info("Log in to save your progress!");
        return;
      }
      try {
        await saveProgressMutation.mutateAsync({
          coins: BigInt(coins),
          level: BigInt(level),
          lives: BigInt(profile.lives),
          score: BigInt(score),
        });
      } catch {
        // Silently fail — local state already updated
      }
    },
    [isAuthenticated, profile.lives, saveProgressMutation],
  );

  // ─── Game flow handlers ──────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    setCurrentLevel(effectiveLevel);
    setCurrentScore(0);
    setSessionCoins(0);
    setScreen("game");
  }, [effectiveLevel]);

  const handleLevelComplete = useCallback(
    (score: number, coinsEarned: number) => {
      setCurrentScore(score);
      setSessionCoins(coinsEarned);
      const newLevel = currentLevel + 1;
      const newCoins = effectiveCoins + coinsEarned;
      setLocalCoins(newCoins);
      persistProgress(newLevel, score, newCoins);
      setScreen("level-complete");
    },
    [currentLevel, effectiveCoins, persistProgress],
  );

  const handleNextLevel = useCallback(() => {
    const nextLevel = currentLevel + 1;
    const plan = profile.plan;
    if (plan === UserPlan.free && nextLevel > 50) {
      setScreen("plans");
      return;
    }
    if (plan === UserPlan.pro && nextLevel > 500) {
      setScreen("plans");
      return;
    }
    setCurrentLevel(nextLevel);
    setCurrentScore(0);
    setSessionCoins(0);
    setScreen("game");
  }, [currentLevel, profile.plan]);

  const handleGameOver = useCallback(
    (score: number) => {
      setCurrentScore(score);
      persistProgress(currentLevel, score, effectiveCoins);
      setScreen("game-over");
    },
    [currentLevel, effectiveCoins, persistProgress],
  );

  const handleRetry = useCallback(() => {
    setCurrentScore(0);
    setSessionCoins(0);
    setScreen("game");
  }, []);

  const handleHome = useCallback(() => setScreen("home"), []);
  const handleShop = useCallback(() => setScreen("shop"), []);
  const handlePlans = useCallback(() => setScreen("plans"), []);
  const handleLeaderboard = useCallback(() => setScreen("leaderboard"), []);

  const handlePurchaseSuccess = useCallback(
    (upgradeId: bigint, newCoins: number) => {
      setLocalCoins(newCoins);
      setLocalPurchases((prev) => [...prev, upgradeId]);
    },
    [],
  );

  // Build profile for home screen
  const homeProfile = useMemo(
    () => ({
      ...profile,
      coins: BigInt(effectiveCoins),
      level: BigInt(effectiveLevel),
      purchasedUpgrades: allPurchases,
    }),
    [profile, effectiveCoins, effectiveLevel, allPurchases],
  );

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.13 0.03 280)",
            border: "1px solid oklch(0.3 0.06 280 / 0.5)",
            color: "oklch(0.97 0.01 270)",
          },
        }}
      />

      {/* Login nudge when not authenticated */}
      {!isAuthenticated && screen === "home" && (
        <button
          type="button"
          className="fixed top-3 right-3 z-50 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-body cursor-pointer border-0 bg-transparent"
          style={{
            background: "oklch(0.13 0.03 280 / 0.9)",
            border: "1px solid oklch(0.3 0.06 280 / 0.5)",
            backdropFilter: "blur(8px)",
            color: "oklch(0.75 0.18 200)",
          }}
          onClick={login}
        >
          <span className="w-2 h-2 rounded-full bg-neon-yellow animate-pulse-glow" />
          Log in to save progress
        </button>
      )}

      {screen === "home" && (
        <HomeScreen
          profile={homeProfile}
          onPlay={handlePlay}
          onShop={handleShop}
          onPlans={handlePlans}
          onLeaderboard={handleLeaderboard}
        />
      )}

      {screen === "game" && (
        <GameScreen
          level={currentLevel}
          lives={Number(profile.lives)}
          coins={effectiveCoins}
          levelConfig={levelConfig}
          upgrades={upgradeState}
          onLevelComplete={handleLevelComplete}
          onGameOver={handleGameOver}
          onHome={handleHome}
          onShop={handleShop}
        />
      )}

      {screen === "level-complete" && (
        <LevelCompleteScreen
          level={currentLevel}
          score={currentScore}
          coins={sessionCoins}
          totalCoins={effectiveCoins}
          plan={profile.plan}
          onNext={handleNextLevel}
          onShop={handleShop}
          onHome={handleHome}
          onPlans={handlePlans}
        />
      )}

      {screen === "game-over" && (
        <GameOverScreen
          score={currentScore}
          highScore={Number(profile.highScore)}
          level={currentLevel}
          onRetry={handleRetry}
          onHome={handleHome}
        />
      )}

      {screen === "shop" && (
        <ShopScreen
          upgrades={upgrades}
          coins={effectiveCoins}
          purchasedUpgrades={allPurchases}
          onBack={handleHome}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {screen === "plans" && (
        <PlansScreen currentPlan={profile.plan} onBack={handleHome} />
      )}

      {screen === "leaderboard" && <LeaderboardScreen onBack={handleHome} />}

      {/* Footer */}
      <footer className="fixed bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-[10px] text-muted-foreground/30 font-body whitespace-nowrap">
          © {new Date().getFullYear()} Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="pointer-events-auto hover:text-muted-foreground/60 transition-colors underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </>
  );
}
