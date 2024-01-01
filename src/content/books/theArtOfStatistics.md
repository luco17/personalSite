---
title: "The Art Of Statistics"
author: "David Spiegelhalter"
date: 2022-08-25T19:01:08+02:00
link: true
---

Interesting bits below

### Getting things in proportion

1. There was a famous headline claiming processed meat increases the risk of bowel cancer by 18%. This sounds like a baseline risk 6% increasing to 24% by eating processed meat. But the headline confused _relative risk_ with _absolute risk_. To calculate the relative risk you multiply 6% by 18% (0.06 \* 1.18) and get 7.08%, an increase in absolute risk of 1.8%!

2. Odds ratios are useful for unlikely events, but less useful for common events.

### What causes what

3. Non-drinkers are often reported to have higher death rates than moderate drinkers. This is likely partly attributable to _reverse causation_ - those people who are most likely to die do not drink because they are ill already. More careful analyses exclude ex-drinkers, and also ignore adverse health events in the first few years of the study, since these may be due to pre-existing conditions.

4. A study of admission rates by gender to Cambridge done in 1996 showed acceptance rates of 23% for women and 24% for men. Acceptance rates for individual subjects, however, were always more favourable for women. This is an example of [Simpson's Paradox](https://en.wikipedia.org/wiki/Simpson%27s_paradox).

5. Ice cream sales and drowning correlate. Hot weather may be the _confounding_ factor here. You can adjust for this by looking at the relationship between drownings and ice-cream sales on days with similar temperatures. This is an example of stratification.

6. [Austin Bradford Hill](https://en.wikipedia.org/wiki/Austin_Bradford_Hill) set the gold standard for Randomised Control Trials (RCTs) in the early 50s with Streptomycin - a med for tuberculosis. This RCT was influenced by [Ronald Fisher's](https://en.wikipedia.org/wiki/Ronald_Fisher) work in agriculture. See also the [Bradford Hill criteria](https://en.wikipedia.org/wiki/Bradford_Hill_criteria).

### Modelling relationships using regression

7. The slope of the estimator is given by Covar(x,y)/Var(x). Intercept by Ave(y)-Slope(Ave(x)).

8. Logistic regression ensures curves can't go above or below 100% or 0% i.e. it's used to estimate the probability of an event occurring.

### Algorithms, analytics, and prediction

9. Build a model to predict survival rates on the Titanic. If you done a really simple heuristic, all men die, all women survive, your model will be right 78% of the time! Comparing simple heuristics to more complex approaches is always a valuable sense check.

10. Algorithms that give probabilities (or any number) rather than simple classification are often compared using [ROC curves](https://en.wikipedia.org/wiki/Receiver_operating_characteristic).

11. A confusion matrix can be used to assess classification accuracy. It highlights true positives, false positives, true negatives, false negatives. Using these you can calculate test [sensitivity and specificity](https://en.wikipedia.org/wiki/Sensitivity_and_specificity).

12. Sensitivity gives the _true positive_ rate. If this rate is high, the classifier is unlikely to give you a false negative, therefore if you get a negative result, chances are it's accurate (e.g. useful for ruling out disease).

13. Specificity gives the _true negative_ rate. If this rate is high, the classifier is unlikely to give you a false positive, therefore if you get a positive result, chances are it's accurate (e.g. useful for ruling in disease).

14. In the example of predicting survivors on the Titanic, iff you adjust the probability threshold of survival higher, then the test is less likely to false positive survival, thereby improving test specificity at the cost of sensitivity.

15. [Calibration plots](https://cran.r-project.org/web/packages/predtools/vignettes/calibPlot.html) take the estimated probability of the thing measured (x-axis) and plot it against the the observed percentage of the thing measured (y-axis).

16. ROC curves assess how well an algorithm splits groups, Calibration checks the probabilities make sense. [Mean Squared Error](https://en.wikipedia.org/wiki/Mean_squared_error) is a useful tool that combines these. MSEs should be compared to _reference scores_ that deploy simple heuristics. Take weather forecasting, if it rains on 20% of days, apply that to a 5 day forecast where it rained 2 days of the week and your MSE would be 0.28 = (1.4)/5. Any model should strive to beat this reference score. The percentage improvement (aka skill score) is given by (Ref MSE - Algo MSE)/Ref MSE.

17. When fitting models consider the [_bias-variance_ tradeoff](https://en.wikipedia.org/wiki/Bias–variance_tradeoff). Where bias underfits (missing relevant predictive relationships) and variance (the model's ability to deal with new/varied data) overfits.

18. [Cross validation](<https://en.wikipedia.org/wiki/Cross-validation_(statistics)>) can protect against going too far in either direction of biace-variance

19. An algorithm trained to discriminate pictures of huskies from Alsatians was very effective until used on huskies kept indoors. The model was relying on the snow in the background, rather than anything about the dogs themselves.

### Margin of error

20. ONS announces unemployment falls by 3000 people. Papers report as such. What they miss is that the margin of error was plus-minus 77k! So it could have fallen 80k or risen by 74k.

21. In a well designed survey, we expect our _sample_ summary statistics to be close to the _population_ summary values. Sample summary values are usually called 'statistics' whereas population summary values are usually called 'parameters'.

22. Sample sizes matter! If you asked 100 people about their employment status an 7 replied 'unemployed', you would not feel confident claiming a 7% unemployment rate. You'd get more comfortable with such a claim as the sample numbers grow to 1k, 10k, 100k etc.

23. You can get better confidence in your sample statistics by repeatedly sampling from the population. Where this isn't possible, taking repeated random samples with replacement from your original sample ([bootstrapping](<https://en.wikipedia.org/wiki/Bootstrapping_(statistics)>)) can tell you about the variability of an estimate.

24. The more samples you take, the more the distribution of sample means tends towards the form of a normal distribution. See [central limit theorem](https://en.wikipedia.org/wiki/Central_limit_theorem). Ultimately this allows us to quantify our uncertainty about the sample estimates.

### Probability

25. The Poisson distribution is useful for modelling the probability of counts of discrete events, e.g. the number of winning lottery tickets each week.

### Putting probability and statistics together

26. Bernoulli trials are experiments with a 'success/fail' outcome. Results of repeated trials follow a binomial distribution, a single Bernoulli experiment has a Bernoulli distribution.

27. A 95% confidence interval suggests that if the same experiment were repeated multiple times, 95% of such intervals should contain the true value.

### Answering questions and claiming discoveries

28. The null hypothesis is what we are willing to assume is the case until proven otherwise. A null hypothesis is never proved, but is possibly disproved. An analogy: a defendant can be found guilty, but nobody is ever found innocent, simply not proven guilty.

29. Take a series of measurements, find some result '_X_'. You need to know whether 'X' is big enough to provide evidence against the null hypothesis. i.e. How does 'X' compare to results you could expect to observe due to _random variation_. You can take characteristic you are measuring and distribute them at random to the subjects again (this is how we would expect things to work if they were truly random) and reassess the 'X' against these new observations. This process can be repeated _n_ times.

30. You can measure how far your result differs from what was expected using P-values, defined as: "The probability of getting a result at least as extreme as you did, if the null hypothesis an all other assumptions were true.

31. The Chi-squared is used to _"determine whether there is a statistically significant difference between the expected frequencies and the observed frequencies in one or more categories of a contingency table."_ It is only useful for categorical data (e.g. assessing the preference for hip-hop vs. house music for basketball players and cyclists).
