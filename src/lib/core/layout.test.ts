import { it, expect } from 'vitest';
import { TimelineIndex, layout } from './layout';
import { entries, byId } from '$lib/data/catalog';
import { toDay } from './date';
import { extent, type Entry } from './model';
import { HISTORY, CYCLE } from './viewport';
it('finds continuing periods and events inside arbitrary windows', () => {
	const index = new TimelineIndex(entries),
		a = toDay({ year: 1963 }),
		b = toDay({ year: 1964 });
	expect(
		index
			.query(a, b)
			.map((e) => e.id)
			.sort()
	).toEqual(
		entries
			.filter((e) => {
				const [s, t] = extent(e);
				return s < b && t > a;
			})
			.map((e) => e.id)
			.sort()
	);
});
it('preserves temporal geometry regardless of label length', () => {
	const entry = { ...byId.get('heroic-age')!, title: 'A very long label '.repeat(100) };
	const mark = layout(new TimelineIndex([entry]), HISTORY, 800)[0].marks[0];
	expect(mark.width).toBeCloseTo(
		((extent(entry)[1] - extent(entry)[0]) / (HISTORY.end - HISTORY.start)) * 800
	);
});
it('keeps cycles open and the two epoch schemes in different tracks', () => {
	const tracks = layout(new TimelineIndex(entries), HISTORY, 1000);
	expect(tracks.find((t) => t.id === 'formative')?.marks.length).toBeGreaterThan(0);
	expect(tracks.find((t) => t.id === 'divine')?.marks.length).toBeGreaterThan(0);
	expect(layout(new TimelineIndex(entries), CYCLE, 1000)[0].marks[0].open).toBe(true);
});
it('bounds rendered marks for 10,000 clustered events', () => {
	const fixture: Entry[] = Array.from({ length: 10000 }, (_, i) => ({
		...byId.get('declaration-bab')!,
		id: `stress-${i}`,
		temporal: {
			type: 'point',
			date: { year: 1844 + Math.floor(i / 100), month: 1, day: (i % 28) + 1, precision: 'day' }
		}
	}));
	const index = new TimelineIndex(fixture),
		start = performance.now();
	let tracks = layout(index, HISTORY, 390);
	for (let i = 0; i < 20; i++) tracks = layout(index, HISTORY, 390);
	expect(tracks.reduce((n, t) => n + t.marks.length, 0)).toBeLessThan(20);
	expect(tracks.flatMap((t) => t.marks).reduce((n, m) => n + m.entries.length, 0)).toBe(10000);
	expect(performance.now() - start).toBeLessThan(1000);
});

it('clusters adjacent and edge markers without overlapping hit areas', () => {
	const fixture: Entry[] = Array.from({ length: 200 }, (_, i) => ({
		...byId.get('declaration-bab')!,
		id: `edge-${i}`,
		temporal: { type: 'point', date: { year: 1844 + i, precision: 'year' } }
	}));
	for (const width of [320, 390, 1000]) {
		const marks = layout(new TimelineIndex(fixture), HISTORY, width, 48)
			.flatMap((t) => t.marks)
			.sort((a, b) => a.x - b.x);
		expect(
			marks.every((m, i) => i === 0 || m.x >= marks[i - 1].x + marks[i - 1].width - 0.01)
		).toBe(true);
	}
});

it('keeps 10,000 overlapping long periods in bounded lanes without discarding records', () => {
	const fixture: Entry[] = Array.from({ length: 10000 }, (_, i) => ({
		...byId.get('heroic-age')!,
		id: `overlap-${i}`
	}));
	const tracks = layout(new TimelineIndex(fixture), HISTORY, 390);
	expect(tracks[0].lanes).toBeLessThanOrEqual(9);
	expect(tracks[0].marks.length).toBeLessThan(20);
	expect(tracks[0].marks.reduce((sum, m) => sum + m.entries.length, 0)).toBe(10000);
});

it('does not include a day-precision event in the immediately neighbouring days', () => {
	const event = byId.get('declaration-bab')!,
		index = new TimelineIndex([event]),
		day = extent(event)[0];
	expect(index.query(day, day + 1)).toEqual([event]);
	expect(index.query(day + 1, day + 2)).toEqual([]);
	expect(index.query(day - 1, day)).toEqual([]);
});
