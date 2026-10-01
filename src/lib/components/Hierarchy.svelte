<script lang="ts">
	import { entries, byId, site } from '$lib/data/catalog';
	import { ancestors } from '$lib/core/model';
	let {
		focus,
		onfocus,
		onselect
	}: { focus: string | null; onfocus: (id: string) => void; onselect: (id: string) => void } =
		$props();
	let expanded = $state(new Set([site.cycleEntryId]));
	let query = $state('');
	const normalize = (s: string) =>
		s
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.replace(/[‘’']/g, '')
			.toLowerCase();
	const found = $derived(
		query.trim()
			? entries
					.filter((e) => normalize(e.title + ' ' + e.summary).includes(normalize(query)))
					.slice(0, 30)
			: []
	);
	function toggle(id: string) {
		const next = new Set(expanded);
		next.has(id) ? next.delete(id) : next.add(id);
		expanded = next;
	}
	$effect(() => {
		if (focus) {
			const entry = byId.get(focus);
			if (entry) {
				const next = new Set(expanded);
				let changed = false;
				for (const a of ancestors(entry, byId)) {
					if (!next.has(a.id)) {
						next.add(a.id);
						changed = true;
					}
				}
				if (changed) expanded = next;
			}
		}
	});
</script>

<label class="search-field"
	><span aria-hidden="true">⌕</span><input
		type="search"
		placeholder="Find a period or event"
		aria-label="Find a period or event"
		bind:value={query}
	/></label
>
{#if query.trim()}
	<p class="eyebrow search-count">{found.length} matches</p>
	<ul class="search-results">
		{#each found as entry}<li>
				<button
					onclick={() => {
						entry.kind === 'event' ? onselect(entry.id) : onfocus(entry.id);
						query = '';
					}}><span>{entry.title}</span><small>{entry.kind}</small></button
				>
			</li>{/each}
	</ul>
	{#if !found.length}<p class="small muted">
			No matching entries. Try a year-independent term such as “Plan” or “Báb”.
		</p>{/if}
{:else}
	<p class="eyebrow nav-caption">Explore the chronology</p>
	{#snippet branch(parentId: string | undefined, depth: number)}
		<ul class="hierarchy" style="--depth:{depth}">
			{#each entries.filter((e) => e.parentId === parentId && e.kind !== 'event') as entry}
				{@const children = entries.some((e) => e.parentId === entry.id && e.kind !== 'event')}
				<li>
					<div class:current={focus === entry.id} class="tree-row">
						{#if children}<button
								class="tree-toggle"
								aria-label="{expanded.has(entry.id) ? 'Collapse' : 'Expand'} {entry.title}"
								aria-expanded={expanded.has(entry.id)}
								onclick={() => toggle(entry.id)}>{expanded.has(entry.id) ? '−' : '+'}</button
							>{:else}<span class="tree-leaf" aria-hidden="true">·</span>{/if}
						<button
							class="tree-name"
							aria-current={focus === entry.id ? 'true' : undefined}
							onclick={() => onfocus(entry.id)}
							>{entry.shortTitle ?? entry.title.replace(/^The /, '')}</button
						>
					</div>
					{#if expanded.has(entry.id)}{@render branch(entry.id, depth + 1)}{/if}
				</li>
			{/each}
		</ul>
	{/snippet}
	{@render branch(undefined, 0)}
	<div class="sidebar-note">
		<span class="note-orbit" aria-hidden="true">◌</span>
		<p>Many scales.<br />One unfolding story.</p>
		<small>Explore a period to discover the events and relationships within it.</small>
	</div>
{/if}
