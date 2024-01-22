---
title: My startup mistakes
date: 2024-01-15
---

> Experience keeps a dear school, yet fools will learn in no other. ~ Ben Franklin

This post is about the biggest mistakes I made building my first startup. They are the best education I've had in how to build and market useful software.

### How it's gone

Our app, [Squaddy](https://squaddy.app),[^1] lets you track and share workouts. Think Strava for strength training but with more powerful group features. As of today it has ~20k downloads, ~100 subscribers and grows at ~1.2% per week. We've done no ads other than a two month Insta ads trial. Here are some stats that illustrate the trials of getting it this far:

- Started work in March 2020
- Spent £150k ($190k) of savings
- Spent £380k ($484k) of angel money
- Worked over 10k hours ~ many weekends
- Hired 14 people (8 devs, 5 ‘growth’)[^2]
- Fired 11 people (just co-founder and I left)
- Worked with 5 marketing agencies (none of these contracts lasted more than 3 months)

## The mistakes

### #1. Aiming too wide

‘Make a product that appeals to many people to maximise your potential market.’ This seductively simple statement fooled me twice. Here’s what I got wrong:

To me, broad appeal meant attracting lots of fitness niches, so I interviewed triathletes, powerlifters, bodybuilders, crossfitters, etc. Each niche had their own problems and feature requests but instead of recognising a signal to refine our audience, I saw more opportunity.

The problems became evident when trying to turn this mish-mash of requests into a coherent product. Our backlog, test surface and engineering bills all grew. This increased mass slowed my decision making. Questions like ‘how do we display content on the home page’ became tougher when trying to please multiple communities. The UI grew more complicated.

It also negatively impacted marketing. In trying to appeal to many niches, each of whom had their own workouts, influencers and brands, we struggled create content that resonated with anyone. As an early stage company you have to have a clear voice to stand out, you can’t do that with platitudes.

Focusing on a niche would have given us a smaller, more complete set of user problems, a correspondingly tighter feature set and helped shape a coherent marketing strategy.

Strava’s MVP was a desktop app that only worked with a specific Garmin cycling computer! Story [here](https://www.youtube.com/watch?v=STb34HA8WbE).

### #2. Junk customer research

Two sub-mistakes here. The first was an overly broad target market - as addressed above. Rob Fitzpatrick in “[The Mom Test](https://www.momtestbook.com/)” is good on this:

> “If you start too generic, everything is watered down. Your marketing message is generic. You suffer feature creep. By serving too many segments you run into three problems: You get overwhelmed by options and don’t know where to start; You aren’t moving forward but can’t prove yourself wrong; You receive mixed feedback and can’t make sense of it.”

The second was loose questions in interviews. Two more quotes from The Mom Test are illustrative:

> “Without concrete facts, you make generalisations. Generalisations make it hard to answer difficult trade-offs that come up during product development.”

> “If interviewees claim something is annoying but haven’t looked for any solutions to fix it, chances are, it doesn’t matter that much to them.”

I got much better at this by Squaddy v1. For example, after research interviews I’d asked interviewees for cash deposits on the basis of the Figma prototype to better gauge their enthusiasm. Interestingly, whilst our hit rate was good here, many of those that paid never became users. It’s comparatively easy to get someone to give you £20 on the basis of a Figma demo and some selling! Even when you follow the ‘path’ you’ll be continually surprised.

Poor interviewing and segmentation led to a lot of dead ends and masses of time wasted. “Talking to your customers” is not enough.

### #3. Overbuilding

Fred Brooks captured this really well:

> "The appeal of proposed features is evident at the outset; the performance penalty is evident only as system testing proceeds."

This was the first software project where I’d had a totally blank canvas. I wanted to create a small, useful and robust MVP. Thing is, my version of ‘small’ should have been much smaller. Over the course of the project we undertook two big pivots i.e. three big product builds. Each one took 4-6 months and each has features that were either removed or have had no impact.

We pored over edge cases like “what happens if an admin kicks out another admin” when the admin functionality itself proved to be irrelevant and not worth building! This tendency was made worse because we were running scrum and I was making product decisions on the fly in refinement sessions. It wasn’t until I discovered [Shape Up](https://basecamp.com/shapeup/1.1-chapter-02) that I managed to curb this tendency. It was destructive because it delayed launch, ballooned the test surface and burned cash.

### #4. Overhiring

I’d read in a book something like “As a business owner your number one asset is time, so outsource the stuff you’re bad at and focus on what you’re good at to best maximise your time.” This seemed reasonable and I adopted it, but it was deeply flawed for these reasons:

- I didn’t know enough about marketing or growth to hire well
- Our cash burn grew
- Employing people is a responsibility; it added weight to my decisions when I needed to be most nimble

In future I’ll look to get a good founding team of three in place and then grow reach/revenue until things are falling apart before making a hire. That said, certain one-offs can be outsourced.

### #5. Trying to sell B2B & B2C

Squaddy v1 had a feature set that I thought could be sold to ordinary folks training together (b2c) as well as PTs and gyms (b2b). Similar to mistake 1, these audiences want different features and respond to different marketing strategies. Most difficult to square are the differences in pricing models. Doing both created a big mess and we pivoted away from it with Squaddy v2 but only after burning time, cash and enthusiasm.

## Being too clever on the tech

The back-end of our first product was built with a serverless architecture and fashionable back and front ends. It was hard to debug, had a mediocre dev experience and generally slowed us down. These problems were compounded by hiring too many engineers who had to be onboarded to the stack. At one point we had 5! Madness. Big cash burner. 

We course corrected with Squaddy by using architecture and frameworks we were familiar with and we’ve never moved faster than with just two engineers.

## V2/V3 grab bags

We ditched a huge amount of the code and all the branding for V1 to do V2. In retrospect we should have modified V1 rather than changing all the branding etc. Cost a bomb and had minimal short/mid-term impact.

[^2]: These things did not all overlap, there were phases of higher and lower headcount.
[^1]: Squaddy was launched in September 2022 after a major pivot in winter 2021 and a minor pivot in Easter 2022. Our first idea was called "The Workout Projektt" (Projektt).

