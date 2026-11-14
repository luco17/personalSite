---
title: Cursor's extension cache attack, and what HTTPS doesn't prove
date: 2026-11-14
description: A chain of leaked keys ended with a tampered Claude Code extension served from Cursor's own cache.
---

Cursor's [write-up of its recent security incident](https://cursor.com/blog/security-incident-update) is a neat example of a supply-chain attack built from a chain of ordinary failings. None of them would have been enough on its own.

## The chain

1. Cursor gave Fireworks, an AI vendor, a key to a read-only storage bucket. Fireworks leaked it.
2. The bucket held coding-agent traces kept for model training. Some of them contained credentials that had never been redacted.
3. Those credentials still worked. They opened some of the third-party SaaS tools Cursor uses, and that exposed more credentials.
4. One of those credentials gave write access to Cursor's extension-marketplace cache. The attacker swapped Anthropic's Claude Code extension for tampered copies.

That last step was not a redirect to a bad mirror. The tampered files sat in the real cache, so the URL, the domain and the TLS certificate all checked out. The copies were live for about 11 hours, and up to 5,000 users may have pulled them. Open VSX and Anthropic's own release were never touched.

Cursor warns that uninstalling the extension may not be enough to clean an affected machine, because once malicious code has run you can't assume removing it undoes what it did.

## Lessons

- **Don't leak keys, and assume your vendors will.** A key you hand to a third party leaks as easily as one of yours does.
- **Scope keys, rotate them and limit where they work from.** The attack could have stopped at almost every step if a credential had expired, had narrower permissions or only worked from known networks.
- **Don't keep secrets in stored data.** Logs, traces and training sets end up holding credentials unless you redact them as they are written. Keep less, and delete it sooner.
- **Verify against something the distributor can't touch.** HTTPS proves where a file came from, not that it is the file the publisher released. A hash stored next to the file gets replaced along with it. A publisher signature is stronger, because the signing key never enters the distribution path, so whoever runs the mirror or cache can't forge one. Signed OS updates, npm provenance and Sigstore all work this way.

## My working theories

The post leaves two gaps, and these are my guesses at what fills them rather than anything Cursor has said:

- **Whose credentials opened Cursor's internal tools?** I suspect Cursor staff use Cursor, so their own internal tokens ended up in the training traces alongside customers'.
- **Why did the cache serve the tampered files?** I suspect it didn't check publisher signatures or hashes against the original source at all, because a check like that would have rejected the swapped files.
