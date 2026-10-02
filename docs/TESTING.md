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
- Unit suite: 23 passing tests. Includes calendar/viewport invariants, collision grouping, 10,000 point events and 10,000 overlapping periods; all records remain accessible in bounded marks/lanes.
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

## Ubuntu CI verification

The initial implementation passed all 85 applicable browser checks in GitHub Actions, including Firefox, against the local Cloudflare runtime: [successful run](https://github.com/benaltair/epoch/actions/runs/36896803124). Five intentional skips are the Chromium-CDP-only pinch test on other projects. This closes the local Firefox coverage gap; physical-device testing remains separate. The final interval-boundary regression and this report update are rechecked on the PR head.

## Full-screen revision — 2 October 2026

- Restored the original white/blue system-font aesthetic and viewport-sized canvas; removed the permanent sidebar, introduction, promotional copy and story teasers.
- Added regression coverage for continuous sequence rows, uncertainty-only transitions, genuine gaps/overlaps, contextual focus, short logarithmic zoom transitions and reduced motion.
- Unit tests: 29 passed. Content workflow, type/Svelte checks and static production build passed.
- All 81 applicable local browser checks passed across Chromium/WebKit desktop, iPhone, Android and iPad profiles (73 on the first full run, with corrected test selection and Safari focus restoration verified in targeted reruns). Four intentional native-CDP skips remain. The 20 affected dialog, navigation, layout and accessibility checks passed in the final rerun.
- Desktop, phone and tablet screenshots were inspected. Safari dialog dismissal now explicitly restores focus. Physical-device testing remains unperformed; the CI run for this revision is recorded on the PR.

## Diagram revision — 2 October 2026

- Fixed canvas bands, vertical ministry columns, measured full/short/abbreviated names, compact plan callouts and historical boundary ticks follow the reference diagram while preserving linear dates.
- Content: 52 published entries, 9 stories and 15 sources; added the Bahá’í Era and three sourced Heroic Age epochs. Layout and abbreviations remain editable as content.
- Unit tests: 31 passed. Content workflow, static production build and Svelte/TypeScript checks passed with no errors or warnings.
- All 86 applicable local browser checks passed across desktop Chromium/WebKit, iPhone, Android and iPad profiles; four intentional native-CDP skips. Includes fixed vertical band positions across zoom, abbreviation expansion, reduced motion, gestures, accessibility and content-failure recovery.
- Desktop, mobile and tablet screenshots reviewed. Axis labels are constrained within the viewport and columns hide text when too narrow to render it legibly. Physical-device testing remains unperformed.
