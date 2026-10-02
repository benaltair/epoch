# Maintaining the chronology

The chronology is authored as data. Adding or correcting an event does not require changes to a Svelte component, the calendar engine, or the layout engine.

## Where to edit

| Location                    | Purpose                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `content/entries/<id>.json` | One event or period, its dates, hierarchy, short summary and sources    |
| `content/stories/<id>.json` | Optional longer reading material, quotation and image                   |
| `content/sources.json`      | Shared citations with stable IDs, titles, HTTPS URLs and notes          |
| `content/schemes.json`      | Human-readable names of independent classifications                     |
| `content/lanes.json`        | Row order, labels, sequential layout, theme token and visible time span |
| `content/site.json`         | Initial historical range, cycle preset and reserved featured IDs        |

File names and entry IDs must match. IDs are permanent: changing an ID breaks existing reading links. Correct the contents of a record without renaming it.

## Add an event

1. Run `npm run content:new -- unique-event-id`. This creates a **draft**, which is excluded from the published timeline and static pages. The sample date, parent and source are placeholders to replace.
2. Edit its title, temporal information, summary, parent and source IDs. The editor offers field completion from the generated JSON schema.
3. Optionally add `content/stories/unique-event-id.json` with `paragraphs`, an attributed `quote`, or an `image` with alternative text, caption, credit and source URL.
4. Run `npm run content:validate` and inspect the source.
5. Set `status` to `published`, run `npm run validate`, and preview the relevant historical window and reading page.
6. Submit the data changes for review. Deployment should occur only after the content and browser checks pass.

Never change the core renderer to add a record. Static pages and story endpoints are discovered automatically from the files. Navigation-only records can use `display: "navigation"`.

## Dates and honesty about precision

Use Gregorian civil dates, **not** timestamps. The underlying coordinates do not use the browser's local time zone. A historical date and the annual commemoration of that event are different records.

```json
{ "type": "point", "date": { "year": 1844, "month": 5, "day": 23, "precision": "day" } }
```

If only the month is supported, omit the day and use `precision: "month"`. If only the year is known, omit month and day and use `precision: "year"`. Add `approximate: true` for an explicitly approximate date. Do not add January 1 to make an uncertain record appear precise.

An undated period uses `{"type":"undated","label":"Future age · dates not specified"}`. It remains searchable, present in the hierarchy and available as a reading page; it receives no invented temporal position.

Periods use `type: "period"`, a `start`, and an optional `end`. An absent end means **unknown/continuing**, never the last year visible on screen. A minimum duration uses `minimumYears` and cannot also claim an exact end.

```json
{
	"type": "period",
	"start": { "year": 1844, "precision": "year" },
	"minimumYears": 500000,
	"endNote": "At least 500,000 years; no known endpoint."
}
```

An uncertain end can supply an earliest `end` and an `endLatest`, with an explanatory `endNote`. The first Formative Age epoch is an example. Plot coordinates are rendering conveniences; the card always displays the source's precision.

Internally, year 0 means 1 BCE; year -1 means 2 BCE. The UI formats BCE years without a year zero. Dates before Gregorian adoption are normalized proleptic Gregorian coordinates; source-calendar interpretation must be documented in the editorial/source note.

## Relationships and display

- `kind` describes the entry. `scheme` identifies its historical classification.
- `parentId` defines a reviewed navigational relationship, not one inferred from overlapping dates.
- `relatedIds` connects records across classifications.
- Formative Age epochs and Divine Plan epochs have different schemes, parents and lanes.
- `laneId` selects a configured display row. Add or reorder lanes through `content/lanes.json`.
- `importance` ranges from 0 to 5 and selects a representative when entries are clustered. It does not remove records.
- `shortTitle` is optional. Text never determines a period's duration or pushes adjacent dates.
- `focusRange` is an optional numeric viewing hint, not a historical endpoint. Prefer leaving it absent.

Periods and event groups are laid out automatically. A record with no long story still gets its summary, dates, citations and permanent page. Images are optional; an image failure does not remove the text or sources. Failed story requests offer retry while retaining the source information.

## Validation and publication

`npm run content:validate` checks schemas, date validity and precision, unique IDs, chronology, source existence, parent/related references, hierarchy cycles, lane/scheme existence, quote references, orphaned stories, and published references to drafts. `predev` and `prebuild` run this gate automatically. CI runs it before building. The last successful static deployment remains available if a later dataset fails validation.

JSON schemas are generated with `npm run content:schema`; schema changes are code changes and deserve review. Text is rendered as escaped text, never arbitrary HTML. URLs must use HTTPS.

A future CMS should export this exact directory shape (or a validated equivalent at build time). Keep credentials and drafts on the build/editorial side; visitors receive only published metadata, static pages and story payloads. Do not call a CMS during a gesture or allow edits to bypass validation.

## Editorial responsibility

Sources support the content; a source link alone is not proof that every interpretation is settled. Preserve conflicts in an `editorialNote` and a reader-facing `endNote` or story. Prefer authoritative texts and dated institutional messages, distinguish an announcement date from a period boundary, and seek human review for disputed classifications. Use full source URLs and maintain image attribution and rights information.

## Rendering boundary

The gate writes a generated catalogue containing published records only. Source JSON and draft entries are not imported directly into the production browser bundle. The renderer performs interval queries over this catalogue, and extended stories pass a small response-shape check before display. Invalid or unavailable story payloads fall back to the already-loaded summary and citations.

A year- or month-precision boundary is rendered as a possible interval, with a patterned cap. For a lane marked `sequential: true`, uncertainty-only overlaps share a transition on the same row. The next period’s start supplies the display split; hatching and the original dates retain their uncertainty. Definite overlaps still receive separate rows, and genuine gaps remain visible. Navigation-only records never reserve a row. Narrow adjacent periods form one selectable group on that row; the individual spans, gaps and source records remain intact. This does not assert an exact New Year’s Day boundary. Undated entries have no position in the interval index. Finite calendar records currently support astronomical years −10,000 through 999,999; an out-of-range record fails publication explicitly.

`npm run test:content` exercises adding a draft, publication, correction, and rejection of a broken source reference in an isolated temporary dataset. It proves these ordinary editorial changes require no component or layout edits.
