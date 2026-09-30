import { execFileSync, spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export async function validateDeploySource({ root = projectRoot } = {}) {
  let info;
  try {
    info = JSON.parse(await readFile(resolve(root, 'dist/client/build-info.json'), 'utf8'));
  } catch {
    throw new Error('Build metadata is missing or invalid. Run npm run build before deploying.');
  }
  if (info?.schemaVersion !== 1 || !/^[a-f0-9]{40}$/.test(info.commit ?? '') ||
      typeof info.committedAt !== 'string' || !Number.isFinite(Date.parse(info.committedAt))) {
    throw new Error('Build metadata is missing or invalid. Run npm run build before deploying.');
  }
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  if (git(['status', '--porcelain', '--untracked-files=all'])) {
    throw new Error('Commit or remove uncommitted source changes, then rebuild before deploying. Blaze must be able to fetch the exact published revision.');
  }
  const [commit, committedAt] = git(['show', '-s', '--format=%H%n%cI', 'HEAD']).split('\n');
  if (info.commit !== commit || Date.parse(info.committedAt) !== Date.parse(committedAt)) {
    throw new Error('The build does not match the current source commit. Run npm run build before deploying.');
  }
  return info;
}

async function deploySite() {
  // A production deploy must be reproducible from Git. Ordinary local builds
  // remain available with uncommitted changes; this guard runs only on deploy.
  await validateDeploySource();
  // Use the adapter's generated Worker configuration, never the source config.
  const result = spawnSync(process.execPath, [
    resolve(projectRoot, 'node_modules/wrangler/bin/wrangler.js'),
    'deploy', '--config', 'dist/server/wrangler.json',
  ], { cwd: projectRoot, stdio: 'inherit' });

  if (result.error || result.status !== 0) {
    throw new Error('lcod.uk deployment failed; Blaze was not triggered.');
  }
}

export async function deployAndNotify({
  deploy = deploySite,
  hookUrl = process.env.BLAZE_DEPLOY_HOOK_URL,
  fetchImpl = fetch,
  sleep = setTimeout,
  log = console.log,
} = {}) {
  await deploy();

  if (!hookUrl) {
    log('lcod.uk deployed. BLAZE_DEPLOY_HOOK_URL is unset; skipping the Blaze build.');
    return;
  }

  // The URL is a credential. Never include it or a raw fetch error in logs.
  if (!/^https:\/\/api\.cloudflare\.com\/client\/v4\/workers\/builds\/deploy_hooks\/[a-zA-Z0-9_-]+$/.test(hookUrl)) {
    throw new Error('lcod.uk is live, but BLAZE_DEPLOY_HOOK_URL is not a valid Cloudflare deploy hook.');
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    let failure = 'network error or timeout';
    try {
      const response = await fetchImpl(hookUrl, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
      });
      const body = await response.json();
      if (response.ok && body?.success === true && typeof body.result?.build_uuid === 'string') {
        log('lcod.uk deployed. Cloudflare accepted the Blaze build trigger.');
        return;
      }
      failure = `Cloudflare did not accept the trigger (HTTP ${response.status})`;
    } catch {
      // Fetch errors can contain the secret URL; report only the failure category.
    }
    log(`Blaze trigger attempt ${attempt}/3 failed: ${failure}.`);
    if (attempt < 3) await sleep(attempt * 1_000);
  }

  throw new Error('lcod.uk is live, but the Blaze build could not be triggered after 3 attempts. Retry the deployment or trigger the Blaze build in Cloudflare.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await deployAndNotify();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
