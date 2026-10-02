# Epoch

An independent, sourced exploration of Bahá’í history. Move from the scale of a cycle to a single day, explore the hierarchy of periods, and open events as reading cards.

## Develop

Use Node 22.12+ and the committed npm lockfile.

```sh
npm ci
npm run dev
npm run validate
npx playwright install chromium firefox webkit
npm run test:integration
```

The compatible toolchain is Svelte 5, SvelteKit 2, Vite 8 and TypeScript 6. Versions are pinned. TypeScript 7 was not selected because the current Svelte checking tool requires an earlier compatible major.

## Maintain the content

Edit JSON under `content/`, independently of the Svelte application. One entry per file contains its identity, dates, classification, hierarchy, summary and sources. Optional stories are separate. The same content generates the timeline, search, cards and permanent reading pages.

```sh
npm run content:new -- unique-event-id
npm run content:validate
npm run content:schema
```

New entries start as drafts. A publication gate checks dates, schemas and relationships before development or production builds. Only published records enter the generated browser catalogue. Do not edit `.generated/`.

Read [the content guide](docs/CONTENT.md) for precision, uncertain endpoints, undated periods, sources, authoring and review. Some historical classifications intentionally overlap: parent relationships are editorial navigation, not inferred date containment. Formative Age epochs and Divine Plan epochs remain separate.

## Architecture

- Gregorian civil-day coordinates support dates beyond JavaScript `Date`, including the 500,000-year minimum cycle perspective.
- A viewport and interval index select relevant entries. Screen-space clustering keeps dense event groups accessible without creating thousands of DOM nodes.
- Native HTML controls and CSS-positioned marks retain keyboard access. CSS Grid arranges the page; it does not allocate one column per year or day.
- Pinch, pan, zoom controls, the overview, breadcrumbs and URL navigation use the same viewport model.
- Extended stories load on demand. Summaries and citations survive failed requests. Every published entry has a prerendered reading page that works without JavaScript.
- Theme colours, row spacing and reading scale are CSS variables in `src/lib/styles/app.css`. Calendar zoom remains separate from text size.

## Cloudflare deployment

The app is fully prerendered with `adapter-static`. `npm run build` produces `build/`; there is no database, cookie session or server runtime required for readers.

Workers Static Assets is configured in `wrangler.jsonc`. `npm run preview:cloudflare` serves the built site locally. `npm run deploy:workers` builds and deploys when you are ready and authenticated to the intended account.

Cloudflare Pages is also supported: build command `npm run build`, output directory `build`, Node 22. Use these settings instead of the default SvelteKit `.svelte-kit/cloudflare` output. See [deployment details](docs/DEPLOYMENT.md).

## Verification

See [testing](docs/TESTING.md) and [implementation milestones](docs/IMPLEMENTATION.md). CI checks content, types, calendar/layout invariants, production generation, and browser journeys. Browser device profiles are emulation; they are not a claim of physical-device certification.

## Scope and editorial care

Gregorian dates are used as authored civil dates. A future Badí‘ calendar layer must use verified calendar data; simple year subtraction is insufficient. Continuing periods, minimum durations and future undated ages never receive invented endpoints. The initial dataset is a reviewed starting collection, not an exhaustive history.

Source attribution accompanies every entry. Historical interpretation and future additions still deserve editorial review. This project does not assert institutional endorsement. No new licence is granted by this update; licensing remains an explicit project decision.
