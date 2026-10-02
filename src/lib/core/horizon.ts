import { afterYears, toDay } from './date';
import { extent, type Entry } from './model';
import site from '../../../content/site.json';

/** Display limits are not historical endpoints. The source extent remains open. */
export function displayEnd(entry: Entry, byId: Map<string, Entry>): number {
	const t = entry.temporal;
	if (t.type !== 'period' || t.end) return extent(entry)[1];
	if (entry.kind === 'cycle') return Infinity;
	const reference = entry.displayHorizon ? byId.get(entry.displayHorizon.minimumOf)?.temporal : t;
	if (reference?.type === 'period' && reference.minimumYears)
		return afterYears(reference.start, reference.minimumYears);
	return Math.max(toDay(t.start), toDay(site.reviewedThrough));
}
export function hasUndatedContinuation(entry: Entry) {
	return (
		entry.temporal.type === 'period' &&
		!entry.temporal.end &&
		!entry.temporal.minimumYears &&
		!entry.displayHorizon &&
		entry.kind !== 'cycle'
	);
}
