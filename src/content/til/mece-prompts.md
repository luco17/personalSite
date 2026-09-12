---
title: "MECE prompts"
date: 2026-09-12
---

MECE: mutually exclusive, collectively exhaustive. Give each prompt section a distinct job, and cover everything the agent needs.

This outline comes from [Wulfie Bain's X post on writing better prompts](https://x.com/wulfie_bain_/status/2098060386813566990):

```text
# Background - outlines the background for the agent
    ## Aim - high level aim for the agent
    ## Context - e.g. the product it's operating within, key domain specific words that come up

# Behaviour - only touches * non-output * behaviour, i.e. process
    ## Proactiveness - how proactive should the agent be, vs seeking to clarify
    ## Workflow - when the agent does start, do we want it to follow a rough workflow? Plan first then act? Or act straight away?
    ## Tool use
        ### Parallel tool use - which tools should be used in parallel?
        ### Tool X vs Y vs Z - specific instructions on when to use each, which doesn't necessarily fit into any one given tool description
            #### tool_y - a specific section on a tricky tool and interactions with other tools

# Output - only touches * output * behaviour
    ## Output Format - e.g. specifying we want markdown, no bullet points
    ## Output Rules - e.g. never mentioning competitors X, Y, Z.
```
