import assert from 'node:assert/strict';
import test from 'node:test';
import { deployAndNotify } from './deploy.mjs';

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
