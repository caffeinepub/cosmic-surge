import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProfileUpdate } from "../backend.d";
import { UserPlan } from "../backend.d";
import { useActor } from "./useActor";

// ─── Default fallback profile ─────────────────────────────────────────────
export const DEFAULT_PROFILE = {
  coins: BigInt(100),
  plan: UserPlan.free,
  level: BigInt(1),
  lives: BigInt(3),
  totalScore: BigInt(0),
  highScore: BigInt(0),
  purchasedUpgrades: [] as bigint[],
};

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return DEFAULT_PROFILE;
      try {
        return await actor.getProfile();
      } catch {
        return DEFAULT_PROFILE;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useUpgrades() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["upgrades"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUpgrades();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useLevelConfig(level: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["levelConfig", level],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getLevelConfig(BigInt(level));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && level > 0,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getLeaderboard();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSaveProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (progress: ProfileUpdate) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.saveProgress(progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function usePurchaseUpgrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      upgradeId,
      cost,
    }: { upgradeId: bigint; cost: bigint }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.purchaseUpgrade(upgradeId, cost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
