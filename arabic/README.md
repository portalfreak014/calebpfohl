# (Unofficial) UAD Study Companion

Study tools and reference materials for Arabic learners.

## Name and status

This project is called **(Unofficial) UAD Study Companion**. It is an independent study-resource project and is not affiliated with, endorsed by, or officially connected to the Defense Language Institute Foreign Language Center (DLIFLC), UAD, or the U.S. Department of Defense.

For browser titles and metadata, use: `UAD Study Companion (Unofficial)`.

## Pill navigation

The shared navigation is rendered by `pill-nav.js` into elements marked with `data-pill-nav`. On scroll, the pill scales smoothly from 100% to 70% over the first 150 px of page scrolling, then remains at 70%. Use a passive scroll listener and apply the scale directly to `.nav`; set `transform-origin: top center` and `will-change: transform` so the animation remains smooth.