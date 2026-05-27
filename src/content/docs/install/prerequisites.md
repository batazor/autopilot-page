---
title: Prerequisites
description: Required tools and BlueStacks setup before running the Autopilot stack.
sidebar:
  order: 1
---

:::tip
Pre-built images on GitHub Container Registry — no Python / uv install needed.
:::

## Required software

| Requirement | Version | Download |
|:------------|:--------|:---------|
| Docker | `compose v2` | [Get Docker](https://docs.docker.com/get-docker/) |
| Android Platform Tools (`adb`) | latest | [Download ADB](https://developer.android.com/tools/releases/platform-tools) |
| BlueStacks | `5` or newer | [Download BlueStacks](https://www.bluestacks.com/) |

:::caution[Emulator config]
The emulator must run **720 × 1280, 320 DPI, English game language**. See [Emulator setup](/autopilot-page/config/emulator/) for the full settings list.
:::

## Get the compose file

The autopilot bot is distributed as Docker images. You only need [`docker-compose.prod.yml`](/autopilot-page/docker-compose.prod.yml) to run it:

```sh
curl -fsSL https://batazor.github.io/autopilot-page/docker-compose.prod.yml -o docker-compose.prod.yml
```

Or save it manually from the link above. After that pick your platform: [macOS](/autopilot-page/install/macos/) · [Linux](/autopilot-page/install/linux/) · [Windows](/autopilot-page/install/windows/).

:::tip[License]
The bot is free, but you'll need a license file on first start. The dashboard asks for it via an upload prompt — get the current `licence.jwt` from the `#install` channel on [Discord](https://discord.gg/62twnzKG9). See [License activation](/autopilot-page/install/license/) for the full flow.
:::
