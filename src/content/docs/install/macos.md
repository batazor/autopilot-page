---
title: Install on macOS
description: Run the autopilot stack on macOS with Docker Desktop.
sidebar:
  order: 2
  label: macOS
---

:::note[One-time setup]
Docker Desktop → **Settings → Resources → Network** → check **Enable host networking** (beta).
Required so the bot container can talk to the host's `adb` server on `127.0.0.1:5037`.
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
open http://127.0.0.1:3000/overview
```

On first start the dashboard will prompt for a license file — see [License activation](/autopilot-page/install/license/).
