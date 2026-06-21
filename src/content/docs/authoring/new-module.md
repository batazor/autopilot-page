---
title: Creating a module
description: Scaffold a new module directory from the dashboard's /modules page — module.yaml, analyze/, scenarios/ — and go straight to writing your first scenario.
sidebar:
  order: 2
  label: New module
---

Every automation lives inside a **module** — a directory under `modules/` with a `module.yaml` manifest, overlay rules in `analyze/analyze.yaml`, and DSL scenarios in `scenarios/`. If your automation fits an existing module (e.g. a new hero scenario goes in `modules/heroes/`), skip this page and head straight to [Labeling](/autopilot-page/authoring/labeling/) and the [DSL primer](/autopilot-page/authoring/dsl/). Create a new module only when you're starting a new feature domain.

## Scaffold from the dashboard

1. Open <http://127.0.0.1:3000/modules>.
2. Click **New module**. A dialog opens with five fields:

   | Field | What it means |
   |:---|:---|
   | **ID** | Directory name and module identifier. Lowercase letters, digits, and underscores; must start with a letter. Example: `my_feature`. |
   | **Title** | Human-readable label shown in the dashboard. |
   | **Description** | One-line summary of what this module automates. |
   | **Parent** | Where the directory lands: root (`modules/<id>/`), or under `core`, `deals`, `alliance`, `events`. Pick `core` for game-wide infrastructure; otherwise root is fine. |
   | **Include in wiki** | Exposes the module on the public wiki. Leave off until you have something worth showing. |

3. Click **Create**. The API writes:

   ```text
   modules/[<parent>/]<id>/
     module.yaml              # manifest with id, title, description, wiki flag
     analyze/analyze.yaml     # empty overlay rules (`overlay: []`)
     scenarios/.gitkeep       # empty scenarios folder
   ```

   The overlay engine and scenario loader pick the module up on the next tick — no restart needed.

## Add your first scenario

The newly created module row links to **`/edit-dsl?new=1`**, which jumps straight to the scenario editor with the create-scenario form focused. From there:

1. Pick your module from the dropdown.
2. Give the scenario a name and (optionally) a cron expression.
3. Drop in `match` / `click` / `while_match` steps — see the [DSL primer](/autopilot-page/authoring/dsl/) for syntax.
4. Save. The YAML file appears under `modules/<id>/scenarios/`.

If your scenario references regions that don't exist yet, label them first via the [Labeling editor](/autopilot-page/authoring/labeling/).

## Commit the new files

The scaffolding is written to disk but **not** committed for you. Once you're happy with the first scenario:

```sh
git add modules/<id>/ references/  # references/ only if you labeled new regions
git commit -m "feat(<id>): scaffold module"
```

That's it — the next worker restart loads your module the same way as everything else under `modules/`.
