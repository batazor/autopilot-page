---
title: Install on Windows
description: Run the autopilot stack on Windows with Docker Desktop + WSL2.
sidebar:
  order: 4
  label: Windows
---

:::note[One-time setup]
1. Docker Desktop → **Settings → Resources → Network** → check **Enable host networking** (beta).
   Required so the bot container can talk to the host's `adb` server on `127.0.0.1:5037`.
2. Install [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools),
   unzip to e.g. `%LOCALAPPDATA%\Android\Sdk\platform-tools\`, and add that folder to your `PATH`
   (*System Properties → Environment Variables*).
3. In BlueStacks: **Settings → Advanced → Android Debug Bridge** → **Enabled**.
:::

```powershell
# 1. Fetch the compose file
curl -fsSL https://batazor.github.io/autopilot-page/docker-compose.prod.yml -o docker-compose.prod.yml

# 2. Bring up the host's ADB and confirm BlueStacks is visible
adb start-server
adb devices

# 3. Pull and start: redis + bot + api + web
docker compose -f docker-compose.prod.yml up -d

# 4. Open the dashboard
start http://127.0.0.1:3000/overview
```

On first start the dashboard will prompt for a license file — see [License activation](/autopilot-page/install/license/).

:::caution[Antivirus]
If your antivirus flags `adb.exe` as PUA — whitelist the Android Platform Tools folder. ADB is a legitimate dev tool but can give root shells, so some scanners treat it as suspicious.
:::
