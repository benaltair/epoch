import { it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { entrySchema, storySchema, validateContent } from '../../../scripts/content-schema.mjs';
import { entries, sources, schemeLabels, site } from './catalog';
import { stories } from './stories';
import { groups } from '$lib/core/layout';
const dataset = () => ({
	entries: structuredClone(entries),
	sources,
	stories,
	schemes: schemeLabels,
	lanes: groups,
	site
});
it('validates every editable content file against its schema', () => {
	for (const file of readdirSync('content/entries'))
		expect(
			entrySchema.safeParse(JSON.parse(readFileSync('content/entries/' + file, 'utf8'))).success
		).toBe(true);
	for (const file of readdirSync('content/stories'))
		expect(
			storySchema.safeParse(JSON.parse(readFileSync('content/stories/' + file, 'utf8'))).success
		).toBe(true);
	expect(validateContent(dataset())).toEqual([]);
});
it('rejects missing sources, circular parents, and impossible calendar dates', () => {
	const d = dataset();
	d.entries[0].sourceIds = ['missing'];
	d.entries[0].parentId = d.entries[0].id;
	d.entries[1].temporal = {
		type: 'point',
		date: { year: 1900, month: 2, day: 29, precision: 'day' }
	};
	const errors = validateContent(d);
	expect(errors.some((e: string) => e.includes('missing source'))).toBe(true);
	expect(errors.some((e: string) => e.includes('cyclic'))).toBe(true);
	expect(errors.some((e: string) => e.includes('impossible'))).toBe(true);
});
it('rejects minimum duration presented as a fixed endpoint and broken precision', () => {
	const d = dataset();
	d.entries[0].temporal = {
		type: 'period',
		start: { year: 1844, day: 1, precision: 'year' },
		end: { year: 2044, precision: 'year' },
		minimumYears: 500000
	};
	const errors = validateContent(d);
	expect(errors.some((e: string) => e.includes('precision'))).toBe(true);
	expect(errors.some((e: string) => e.includes('minimum duration'))).toBe(true);
});
it('rejects executable URLs and arbitrary extra fields', () => {
	expect(
		storySchema.safeParse({
			paragraphs: [],
			image: {
				src: 'javascript:alert(1)',
				alt: 'x',
				caption: 'x',
				credit: 'x',
				sourceUrl: 'https://example.org'
			}
		}).success
	).toBe(false);
	expect(entrySchema.safeParse({ ...entries[0], unexpected: true }).success).toBe(false);
});

it('excludes undated entries from temporal queries and preserves year precision', () => {
	const age = entries.find((e) => e.id === 'golden-age')!;
	expect(age.temporal.type).toBe('undated');
	const d = dataset();
	d.entries[0].temporal = { type: 'point', date: { year: 1000000, precision: 'year' } };
	expect(entrySchema.safeParse(d.entries[0]).success).toBe(false);
});
