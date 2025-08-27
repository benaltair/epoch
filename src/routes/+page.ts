import type { PageLoad } from './$types';
import type { Event } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/data/events.json');
	if (!res.ok) {
		throw new Error('Failed to fetch events');
	}
	const events: Event[] = await res.json();
	return { events };
};
