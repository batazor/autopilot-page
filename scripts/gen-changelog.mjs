// Generates src/content/docs/changelog.md from annotated git tags at build
// time. In CI the checkout must fetch tags (deploy.yml uses fetch-depth: 0).
// If git or tags are unavailable (shallow clone, tarball build), the existing
// file is left untouched so the build never fails.
import { execFileSync } from 'node:child_process';
import { writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'src', 'content', 'docs', 'changelog.md');

let tags = [];
try {
  const raw = execFileSync(
    'git',
    [
      'for-each-ref',
      'refs/tags',
      '--sort=-creatordate',
      '--format=%(refname:short)\t%(creatordate:short)\t%(contents:subject)',
    ],
    { cwd: root, encoding: 'utf8' },
  );
  tags = raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [tag, date, ...subject] = line.split('\t');
      return { tag, date, subject: subject.join('\t').trim() };
    })
    .filter((t) => /^v\d/.test(t.tag));
} catch {
  tags = [];
}

if (!tags.length) {
  if (existsSync(out)) {
    console.log('[changelog] no tags visible (shallow clone?) — keeping existing changelog.md');
    process.exit(0);
  }
  console.log('[changelog] no tags and no existing file — writing placeholder');
}

const body = tags
  .map((t) => `## ${t.tag} — ${t.date}\n\n${t.subject || '_no description_'}\n`)
  .join('\n');

const page = `---
title: Changelog
description: Release history of the Autopilot docs site and its browser tools, generated from git tags at build time.
sidebar:
  order: 2
  label: Changelog
template: doc
tableOfContents: false
---

Every release below is a \`vX.Y.Z\` git tag in the
[autopilot-page](https://github.com/batazor/autopilot-page) repository — tags
trigger the deploy, so this list is exactly what went live. The bot itself
lives in [autopilot](https://github.com/batazor/autopilot).

${body || '_No releases yet._'}
`;

writeFileSync(out, page);
console.log(`[changelog] wrote ${tags.length} releases to changelog.md`);
