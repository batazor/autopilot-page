// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://batazor.github.io',
  base: '/autopilot-page',
  integrations: [
    starlight({
      title: 'Whiteout Survival Autopilot',
      description:
        'Multi-account Whiteout Survival bot — one worker per BlueStacks instance, queue/state in Redis, screen text via local Tesseract OCR.',
      logo: {
        src: './src/assets/logo.png',
        replacesTitle: false,
      },
      favicon: '/favicon.png',
      customCss: ['./src/styles/wos.css'],
      social: [
        {
          icon: 'discord',
          label: 'Discord',
          href: 'https://discord.gg/62twnzKG9',
        },
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/batazor/autopilot',
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
            { label: 'Whiteout Survival', slug: 'features' },
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
          ],
        },
        {
          label: 'Operations',
          items: [
            { label: 'Troubleshooting', slug: 'ops/troubleshooting' },
          ],
        },
      ],
    }),
  ],
});
