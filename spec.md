# Cosmic Surge

## Current State
New project. No existing backend or frontend code.

## Requested Changes (Diff)

### Add
- Addictive arcade-style space shooter game with 2000+ levels
- Player spaceship that moves and shoots
- Enemies with increasing difficulty per level
- Power-ups and upgrades system (weapons, shields, speed)
- Score tracking and high score persistence
- Level progression system (2000+ levels with varied enemy patterns, speeds, and types)
- Premium plans UI (Free, Pro, Elite tiers) with feature gating
- Game state persistence (current level, score, upgrades) per user
- Lives system and game over / restart flow
- Animated starfield background and space-themed visuals

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan

### Backend (Motoko)
- Player profile: store current level, high score, total score, lives, upgrades purchased
- Level data: procedurally generated level configs up to 2000+ levels (difficulty curves, enemy counts, speed multipliers)
- Upgrade store: list of available upgrades (weapons, shields, speed boosts) with costs
- Premium plans: Free / Pro / Elite plan definitions, user plan assignment
- Functions: getProfile, saveProgress, purchaseUpgrade, getUpgrades, getLevelConfig, getPlan, setPlan

### Frontend (React)
- Landing / Home screen with Play button and plan info
- Game canvas using Canvas API or React state for game loop
- HUD: level number, score, lives, active upgrades indicator
- Enemy wave spawner driven by level config from backend
- Upgrade shop modal (between levels or from pause menu)
- Premium plans page with tier cards and upgrade CTA
- Game over screen with score summary and restart
- Level complete screen with score and next-level button
- Persistent state loaded from backend on app start
