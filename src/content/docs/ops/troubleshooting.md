---
title: Troubleshooting
description: Common failures and how to diagnose them.
---

## Self-diagnosis

`adb` ships **inside** the bot image — you don't need it installed on the host. The compose file
names the container `autopilot-bot`, so run ADB straight inside it:

```sh
docker info | grep -i 'server version'                # daemon reachable
docker compose -f docker-compose.prod.yml ps          # services up + healthchecks
docker exec autopilot-bot adb devices                 # emulator visible from inside the bot
docker compose -f docker-compose.prod.yml logs --tail=80 bot | grep -i error
```

If `adb devices` is empty, the bot can't reach the emulator. Restart ADB from inside the same
container — no host `adb` required:

```sh
docker exec autopilot-bot adb kill-server
docker exec autopilot-bot adb start-server
docker exec autopilot-bot adb devices
```

Typical failures:

- **Docker daemon unreachable** — Docker Desktop closed or the WSL2 backend asleep (Windows).
- **Host networking off** — enable *Settings → Resources → Network → Enable host networking* in Docker Desktop (macOS / Windows). The bot shares the host loopback through host networking; without it the container can't reach the emulator's ADB.
- **`autopilot-bot` not found** — the stack isn't running, or your compose file predates `container_name`. Re-fetch `docker-compose.prod.yml`, then `docker compose -f docker-compose.prod.yml up -d`.
- **No online device** — start the emulator and enable its ADB (BlueStacks: *Settings → Advanced → Android Debug Bridge*), then re-run the ADB restart above.

## Inspecting a running stack

```sh
docker compose -f docker-compose.prod.yml ps             # service status + healthchecks
docker compose -f docker-compose.prod.yml logs -f bot    # worker logs
docker compose -f docker-compose.prod.yml logs -f api    # dashboard API logs
docker exec autopilot-bot adb devices                    # ADB visibility from inside the bot container
```

## Error reporting

Official production images **automatically ship error logs** to the maintainer's
Grafana Cloud (Loki): uncaught exceptions, crashes, and any `ERROR`-level log
line are sent with their stack trace and the `inst` / `player` / `node` context,
so most issues can be diagnosed without you sending anything by hand. Only
`ERROR` and above leave your machine — normal `INFO`/`DEBUG` logs stay local.
This is tied to a credential baked into the official image; local/source builds
without it ship nothing.

When you open an issue or ask in the `#install` channel on Discord, include the
approximate time and what you were doing so the report can be matched up. For
the local container logs around that moment:

```sh
docker compose -f docker-compose.prod.yml logs --tail=200 bot
docker compose -f docker-compose.prod.yml logs --tail=200 api
```

## Common symptoms

<div class="scenario-tables">

| Symptom | Likely cause | Fix |
|:--------|:-------------|:----|
| A UI page shows an API error banner | Backend endpoint failed or returned a validation error | Click **Copy report** in the banner and send it with `docker compose -f docker-compose.prod.yml logs --tail=120 api`. |
| Bot UI loads but no work runs | All instances `paused=1` / `auto_paused=1` in Redis | `docker compose -f docker-compose.prod.yml logs bot` — the `game_health_watchdog` line shows why. Usually no ADB device online. |
| Bot control says stopped, but the fleet overview has a live worker | Old API image or stale browser data | `docker compose -f docker-compose.prod.yml up -d --pull always`, then refresh the dashboard. |
| ADB scan doesn't list a running emulator | Scan missed the port, or ADB kept an old offline serial | Confirm with `docker exec autopilot-bot adb devices`, then **Devices (ADB) → Add device** with that serial, e.g. `127.0.0.1:5615`. |
| Screenshot / approvals image is blank | `api` can't see the worker's rolling-screenshot dir | Re-fetch `docker-compose.prod.yml` and recreate `api` + `bot`; the current compose mounts `wos_temporal` into both. |
| `tap_*` scenarios stall on "waiting for approval" | `click_approval` mode left on with the approvals page closed | Open **Click approvals** (`/approvals`), or unset `wos:ui:click_approval:enabled:<inst>` in Redis. |
| Bot can't see the emulator inside the container | `network_mode: host` not active | Docker Desktop → enable Host networking (see [Images & networking](/autopilot-page/install/images/)). |
| OCR returns garbage / empty text | Wrong emulator resolution or DPI | Verify [Emulator setup](/autopilot-page/config/emulator/) — must be **720 × 1280 @ 320 DPI, English**. |
| Startup blocked with `validation acknowledged via WOS_VALIDATION_ACK` | Mismatch between `area.json` / `analyze/*.yaml` / `scenarios/*.yaml` | The message names the file + key. Set `WOS_VALIDATION_ACK=1` only as a temporary unblock — fix the YAML, then remove the env var. |
| Fish detect: `Inference unavailable: … HTTP 401 …` | Roboflow API key missing / invalid (optional [Fish detection](/autopilot-page/config/inference/)) | Set `ROBOFLOW_API_KEY` and restart the API. Only affects the Fishing Tournament detector. |

</div>
