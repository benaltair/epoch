import { it, expect } from 'vitest';
import { focusView, interpolateView } from './focus';
import { entries, byId } from '$lib/data/catalog';
import { TimelineIndex } from './layout';
import { entryRange } from './model';
import { CYCLE, HISTORY, span } from './viewport';
it('keeps lower-level periods well inside the window at phone and desktop density', () => {
	for (const width of [320, 1440])
		for (const id of ['formative-2', 'nine-year-plan', 'ministry-bab']) {
			const e = byId.get(id)!,
				focus = focusView(e, new TimelineIndex(entries), width),
				range = entryRange(e);
			expect(span(range) / span(focus)).toBeLessThanOrEqual(0.66);
			expect(focus.start).toBeLessThan(range.start);
			expect(focus.end).toBeGreaterThan(range.end);
		}
});
it('gives dense neighbourhoods more room without filling the whole window', () => {
	const e = byId.get('nine-year-plan')!;
	const sparse = focusView(e, new TimelineIndex([e]), 320);
	const dense = focusView(e, new TimelineIndex(entries), 320);
	expect(span(dense)).toBeLessThan(span(sparse));
	expect(span(entryRange(e)) / span(dense)).toBeLessThan(0.66);
});
it('interpolates enormous zoom changes with finite monotonic scale and exact endpoints', () => {
	expect(interpolateView(CYCLE, HISTORY, 0)).toEqual(CYCLE);
	expect(interpolateView(CYCLE, HISTORY, 1)).toEqual(HISTORY);
	let previous = span(CYCLE);
	for (let p = 0.05; p < 1; p += 0.05) {
		const v = interpolateView(CYCLE, HISTORY, p);
		expect(Number.isFinite(v.start + v.end)).toBe(true);
		expect(span(v)).toBeLessThan(previous);
		expect(span(v)).toBeGreaterThanOrEqual(span(HISTORY));
		previous = span(v);
	}
});

it('ramps logarithmic zoom speed up and down symmetrically', () => {
	const logSize = (p: number) => Math.log(span(interpolateView(CYCLE, HISTORY, p)));
	const first = logSize(0) - logSize(0.1);
	const middle = logSize(0.4) - logSize(0.5);
	const last = logSize(0.9) - logSize(1);
	expect(first).toBeLessThan(middle);
	expect(last).toBeCloseTo(first, 8);
});
