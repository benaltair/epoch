<script lang="ts">
	import { dateLabel } from '$lib/core/model';
	let { data } = $props();
</script>

<svelte:head
	><title>Reading index · Epoch</title><meta
		name="description"
		content="Browse the sourced periods and events of the Bahá’í chronology."
	/></svelte:head
>
<header class="reading-header">
	<a class="brand" href="/">epoch</a><a href="/">Explore the timeline ↗</a>
</header>
<main class="reading-page">
	<p class="eyebrow">Every period and event</p>
	<h1>Reading index</h1>
	<p>
		Explore the chronology as a collection of sourced reading pages. Undated periods appear after
		dated entries.
	</p>
	<ol class="reading-index">
		{#each data.entries as entry}<li>
				<a href="/entry/{entry.id}/"
					><strong>{entry.title}</strong><span>{dateLabel(entry)}</span></a
				>
				<p>{entry.summary}</p>
			</li>{/each}
	</ol>
</main>
