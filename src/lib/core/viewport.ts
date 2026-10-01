import { toDay } from './date';
import site from '../../../content/site.json';
export interface Viewport {
	start: number;
	end: number;
}
export const WORLD: Viewport = { start: toDay({ year: -10000 }), end: toDay({ year: 1000000 }) };
export const HISTORY: Viewport = {
	start: toDay({ year: site.historyStartYear }),
	end: toDay({ year: site.historyEndYear })
};
import published from '../../../.generated/catalog.json';
const records = published as {
	id: string;
	temporal: {
		type: string;
		start?: { year: number };
		end?: { year: number };
		minimumYears?: number;
	};
}[];
const cycle = Object.values(records).find((e) => e.id === site.cycleEntryId)?.temporal;
const cycleStart = cycle?.start?.year ?? site.historyStartYear;
export const CYCLE: Viewport = {
	start: toDay({ year: cycleStart }),
	end: toDay({
		year: cycle?.end?.year ?? cycleStart + (cycle?.minimumYears ?? site.historyEndYear - cycleStart)
	})
};
export const MIN_SPAN = 1;
export const span = (v: Viewport) => v.end - v.start;
export function constrain(v: Viewport): Viewport {
	if (!Number.isFinite(v.start) || !Number.isFinite(v.end)) return { ...HISTORY };
	const duration = Math.max(MIN_SPAN, Math.min(span(WORLD), span(v)));
	const start = Math.max(WORLD.start, Math.min(WORLD.end - duration, v.start));
	return { start, end: start + duration };
}
export function position(day: number, v: Viewport, width: number) {
	return ((day - v.start) / span(v)) * width;
}
export function at(x: number, v: Viewport, width: number) {
	return v.start + (x / Math.max(1, width)) * span(v);
}
export function zoomAt(v: Viewport, factor: number, anchor: number): Viewport {
	const fraction = Math.max(0, Math.min(1, anchor)),
		duration = Math.max(MIN_SPAN, Math.min(span(WORLD), span(v) / factor));
	const date = v.start + span(v) * fraction;
	return constrain({ start: date - duration * fraction, end: date + duration * (1 - fraction) });
}
export function pan(v: Viewport, fraction: number) {
	const delta = span(v) * fraction;
	return constrain({ start: v.start + delta, end: v.end + delta });
}
export function fit(start: number, end: number, padding = 0.06) {
	const size = Math.max(1, end - start);
	return constrain({ start: start - size * padding, end: end + size * padding });
}
export function pinch(
	v: Viewport,
	startCenter: number,
	center: number,
	startDistance: number,
	distance: number,
	width: number
) {
	const duration = Math.max(
		MIN_SPAN,
		Math.min(span(WORLD), (span(v) * startDistance) / Math.max(1, distance))
	);
	const anchor = at(startCenter, v, width),
		start = anchor - (center / Math.max(1, width)) * duration;
	return constrain({ start, end: start + duration });
}
export interface Navigation {
	view: Viewport;
	focus: string | null;
	selected: string | null;
}
export function encodeNavigation(n: Navigation) {
	const p = new URLSearchParams();
	p.set('from', n.view.start.toFixed(4));
	p.set('to', n.view.end.toFixed(4));
	if (n.focus) p.set('focus', n.focus);
	if (n.selected) p.set('entry', n.selected);
	return `?${p}`;
}
export function decodeNavigation(search: string, ids: Set<string>): Navigation {
	const p = new URLSearchParams(search),
		a = Number(p.get('from')),
		b = Number(p.get('to'));
	return {
		view:
			p.has('from') && p.has('to') && Number.isFinite(a) && Number.isFinite(b) && b > a
				? constrain({ start: a, end: b })
				: { ...HISTORY },
		focus: ids.has(p.get('focus') ?? '') ? p.get('focus') : null,
		selected: ids.has(p.get('entry') ?? '') ? p.get('entry') : null
	};
}
