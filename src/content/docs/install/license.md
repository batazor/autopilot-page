---
title: License activation
description: How to get and apply a license key for Autopilot. Trial is free; Pro is in private beta (free for contributors and testers).
sidebar:
  order: 5
  label: License
---

The bot itself is **free** under the trial tier. A license file is still required — it carries your tier (trial / pro), expiry, and usage limits (max devices, max players per device), and lets us rotate keys without releasing a new image.

## Get started in 30 seconds

1. Start the stack — `docker compose -f docker-compose.prod.yml up -d`
2. Open the dashboard at <http://127.0.0.1:3000/overview>
3. Grab the current `licence.jwt` from the `#install` channel on [Discord](https://discord.gg/62twnzKG9)
4. The UI will prompt you to **upload a license file** on first start — drop the `licence.jwt` in
5. Restart the bot when the UI asks:

   ```sh
   docker compose -f docker-compose.prod.yml restart bot
   ```

That's it. The license file is persisted in the `wos_license` Docker volume (shared between `bot` and `api`) and survives `docker compose down`. It is only wiped by `docker compose down -v`.

## When the key expires

Trial keys rotate every so often. When yours stops working:

1. Pull the latest `licence.jwt` from the `#install` channel on [Discord](https://discord.gg/62twnzKG9)
2. Re-upload it through the same UI flow

## Trial vs Pro

| | **Trial** | **Pro** _(private beta)_ |
|:---|:---|:---|
| Host binding | Any host (one shared key) | Bound to a specific host fingerprint |
| Devices (emulator instances) | **2** | Negotiable (default 1, capped at 100) |
| Players per device | **3** | **3** (capped at 100) |
| Validity | Monthly key rotation in [Discord](https://discord.gg/62twnzKG9) | Issued per request |
| How to get it | `#install` channel on [Discord](https://discord.gg/62twnzKG9) | DM a maintainer (see below) |

The trial key works on any host — same file works for every user. The pro key will be bound to your machine fingerprint and won't run on a different host.

:::tip[Pro is in private beta — free for contributors & testers]
A paid Pro tier is on the roadmap, but it isn't open for purchase yet. In the meantime, Pro is **free** for people helping the project — module development & debugging, labeling, and active testing of pre-release builds. DM a maintainer on [Discord](https://discord.gg/62twnzKG9) with your host fingerprint (shown on the dashboard's **License** page) and we'll issue you a key.
:::
