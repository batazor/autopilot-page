---
title: Troubleshooting
description: Common failures and how to diagnose them.
---

## Self-diagnosis

```sh
docker info | grep -i 'server version\|host'      # daemon reachable, host-net mode
docker compose version --short                    # Compose v2 installed
adb version && adb devices                        # ADB on PATH + emulator online
which adb                                         # actual binary used
docker compose -f docker-compose.prod.yml logs --tail=80 bot | grep -i license
```

Typical failures:

- **Docker daemon unreachable** — Docker Desktop closed or WSL2 backend asleep (Windows).
- **Host networking off** — enable *Settings → Resources → Network* in Docker Desktop (macOS / Windows).
- **`adb` not on `PATH`** — install [Platform Tools](https://developer.android.com/tools/releases/platform-tools) and add to `PATH`.
- **No online device** — enable BlueStacks ADB, then `adb kill-server` && `adb start-server`.

## Inspecting a running stack

```sh
docker compose -f docker-compose.prod.yml ps             # service status + healthchecks
docker compose -f docker-compose.prod.yml logs -f bot    # worker logs
docker compose -f docker-compose.prod.yml logs -f api    # dashboard API logs
docker compose -f docker-compose.prod.yml exec bot adb devices   # ADB visibility from inside the bot container
```

## Common symptoms

| Symptom | Likely cause | Where to look |
|:--------|:-------------|:--------------|
| Bot service is healthy but no work starts; logs say `license gate: waiting for valid license` | Fresh install or expired/invalid license | Open `/license`, upload the current `licence.jwt`, then wait a few seconds. The bot service watches the shared `license-data` volume and continues automatically; no restart is needed. |
| License page or another UI page shows an API error | Backend endpoint failed or returned a detailed validation error | Click **Copy report** in the red error banner and send the JSON report with `docker compose -f docker-compose.prod.yml logs --tail=120 api`. |
| Bot UI loads, no work runs | All instances `paused=1` / `auto_paused=1` in Redis | `docker compose … logs bot` — the `game_health_watchdog` line shows why. Usually no ADB device online. |
| Bot control says stopped but the fleet overview has a live worker | Old API image or stale browser data | Pull the current `latest` images with `docker compose -f docker-compose.prod.yml up -d --pull always`, then refresh the dashboard. Current builds read fleet heartbeats for the Bot control card. |
| ADB scan does not list a running emulator | Port scan missed the emulator, or ADB kept an old offline serial | Open **Devices (ADB)**, click **Add device**, and enter the serial shown by `adb devices`, for example `127.0.0.1:5615`. |
| Screenshot / approvals image is blank | `api` cannot see the worker's rolling screenshot directory | Re-fetch `docker-compose.prod.yml` and recreate `api` + `bot`; the current compose mounts `wos_temporal` into both services. |
| `tap_*` scenarios stall on "waiting for approval" | `click_approval` mode left on with the approvals page closed | Open **Click approvals** in the Web UI (`/approvals`), or unset `wos:ui:click_approval:enabled:<inst>` in Redis. |
| Bot can't see the emulator inside the container | `network_mode: host` not active | Docker Desktop → enable Host networking (see [Images & networking](/autopilot-page/install/images/)). |
| OCR returns garbage / empty text | Wrong emulator resolution or DPI | Verify [Emulator setup](/autopilot-page/config/emulator/) — must be **720 × 1280 @ 320 DPI, English**. |
| Startup blocked with `validation acknowledged via WOS_VALIDATION_ACK` prompt | Mismatch between `area.json` / `analyze/*.yaml` / `scenarios/*.yaml` | The error message names the file + key. Set `WOS_VALIDATION_ACK=1` only as a temporary unblock — fix the YAML and remove the env var afterwards. |
| Fish detect page: `Inference unavailable: … HTTP 401 …` | Roboflow API key missing/invalid (optional [Fish detection](/autopilot-page/config/inference/) feature) | Set `ROBOFLOW_API_KEY` and restart the API process (`.env` is read once at start). Only affects the Fishing Tournament fish detector — nothing else needs it. |
