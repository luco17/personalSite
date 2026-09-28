---
title: "eval;unit-test"
date: 2026-09-28
---

Read some of @HamelHusain's pieces on evals and wrote several myself for my company's internal ops workflows. Thoughts thus far:

1. Much of what I can do in Codex my colleagues can't. They're too busy to learn, not that AI literate, etc. Deploying Codex skills and showing them how to use them helps bridge this gap.

2. Skills can be quite variable tho - if they don't perform as expected, colleagues conclude AI a hoax and don't use it/revert to their usual ways! The bar to convert them is pretty close to perfection.

3. Writing evals and manually eyeballing responses to see if they pass/fail is quite counterintuitive. I was expecting more of a unit test type flow but realise this is a mistake, have to eyeball many responses.

4. Evals make me consider which parts of a flow can be code vs which should be delegated to AI.

5. When piloting codex solo on a subscription I can ask the LLM to write a SQL query/python script on the fly each time and it's generally right. Perhaps because it has memory, long-running context and AGENTS.md.

   Colleagues running their own instances of Codex don't have this inherited context, so get more performance drift. Hence the need for interweaving more deterministic approaches.

6. Giving the agent access to these functions (e.g. python, SQL scripts) brings things full circle back to unit testing. The unit tests ensures those scripts do what you expect and you want to ensure your skill file is calling them, so they go into the eval.

Interesting interweaving of Agent & Scripts; Evals & Unit Tests.
