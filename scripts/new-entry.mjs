import { writeFile } from 'node:fs/promises';
const id = process.argv[2];
if (!id || !/^[a-z0-9-]+$/.test(id)) {
	console.error('Usage: npm run content:new -- unique-entry-id');
	process.exit(1);
}
const entry = {
	id,
	title: 'New historical event',
	kind: 'event',
	scheme: 'events',
	laneId: 'event',
	parentId: 'heroic-age',
	temporal: { type: 'point', date: { year: 1844, precision: 'year' } },
	summary: 'Replace this summary and date after checking the source.',
	sourceIds: ['bab'],
	importance: 2,
	status: 'draft',
	editorialNote: 'Template only. Replace the example source and parent before publication.'
};
await writeFile(`content/entries/${id}.json`, JSON.stringify(entry, null, 2) + '\n', {
	flag: 'wx'
});
console.log(
	`Created content/entries/${id}.json as a draft. Edit, validate, then set status to published.`
);
