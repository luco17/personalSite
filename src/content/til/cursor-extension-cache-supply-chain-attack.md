---
title: Cursor's extension cache attack
date: 2026-11-14
description: A chain of leaked keys ended with a tampered Claude Code extension served from Cursor's own cache.
---

Cursor's [write-up of its recent security incident](https://cursor.com/blog/security-incident-update). Example of a supply-chain attack chained together by simple failings. 

## The chain

1. Cursor gave Fireworks, an AI vendor, a key to a read-only storage bucket. Fireworks leaked it.
2. The bucket held coding-agent convos; some of these had plaintext creds!
3. Some of these still worked and gave access to tools Cursor uses, more creds available in there...
4. One of these gave access to Cursor's extension-marketplace cache. The attacker swapped Anthropic's Claude Code extension for tampered copies.

That last step was not a redirect to a bad mirror. The tampered files sat in the real cache, so the URL, the domain and the TLS certificate all checked out. 

## Lessons

- Don't leak keys; assume your vendors will. 
- Scope keys, rotate them and limit where they work from. 
- Verify against something the distributor can't touch. HTTPS proves file origins, not authenticity. Publisher signature is stronger, because the signing key never enters the distribution path.

## My working theories

The post leaves two gaps, so these are guesses.

- **Whose credentials opened Cursor's internal tools?** I suspect Cursor staff use Cursor, so their own internal tokens ended up in the training traces alongside customers'.
- **Why did the cache serve the tampered files?** I suspect it didn't check publisher signatures or hashes against the original source at all, because a check like that would have rejected the swapped files.
