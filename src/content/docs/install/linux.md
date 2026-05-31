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

## Optional: emulator choices

BlueStacks is the known-good default, but Linux can also run Autopilot against
any Android target that shows up in `adb devices` and can be kept at
**720 × 1280 portrait, 320 DPI, English game language**.

| Option | When to use it | Setup notes |
|:-------|:---------------|:------------|
| [Android Studio Emulator](https://developer.android.com/studio/run/managing-avds) | You want the official Android emulator and already have Android Studio / SDK tools installed. | Create a phone AVD with a custom 720 × 1280 portrait hardware profile, set density to 320 DPI, launch it, then confirm `adb devices` shows an `emulator-####` serial. |
| [Waydroid](https://docs.waydro.id/) | You want a lightweight Linux-native Android container on a Wayland desktop. | Install and initialize Waydroid for your distro, start the session, connect ADB with `adb connect <waydroid-ip>:5555`, then verify it appears in `adb devices`. Waydroid is optional/advanced; test one account first before scaling. |

For either option, open the game once, set the game language to English, and
verify the active display profile before starting the stack:

```sh
adb shell wm size
adb shell wm density
```

```sh
# 1. Fetch the compose file
curl -fsSL https://batazor.github.io/autopilot-page/docker-compose.prod.yml -o docker-compose.prod.yml

# 2. Bring up the host's ADB and confirm your emulator is visible
adb start-server
adb devices

# 3. Pull and start: redis + bot + api + web
docker compose -f docker-compose.prod.yml up -d

# 4. Open the dashboard
xdg-open http://127.0.0.1:3000/overview
```

On first start the dashboard will prompt for a license file — see [License activation](/autopilot-page/install/license/).
