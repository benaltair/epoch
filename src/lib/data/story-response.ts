import type { Story } from '$lib/core/model';
/** Story requests can fail independently of the already-loaded chronology. */
export function readStory(value: unknown, sourceIds: Set<string>): Story {
	if (!value || typeof value !== 'object') throw new Error('Invalid story');
	const s = value as Record<string, unknown>;
	if (!Array.isArray(s.paragraphs) || !s.paragraphs.every((p) => typeof p === 'string'))
		throw new Error('Invalid paragraphs');
	const story: Story = { paragraphs: s.paragraphs };
	if (s.quote !== undefined) {
		const q = s.quote as Record<string, unknown>;
		if (
			!q ||
			typeof q.text !== 'string' ||
			typeof q.sourceId !== 'string' ||
			!sourceIds.has(q.sourceId)
		)
			throw new Error('Invalid quote');
		story.quote = { text: q.text, sourceId: q.sourceId };
	}
	if (s.image !== undefined) {
		const i = s.image as Record<string, unknown>;
		if (
			!i ||
			!['src', 'alt', 'caption', 'credit', 'sourceUrl'].every((k) => typeof i[k] === 'string') ||
			!String(i.src).startsWith('https://') ||
			!String(i.sourceUrl).startsWith('https://')
		)
			throw new Error('Invalid image');
		story.image = i as unknown as NonNullable<Story['image']>;
	}
	return story;
}
