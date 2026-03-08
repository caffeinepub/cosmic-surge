import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProfileUpdate {
    coins: bigint;
    level: bigint;
    lives: bigint;
    score: bigint;
}
export interface LevelConfig {
    enemyCount: bigint;
    difficulty: bigint;
    index: bigint;
    enemyTypes: string;
    speedMultiplier: number;
}
export interface Upgrade {
    id: bigint;
    maxLevel: bigint;
    cost: bigint;
    name: string;
    description: string;
}
export interface PlayerProfile {
    coins: bigint;
    plan: UserPlan;
    level: bigint;
    lives: bigint;
    totalScore: bigint;
    highScore: bigint;
    purchasedUpgrades: Array<bigint>;
}
export interface UserProfile {
    name: string;
}
export enum UserPlan {
    pro = "pro",
    free = "free",
    elite = "elite"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<PlayerProfile>>;
    getLevelConfig(level: bigint): Promise<LevelConfig>;
    getProfile(): Promise<PlayerProfile>;
    getUpgrades(): Promise<Array<Upgrade>>;
    getUserPlan(): Promise<UserPlan>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    purchaseUpgrade(upgradeId: bigint, cost: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveProgress(progress: ProfileUpdate): Promise<void>;
    setPlan(user: Principal, plan: UserPlan): Promise<void>;
}
