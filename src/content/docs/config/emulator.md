---
title: Emulator setup
description: Required BlueStacks settings for Autopilot.
---

The bot interfaces with your Android emulator via ADB. Officially supported: **BlueStacks 5+**.

## Required instance settings

| Setting | Value | Status |
|:--------|:------|:------:|
| **Resolution** | `720 × 1280` (Portrait) | **Mandatory** |
| **DPI** | `320` | **Mandatory** |
| **Game Language** | English | **Mandatory** |
| **ADB** | Enabled (Advanced settings → Android Debug Bridge) | **Mandatory** |
| **ADB Serial** | Matches the device serial configured in the autopilot devices table | **Mandatory** |
| **CPU / RAM** | 2 Cores / 2 GB | Recommended |
| **Frame Rate** | 30 FPS | Recommended |

:::tip[In-game graphics]
In the game's settings, disable **Snowfall** and **Day/Night Cycle**, and avoid **Ultra** graphics.
This considerably improves performance and visual reliability for the bot.
:::
