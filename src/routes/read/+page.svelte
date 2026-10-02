<script lang="ts">
	import { dateLabel } from '$lib/core/model';
	let { data } = $props();
</script>

<svelte:head
	><title>Reading index · Bahá’í Timeline</title><meta
		name="description"
		content="Browse the sourced periods and events of the Bahá’í chronology."
	/></svelte:head
>
<header class="reading-header">
	<a class="brand" href="/">Bahá’í Timeline</a><a href="/">Timeline ↗</a>
</header>
<main class="reading-page">
	<h1>Reading index</h1>
	<ol class="reading-index">
		{#each data.entries as entry}<li>
				<a href="/entry/{entry.id}/"
					><strong>{entry.title}</strong><span>{dateLabel(entry)}</span></a
				>
				<p>{entry.summary}</p>
			</li>{/each}
	</ol>
</main>
