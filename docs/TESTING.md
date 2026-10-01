# Verification plan

Run `npm ci`, `npm run validate`, `npx playwright install chromium firefox webkit`, then `npm run test:integration`.

## Automated coverage

- Calendar: known Gregorian dates, leap centuries, BCE/year zero, and 500,000-year round trips.
- Viewport: anchor-preserving zoom, translating pinch, day-scale limits, malformed deep links and state restoration.
- Content: JSON schemas, precision, temporal constraints, cyclic/missing references and source integrity.
- Layout: interval queries, independent epoch lanes, labels independent of temporal geometry, and a 10,000-event stress dataset.
- Browsers: desktop Chromium, Firefox and WebKit; iPhone, Pixel and iPad profiles. Full-cycle journey, cards, static reading without JavaScript, search, themes, keyboard and history, density limits and axe accessibility checks.

These device profiles emulate viewport and browser capabilities. They do not certify physical touchscreen behavior, device thermals, or a specific device's frame rate.

## Physical-device acceptance

On an iPhone/Safari, Android/Chrome and iPad/Safari:

1. Open the full cycle, enter recorded history, select an age, open an event, and return through broader context.
2. Pinch slowly and quickly with a moving midpoint. Lift one finger and continue panning without a jump. Cancel a gesture by switching apps and resume.
3. Pan horizontally and move through the vertical tracks. Confirm that the surrounding page and story still scroll normally.
4. Rotate while zoomed in and while a story is open. Dates must remain stable and all controls reachable.
5. Use browser text enlargement, large reading size, dark mode, reduced motion and VoiceOver/TalkBack. Sources and the reading list must remain usable.
6. Confirm browser Back restores the previous meaningful view and that copying a URL restores it in another tab.
7. Profile a sustained pinch/pan on agreed representative hardware. Aim for 60 Hz interaction; record actual frame times rather than inferring performance from a desktop score.

Do not mark the physical-device checklist as passed from emulator results. Record device, OS, browser version, date and observed issues.

## Local verification — 1 October 2026

- Content: 48 published entries, 9 optional extended stories, 14 citations; schemas and cross-references valid.
- Svelte/TypeScript: zero errors and zero warnings.
- Unit suite: 22 passing tests. Includes calendar/viewport invariants, collision grouping, 10,000 point events and 10,000 overlapping periods; all records remain accessible in bounded marks/lanes.
- Editorial workflow: add draft → publish → correct → reject invalid source reference without replacing the last valid catalogue, passed in an isolated dataset.
- Production static build, formatting and `wrangler deploy --dry-run`: passed. The dry run uploaded nothing.
- Cloudflare Workers local runtime: 71 browser checks passed across desktop Chromium/WebKit, iPhone, Pixel/Android and iPad profiles. Four deliberate skips cover the Chromium-CDP-only native pinch check on other projects; the Android CDP pinch test passed.
- Coverage includes day-scale limits, full-cycle drill-down, anchored pinch, pan, overview controls, cancellation, URL/Back, 320px reflow, orientation change, larger reading text, light/dark axe checks, failed/malformed story payloads, failed photographs, page-error capture, and a complete reading path with JavaScript disabled.
- Direct Cloudflare route probes: story JSON 200 with `application/json`; permanent reading page 200 HTML; missing route 404 HTML.
- Visual review: desktop, mobile, tablet and mobile card screenshots reviewed. No live deployment performed.

### Environment limitations

The downloaded Firefox 155 executable failed before loading the app with “Could not find profile folder”, both through Playwright and with a manually created `/private/tmp` profile. This is an unverified browser locally, not a passed test. The GitHub Actions matrix includes Firefox on Ubuntu; record that result separately.

Reads under the local Documents checkout intermittently stalled. Validation ran against the same source files copied into `/private/tmp/epoch-validation` with a clean `npm ci` from the committed lockfile. The deliverable remains in the repository checkout; the temporary path is not a production dependency.

The dependency audit reports three low-severity findings in one transitive `cookie <0.7.0` chain through SvelteKit/adapter-static. The reported automatic “fix” would downgrade to obsolete incompatible packages. This deployment serves static assets and has no server-side cookie processing; the dependency should still be revisited with a compatible upstream release. No forced downgrade was applied.

Physical-device tests remain unperformed. No claim is made about physical touch ergonomics, assistive-technology certification, battery use or sustained frame rate on actual phones.
