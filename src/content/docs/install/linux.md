---
title: Install on Linux
description: Run the autopilot stack on Linux with Docker Engine.
sidebar:
  order: 3
  label: Linux
---

:::tip
Native Linux — `network_mode: host` works out of the box, nothing to toggle.
:::

```sh
# 1. Fetch the compose file
curl -fsSL https://batazor.github.io/autopilot-page/docker-compose.prod.yml -o docker-compose.prod.yml

# 2. Bring up the host's ADB and confirm BlueStacks is visible
adb start-server
adb devices

# 3. Pull and start: redis + bot + api + web
docker compose -f docker-compose.prod.yml up -d

# 4. Open the dashboard
xdg-open http://127.0.0.1:3000/overview
```

On first start the dashboard will prompt for a license file — see [License activation](/autopilot-page/install/license/).
