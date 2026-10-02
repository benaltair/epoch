import { it, expect } from 'vitest';
import { entries, byId, site } from '$lib/data/catalog';
import { displayEnd } from './horizon';
import { extent } from './model';
import { afterYears, toDay } from './date';
import { layout, TimelineIndex } from './layout';
import { constrain, HISTORY_BOUNDS, CYCLE, encodeNavigation, decodeNavigation } from './viewport';

it('keeps unknown ends open in data without projecting their bars into the distant future', () => {
	const e = byId.get('divine-3')!;
	expect(extent(e)[1]).toBe(Infinity);
	expect(displayEnd(e, byId)).toBe(toDay(site.reviewedThrough));
	const tracks = layout(
		new TimelineIndex(entries),
		{ start: toDay({ year: 2500 }), end: toDay({ year: 2600 }) },
		1000
	);
	expect(
		tracks.flatMap((t) => t.marks).some((m) => m.entries.some((e) => e.id === 'divine-3'))
	).toBe(false);
	expect(tracks.find((t) => t.id === 'cycle')!.marks[0].open).toBe(true);
});
it('uses the sourced minimum as a display horizon, not as a historical end', () => {
	const dispensation = byId.get('bahai-dispensation')!;
	if (dispensation.temporal.type !== 'period') throw new Error('Expected period');
	const minimum = afterYears(dispensation.temporal.start, 1000);
	expect(displayEnd(dispensation, byId)).toBe(minimum);
	expect(displayEnd(byId.get('bahai-era')!, byId)).toBe(minimum);
	expect(extent(dispensation)[1]).toBe(Infinity);
	expect(displayEnd(byId.get('bahai-cycle')!, byId)).toBe(Infinity);
});
it('bounds history at 2100 while preserving an explicit full-cycle navigation state', () => {
	const duration = 100;
	const v = constrain(
		{ start: HISTORY_BOUNDS.end + 1000, end: HISTORY_BOUNDS.end + 1000 + duration },
		HISTORY_BOUNDS
	);
	expect(v.end).toBe(toDay({ year: 2101 }));
	expect(v.end - v.start).toBe(duration);
	const n = { view: CYCLE, focus: 'bahai-cycle', selected: null, scale: 'wide' as const };
	expect(decodeNavigation(encodeNavigation(n), new Set(byId.keys()))).toEqual(n);
});

it('keeps leadership transitions continuous and the first UHJ election precisely dated', () => {
	const guardian = byId.get('ministry-shoghi-effendi')!;
	const hands = byId.get('custodianship-hands')!;
	const house = byId.get('universal-house-of-justice')!;
	expect(extent(guardian)[1]).toBe(extent(hands)[0]);
	expect(extent(hands)[1]).toBe(extent(house)[0]);
	expect(extent(house)[0]).toBe(toDay({ year: 1963, month: 4, day: 21 }));
	expect(extent(byId.get('election-uhj')!)[0]).toBe(extent(house)[0]);
	expect(guardian.kind).toBe('ministry');
	expect(house.kind).toBe('institution');
});
