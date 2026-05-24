---
title: View Transitions Without a SPA
date: 2026-05-24
---

I recently built a  new lift logging app and had historically done them in SwiftUI. The AppStore faff isn't worth it for me anymore so decided to port the SwiftApp to a PWA. Claude made this incredibly easy (I'll put in the prompt later) but there was a bit of tidying needed to make it feel 'app-like' with regard to the subtle interactions and page transitions.

The [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) provided soem of the answer. It taps into the browser's ability to  animate between two DOM states if you wrap the DOM change in `document.startViewTransition()`. 

The PWA has a tiny same-origin navigation layer:

1. Intercept a normal internal link click.
2. Fetch the next page as HTML.
3. Parse it with `DOMParser`.
4. Replace the current `body`, `title` and body class.
5. Re-run the small page-specific event handlers.
6. Wrap that swap in `document.startViewTransition()` when the browser supports it.

This fits the server-rendered HTML approach I like. The server remains the source of truth. The client is not reconstructing state from JSON and trying to keep it in sync with the page. It just asks the server for the next document and swaps it in.

## Back navigation
The script keeps a small index in `history.state`, sets `html[data-nav-direction="back"]` before the swap, and CSS uses that attribute to reverse the slide. Forward navigation brings the next screen in from the right. Back navigation brings the previous screen in from the left.

## Recent page cache
The app also keeps an in-memory snapshot cache for recent pages. A snapshot is just the current body HTML, title, body class and scroll position. When the user goes back and the snapshot exists, the app can restore it immediately instead of fetching it again. 

## Simple CSS
```css
::view-transition-old(root),
::view-transition-new(root) {
  mix-blend-mode: normal;
}

@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 200ms;
    animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }

  ::view-transition-old(root) {
    animation-name: app-page-out-forward;
  }

  ::view-transition-new(root) {
    animation-name: app-page-in-forward;
  }

  html[data-nav-direction="back"]::view-transition-old(root) {
    animation-name: app-page-out-back;
  }

  html[data-nav-direction="back"]::view-transition-new(root) {
    animation-name: app-page-in-back;
  }
}
```

The navigation no longer feels like a document reload!
