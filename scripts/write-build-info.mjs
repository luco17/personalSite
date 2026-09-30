import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export async function writeBuildInfo({ root = projectRoot } = {}) {
  const [commit, committedAt] = execFileSync(
    'git', ['show', '-s', '--format=%H%n%cI', 'HEAD'],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  ).trim().split('\n');

  if (!/^[a-f0-9]{40}$/.test(commit) || !Number.isFinite(Date.parse(committedAt))) {
    throw new Error('Cannot identify the source commit for this build.');
  }

  const info = { schemaVersion: 1, commit, committedAt: new Date(committedAt).toISOString() };
  // Astro's Cloudflare adapter serves static assets from dist/client.
  await writeFile(resolve(root, 'dist/client/build-info.json'), `${JSON.stringify(info)}\n`);
  return info;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const info = await writeBuildInfo();
  console.log(`Published build metadata for ${info.commit.slice(0, 12)}.`);
}
