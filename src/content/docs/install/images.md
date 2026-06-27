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
| `inference` | `roboflow/roboflow-inference-server-cpu` | **Optional** — only with the `full` profile. Fishing Tournament fish detector ([Fish detection](/config/inference/)). |

### Registry mirror (GitLab)

The source repo is mirrored to
[gitlab.com/batazor/autopilot](https://gitlab.com/batazor/autopilot), and its
pipeline (`.gitlab-ci.yml`) publishes the **same multi-arch (amd64+arm64)**
`bot` and `web` images to the GitLab Container Registry. If GHCR is slow or
blocked for you, point the stack at the mirror with `WOS_REGISTRY` — nothing
else changes:

```sh
WOS_REGISTRY=registry.gitlab.com/batazor/autopilot \
  docker compose -f docker-compose.prod.yml up -d --pull always
```

| Service | GitHub Container Registry (default) | GitLab Container Registry (mirror) |
|:--------|:------------------------------------|:-----------------------------------|
| `bot` | `ghcr.io/batazor/autopilot/bot:latest` | `registry.gitlab.com/batazor/autopilot/bot:latest` |
| `web` | `ghcr.io/batazor/autopilot/web:latest` | `registry.gitlab.com/batazor/autopilot/web:latest` |

### Default vs full stack (profiles)

The `inference` image is **not pulled by default** — it sits behind a Compose
profile, so a plain `up` runs only the core services:

```sh
docker compose -f docker-compose.prod.yml up -d --pull always                  # default: redis, bot, api, web
docker compose -f docker-compose.prod.yml --profile full up -d --pull always   # + inference (needs ROBOFLOW_API_KEY)
```

### Updating the public images

Public images are published as `latest` only — keep your install on `latest`.
Updating is more than `--pull always` (you also refresh the compose file, and a
stuck container needs a `down` first) — see **[Updating](/install/updating/)**.

## How the container reaches ADB

`bot`, `api`, and `web` run in `network_mode: host` so the app **shares the host's loopback**. On boot the `bot` starts **its own** adb server (bundled in the image) on `127.0.0.1:5037`; because that port is the shared host loopback, the workers, the dashboard ADB scan, and any emulator on loopback all reach it. **You don't install `adb` on the host or run `adb start-server` yourself** — the container does it (`adb.ensure_adb_server`, idempotent). The server stays bound to loopback only (safe, no LAN exposure).

No host adb, no `adb -a`, no socat sidecar, no `host.docker.internal` indirection.

Side effect: app containers do not use Compose-internal DNS for `redis`. Instead, `bot` and `api` connect to Redis over a shared **Unix socket volume** (`redis_socket` → `/var/run/redis/redis.sock`), and `web` proxies `/api` to `127.0.0.1:8765`.

The compose file also shares `wos_temporal` between `bot` and `api`; that is where the worker writes
rolling screenshots used by the dashboard preview and Click approvals page.

## Platform support for `network_mode: host`

- **Linux** — fully supported out of the box.
- **Docker Desktop (macOS / Windows)** — works only with the **Host networking** beta enabled
  (*Settings → Resources → Network → Enable host networking*). Without it, the app containers can
  mount the Redis socket but **not** reliably reach the emulator over the shared loopback.
