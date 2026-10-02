import { ticks, toDay } from './date';
import { span, position, type Viewport } from './viewport';
import type { Entry } from './model';
/** Prefer historical boundaries where legible, while retaining a linear date scale. */
export function diagramTicks(entries: Entry[], view: Viewport, width: number) {
	const regular = ticks(view.start, view.end, width);
	if (span(view) < 365 * 8 || span(view) > 365 * 5000) return regular;
	const candidates: { day: number; label: string; priority: number }[] = [];
	for (const e of entries) {
		if (e.temporal.type !== 'period' || e.display === 'navigation') continue;
		const priority =
			e.kind === 'cycle'
				? 8
				: e.kind === 'age'
					? 7
					: e.kind === 'ministry'
						? 6
						: e.kind === 'epoch'
							? 5
							: 4;
		for (const d of [e.temporal.start, e.temporal.end].filter((d) => !!d)) {
			const day = toDay(d);
			if (day >= view.start && day < view.end)
				candidates.push({ day, label: String(d.year), priority });
		}
	}
	candidates.push(...regular.map((t) => ({ ...t, priority: 1 })));
	const chosen: typeof candidates = [];
	for (const c of candidates.sort((a, b) => b.priority - a.priority || a.day - b.day)) {
		const x = position(c.day, view, width),
			size = c.label.length * 7 + 14;
		if (
			chosen.some(
				(t) => Math.abs(position(t.day, view, width) - x) < Math.max(size, t.label.length * 7 + 14)
			)
		)
			continue;
		chosen.push(c);
	}
	return chosen.sort((a, b) => a.day - b.day);
}
