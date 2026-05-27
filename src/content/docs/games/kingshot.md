---
title: Kingshot
description: Kingshot support is on the roadmap — we'll start the implementation as soon as volunteers show up.
sidebar:
  order: 2
hero:
  image:
    file: ../../../assets/kingshot.png
  actions:
    - text: Join the effort on Discord
      link: https://discord.gg/62twnzKG9
      icon: external
      variant: primary
---

The autopilot engine is game-agnostic — scenarios, overlay rules, and the DSL aren't tied to any specific game. Adding Kingshot is essentially authoring its scenario set under `modules/`; no engine changes required.

## Status

**Not started.** No scenarios, no labeled regions, no analyzer rules for Kingshot yet.

**We'll start the implementation as soon as volunteers show up.** This isn't a planned-but-delayed project — it's a "if there's interest, we'll do it" project. If even one person commits to authoring the daily-loop scenarios, we'll pair up and ship a working version.

## Want to help?

Drop into the **`#install`** channel on [Discord](https://discord.gg/62twnzKG9) and ping us. You don't need prior contribution experience — if you can describe Kingshot's daily loop in plain English, you can describe it in the DSL.

We'll help with:

- Labeling editor walkthrough — how to capture screens and define regions
- DSL primer — `match`, `click`, `while_match`, `cond`, `push_scenario`
- Module layout — how to add a new game alongside Whiteout Survival
- Reviewing your first scenario

The [Whiteout Survival coverage](/autopilot-page/games/whiteout-survival/) is a good template for what "fully covered" looks like — that's roughly what we'd aim for with Kingshot, ideally driven by someone who actually plays the game.
