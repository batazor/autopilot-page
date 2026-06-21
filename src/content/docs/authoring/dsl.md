---
title: Writing scenarios (DSL)
description: A primer on the YAML DSL — match, click, while_match, ocr, cond, push_scenario — with a complete worked example.
sidebar:
  order: 4
  label: DSL primer
---

Scenarios are declarative YAML files that tell the bot what to look for on screen and what to do when it sees it. They live under `games/<game>/<module>/scenarios/*.yaml` (e.g. `games/wos/vip/scenarios/`) and are auto-discovered at startup. The filename without `.yaml` is the scenario key; a `by_cron/` subdirectory groups cron-only schedules.

A scenario is **not** a script. It doesn't have variables or functions in the imperative sense. It's a tree of step nodes — each with a guard (`match`, `cond`, `while_match`) and a body that runs when the guard fires.

## Skeleton

```yaml
enabled: true                    # default is false — a disabled scenario is ignored at load
name: "Human-readable label for the queue"
priority: 80_000                 # higher = runs first when multiple are pending
device_level: true               # popup-style scenario, no player binding (optional)
cron: "0 */12 * * *"             # standard cron, optional (player-bound scenarios)
node: vip                        # screen graph target — bot navigates here first
cond: "active_player != null"    # top-level guard; skip whole scenario if false

steps:
  - <step>
  - <step>
```

If `cron` is omitted, the scenario only runs when explicitly pushed (from an overlay rule, another scenario via `push_scenario`, or manually from the debug runner). If `node` is omitted, the bot assumes you're already on the right screen.

`device_level: true` marks a generic UI scenario (popups, reconnect prompts) that needs no player identity — zero `while_match` iterations is "ok, nothing to do."

## Step types

Each step carries **exactly one** action key (the validator enforces this), plus an optional `cond` and modifiers.

| Key | Purpose |
|:---|:---|
| `click` | Tap the center of a labeled region |
| `long_click` | Long-press a region |
| `match` | Probe a region — hard gate or soft guard (see below) |
| `while_match` | Probe, run `steps:` while matched, exit when not |
| `ocr` | OCR the region; persist via `state:` or `store:` |
| `swipe_direction` | Swipe `direction: up\|down\|left\|right`, `delta: <px>` |
| `push_scenario` | Enqueue another scenario by key |
| `exec` | Run an in-process action by name |
| `wait` | Sleep — accepts `0.5`, `"500ms"`, `"3s"` |
| `ttl` | Early-exit and reschedule self for `now + ttl` (`"30m"`, `"2h"`) |
| `loop` / `repeat` | Loop with `max:` / `until_match:`; exit early with `break` |
| `system_back` | Press Android system Back |

For conditional branching, use a composite `cond:` block (`cond:` + `steps:`) — there is no separate `if:` step.

### `match` — two very different shapes

**Bare `match:`** (no `steps:`) is a hard gate: a miss **aborts the whole scenario**. Use it for "this region MUST be present."

```yaml
- match: page.vip.title        # not on the VIP screen? abort and reschedule
```

**`match:` + `steps:`** (optionally `else:`) is a soft guard: matched → run `steps`, miss → run `else` if present and continue. It never aborts.

```yaml
- match: button.claim
  threshold: 0.9
  steps:
    - click: button.claim
    - wait: 500ms
  else:
    - ttl: 30m                 # nothing to claim — back off and retry later
```

### `while_match`

Loop **while** a region is visible — the workhorse for "keep tapping until the popup chain clears."

```yaml
- while_match: button.tap_anywhere_to_exit
  max: 3                       # safety cap — never spin more than 3 iterations
  retry:
    attempts: 3
    interval: 500ms            # initial-probe retries when the UI needs time to settle
  steps:
    - click: button.tap_anywhere_to_exit
    - wait: 300ms
```

`while_match` with `max: 1` is the idiomatic "tap if visible, skip otherwise" — equivalent to `match + steps`. Zero iterations is fine by default; opt in to "this step MUST have done work" with `strict: true` (a player-bound scenario then soft-fails and reschedules instead of silently continuing). An `else:` block runs only when there were **zero** iterations.

### Match modifiers

Work on both `match:` and `while_match:`:

| Modifier | Effect |
|:---|:---|
| `threshold: 0.95` | Template-match score, default `0.9` — tighten on crowded screens |
| `min_match_saturation: 48` | Reject low-saturation matches (kills grey-on-grey false positives) |
| `isRedDot: true\|false` | Gate on the red-dot badge at the region (needs `has_red_dot` in labeling) |
| `isTabActive: true\|false` | Gate on the tab-active visual marker |
| `isWhiteBorder: true\|false` | Gate on the white-border visual marker |

