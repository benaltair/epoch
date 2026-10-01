import { z } from 'zod';
const id = z.string().regex(/^[a-z0-9-]+$/);
const https = z.url().refine((s) => s.startsWith('https://'), 'Only HTTPS links are allowed');
export const dateSchema = z.strictObject({
	year: z.number().int().min(-10000).max(999999),
	month: z.number().int().min(1).max(12).optional(),
	day: z.number().int().min(1).max(31).optional(),
	precision: z.enum(['year', 'month', 'day']),
	approximate: z.boolean().optional()
});
const temporal = z.discriminatedUnion('type', [
	z.strictObject({ type: z.literal('undated'), label: z.string().min(1) }),
	z.strictObject({ type: z.literal('point'), date: dateSchema }),
	z.strictObject({
		type: z.literal('period'),
		start: dateSchema,
		end: dateSchema.optional(),
		endLatest: dateSchema.optional(),
		minimumYears: z.number().int().positive().max(1000000).optional(),
		endNote: z.string().optional()
	})
]);
export const entrySchema = z.strictObject({
	id,
	title: z.string().min(1).max(300),
	shortTitle: z.string().min(1).max(100).optional(),
	kind: z.enum(['cycle', 'dispensation', 'age', 'ministry', 'epoch', 'plan', 'event']),
	scheme: id,
	laneId: id,
	parentId: id.optional(),
	temporal,
	summary: z.string().min(1).max(2000),
	sourceIds: z.array(id).min(1),
	relatedIds: z.array(id).optional(),
	importance: z.number().int().min(0).max(5),
	focusRange: z.strictObject({ start: z.number(), end: z.number() }).optional(),
	display: z.enum(['timeline', 'navigation']).optional(),
	status: z.enum(['draft', 'published']),
	editorialNote: z.string().optional()
});
export const sourceSchema = z.record(
	id,
	z.strictObject({ title: z.string().min(1), url: https, note: z.string().optional() })
);
export const storySchema = z.strictObject({
	paragraphs: z.array(z.string().min(1).max(10000)),
	quote: z.strictObject({ text: z.string().min(1), sourceId: id }).optional(),
	image: z
		.strictObject({
			src: https,
			alt: z.string().min(1),
			caption: z.string().min(1),
			credit: z.string().min(1),
			sourceUrl: https
		})
		.optional()
});
export const laneSchema = z
	.array(
		z.strictObject({
			id,
			label: z.string().min(1),
			tone: id,
			maxSpanYears: z.number().positive().optional()
		})
	)
	.min(1);
export const siteSchema = z.strictObject({
	featuredEntryIds: z.array(id),
	cycleEntryId: id,
	historyStartYear: z.number().int(),
	historyEndYear: z.number().int()
});
export function checkDate(d, label, errors) {
	const leap = d.year % 4 === 0 && (d.year % 100 !== 0 || d.year % 400 === 0);
	const lengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (d.day && d.day > lengths[(d.month ?? 1) - 1])
		errors.push(`${label}: impossible calendar date`);
	if (
		(d.precision === 'year' && (d.month || d.day)) ||
		(d.precision === 'month' && (!d.month || d.day)) ||
		(d.precision === 'day' && (!d.month || !d.day))
	)
		errors.push(`${label}: precision does not match supplied fields`);
}
const dateKey = (d) => d.year * 372 + (d.month ?? 1) * 31 + (d.day ?? 1);
export function validateContent({ entries, sources, stories, lanes, schemes, site }) {
	const errors = [],
		ids = new Set(entries.map((e) => e.id)),
		byId = new Map(entries.map((e) => [e.id, e]));
	if (ids.size !== entries.length) errors.push('Duplicate entry IDs');
	if (new Set(lanes.map((l) => l.id)).size !== lanes.length) errors.push('Duplicate lane IDs');
	for (const e of entries) {
		if (!lanes.some((l) => l.id === e.laneId)) errors.push(`${e.id}: missing lane ${e.laneId}`);
		if (!schemes[e.scheme]) errors.push(`${e.id}: missing scheme ${e.scheme}`);
		if (e.sourceIds.some((id) => !sources[id])) errors.push(`${e.id}: missing source`);
		for (const ref of [e.parentId, ...(e.relatedIds ?? [])].filter(Boolean)) {
			if (!ids.has(ref)) errors.push(`${e.id}: missing related/parent entry ${ref}`);
			else if (e.status !== 'draft' && byId.get(ref).status === 'draft')
				errors.push(`${e.id}: published record refers to a draft`);
		}
		const seen = new Set();
		let node = e;
		while (node) {
			if (seen.has(node.id)) {
				errors.push(`${e.id}: cyclic hierarchy`);
				break;
			}
			seen.add(node.id);
			node = byId.get(node.parentId);
		}
		const t = e.temporal;
		for (const d of t.type === 'undated'
			? []
			: t.type === 'point'
				? [t.date]
				: [t.start, t.end, t.endLatest].filter(Boolean))
			checkDate(d, e.id, errors);
		if (t.type === 'period') {
			if (t.end && dateKey(t.end) <= dateKey(t.start))
				errors.push(`${e.id}: end must be after start`);
			if (t.endLatest && (!t.end || dateKey(t.endLatest) <= dateKey(t.end)))
				errors.push(`${e.id}: invalid uncertain endpoint`);
			if (t.minimumYears && t.start.year + t.minimumYears > 999999)
				errors.push(`${e.id}: minimum duration exceeds the supported calendar range`);
			if (t.minimumYears && t.end)
				errors.push(`${e.id}: minimum duration cannot also be an exact endpoint`);
		}
		if (e.focusRange && e.focusRange.end <= e.focusRange.start)
			errors.push(`${e.id}: invalid viewing range`);
	}
	for (const [id, story] of Object.entries(stories)) {
		if (!ids.has(id)) errors.push(`${id}: orphaned story`);
		if (
			story.quote &&
			(!sources[story.quote.sourceId] || !byId.get(id)?.sourceIds.includes(story.quote.sourceId))
		)
			errors.push(`${id}: quote source must appear in the entry sourceIds`);
	}
	for (const id of [site.cycleEntryId, ...site.featuredEntryIds])
		if (!ids.has(id) || byId.get(id).status === 'draft')
			errors.push(`Site configuration: missing published entry ${id}`);
	if (
		byId.get(site.cycleEntryId)?.kind !== 'cycle' ||
		byId.get(site.cycleEntryId)?.temporal.type !== 'period'
	)
		errors.push('The cycle preset must reference a dated cycle period');
	if (site.historyStartYear < -10000 || site.historyEndYear > 999999)
		errors.push('History viewport is outside the supported calendar range');
	if (site.historyEndYear <= site.historyStartYear)
		errors.push('History viewport must have positive duration');
	return errors;
}
