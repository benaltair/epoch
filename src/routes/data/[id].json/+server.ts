import { json, error } from '@sveltejs/kit';
import { byId } from '$lib/data/catalog';
import { stories } from '$lib/data/stories';
export const entries = () => Array.from(byId.keys(), (id) => ({ id }));
export function GET({ params }: { params: { id: string } }) {
	const entry = byId.get(params.id);
	if (!entry) error(404, 'Entry not found');
	return json(stories[params.id] ?? { paragraphs: [] });
}

export const prerender = true;
export const trailingSlash = 'never';
