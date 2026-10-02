import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { z } from 'zod';
import {
	entrySchema,
	sourceSchema,
	storySchema,
	laneSchema,
	siteSchema,
	validateContent
} from './content-schema.mjs';
const read = async (path) => JSON.parse(await readFile(path, 'utf8'));
const files = async (dir, schema) => {
	const result = {};
	for (const file of (await readdir(dir)).filter((f) => f.endsWith('.json')).sort()) {
		const value = schema.parse(await read(`${dir}/${file}`)),
			id = file.slice(0, -5);
		if (value.id && value.id !== id) throw new Error(`${file}: filename must equal entry id`);
		result[id] = value;
	}
	return result;
};
try {
	const entryFiles = await files('content/entries', entrySchema),
		stories = await files('content/stories', storySchema);
	const sources = sourceSchema.parse(await read('content/sources.json')),
		lanes = laneSchema.parse(await read('content/lanes.json')),
		site = siteSchema.parse(await read('content/site.json')),
		schemes = z.record(z.string(), z.string().min(1)).parse(await read('content/schemes.json'));
	const entries = Object.values(entryFiles),
		errors = validateContent({ entries, sources, stories, lanes, site, schemes });
	if (errors.length) throw new Error(errors.join('\n'));
	if (process.argv.includes('--schema')) {
		await writeFile(
			'content/entry.schema.json',
			JSON.stringify(z.toJSONSchema(entrySchema), null, 2) + '\n'
		);
		await writeFile(
			'content/story.schema.json',
			JSON.stringify(z.toJSONSchema(storySchema), null, 2) + '\n'
		);
	}
	await mkdir('.generated', { recursive: true });
	await writeFile(
		'.generated/catalog.json',
		JSON.stringify(entries.filter((e) => e.status !== 'draft')) + '\n'
	);
	console.log(
		`Content valid: ${entries.length} entries, ${Object.keys(stories).length} stories, ${Object.keys(sources).length} sources.`
	);
} catch (e) {
	console.error('Content validation failed. Nothing should be published.\n' + e.message);
	process.exitCode = 1;
}
