import type { Story } from '$lib/core/model';
// Imported only by server/prerender modules. Full stories are fetched on demand in the explorer.
const files = import.meta.glob('../../../content/stories/*.json', {
	eager: true,
	import: 'default'
});
export const stories: Record<string, Story> = Object.fromEntries(
	Object.entries(files).map(([path, story]) => [
		path.split('/').pop()!.replace('.json', ''),
		story as Story
	])
);
