// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { visit } from 'unist-util-visit';

// Single source of truth for the GitHub Pages project subpath. Used both as
// Astro's `base` and by the remark plugin below, so page content never has to
// hard-code it — change it here to move the site.
const base = '/autopilot-page';

// Prefix root-relative in-page links/assets with `base` at build time, so MD/MDX
// can use plain "/install/…" paths. Covers markdown links/images and raw/JSX
// <a href> / <img src> (mdxJsxElement) attributes. Idempotent — already-based
// and external (http, //, #, mailto, relative) URLs are left untouched.
//
// NOTE: this walks the MDAST body only. Starlight reads `hero.actions[].link`
// from validated frontmatter (before remark runs), so those few hero links keep
// the literal base prefix in the .mdx frontmatter — the one deliberate exception.
function withBase(url) {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return url;
  if (url === base || url.startsWith(base + '/')) return url;
  return base + url;
}
function remarkBasePath() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        (node.type === 'link' || node.type === 'image' || node.type === 'definition') &&
        typeof node.url === 'string'
      ) {
        node.url = withBase(node.url);
      } else if (
        (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
        Array.isArray(node.attributes)
      ) {
        for (const attr of node.attributes) {
          if (
            attr &&
            attr.type === 'mdxJsxAttribute' &&
            (attr.name === 'href' || attr.name === 'src') &&
            typeof attr.value === 'string'
          ) {
            attr.value = withBase(attr.value);
          }
        }
      }
    });
  };
}

export default defineConfig({
  site: 'https://batazor.github.io',
  base,
  markdown: {
    remarkPlugins: [remarkBasePath],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap(),
    starlight({
      title: 'Autopilot',
      description:
        'Free, game-agnostic Android autopilot — one worker per emulator instance, queue/state in Redis, screen text via local Tesseract OCR. Whiteout Survival fully covered, including Dreamscape Memory; Kingshot basic automation is underway.',
      logo: {
        src: './src/assets/logo.png',
        replacesTitle: false,
      },
      favicon: '/favicon.png',
      customCss: ['./src/styles/tailwind.css', './src/styles/wos.css'],
      head: [
        // Google Analytics 4.
        {
          tag: 'script',
          attrs: {
            async: true,
            src: 'https://www.googletagmanager.com/gtag/js?id=G-H94ZVP57ER',
          },
        },
        {
          tag: 'script',
          content: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-H94ZVP57ER');
`,
        },
        // Google Search Console ownership verification (meta-tag method —
        // works on the project subpath, unlike a root robots.txt/HTML file).
        {
          tag: 'meta',
          attrs: {
            name: 'google-site-verification',
            content: 'SV2rA14MQUfzFJ662HU_y99PCVv0RNUdwEmt5dxvxjI',
          },
        },
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
        // Header theme toggle for small screens (styles: wos.css). Starlight
        // buries its theme select inside the hamburger menu on docs pages and
        // omits it entirely on the splash page, so phones get a one-tap button
        // next to search. Syncs with Starlight: same data-theme attribute +
        // localStorage key.
        {
          tag: 'script',
          content: `
(function () {
  function init() {
    if (document.getElementById('wos-theme-fab')) return;
    var btn = document.createElement('button');
    btn.id = 'wos-theme-fab';
    btn.type = 'button';
    var SUN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
    var MOON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    function dark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }
    function render() {
      btn.innerHTML = dark() ? SUN : MOON;
      btn.setAttribute('aria-label', dark() ? 'Switch to light theme' : 'Switch to dark theme');
    }
    btn.addEventListener('click', function () {
      var next = dark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('starlight-theme', next); } catch (e) { /* private mode */ }
      document.querySelectorAll('starlight-theme-select select').forEach(function (s) { s.value = next; });
      render();
    });
    render();
    new MutationObserver(render)
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    // The flex row is the inner div.header; the outer <header> is a block.
    var header = document.querySelector('header.header > div.header')
      || document.querySelector('header.header')
      || document.querySelector('.header');
    (header || document.body).appendChild(btn);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
`,
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/batazor/autopilot',
        },
        {
          icon: 'discord',
          label: 'Discord',
          href: 'https://discord.gg/62twnzKG9',
        },
      ],
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
            { label: 'Images & networking', slug: 'install/images' },
            { label: 'Updating', slug: 'install/updating' },
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
