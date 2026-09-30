Code for my personal site. Built using [Astro](https://astro.build). No Tailwind or Alpine - my usual partners in crime - just plain ole' css and html.

## Deployment

Cloudflare Workers Builds uses `npm run build` as its build command and `npm run deploy` as its production deploy command. Keep preview deployments on Cloudflare's separate preview command; they must not trigger the production Blaze build.

The build writes `/build-info.json` with the source commit and commit date. This tiny public file is served with `Cache-Control: no-store` so the fast site can import the version published on `lcod.uk`.

Set `BLAZE_DEPLOY_HOOK_URL` as a **build secret** on the `personal-site` Worker. The deploy script first publishes `lcod.uk`, then asks Cloudflare to build Blaze. It retries a failed trigger three times and reports failure if Cloudflare still refuses it; `lcod.uk` remains deployed. The hook URL is a credential and must not be committed or logged.

For a local deployment, run `npm run build` followed by `npm run deploy`. Omitting the hook secret skips Blaze. Run `npm test` to check build metadata and deployment sequencing.
