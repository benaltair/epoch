import { it, expect } from 'vitest';
import { diagramLabel } from './labels';
import { diagramTicks } from './axis';
import { entries, byId } from '$lib/data/catalog';
import { HISTORY, position } from './viewport';
const measure = (text: string) => text.length * 7;
it('expands a plan abbreviation only when its name fits', () => {
	const plan = byId.get('nine-year-plan')!;
	expect(diagramLabel(plan, 24, measure)).toBe('9YP');
	expect(diagramLabel(plan, 150, measure)).toBe('Nine Year Plan');
	expect(diagramLabel(plan, 10, measure)).toBe('');
});
it('keeps historical labels collision-free on a linear axis', () => {
	for (const width of [320, 1440]) {
		const labels = diagramTicks(entries, HISTORY, width);
		expect(labels.some((t) => t.label === '1844')).toBe(true);
		for (let i = 1; i < labels.length; i++)
			expect(
				position(labels[i].day, HISTORY, width) - position(labels[i - 1].day, HISTORY, width)
			).toBeGreaterThanOrEqual(41.9);
	}
});
