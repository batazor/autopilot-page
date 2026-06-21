# autopilot-page

Documentation site for [Whiteout Survival Autopilot](https://github.com/batazor/autopilot), built with [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/).

Live at <https://batazor.github.io/autopilot-page/>.

## Develop

```sh
npm install
npm run dev      # http://127.0.0.1:4321
npm run build
```

## Deploy

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the site
and publishes to GitHub Pages. Enable Pages once in repo settings → Pages →
Source: **GitHub Actions**.