### `ocr` — two destinations, two lifetimes

```yaml
- ocr: page.profile.power
  state: profile.power         # → persistent per-player state; survives restarts
- ocr: page.shop.price
  store: shop_price            # → Redis, scenario-scoped; cleared at next run
```

Use `state:` for long-lived facts about the player, `store:` for transient values consumed later in the same scenario.

### `cond` expressions

Used at scenario level and on any step:

- `currentNode == main_city` / `currentNode != main_city` — screen graph state
- `<field> == "value"` / `!=` — full-string, case-insensitive
- `<field> ~= "Upgrade|Build"` — case-insensitive substring, `|` is alternation
- `<field> == null` / `!= null` — field empty / unset

The left-hand side reads instance state (e.g. `active_player`, `current_screen`).

## A complete example: VIP daily

This is `games/wos/vip/scenarios/by_cron/vip.daily.yaml`, abridged:

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
      # The chest opens a "click to continue" overlay — clear it.
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
      - wait: 0.8s
      # "tap anywhere to exit" reward overlay
      - while_match: button.tap_anywhere_to_exit
        max: 3
        steps:
          - click: button.tap_anywhere_to_exit
          - wait: 0.3s

  # Spend VIP points: the "+" button long-presses a Use dialog.
  - while_match: page.vip.add
    isRedDot: true
    max: 3
    steps:
      - click: page.vip.add
      - wait: 0.5s
      - while_match: button.use
        retry:
          attempts: 3
          interval: 500ms
        steps:
          - long_click: button.use
          - wait: 1s
      - while_match: increase_level.icon.close
        max: 1
        steps:
          - click: increase_level.icon.close
          - wait: 300ms
```

What's happening:

1. `cron + node` schedules the scenario every 12h and navigates to the VIP screen before the first step runs.
2. The outer `while_match: page.vip.box / isRedDot: true` only iterates if there's a red-dot reward to claim — the scenario is a no-op on already-claimed days.
3. Each iteration handles the reward chest + the "click to continue" overlay that pops after tapping.
4. The `while_match: button.claim / max: 1` handles the central Claim button independently — and never fails when it isn't lit.
5. The `max:` caps and `retry:` intervals keep the bot from spinning when the game's animation is slow.

## Testing your scenario

1. **From the dashboard** — open the debug runner at <http://127.0.0.1:3000/debug-run>, pick your scenario from the dropdown, click **Run**. You see step-by-step decisions and which `match` / `cond` evaluated to what.
2. **From the queue** — push it onto an instance's queue (sidebar → instance → push scenario). Better for testing the cron path.
3. **Schema & startup validation** — `uv run pytest tests/tasks/test_dsl_schema.py tests/test_startup_validation.py -q` catches stale region references and schema errors before a live run.

## When something doesn't fire

The most common causes, ordered by likelihood:

1. **Scenario not enabled** — `enabled:` defaults to `false`; a disabled scenario silently never runs.
2. **Region not labeled at the right screen** — `match` only sees regions registered for the current screen. Verify the region in the module's `area.yaml` (via the labeling editor — never hand-edit).
3. **Threshold too tight** — drop `threshold` by 0.05 and retry. (Too loose is also a failure mode: 0.85 commonly false-positives on busy backgrounds.)
4. **Bare `match:` on a maybe-visible element** — aborts the scenario on a miss. Add `steps:` to switch to soft-guard semantics.
5. **`isRedDot: true` filter** — make sure the region has red-dot detection enabled in the labeling editor; otherwise the filter always reads false.
6. **`cond` guard failing silently** — predicates with typos pass as "skip." Print state from the debug runner to verify.

## What's next

If you're authoring scenarios for a new game (Kingshot, etc.), the loop is the same:

1. Create `games/<game>/<module>/` exporting `MODULE_ID`, `MODULE_CONFIG`, `area_yml()`, `overlay_analyze_yaml()`, `scenarios()`.
2. Label regions for the screens you need (the editor writes the module's `area.yaml` + reference crops).
3. Write scenarios that reference them.
4. Push a PR — we'll review and pair on whatever's tricky.

Ping us in the `#install` channel on [Discord](https://discord.gg/62twnzKG9) before you start so we can flag any pieces that are still WIP on our side.
