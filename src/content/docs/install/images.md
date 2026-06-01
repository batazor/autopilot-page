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
docker compose -f docker-compose.prod.yml up -d                  # default: redis, bot, api, web
docker compose -f docker-compose.prod.yml --profile full up -d   # + inference (needs ROBOFLOW_API_KEY)
```

### Pinning a version

```sh
WOS_IMAGE_TAG=v0.1.0 docker compose -f docker-compose.prod.yml up -d
```

### Using a fork's images

```sh
WOS_REGISTRY=ghcr.io/your-fork docker compose -f docker-compose.prod.yml up -d
```

## How the container reaches the host's ADB

`bot` runs in `network_mode: host` so the container **shares the host's loopback** — `adb start-server` stays bound to `127.0.0.1:5037` (safe, no LAN exposure) and the container talks to it as `127.0.0.1:5037` from inside.

No `adb -a`, no socat sidecar, no `host.docker.internal` indirection.

Side effect: `bot` cannot use Compose-internal DNS for `redis`. Instead, `bot` connects to Redis over a shared **Unix socket volume** (`redis_socket` → `/var/run/redis/redis.sock`). `api` and `web` use the default bridge network and reach Redis via the `redis` service name; `web` proxies `/api` to `api:8765`.

## Platform support for `network_mode: host`

- **Linux** — fully supported out of the box.
- **Docker Desktop (macOS / Windows)** — works only with the **Host networking** beta enabled
  (*Settings → Resources → Network → Enable host networking*). Without it, the bot can reach `redis`
  on loopback but **not** the host's `adb` server.
