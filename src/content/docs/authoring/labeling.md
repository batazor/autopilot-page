---
title: Labeling regions
description: Walkthrough of the Labeling editor — capture a screen, draw region boxes, set the detection action, save to area.json.
sidebar:
  order: 3
  label: Labeling
---

The Labeling editor is the only supported way to populate `area.json` and `references/`. Do not hand-edit those files — the editor keeps them in sync (region coordinates → JSON, crop bitmaps → PNGs), and a manual change will drift.

Don't run the bot but want to help with labeling? Use the
[online label editor](/authoring/label-editor/) — it runs entirely in your
browser and exports a JSON with percentage coordinates that maintainers can
apply.

## Open the editor

Once the dashboard is running (`docker compose up -d` or `uv run play`), open <http://127.0.0.1:3000/labeling>. The page proxies through to the FastAPI backend and reads/writes `area.json` + `references/` on disk.

## The loop

1. **Capture.** Click **Capture** while the emulator is on the screen you want to label. The bot's ADB connection snapshots the framebuffer at 720 × 1280 (the only supported resolution).
2. **Draw.** Drag a bounding box around the UI element — a button, a number badge, a tab row, a text label.
3. **Name.** Give the region a stable, hierarchical name (`button.claim`, `page.vip.box`, `tab.hero.recruit`). The dot-separated naming is a convention, not a hard rule — but `scan_heroes_grid` etc. break if names are inconsistent.
4. **Pick a detection action.** This is what the runtime evaluates when a DSL step says `match: <region>`:
   - **`exist`** — template match. The region's crop is compared against the live screen at the saved coordinates. Use for icons, buttons, badges.
   - **`text`** — OCR via Tesseract. Use for numbers and short labels.
   - **`color_check`** — dominant color in the box. Useful for tab-active vs tab-inactive.
   - **`has_red_dot: true`** — programmatic red-dot badge detector. Enables the DSL `isRedDot:` filter.
5. **Save.** The editor:
   - writes the box coordinates to `area.json`,
   - crops the bitmap and saves it to `references/<region-name>.png`,
   - reloads the in-memory overlay rules so subsequent ticks see the new region immediately.

## What a labeled region looks like in `area.json`

Conceptually (don't hand-edit):

```json
{
  "button.claim": {
    "screen": "vip",
    "bbox": [120, 880, 320, 940],
    "action": "exist",
    "threshold": 0.85
  }
}
```

The `threshold` knob is exposed in the editor — lower values are more permissive (false positives), higher are stricter (false negatives). Start at `0.85` and only adjust if you see misfires.

## Common mistakes

- **Re-labeling the same region from a different screen** — region names are global. If `button.claim` exists in both `vip` and `mail`, scope it: `button.vip.claim` and `button.mail.claim`.
- **Hand-editing `area.json`** — the editor reloads region cache on save; a hand-edit won't trigger the reload and your changes will be ignored until you bounce the bot.
- **Capturing at the wrong resolution** — anything other than 720 × 1280 portrait and the coordinates drift. Verify your BlueStacks instance: see [Emulator setup](/config/emulator/).
- **Threshold too tight** — if `match` is failing on a screen that looks identical to you, drop the threshold by 5 points before assuming the labeling is wrong.

When you're done labeling, head to [Writing scenarios (DSL)](/authoring/dsl/) to wire the regions into an actual automation.
