---
title: Images & networking
description: Reference for the pre-built container images and the host-networking model used by the bot.
sidebar:
  order: 5
---

## Images that get pulled

| Service | Image | Notes |
|:--------|:------|:------|
| `bot` | `ghcr.io/batazor/autopilot/bot:latest` | Headless worker + scheduler + local Tesseract OCR. Multi-arch (amd64+arm64). |
| `api` | same `bot` image, `command: api` | FastAPI for the Web UI (`:8765`). |
| `web` | `ghcr.io/batazor/autopilot/web:latest` | Next.js operator dashboard (`:3000`). Multi-arch. |
| `redis` | `redis:alpine` | Queue + state. |
| `inference` | `roboflow/roboflow-inference-server-cpu` | **Optional** — only with the `full` profile. Fishing Tournament fish detector ([Fish detection](/autopilot-page/config/inference/)). |

### Default vs full stack (profiles)

The `inference` image is **not pulled by default** — it sits behind a Compose
profile, so a plain `up` runs only the core services:

```sh
docker compose -f docker-compose.prod.yml up -d --pull always                  # default: redis, bot, api, web
docker compose -f docker-compose.prod.yml --profile full up -d --pull always   # + inference (needs ROBOFLOW_API_KEY)
```

### Updating the public images

```sh
docker compose -f docker-compose.prod.yml up -d --pull always
```

Public images are published as `latest` only. `WOS_IMAGE_TAG` is still available in the compose file
for private forks that publish their own tags, but the official install path should stay on `latest`.

### Using a fork's images

```sh
WOS_REGISTRY=ghcr.io/your-fork docker compose -f docker-compose.prod.yml up -d --pull always
```

## How the container reaches the host's ADB

`bot`, `api`, and `web` run in `network_mode: host` so the app **shares the host's loopback** — `adb start-server` stays bound to `127.0.0.1:5037` (safe, no LAN exposure) and both workers and the dashboard ADB scan talk to it as `127.0.0.1:5037` from inside their containers.

No `adb -a`, no socat sidecar, no `host.docker.internal` indirection.

Side effect: app containers do not use Compose-internal DNS for `redis`. Instead, `bot` and `api` connect to Redis over a shared **Unix socket volume** (`redis_socket` → `/var/run/redis/redis.sock`), and `web` proxies `/api` to `127.0.0.1:8765`.

The compose file also shares `wos_temporal` between `bot` and `api`; that is where the worker writes
rolling screenshots used by the dashboard preview and Click approvals page.

## Platform support for `network_mode: host`

- **Linux** — fully supported out of the box.
- **Docker Desktop (macOS / Windows)** — works only with the **Host networking** beta enabled
  (*Settings → Resources → Network → Enable host networking*). Without it, the app containers can
  mount the Redis socket but **not** reliably reach the host's `adb` server.
