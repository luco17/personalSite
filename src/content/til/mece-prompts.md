---
title: "MECE prompts"
date: 2026-09-12
---

MECE: mutually exclusive, collectively exhaustive. Give each prompt section a distinct job, and cover everything the agent needs.

This outline comes from [Wulfie Bain's X post on writing better prompts](https://x.com/wulfie_bain_/status/2098060386813566990):

## Background

Outlines the background for the agent.

- **Aim** — high level aim for the agent.
- **Context** — e.g. the product it's operating within, key domain specific words that come up.

## Behaviour

Only touches *non-output* behaviour, i.e. process.

- **Proactiveness** — how proactive should the agent be, vs seeking to clarify?
- **Workflow** — when the agent does start, do we want it to follow a rough workflow? Plan first then act? Or act straight away?
- **Tool use**
  - **Parallel tool use** — which tools should be used in parallel?
  - **Tool X vs Y vs Z** — specific instructions on when to use each, which doesn't necessarily fit into any one given tool description. For example, a section on **tool_y** could cover a tricky tool and its interactions with other tools.

## Output

Only touches *output* behaviour.

- **Output format** — e.g. specifying we want Markdown, no bullet points.
- **Output rules** — e.g. never mentioning competitors X, Y, Z.
