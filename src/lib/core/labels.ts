import type { Entry } from './model';
export type MeasureText = (text: string) => number;
/** The label changes, never the geometry. No wrapped or ellipsized diagram text. */
export function diagramLabel(entry: Entry, available: number, measure: MeasureText): string {
	for (const label of [
		...new Set([entry.title, entry.shortTitle, entry.abbreviation].filter((s): s is string => !!s))
	]) {
		if (measure(label) <= available) return label;
	}
	return '';
}
