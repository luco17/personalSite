---
title: Xero Custom Connections
date: 2026-06-19
---

Discovered Custom Connections as a way to quickly integrate a Codex finance agent with my Xero workspace. Avoids having to create a user-facing OAuth 2.0 flow which was a nause in QBO. Instead you get machine-machine authentication using a simple Client Credentials grant.

The other plus is eliminating token lifecycle management. Xero charges a $5pcm per connection.
