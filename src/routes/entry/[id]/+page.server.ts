import { error } from '@sveltejs/kit';
import { byId } from '$lib/data/catalog';
import { stories } from '$lib/data/stories';
import { ancestors } from '$lib/core/model';
export const entries = () => Array.from(byId.keys(), (id) => ({ id }));
export function load({ params }: { params: { id: string } }) {
	const entry = byId.get(params.id);
	if (!entry) error(404, 'Entry not found');
	return {
		entry,
		story: stories[params.id] ?? { paragraphs: [] },
		ancestors: ancestors(entry, byId)
	};
}
