---
title: Fish detection (Roboflow)
description: Optional object-detection inference for the Fishing Tournament event.
---

:::note[Optional]
This is an **optional** dependency. It is only needed for the **Fishing
Tournament** event, where fish appear at varying positions and orientations that
a fixed image template can't match. Everything else in Autopilot — every other
event, scenario, and the whole dashboard — works without it. Skip this page
entirely unless you want fish detection.
:::

The Fishing Tournament fish detector uses an object-detection model
(`find-fish-ssnpa/6`) served by a self-hosted **Roboflow inference server** that
runs as its own container. The model runs **locally** — your screenshots are
sent to `127.0.0.1:9001`, not to a cloud API.

## What you need

| Requirement | Why |
|:------------|:----|
| The `inference` container | Runs the model on your machine. |
| A Roboflow **API key** | The inference server uses it to download the model weights on the first request (cached afterwards). |

## 1. Get your Roboflow API key

Create a free account at [roboflow.com](https://roboflow.com), then retrieve your
**Private API Key** — see Roboflow's guide:
[Find your Roboflow API key](https://docs.roboflow.com/developer/authentication/find-your-roboflow-api-key#retrieve-an-api-key).

The key must have access to the workspace that owns `find-fish-ssnpa/6`. If you
point `WOS_FISH_MODEL_ID` at your own trained model, use a key for that
workspace instead.

## 2. Set the key

The detection request is made by the **API process**, so the key must be present
where that process runs.

**Production (Docker)** — set it in the environment, or add it to a `.env` file
next to `docker-compose.prod.yml`:

```sh
ROBOFLOW_API_KEY=rf_your_key
```

**Local dev** — add it to `.env` in the repo root, then **restart** `uv run play`
(the key is read once at process start):

```sh
ROBOFLOW_API_KEY=rf_your_key
```

## 3. Start the inference container

You have two ways to bring the container up: a one-click widget in the dashboard,
or the command line.

### From the dashboard (recommended)

The **Fish detect** page (Debug → Fish detect) has an **Inference service**
widget at the top. Press **Start** and it pulls the image, starts the container,
and shows live progress through four stages — **Install → Download → Start →
Ready** — alongside a liveness line (`container` / `health`) and a collapsible
**log window**. **Stop** shuts it down again (the container is kept, so the next
start is instant). No shell needed.

The widget drives Docker for you, so where it works depends on how the dashboard
runs:

- **Local dev** — works out of the box; the dashboard process reaches your host's
  Docker daemon directly.
- **Production** — the dashboard runs *inside* a container, so it needs the host
  Docker socket mounted into the `api` service **and** an image that ships the
  `docker` CLI. Both are **off by default** — mounting `/var/run/docker.sock`
  grants the container root-equivalent control of the host, so only enable it on
  a trusted, loopback-only deployment. The socket mount is pre-written (commented
  out) on the `api` service in `docker-compose.prod.yml`. Until you enable it the
  widget reads **"Docker unavailable"** — use the command-line path below instead.

It reuses the same `ROBOFLOW_API_KEY` from step 2 (read from the API process
environment) and the same `inference_cache` volume, so weights are shared with a
container you start via Compose.

### From the command line

The `inference` service is **opt-in**, gated behind a Compose profile so the
default `up` never pulls this image. Enable it with the `full` profile (which
also starts every normal service):

```sh
# production — full stack including inference
ROBOFLOW_API_KEY=rf_your_key docker compose -f docker-compose.prod.yml --profile full up -d

# local dev — full stack including inference
docker compose --profile full up -d
```

Already running the default stack and just want to add inference? Naming the
service starts it without restarting the rest:

```sh
docker compose -f docker-compose.prod.yml up -d inference --pull always   # production
docker compose up -d inference                              # local dev
```

The server listens on `127.0.0.1:9001`. The first detection pulls the model
weights (using your key) into the `inference_cache` volume; after that it works
offline and survives restarts.

## Optional tuning

These have working defaults — override via environment variables only if needed:

| Variable | Default | Purpose |
|:---------|:--------|:--------|
| `ROBOFLOW_API_KEY` | *(empty)* | Roboflow private API key. **Required** for this feature. |
| `WOS_INFERENCE_URL` | `http://127.0.0.1:9001` | Inference server URL (the prod `api` service uses `http://inference:9001`). |
| `WOS_FISH_MODEL_ID` | `find-fish-ssnpa/6` | Roboflow model id to run. |
| `WOS_FISH_CONFIDENCE` | `0.4` | Default confidence threshold. |
| `WOS_INFERENCE_TIMEOUT_SECONDS` | `30` | Request timeout. |

## Verify

Open the **Fish detect** page in the dashboard (Debug → Fish detect). The
**Inference service** widget at the top should read **Ready** once the container
is healthy — if it shows **Stopped**/**Not installed**, press **Start** and wait
for it to finish. Then pick an instance on the Fishing Tournament screen and
press **Run detection**. Detected fish are drawn as boxes with confidence scores.

If you see **"Inference unavailable: … HTTP 401 …"**, the API key is missing or
invalid — re-check steps 1–2 (and remember to restart the API process in dev so
it reloads `.env`).
