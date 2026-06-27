# autopilot-page

Documentation site for [Whiteout Survival Autopilot](https://github.com/batazor/autopilot), built with [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/).

Source is mirrored to [gitlab.com/batazor/autopilot](https://gitlab.com/batazor/autopilot) (GitLab CI publishes the multi-arch Docker images).

Live at <https://batazor.github.io/autopilot-page/>.

## Develop

```sh
npm install
npm run dev      # http://127.0.0.1:4321
npm run build
```

## Deploy

Pushing a version tag (`vX.Y.Z`) — or running the workflow manually from the
**Actions** tab (`workflow_dispatch`) — triggers `.github/workflows/deploy.yml`,
which builds the site and publishes to GitHub Pages. Plain pushes to `main` do
**not** redeploy; cut a tag to ship a release. Enable Pages once in repo
settings → Pages → Source: **GitHub Actions**.
