import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Float "mo:core/Float";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module PlayerProfile {
    public func compare(a : PlayerProfile, b : PlayerProfile) : Order.Order {
      Nat.compare(b.highScore, a.highScore);
    };
  };

  type PlayerProfile = {
    level : Nat;
    highScore : Nat;
    totalScore : Nat;
    coins : Nat;
    lives : Nat;
    purchasedUpgrades : [Nat];
    plan : UserPlan;
  };

  type UserPlan = {
    #free;
    #pro;
    #elite;
  };

  type Upgrade = {
    id : Nat;
    name : Text;
    description : Text;
    cost : Nat;
    maxLevel : Nat;
  };

  type LevelConfig = {
    index : Nat;
    enemyCount : Nat;
    speedMultiplier : Float;
    enemyTypes : Text;
    difficulty : Nat;
  };

  public type ProfileUpdate = {
    level : Nat;
    score : Nat;
    coins : Nat;
    lives : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  let initialUpgrades = [
    { id = 1; name = "Weapon Power"; description = "Increase weapon damage"; cost = 100; maxLevel = 5 },
    { id = 2; name = "Shield Strength"; description = "Increase shield durability"; cost = 120; maxLevel = 5 },
    { id = 3; name = "Speed Boost"; description = "Increase ship speed"; cost = 80; maxLevel = 5 },
    { id = 4; name = "Multi-Shot"; description = "Add additional projectiles"; cost = 150; maxLevel = 3 },
    { id = 5; name = "Rapid Fire"; description = "Increase fire rate"; cost = 200; maxLevel = 3 },
  ];

  let getUpgradesImpl = List.fromArray<Upgrade>(initialUpgrades);

  // Store player profiles
  let profiles = Map.empty<Principal, PlayerProfile>();

  // Store user profiles (for frontend requirements)
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Game-specific functions
  public query ({ caller }) func getProfile() : async PlayerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access game profiles");
    };

    let profile = switch (profiles.get(caller)) {
      case (?existing) { existing };
      case (null) {
        let newProfile : PlayerProfile = {
          level = 1;
          highScore = 0;
          totalScore = 0;
          coins = 0;
          lives = 3;
          purchasedUpgrades = [];
          plan = #free;
        };
        profiles.add(caller, newProfile);
        newProfile;
      };
    };
    profile;
  };

  public shared ({ caller }) func saveProgress(progress : ProfileUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save progress");
    };

    let profile = switch (profiles.get(caller)) {
      case (?existing) { existing };
      case (null) {
        Runtime.trap("Profile does not exist");
      };
    };

    let updatedProfile : PlayerProfile = {
      level = progress.level;
      highScore = if (progress.score > profile.highScore) {
        progress.score;
      } else {
        profile.highScore;
      };
      totalScore = profile.totalScore + progress.score;
      coins = profile.coins + progress.coins;
      lives = progress.lives;
      purchasedUpgrades = profile.purchasedUpgrades;
      plan = profile.plan;
    };

    profiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func purchaseUpgrade(upgradeId : Nat, cost : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can purchase upgrades");
    };

    let profile = switch (profiles.get(caller)) {
      case (?existing) { existing };
      case (null) {
        Runtime.trap("Profile does not exist");
      };
    };

    if (profile.coins < cost) {
      Runtime.trap("Not enough coins");
    };

    let updatedUpgrades = List.fromArray<Nat>(profile.purchasedUpgrades);
    updatedUpgrades.add(upgradeId);

    let updatedProfile : PlayerProfile = {
      level = profile.level;
      highScore = profile.highScore;
      totalScore = profile.totalScore;
      coins = profile.coins - cost;
      lives = profile.lives;
      purchasedUpgrades = updatedUpgrades.toArray();
      plan = profile.plan;
    };

    profiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func setPlan(user : Principal, plan : UserPlan) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set user plans");
    };

    let profile = switch (profiles.get(user)) {
      case (?existing) { existing };
      case (null) {
        Runtime.trap("Profile does not exist");
      };
    };

    let updatedProfile : PlayerProfile = {
      level = profile.level;
      highScore = profile.highScore;
      totalScore = profile.totalScore;
      coins = profile.coins;
      lives = profile.lives;
      purchasedUpgrades = profile.purchasedUpgrades;
      plan;
    };

    profiles.add(user, updatedProfile);
  };

  public query ({ caller }) func getUserPlan() : async UserPlan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access their plan");
    };

    switch (profiles.get(caller)) {
      case (?profile) { profile.plan };
      case (null) { #free };
    };
  };

  public query ({ caller }) func getLevelConfig(level : Nat) : async LevelConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access level configurations");
    };

    let difficulty = if (level <= 50) { 1 } else if (level <= 200) { 2 } else if (level <= 500) { 3 } else if (level <= 1000) { 4 } else { 5 };

    let config : LevelConfig = {
      index = level;
      enemyCount = 5 + difficulty * 2;
      speedMultiplier = 1.0 + difficulty.toFloat() * 0.2;
      enemyTypes = if (difficulty == 1) { "Basic" } else if (difficulty == 2) {
        "Basic, Fast";
      } else if (difficulty == 3) {
        "Basic, Fast, Armor";
      } else if (difficulty == 4) { "All" } else { "All" };
      difficulty;
    };
    config;
  };

  public query ({ caller }) func getUpgrades() : async [Upgrade] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view upgrades");
    };

    getUpgradesImpl.toArray();
  };

  public query ({ caller }) func getLeaderboard() : async [PlayerProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view the leaderboard");
    };

    let allProfiles = profiles.values().toArray();
    let sorted = allProfiles.sort();
    let topCount = Int.min(10, sorted.size());
    Array.tabulate<PlayerProfile>(topCount.toNat(), func(i : Nat) : PlayerProfile { sorted[i] });
  };
};
