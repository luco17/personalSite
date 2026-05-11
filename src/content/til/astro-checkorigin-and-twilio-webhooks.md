---
title: Astro checkOrigin and Twilio webhooks
date: 2026-05-11
---

Astro's `security.checkOrigin` protects on-demand rendered routes from CSRF by rejecting form-like unsafe requests whose `Origin` does not match the request URL origin.

That is a problem for Twilio WhatsApp webhooks. Twilio sends inbound message notifications as server-to-server form posts:

```txt
POST https://example.com/api/whatsapp-inbound
Content-Type: application/x-www-form-urlencoded
X-Twilio-Signature: ...
```

Astro sees the above as a cross-site form-like `POST` that did not originate from `https://<your-astro-site.com`. With `checkOrigin: true`, Astro can reject the request before the endpoint gets a chance to verify `X-Twilio-Signature`.

Astro's `security` config does not currently offer a route-level or provider-level exception for this:

- `checkOrigin` is global: on or off for the app.
- `allowedDomains` is for validating trusted `X-Forwarded-Host` values, not for allowing third-party webhook senders.
- `actionBodySizeLimit`, `serverIslandBodySizeLimit`, and `csp` do not affect inbound webhook origin checks.

So the practical choices are:

1. Disable `checkOrigin` globally, receive Twilio inside Astro, and manually verify `X-Twilio-Signature`.
2. Keep `checkOrigin` enabled and receive Twilio outside Astro, for example in a dedicated Worker or webhook service.
