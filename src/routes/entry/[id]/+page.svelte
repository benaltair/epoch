<script lang="ts">
	import EntryContent from '$lib/components/EntryContent.svelte';
	import { entryRange } from '$lib/core/model';
	import { fit, encodeNavigation } from '$lib/core/viewport';
	let { data } = $props();
	const range = $derived(entryRange(data.entry));
	const link = $derived(
		'/' +
			encodeNavigation({
				view: fit(range.start, range.end),
				focus: data.entry.kind === 'event' ? (data.entry.parentId ?? null) : data.entry.id,
				selected: data.entry.id
			})
	);
</script>

<svelte:head
	><title>{data.entry.title} · Epoch</title><meta
		name="description"
		content={data.entry.summary}
	/></svelte:head
>
<header class="reading-header">
	<a class="brand" href="/"
		><span class="brand-mark" aria-hidden="true">✳</span> epoch<span class="brand-sub"
			>A BAHÁ’Í CHRONOLOGY</span
		></a
	><a class="button" href={link}>Show in timeline ↗</a>
</header>
<main class="reading-page">
	<nav aria-label="Period ancestry">
		<a href="/">Timeline</a>{#each data.ancestors as a}<span aria-hidden="true"> / </span><a
				href="/entry/{a.id}/">{a.shortTitle ?? a.title}</a
			>{/each}
	</nav>
	<EntryContent headingLevel={1} entry={data.entry} story={data.story} />
</main>
<footer class="reading-footer">
	An independent exploration of Bahá’í history. Dates and interpretations are accompanied by their
	sources.
</footer>
