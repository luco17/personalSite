---
title: Claude code env secrets and network allow lists
date: 2026-05-18
---

Claude Code sessions started from the web run in an isolated, ephemeral container with no access to a local shell or developer keychain. To let a session deploy Cloudflare Workers you configure secrets and network access on the environment itself.

## Environment variables

Add credentials as environment variables on the Claude Code environment. Wrangler picks them up from the process environment at deploy time.

Scope the API token tightly in the Cloudflare dashboard!

Don't paste tokens into chat or commit messages. The environment variable UI is the only place they should live.

## Domain allowlists

Apply the same minimum-privilege idea to outbound network access. The environment's network policy controls which hosts the session can reach; narrow it to the domains the deploy actually needs rather than leaving it fully open.

## Sanity checks before relying on this

- Run `npx wrangler whoami` in the session; it should report the expected account and the scoped token's permissions.
- Run a dry deploy (`wrangler deploy --dry-run`) before the first real one to confirm bindings resolve without burning a deployment.
- Rotate the token from the Cloudflare dashboard if a session is suspected of leaking it; revocation is instant.
