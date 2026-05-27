---
title: Writing scenarios (DSL)
description: A primer on the YAML DSL — match, click, while_match, cond, push_scenario — with a complete worked example.
sidebar:
  order: 3
  label: DSL primer
---

Scenarios are declarative YAML files that tell the bot what to look for on screen and what to do when it sees it. They live under `modules/<area>/scenarios/*.yaml` and are auto-discovered at startup.

A scenario is **not** a script. It doesn't have variables, loops, or functions in the imperative sense. It's a tree of step nodes — each with a guard (`match`, `cond`, `while_match`) and a body that runs when the guard fires.

## Skeleton

```yaml
enabled: true
name: "Human-readable label for the queue"
priority: 80_000                 # higher = runs first when multiple are pending
cron: "0 */12 * * *"             # standard cron, optional
node: vip                        # screen graph target — bot navigates here first
cond: "active_player != null"    # top-level guard; skip whole scenario if false

steps:
  - <step>
  - <step>
```

If `cron` is omitted, the scenario only runs when explicitly pushed (from another scenario via `push_scenario`, or manually from the debug runner). If `node` is omitted, the bot assumes you're already on the right screen.

## Core steps

### `match`

Wait for a region to be visible. **Fails the scenario** if the region never shows up. Used as a precondition.

```yaml
- match: button.claim
  steps:
    - click: button.claim
    - wait: 500ms
```

### `while_match`

Loop **while** a region is visible — the workhorse for "keep tapping until the popup chain clears."

```yaml
- while_match: button.tap_anywhere_to_exit
  max: 3                         # safety cap — never spin more than 3 iterations
  retry:
    attempts: 3
    interval: 500ms              # how long to wait before checking again
  steps:
    - click: button.tap_anywhere_to_exit
    - wait: 300ms
```

`while_match` with `max: 1` is the idiomatic "tap if visible, skip otherwise" — strictly different from `match` because it doesn't fail if the region is missing.

### `click`

Tap the center of a labeled region.

```yaml
- click: button.claim
```

### `cond`

Skip the step's body if the predicate is false. Predicates can reference state like `currentNode`, `active_player`, OCR-extracted fields.

```yaml
- cond: "currentNode != main_city"
  steps:
    - push_scenario: nav_to_main_city
```

### `push_scenario`

Hand control to another scenario, then resume here when it returns.

```yaml
- push_scenario: nav_to_vip
```

### `isRedDot`

Filter modifier on `match` / `while_match`: only fire if the region carries a red-dot badge. Requires `has_red_dot: true` on the region in `area.json`.

```yaml
- while_match: page.vip.box
  isRedDot: true                 # only iterate if there's a red dot to clear
  steps:
    - click: page.vip.box
```

### `wait`

Pause. Use sparingly — game animations are unpredictable and a fixed `wait` is brittle. Prefer `while_match` against the next expected state.

```yaml
- wait: 2s                       # also: 500ms, 1.5s
```

## A complete example: VIP daily

This is `modules/vip/scenarios/by_cron/vip.daily.yaml`, abridged:

```yaml
enabled: true
name: "VIP: Daily Rewards"
priority: 80_000

cron: "0 */12 * * *"             # every 12h
node: vip                        # nav to the VIP screen first
cond: "active_player != null"    # only run if an account is loaded

steps:
  # Clear any red-dot boxes (animated reward chests on the VIP screen)
  - while_match: page.vip.box
    isRedDot: true
    max: 3
    steps:
      - click: page.vip.box
      - wait: 2s
      # The chest opens a "tap to continue" overlay — clear it.
      - while_match: button.click_to_continue
        max: 1
        retry:
          attempts: 3
          interval: 500ms
        steps:
          - click: button.click_to_continue
          - wait: 500ms

  # Then tap the main "Claim" button if it's lit.
  - while_match: button.claim
    max: 1
    retry:
      attempts: 3
      interval: 400ms
    steps:
      - click: button.claim
      - wait: 800ms
      # "tap anywhere to exit" reward overlay
      - while_match: button.tap_anywhere_to_exit
        max: 3
        steps:
          - click: button.tap_anywhere_to_exit
          - wait: 300ms
```

What's happening:

1. `cron + node` schedules the scenario every 12h and navigates to the VIP screen before the first step runs.
2. The outer `while_match: page.vip.box / isRedDot: true` only iterates if there's a red-dot reward to claim — the scenario is a no-op on already-claimed days.
3. Each iteration handles the reward chest + the "click to continue" overlay that pops after tapping.
4. The final `while_match: button.claim` handles the central Claim button independently — VIP shows it in a different state from the per-day chests.
5. The `max:` caps and `retry:` interval prevent the bot from spinning when the game's animation is slow.

## Testing your scenario

1. **From the dashboard** — open the debug runner at <http://127.0.0.1:3000/debug-run>, pick your scenario from the dropdown, click **Run**. You see step-by-step decisions and which `match` / `cond` evaluated to what.
2. **From the queue** — push it onto an instance's queue (sidebar → instance → push scenario). Better for testing the cron path.
3. **From a Python REPL** — `uv run python -m tasks.runner --scenario your.scenario`. Useful for headless CI checks.

## When something doesn't fire

The most common causes, ordered by likelihood:

1. **Region not labeled at the right screen** — `match` only sees regions whose `screen` matches the current `currentNode`. Verify the region's `screens:` in `area.json` (via the labeling editor).
2. **Threshold too tight** — drop `threshold` by 0.05 and retry.
3. **`isRedDot: true` filter** — make sure the region has `has_red_dot: true` set in the labeling editor; otherwise the filter always reads false.
4. **`cond` guard failing silently** — predicates with typos pass as "skip." Print state from the debug runner to verify.

## What's next

If you're authoring scenarios for a new game (Kingshot, etc.), the loop is the same:

1. Create `modules/<game>/__init__.py` exporting `MODULE_ID`, `MODULE_CONFIG`, `area_yml()`, `overlay_analyze_yaml()`, `scenarios()`.
2. Label regions for the screens you need.
3. Write scenarios that reference them.
4. Push a PR — we'll review and pair on whatever's tricky.

Ping us in the `#install` channel on [Discord](https://discord.gg/62twnzKG9) before you start so we can flag any pieces that are still WIP on our side.
