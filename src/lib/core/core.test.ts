import { describe, it, expect } from 'vitest';
import { toDay, fromDay, formatDate, ticks, precisionBounds } from './date';
import {
	at,
	zoomAt,
	pan,
	pinch,
	constrain,
	HISTORY,
	CYCLE,
	decodeNavigation,
	encodeNavigation
} from './viewport';
import { entries, sources, byId } from '$lib/data/catalog';
import { validateEntries, extent, ancestors } from './model';
describe('Gregorian day arithmetic', () => {
	it('agrees with known historical dates and leap boundaries', () => {
		expect(toDay({ year: 1970, month: 1, day: 1 })).toBe(0);
		expect(toDay({ year: 2000, month: 3, day: 1 }) - toDay({ year: 2000, month: 2, day: 28 })).toBe(
			2
		);
		expect(toDay({ year: 1900, month: 3, day: 1 }) - toDay({ year: 1900, month: 2, day: 28 })).toBe(
			1
		);
		expect(() => toDay({ year: 1900, month: 2, day: 29 })).toThrow();
		expect(toDay({ year: 1844, month: 5, day: 23 })).toBe(Date.UTC(1844, 4, 23) / 86400000);
	});
	it('round-trips BCE through dates beyond native Date', () => {
		for (const year of [-9999, -400, -1, 0, 1, 99, 1844, 2000, 501844, 999999])
			for (const month of [1, 2, 3, 12]) {
				const date = { year, month, day: 28 };
				expect(fromDay(toDay(date))).toEqual(date);
			}
		expect(formatDate({ year: 0, precision: 'year' })).toBe('1 BCE');
		expect(Number.isNaN(new Date(toDay({ year: 501844 }) * 86400000).getTime())).toBe(true);
	});
	it('preserves precision and produces bounded monotonic ticks at every scale', () => {
		expect(
			precisionBounds({ year: 2000, month: 2, precision: 'month' })[1] -
				toDay({ year: 2000, month: 2 })
		).toBe(29);
		for (const duration of [1, 30, 365, 36500, CYCLE.end - CYCLE.start]) {
			const result = ticks(HISTORY.start, HISTORY.start + duration, 900);
			expect(result.length).toBeGreaterThan(0);
			expect(result.length).toBeLessThan(25);
			expect(result.every((t, i) => i === 0 || t.day > result[i - 1].day)).toBe(true);
		}
	});
});
describe('viewport invariants', () => {
	it('keeps the date under the zoom anchor including at extreme scale', () => {
		for (const view of [HISTORY, CYCLE])
			for (const anchor of [0, 0.2, 0.5, 1])
				expect(at(anchor * 1000, zoomAt(view, 7, anchor), 1000)).toBeCloseTo(
					at(anchor * 1000, view, 1000),
					6
				);
	});
	it('supports 500,000 years down to one day without accumulating drift', () => {
		let v = { ...CYCLE };
		for (let i = 0; i < 40; i++) v = zoomAt(v, 2, 0.5);
		expect(v.end - v.start).toBe(1);
		expect((v.start + v.end) / 2).toBeCloseTo((CYCLE.start + CYCLE.end) / 2, 5);
	});
	it('preserves the gesture anchor while pinching and translating', () => {
		const v = pinch(HISTORY, 300, 360, 100, 200, 800);
		expect(at(360, v, 800)).toBeCloseTo(at(300, HISTORY, 800), 7);
		expect(v.end - v.start).toBeCloseTo((HISTORY.end - HISTORY.start) / 2);
	});
	it('rejects malformed URL ranges and restores meaningful state', () => {
		expect(constrain({ start: NaN, end: Infinity })).toEqual(HISTORY);
		const n = { view: pan(HISTORY, 0.2), focus: 'heroic-age', selected: 'declaration-bab' };
		expect(decodeNavigation(encodeNavigation(n), new Set(byId.keys()))).toEqual(n);
		expect(decodeNavigation('?from=Infinity&to=NaN&entry=missing', new Set())).toEqual({
			view: HISTORY,
			focus: null,
			selected: null
		});
	});
});
describe('source and relationship integrity', () => {
	it('validates every published entry', () =>
		expect(validateEntries(entries, sources)).toEqual([]));
	it('does not turn minimum duration into an endpoint', () =>
		expect(extent(byId.get('bahai-cycle')!)[1]).toBe(Infinity));
	it('keeps the epoch schemes distinct', () => {
		expect(ancestors(byId.get('formative-2')!, byId).map((e) => e.id)).toEqual([
			'bahai-cycle',
			'formative-age'
		]);
		expect(ancestors(byId.get('divine-2')!, byId).map((e) => e.id)).toEqual([
			'bahai-cycle',
			'divine-plan'
		]);
	});
	it('rejects missing sources and cyclic hierarchies', () => {
		const bad = entries.map((e) => ({ ...e }));
		bad[0].parentId = 'formative-age';
		bad[1].sourceIds = ['missing'];
		expect(validateEntries(bad, sources).some((e) => e.includes('Hierarchy cycle'))).toBe(true);
		expect(validateEntries(bad, sources).some((e) => e.includes('Missing source'))).toBe(true);
	});
});
