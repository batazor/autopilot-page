---
title: License activation
description: How to get and apply a free license key for Autopilot. Includes trial vs pro tier comparison.
sidebar:
  order: 5
  label: License
---

The bot is **free**. A license file is still required — it carries your tier (trial / pro), expiry, and usage limits (max devices, max players per device), and lets us rotate keys without releasing a new image.

## Trial vs Pro

| | **Trial** | **Pro** |
|:---|:---|:---|
| Price | Free | Free |
| Host binding | Any host (one shared key) | Bound to a specific host fingerprint |
| Devices (emulator instances) | **2** | Negotiable (default 1, capped at 100) |
| Players per device | **3** | **3** (capped at 100) |
| Validity | Monthly key rotation in Discord | Issued per request |
| How to get it | Grab the current `licence.json` from the `#install` channel on [Discord](https://discord.gg/62twnzKG9) | DM a maintainer with your host fingerprint (shown in the UI's License page) |

The trial key works on any host — same file works for every user. The pro key is bound to your machine fingerprint and won't run on a different host.

## Apply the trial key

1. Start the stack — `docker compose -f docker-compose.prod.yml up -d`
2. Open the dashboard at <http://127.0.0.1:3000/overview>
3. The UI will prompt you to **upload a license file** on first start
4. Drop in the `licence.json` you got from the `#install` Discord channel
5. The UI will ask you to restart the stack:

   ```sh
   docker compose -f docker-compose.prod.yml restart bot
   ```

That's it. The license file is persisted in the `wos_license` Docker volume (shared between `bot` and `api`) and survives `docker compose down`. It is only wiped by `docker compose down -v`.

## Get a pro key

If 2 devices × 3 players isn't enough — or if you'd rather not chase the monthly Discord rotation — request a pro key:

1. Open the dashboard's **License** page; copy your host fingerprint
2. DM a maintainer on Discord with the fingerprint and the device/player count you need
3. They'll send back a `licence.json` bound to your host; apply it the same way as the trial

## When the key expires

Trial keys rotate every so often. When yours stops working:

1. Pull the latest `licence.json` from the `#install` Discord channel
2. Re-upload it through the same UI flow
