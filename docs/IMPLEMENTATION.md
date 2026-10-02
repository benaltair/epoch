# Implementation milestones

1. **Data and calendar:** independent JSON entries/stories/sources/display configuration; draft publication gate; source audit; Gregorian arithmetic beyond native Date; precision, uncertain boundaries, open ends, minimum durations and undated periods.
2. **Viewport:** one coordinate model for pan, anchored pinch, controls, overview and URL state; full-cycle through single-day views; resize stability; finite bounds and invalid-link recovery.
3. **Hierarchy and density:** explicit parent/related relationships, separate epoch classifications, stable period lanes, interval indexing, collision grouping, breadcrumbs, search and chronological reading.
4. **Reading and access:** responsive native dialog cards, optional stories and photographs, failure/retry behavior, static entry pages and index without JavaScript, theme tokens, reading-size controls, keyboard navigation and history restoration.
5. **Release preparation:** pinned compatible Svelte 5/SvelteKit 2/Vite 8/TypeScript 6 toolchain, static generation, Cloudflare configuration, CI and browser/device-profile tests.

The site is prepared for Cloudflare Workers Static Assets or Pages. A live deployment and physical-device sign-off remain separate release activities. See `TESTING.md` for actual verification results and remaining checks, `CONTENT.md` for maintenance, `SOURCES.md` for historical decisions, and `DEPLOYMENT.md` for platform settings.

No future endpoint is fabricated. No unverified Gregorian-to-Badí‘ conversion is included. A future CMS can export the same validated content shape without changing the renderer.

## Full-screen explorer

The canvas occupies the viewport. Browse, settings and reading cards use native dialogs; the overview is optional. The baseline appearance follows the original white/blue system-font interface. CSS variables control colours, row sizes, canvas inset, reading scale and `--view-transition-ms` (180 milliseconds). Navigation interpolates the date scale; gestures cancel animation and remain direct. Reduced-motion preferences skip the transition.

Smaller periods keep surrounding dates in view. Epochs, plans and ministries occupy about 35–65% of the window, with denser neighbourhoods receiving more space. Historical dates and navigation ranges remain separate. Copy is limited to controls, short operational instructions, historical content and citations.
