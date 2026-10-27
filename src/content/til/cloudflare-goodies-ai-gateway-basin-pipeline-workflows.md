---
title: 'Cloudflare goodies: AI Gateway, Basin Pipelines, Workflows'
date: 2026-10-27
---

Been playing with three Cloudflare tools.

[Basin Pipelines](https://developers.cloudflare.com/basin-pipelines/) takes in events and sends them to storage. I had three projects in mind: NOAA solar data, a Pi digital twin, or Worker log activity. My Workers are getting tons of probes for secrets at the moment, so I went with the logs. Wired alerts for unusual activity up to a Telegram webhook that messages me. Nice little POC.

[Workflows](https://developers.cloudflare.com/workflows/) runs jobs in steps, saves progress and retries failures. Used it to run my eval suite against agents hosted on Workers. The eval runner now lives in Cloudflare too, using bindings to call the agents.

[AI Gateway](https://developers.cloudflare.com/ai-gateway/) tracks all those agent calls: traces, costs, etc. Handy for seeing what happened and what it cost.
