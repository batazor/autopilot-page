---
title: Authoring flow
description: How a new automation gets added — capture, label, write DSL, test, iterate.
sidebar:
  order: 1
  label: Flow
---

The engine is game-agnostic. Adding a new automation — whether it's a new daily loop for Whiteout Survival or the first scenarios for Kingshot — is the same loop:

0. **(Optional) Create a module** if your automation doesn't fit an existing feature domain — scaffold it from the dashboard's `/modules` page (see [Creating a module](/autopilot-page/authoring/new-module/)).
1. **Capture** a screenshot of the game state you want to automate.
2. **Label** the regions on that screenshot (buttons, badges, text areas) in the Labeling editor.
3. **Save** — the editor writes the region coordinates into the module's `area.yaml` and stores cropped templates in `references/crop/`.
4. **Write a DSL scenario** in YAML that references the regions you just named (`match`, `click`, `cond`, `while_match`, …).
5. **Run it** — either from the dashboard's debug runner, or by letting the cron scheduler pick it up.
6. **Iterate** — re-label if the UI changes, tweak DSL conditions, tighten thresholds.

There is no game-specific engine code — only `games/<game>/...` module directories with `area.yaml`, `analyze/analyze.yaml` (overlay rules), `scenarios/*.yaml` (DSL), and region crops under `references/crop/`. The Python engine never knows it's running on Whiteout Survival or Kingshot; it just executes whatever scenarios are loaded.

## Two paths to write a scenario

| | **DSL (YAML)** | **UI mode** |
|:---|:---|:---|
| Where | `games/<game>/<module>/scenarios/*.yaml` in your editor | Dashboard's debug runner (`/debug-run`) |
| Best for | Anything more than a 3-step sequence; version-controlled changes | One-off taps, exploring what works before committing to a scenario |
| Persistence | Committed to the repo | In-session only |
| Power | Full DSL: loops, conditions, sub-scenarios, scheduling | Linear sequence of steps against current screen state |

Most contributors author scenarios in YAML and use the UI runner to test them. The UI mode is rarely the final form — it's an exploration tool.

## Next

- [Creating a module](/autopilot-page/authoring/new-module/) — scaffold a new feature domain from the dashboard.
- [Labeling regions](/autopilot-page/authoring/labeling/) — how to use the editor.
- [Writing scenarios (DSL)](/autopilot-page/authoring/dsl/) — primer with a complete example.

When stuck, ping us in the `#install` channel on [Discord](https://discord.gg/62twnzKG9) — we review first PRs and can pair on the labeling pass.
