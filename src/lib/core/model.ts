import {
	afterYears,
	formatDate,
	precisionBounds,
	toDay,
	validDate,
	type HistoricalDate
} from './date';
import { CYCLE, HISTORY, type Viewport } from './viewport';
export type Kind = 'cycle' | 'dispensation' | 'age' | 'ministry' | 'epoch' | 'plan' | 'event';
export type Scheme = string;
export interface Source {
	title: string;
	url: string;
	note?: string;
}
export type Temporal =
	| { type: 'undated'; label: string }
	| { type: 'point'; date: HistoricalDate }
	| {
			type: 'period';
			start: HistoricalDate;
			end?: HistoricalDate;
			endLatest?: HistoricalDate;
			minimumYears?: number;
			endNote?: string;
	  };
export interface Entry {
	id: string;
	laneId: string;
	status?: 'draft' | 'published';
	display?: 'timeline' | 'navigation';
	editorialNote?: string;
	title: string;
	shortTitle?: string;
	kind: Kind;
	scheme: Scheme;
	parentId?: string;
	temporal: Temporal;
	summary: string;
	sourceIds: string[];
	relatedIds?: string[];
	importance: number;
	focusRange?: Viewport;
}
export interface Story {
	paragraphs: string[];
	quote?: { text: string; sourceId: string };
	image?: { src: string; alt: string; caption: string; credit: string; sourceUrl: string };
}
export function extent(e: Entry): [number, number] {
	if (e.temporal.type === 'undated') return [Infinity, Infinity];
	if (e.temporal.type === 'point') return precisionBounds(e.temporal.date);
	return [
		toDay(e.temporal.start),
		e.temporal.end
			? e.temporal.endLatest || e.temporal.end.precision !== 'day'
				? precisionBounds(e.temporal.endLatest ?? e.temporal.end)[1]
				: toDay(e.temporal.end)
			: Infinity
	];
}
export function entryRange(e: Entry): Viewport {
	if (e.focusRange) return e.focusRange;
	if (e.temporal.type === 'undated') return { ...HISTORY };
	const [start, end] = extent(e);
	if (Number.isFinite(end)) return { start, end };
	return {
		start,
		end:
			e.temporal.type === 'period' && e.temporal.minimumYears
				? afterYears(e.temporal.start, e.temporal.minimumYears)
				: Math.max(start + 365, HISTORY.end)
	};
}
export function dateLabel(e: Entry): string {
	const t = e.temporal;
	return t.type === 'undated'
		? t.label
		: t.type === 'point'
			? formatDate(t.date)
			: `${formatDate(t.start)} — ${t.end ? formatDate(t.end) + (t.endLatest ? '–' + formatDate(t.endLatest) + ' transition' : '') : t.minimumYears ? `at least ${t.minimumYears.toLocaleString('en-US')} years` : 'continuing'}`;
}
export function ancestors(e: Entry, byId: Map<string, Entry>): Entry[] {
	const result: Entry[] = [];
	let p = e.parentId;
	const seen = new Set<string>();
	while (p && !seen.has(p)) {
		seen.add(p);
		const item = byId.get(p);
		if (!item) break;
		result.unshift(item);
		p = item.parentId;
	}
	return result;
}
export function validateEntries(entries: Entry[], sources: Record<string, Source>): string[] {
	const errors: string[] = [],
		ids = new Set<string>();
	for (const e of entries) {
		if (ids.has(e.id)) errors.push(`Duplicate id: ${e.id}`);
		ids.add(e.id);
	}
	const byId = new Map(entries.map((e) => [e.id, e]));
	for (const e of entries) {
		if (!/^[a-z0-9-]+$/.test(e.id)) errors.push(`Invalid id: ${e.id}`);
		if (!e.sourceIds.length || e.sourceIds.some((id) => !sources[id]))
			errors.push(`Missing source: ${e.id}`);
		if (e.parentId && !byId.has(e.parentId)) errors.push(`Missing parent: ${e.id}`);
		if (e.relatedIds?.some((id) => !ids.has(id))) errors.push(`Missing relation: ${e.id}`);
		const dates =
			e.temporal.type === 'undated'
				? []
				: e.temporal.type === 'point'
					? [e.temporal.date]
					: [e.temporal.start, ...(e.temporal.end ? [e.temporal.end] : [])];
		if (dates.some((d) => !validDate(d))) errors.push(`Invalid date: ${e.id}`);
		const t = e.temporal;
		if (t.type === 'period' && t.end && toDay(t.end) <= toDay(t.start))
			errors.push(`Invalid interval: ${e.id}`);
		if (t.type === 'period' && t.minimumYears !== undefined && (!(t.minimumYears > 0) || t.end))
			errors.push(`Invalid minimum duration: ${e.id}`);
		let p: string | undefined = e.id;
		const seen = new Set<string>();
		while (p) {
			if (seen.has(p)) {
				errors.push(`Hierarchy cycle: ${e.id}`);
				break;
			}
			seen.add(p);
			p = byId.get(p)?.parentId;
		}
	}
	return errors;
}
export const CYCLE_VIEW = CYCLE;
