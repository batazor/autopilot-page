---
title: License activation
description: How to get and apply a free license key for Autopilot.
sidebar:
  order: 5
  label: License
---

The bot is **free**. A license file is still required — it binds your install to a stable per-host id, which keeps the build secure to distribute as pre-built images.

## Get a key

Fresh keys are posted in the **`#install`** channel on our [Discord](https://discord.gg/62twnzKG9). Grab the latest `wos-license.json` from there.

## Apply it

1. Start the stack — `docker compose -f docker-compose.prod.yml up -d`
2. Open the dashboard at <http://127.0.0.1:3000/overview>
3. The UI will prompt you to **upload a license file** on first start
4. Drop in the `wos-license.json` you got from Discord
5. The UI will ask you to restart the stack:

   ```sh
   docker compose -f docker-compose.prod.yml restart bot
   ```

That's it. The license file is persisted in the `wos_license` Docker volume (shared between `bot` and `api`) and survives `docker compose down`. It is only wiped if you run `docker compose down -v`.

## When the key expires

Keys rotate every so often. When yours stops working:

1. Pull the latest one from the `#install` Discord channel
2. Re-upload it through the same UI flow
