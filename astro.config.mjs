// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://batazor.github.io',
  base: '/autopilot-page',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    starlight({
      title: 'Autopilot',
      description:
        'Free, game-agnostic Android autopilot — one worker per emulator instance, queue/state in Redis, screen text via local Tesseract OCR. Whiteout Survival fully covered, including Dreamscape Memory; Kingshot on the roadmap.',
      logo: {
        src: './src/assets/logo.png',
        replacesTitle: false,
      },
      favicon: '/favicon.png',
      customCss: ['./src/styles/tailwind.css', './src/styles/wos.css'],
      head: [
        // OG / Twitter card image — what Discord, Slack, Telegram show when
        // somebody pastes the docs URL. Served from /public so the absolute URL
        // is stable.
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://batazor.github.io/autopilot-page/wos.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:image',
            content: 'https://batazor.github.io/autopilot-page/wos.png',
          },
        },
      ],
      social: [
        {
          icon: 'discord',
          label: 'Discord',
          href: 'https://discord.gg/62twnzKG9',
        },
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/batazor/autopilot-page',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/batazor/autopilot-page/edit/main/',
      },
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Overview', slug: 'index' },
          ],
        },
        {
          label: 'Supported games',
          items: [
            { label: 'Overview', slug: 'games' },
            {
              label: 'Whiteout Survival',
              items: [
                { label: 'Overview', slug: 'games/whiteout-survival' },
                { label: 'Dreamscape Memory (module)', slug: 'games/dreamscape-memory' },
              ],
            },
            { label: 'Kingshot', slug: 'games/kingshot' },
          ],
        },
        {
          label: 'Installation',
          items: [
            { label: 'Prerequisites', slug: 'install/prerequisites' },
            { label: 'macOS', slug: 'install/macos' },
            { label: 'Linux', slug: 'install/linux' },
            { label: 'Windows', slug: 'install/windows' },
            { label: 'License', slug: 'install/license' },
            { label: 'Images & networking', slug: 'install/images' },
          ],
        },
        {
          label: 'Configuration',
          items: [
            { label: 'Emulator setup', slug: 'config/emulator' },
            { label: 'Fish detection (Roboflow)', slug: 'config/inference' },
          ],
        },
        {
          label: 'Authoring',
          items: [
            { label: 'Flow', slug: 'authoring/flow' },
            { label: 'New module', slug: 'authoring/new-module' },
            { label: 'Labeling regions', slug: 'authoring/labeling' },
            { label: 'DSL primer', slug: 'authoring/dsl' },
          ],
        },
        {
          label: 'Operations',
          items: [
            { label: 'Devices (ADB)', slug: 'ops/devices' },
            { label: 'Queue & scheduling', slug: 'ops/queue' },
            { label: 'Click approvals', slug: 'ops/approvals' },
            { label: 'Gift codes', slug: 'ops/gift-codes' },
            { label: 'Troubleshooting', slug: 'ops/troubleshooting' },
          ],
        },
      ],
    }),
  ],
});
