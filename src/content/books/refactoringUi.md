---
title: "Refactoring UI"
author: "Adam Wathan & Steve Schoger"
date: 2022-09-01T17:54:03+01:00
link: true
---

1. Start with a feature, not a layout.

2. Detail comes later. Start low-fi. By designing in grayscale you're forced to use spacing, contrast and size to make things distinct.

3. Don't obsess over edge cases and particularities (e.g. heavy users, error messages, multiple events).

4. Go low-fi to hi-fi on a feature single feature and then move on. Don't do lots of low-fi, then all the hi-fi.

5. Leave out functionality you aren't ready to build. Design the smallest useful version you can ship. Expect all features to be hard to build.

6. Serif is elegant/classic. Rounded sans serif is playful. Large border radii are playful. Small radii are neutral. No radius is formal.

7. Define systems in advance to prevent you from being paralysed by choice.

8. When adding some secondary text to a coloured background, pick a supporting hue rather than a grey or white with low opacity.

9. Emphasize by de-emphasizing. If you can't make an element stand out how you want, de-emphasize the other elements.

10. If you have to use labels, these should generally be secondary. The exception is on information-dense pages like specification sheets where users are scanning for 'width', 'height' etc.

11. Section titles are more often labels than headings - they are supportive content. As such, they should be de-emphasised relative to the content.

12. Primary actions should be obvious (solid, high contrast bg colours); secondary actions should be clear but not prominent (outline styles or lower contrast bg colours); tertiaries should be discoverable but unobtrusive (link style).

13. Start with too much white space and then gradually remove it until happy with the result. So add padding and then take away.

14. Make scaling decisions based on a scaling system to decide on sizes. No values in the scale should be closer than 25%. So if debating a 400px thing, you should consider 500, or 300, not increments of any less.

15. When comparing sizes between things, establish three values with your base as the middle and then compare against the values either side.

16. See examples for a spacing/sizing system [here](https://tailwindcss.com/docs/width)

17. Don't make things full-width unnecessarily. If you're designing something that works best at a narrower width but feels unbalanced in wide ui, break it into columns.

18. Elements that are large on large screens need to shrink faster than elements that are already fairly small. i.e. the difference between small elements and large elements should be less extreme at small screen sizes.

19. Avoid ambiguous spacing between elements. Make sure there's more space around the group than within it.

20. For a range of font-sizes, use the tailwind defaults. Stick to REM to make sure you're keeping to the system. EM will do funny things.

21. Pick fonts by sorting by 'popularity' on Google fonts. Trust the wisdom of crowds.

22. Lines of text should be 45-75 chars. 20-35 em.

23. Always align differnt font sizes that are next to each other using baseline.

24. Line height will be influenced by paragraph width and font size. The wider the paragraph, the higher the line height. The smaller the font, the higher the line height.

25. If text is longer than 2-3 lines, it should be left-aligned.

26. Numbers should be right-aligned.

27. If using all-caps text, increase the letter spacing.

28. True black is unnatural, so start with dark grey.

29. Improve accessibility by using dark text on a lighter background.

30. Small shadows for buttons, medium for dropdowns, big for modals.
