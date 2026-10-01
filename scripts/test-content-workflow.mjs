import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const directory = await mkdtemp(join(tmpdir(), 'epoch-content-'));
try {
	await cp('content', join(directory, 'content'), { recursive: true });
	const entry = JSON.parse(await readFile('content/entries/declaration-bab.json', 'utf8'));
	entry.id = 'workflow-fixture';
	entry.title = 'Workflow fixture';
	entry.status = 'draft';
	const file = join(directory, 'content/entries/workflow-fixture.json');
	const validate = () => {
		const run = spawnSync(process.execPath, [resolve('scripts/validate-content.mjs')], {
			cwd: directory,
			encoding: 'utf8'
		});
		assert.equal(run.status, 0, run.stderr);
	};
	const catalogue = async () =>
		JSON.parse(await readFile(join(directory, '.generated/catalog.json'), 'utf8'));
	await writeFile(file, JSON.stringify(entry));
	validate();
	assert.equal(
		(await catalogue()).some((e) => e.id === entry.id),
		false
	);
	entry.status = 'published';
	await writeFile(file, JSON.stringify(entry));
	validate();
	assert.equal((await catalogue()).find((e) => e.id === entry.id).title, entry.title);
	entry.title = 'Corrected title';
	entry.temporal.date.day = 24;
	await writeFile(file, JSON.stringify(entry));
	validate();
	assert.equal((await catalogue()).find((e) => e.id === entry.id).temporal.date.day, 24);
	entry.sourceIds = ['missing-source'];
	await writeFile(file, JSON.stringify(entry));
	const bad = spawnSync(process.execPath, [resolve('scripts/validate-content.mjs')], {
		cwd: directory,
		encoding: 'utf8'
	});
	assert.notEqual(bad.status, 0);
	assert.equal((await catalogue()).find((e) => e.id === entry.id).title, 'Corrected title');
	console.log(
		'Content workflow passed: add draft → publish → correct → reject invalid edit without replacing the valid catalogue.'
	);
} finally {
	await rm(directory, { recursive: true, force: true });
}
