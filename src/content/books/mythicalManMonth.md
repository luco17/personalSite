---
title: "Mythical Man Month"
author: "Fred Brooks"
date: 2020-08-26T13:40:55+01:00
link: true
---

Interesting stuff but I think his report for the "Defense Science Board" is a better read. Link [here](https://apps.dtic.mil/sti/tr/pdf/ADA188561.pdf)

1. The accumulation of simultaneious and interacting factors brings slower and slower motion.

2. Deep within, we want others to user our work and to find it helpful.

3. When schedule slippage is recognized, the natural (and traditional) response is to add manpower. Like dousing a fire with gasoline, this makes matters worse, much worse. More fire requires more gasoline, and thus begins a regenerative cycle which ends in disaster.

4. For the human makers of things, the incompletenesses and inconsistencies of our ideas become clear only during implementation.

5. Adding people to a project creates two burdens: training and intercommunication. Ways of communicating can be calculated by the formula N(N-1)/2

6. Brooks's Law: "Adding manpower to a late software project makes it later"

7. Discipline is good for art. Indeed, an artist's aphorism asserts, "Form is liberating."

8. In the last analysis the customer is the independent auditor. In the merciless light of real use, every flaw will show.

9. "Experience is a dear teacher, but fools will learn at no other" ~ Poor Richard's Almanac

10. One must say that data for building isolated small programs are not applicable to programming systems products.

    For a program averaging about 3200 words, for example, Sackman, Erikson, and Grant report an average code-plus-debug time of about 178 hours for a single programmer, a figure which would extrapolate to give an annual productivity of 35,800 statements per year. Planning, documentation, testing,
    system integration, and training times must be added. The linear extrapolation of such sprint figures is meaningless. Extrapolation of times for the hundred-yard dash shows that a man can run a mile in under three minutes.

11. A certain small set of documents embodies and expresses much managerial work. The preparation of each one serves as a major occasion for focusing thought and crystallizing discussions that otherwise would wander endlessly.

12. "It is common sense to take a method and try it. If it fails, admit it frankly and try another. But above all, try something" ~ Franklin D. Roosevelt.

13. Where a new system concept or new technology is used, one has to build a system to throw away, for even the best planning is not so omniscient as to get it right the first time. Hence _plan to throw one away; you will, anyhow._

14. Both the tractability and the invsibility of the software product expose its builders to perpetual changes in requirements.

15. Structuring an organization for change is much harder than designing a system for change.

16. Rarely will someone lie about milestone progress, if the milestone is so sharp that he can't deceive himself.

### No silver bullet

17. As we look to the horizon of a decade hence, we see no silver bullet. There is no single development, in either technology or management technique, which by itself promises even one order of magnitude improvement in productivity, in reliability, in simplicity.

18. I believe the hard part of building software to be the specification, design, and testing of this conceptual construct, not the labor of representing it and testing the fidelity of the representation. We still make syntax errors, to be sure; but they are fuzz compared to the conceptual errors in most systems.

19. Enthusiasm jumps when there is a running system, even a simple one. Efforts redouble when the first picture from a new graphics software system appears on the screen, even if it is only a rectangle... I find that teams can grow much more complex entities in four months than they can build.

### Back to MMM

20. The programming project converges more slowly the nearer one gets to the end, whereas one expects it to converge faster as one approaches the end.

21. The builder has the creative responsibility for implementation; the architect only suggests.

22. The purpose of organization is to reduce the amount of communication and coordination necessary.

23. The act of writing requires hundreds of mini-decisions, and it is the existence of these that distinguishes clear, exact policies from fuzzy ones.

24. Delivering the first system, the throwaway, to users will buy time, but only at the cost of agony for the user, distraction for the builders supporting it while they do the redesign, and a bad reputation for the product that will be hard to live down. (see point 13.)

25. Maintenance cost is strongly affected by the number of users. More users find more bugs.

26. System debugging, like astronomy, has always been done chiefly at night.

27. "Many, many failures concern exactly those aspects that were never quite specified." ~ Vyssotsky (pinch of salt here, see over-specification in Shape Up [link](https://basecamp.com/shapeup/1.3-chapter-04)).

28. Chronic schedule slippage is a morale-killer.

29. Software development, in contrast to manufacturing, remains inherently labor-intensive.

30. It is much more difficult to design a general-purpose tool than it is to design a special-purpose tool, precisely because one has to assign weights to the differing needs of the diverse users.

31. The appeal of proposed features is evident at the outset; the performance penalty is evident only as system testing proceeds.
