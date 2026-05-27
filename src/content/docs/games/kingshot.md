---
title: Kingshot
description: Kingshot support is planned but not started yet — contributors welcome.
sidebar:
  order: 1
---

The autopilot engine is game-agnostic — scenarios, overlay rules, and the DSL aren't tied to Whiteout Survival. So far the only game with full scenario coverage is **Whiteout Survival**, but adding a new game is mostly about authoring the scenario set (no engine changes).

## Status

**Not started.** No scenarios, no labeled regions, no analyzer rules for Kingshot yet. The image and infrastructure work today only against Whiteout Survival.

## Want to help?

If you'd like to author Kingshot scenarios — onboarding flow, daily loops, combat, city, events — drop into the **`#install`** channel on [Discord](https://discord.gg/62twnzKG9) and ping us. We'll help with:

- Labeling editor walkthrough (how to capture screens and define regions)
- DSL primer (`match`, `click`, `while_match`, `cond`, `push_scenario`)
- Module layout for adding a new game alongside Whiteout Survival
- Reviewing your first scenario

No prior contribution to the project required — if you can describe the game's daily loop in plain English, you can describe it in the DSL.
