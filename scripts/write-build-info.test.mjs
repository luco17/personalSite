import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { writeBuildInfo } from './write-build-info.mjs';

test('build metadata identifies the source commit and is reproducible', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'personal-site-build-info-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, {
    cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_AUTHOR_DATE: '2026-09-30T10:00:00Z', GIT_COMMITTER_DATE: '2026-09-30T10:00:00Z' },
  }).trim();
  git('init');
  await writeFile(join(root, 'post.md'), 'Published content');
  git('add', 'post.md');
  git('-c', 'user.name=Build test', '-c', 'user.email=build@example.invalid', 'commit', '-m', 'test content');
  await mkdir(join(root, 'dist/client'), { recursive: true });

  const first = await writeBuildInfo({ root });
  const second = await writeBuildInfo({ root });
  assert.deepEqual(first, {
    schemaVersion: 1,
    commit: git('rev-parse', 'HEAD'),
    committedAt: '2026-09-30T10:00:00.000Z',
  });
  assert.deepEqual(second, first);
  assert.deepEqual(JSON.parse(await readFile(join(root, 'dist/client/build-info.json'), 'utf8')), first);
});
