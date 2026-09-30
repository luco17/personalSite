import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { deployAndNotify, validateDeploySource } from './deploy.mjs';

const hookUrl = 'https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/test-secret';
const success = () => Response.json({ success: true, result: { build_uuid: 'test-build' } });

test('a failed site deployment never triggers Blaze', async () => {
  let requested = false;
  await assert.rejects(deployAndNotify({
    deploy: async () => { throw new Error('deployment failed'); },
    hookUrl,
    fetchImpl: async () => { requested = true; return success(); },
  }), /deployment failed/);
  assert.equal(requested, false);
});

test('the hook is posted only after deployment finishes', async () => {
  const events = [];
  await deployAndNotify({
    deploy: async () => { events.push('deployed'); },
    hookUrl,
    fetchImpl: async (url, options) => {
      assert.equal(url, hookUrl);
      assert.equal(options.method, 'POST');
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal instanceof AbortSignal);
      events.push('triggered');
      return success();
    },
    log: () => {},
  });
  assert.deepEqual(events, ['deployed', 'triggered']);
});

test('local deployments can omit the hook', async () => {
  const logs = [];
  await deployAndNotify({
    deploy: async () => {},
    hookUrl: '',
    fetchImpl: async () => { assert.fail('No hook should be called'); },
    log: (message) => logs.push(message),
  });
  assert.match(logs[0], /skipping the Blaze build/);
});

test('a refused trigger is retried and then accepted', async () => {
  let requests = 0;
  const delays = [];
  await deployAndNotify({
    deploy: async () => {}, hookUrl, log: () => {},
    fetchImpl: async () => ++requests === 1
      ? Response.json({ success: false }, { status: 503 })
      : success(),
    sleep: async (delay) => delays.push(delay),
  });
  assert.equal(requests, 2);
  assert.deepEqual(delays, [1_000]);
});

test('HTTP success without API acceptance is a bounded failure', async () => {
  let requests = 0;
  await assert.rejects(deployAndNotify({
    deploy: async () => {}, hookUrl, log: () => {}, sleep: async () => {},
    fetchImpl: async () => { requests++; return Response.json({ success: false }); },
  }), /lcod.uk is live.*3 attempts/);
  assert.equal(requests, 3);
});

test('network error details never expose the hook secret', async () => {
  const logs = [];
  let thrown;
  try {
    await deployAndNotify({
      deploy: async () => {}, hookUrl, sleep: async () => {},
      fetchImpl: async () => { throw new Error(`fetch failed for ${hookUrl}`); },
      log: (message) => logs.push(message),
    });
  } catch (error) { thrown = error; }
  assert.match(thrown.message, /lcod.uk is live/);
  assert.equal([...logs, thrown.message].join('\n').includes('test-secret'), false);
});

test('unexpected hook hosts are rejected without requesting or exposing them', async () => {
  await assert.rejects(deployAndNotify({
    deploy: async () => {}, hookUrl: 'https://example.com/secret',
    fetchImpl: async () => { assert.fail('Unexpected host must not be requested'); },
  }), (error) => !error.message.includes('example.com') && /not a valid Cloudflare/.test(error.message));
});

async function sourceFixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'personal-site-deploy-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git(['init', '--quiet']);
  await writeFile(path.join(root, '.gitignore'), 'dist/\n');
  await writeFile(path.join(root, 'post.md'), 'Published post\n');
  git(['add', '.']);
  git(['-c', 'user.name=Deployment test', '-c', 'user.email=deployment@example.test', 'commit', '--quiet', '-m', 'Initial source']);
  const [commit, date] = git(['show', '-s', '--format=%H%n%cI', 'HEAD']).split('\n');
  const info = { schemaVersion: 1, commit, committedAt: new Date(date).toISOString() };
  const output = path.join(root, 'dist/client');
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'build-info.json'), JSON.stringify(info));
  return { root, info, output };
}

test('production deployment accepts a clean source commit and ignores generated build files', async (t) => {
  const { root, info, output } = await sourceFixture(t);
  await writeFile(path.join(output, 'index.html'), '<h1>Generated HTML</h1>');
  assert.deepEqual(await validateDeploySource({ root }), info);
});

test('production deployment rejects both edited tracked sources and untracked sources', async (t) => {
  const { root } = await sourceFixture(t);
  await writeFile(path.join(root, 'post.md'), 'Uncommitted edited post\n');
  await assert.rejects(validateDeploySource({ root }), /uncommitted source changes/);
  await writeFile(path.join(root, 'post.md'), 'Published post\n');
  await writeFile(path.join(root, 'new-post.md'), 'Uncommitted new post\n');
  await assert.rejects(validateDeploySource({ root }), /uncommitted source changes/);
});

test('production deployment rejects an old build even when the checkout is clean', async (t) => {
  const { root, info, output } = await sourceFixture(t);
  await writeFile(path.join(output, 'build-info.json'), JSON.stringify({ ...info, commit: '0'.repeat(40) }));
  await assert.rejects(validateDeploySource({ root }), /build does not match/);
});

test('production deployment requires valid build metadata', async (t) => {
  const { root, output } = await sourceFixture(t);
  await writeFile(path.join(output, 'build-info.json'), '{}');
  await assert.rejects(validateDeploySource({ root }), /metadata is missing or invalid/);
  await rm(path.join(output, 'build-info.json'));
  await assert.rejects(validateDeploySource({ root }), /metadata is missing or invalid/);
});
