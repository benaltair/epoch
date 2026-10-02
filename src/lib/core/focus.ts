import { entryRange, type Entry } from './model';
import { displayEnd } from './horizon';
import type { TimelineIndex } from './layout';
import { constrain, fit, span, type Viewport } from './viewport';
/** Keep smaller periods in context, giving dense neighbourhoods a little more room. */
export function focusView(entry: Entry, index: TimelineIndex, width: number): Viewport {
	const range = entryRange(entry);
	if (entry.kind === 'era') range.end = displayEnd(entry, index.byId);
	if (
		entry.kind === 'cycle' ||
		entry.kind === 'era' ||
		entry.kind === 'dispensation' ||
		entry.kind === 'age'
	)
		return fit(range.start, range.end);
	const size = Math.max(1, span(range));
	const centre = (range.start + range.end) / 2;
	const neighbours = index
		.query(centre - size * 1.5, centre + size * 1.5)
		.filter((e) => e.id !== entry.id && (e.laneId === entry.laneId || e.kind === 'event')).length;
	const density = Math.min(1, neighbours / Math.max(4, width / 64));
	const fraction =
		(entry.kind === 'plan' ? 0.35 : entry.kind === 'epoch' ? 0.45 : 0.5) + 0.15 * density;
	const duration = Math.max(entry.kind === 'event' ? 30 : 1, size / fraction);
	return constrain({ start: centre - duration / 2, end: centre + duration / 2 });
}
/** Logarithmic scale interpolation avoids a jarring last frame across cycle/day scales. */
export function interpolateView(from: Viewport, to: Viewport, progress: number): Viewport {
	if (progress <= 0) return from;
	if (progress >= 1) return to;
	const t = progress * progress * (3 - 2 * progress);
	const size = Math.exp(Math.log(span(from)) * (1 - t) + Math.log(span(to)) * t);
	// Follow the date whose screen position is invariant under this zoom, where possible.
	const delta = span(from) - span(to);
	const anchor = Math.abs(delta) > 1e-6 ? (to.start - from.start) / delta : 0.5;
	const start =
		Math.abs(anchor) < 1e6 && Math.abs(delta) > 1e-6
			? from.start + (span(from) - size) * anchor
			: from.start + (to.start - from.start) * t;
	return constrain({ start, end: start + size });
}
