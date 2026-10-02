<script lang="ts">
	import { dateLabel, kindLabel, type Entry, type Story } from '$lib/core/model';
	import { sources, byId, schemeLabels } from '$lib/data/catalog';
	let {
		entry,
		story,
		onselect,
		onfocus,
		headingLevel = 2
	}: {
		entry: Entry;
		story: Story | null;
		headingLevel?: 1 | 2;
		onselect?: (id: string) => void;
		onfocus?: (id: string) => void;
	} = $props();
	let failedImage = $state<string | null>(null);
</script>

<div class="entry-content">
	<p class="eyebrow">
		{kindLabel(entry.kind)} <span aria-hidden="true">/</span>
		{schemeLabels[entry.scheme]}
	</p>
	<svelte:element this={headingLevel === 1 ? 'h1' : 'h2'}>{entry.title}</svelte:element>
	<p class="entry-date">{dateLabel(entry)}</p>
	<p class="entry-summary">{entry.summary}</p>
	{#if entry.temporal.type === 'period' && entry.temporal.endNote}<p class="source-note">
			{entry.temporal.endNote}
		</p>{/if}
	{#if story?.image && failedImage === story.image.src}<p class="source-note">
			Image unavailable. <a href={story.image.sourceUrl} target="_blank" rel="noreferrer"
				>View the photo source</a
			>.
		</p>{:else if story?.image}
		<figure>
			<img
				src={story.image.src}
				alt={story.image.alt}
				loading="lazy"
				width="800"
				height="500"
				referrerpolicy="no-referrer"
				onerror={() => {
					failedImage = story?.image?.src ?? null;
				}}
			/>
			<figcaption>
				{story.image.caption}
				<a href={story.image.sourceUrl} target="_blank" rel="noreferrer">{story.image.credit}</a>
			</figcaption>
		</figure>
	{/if}
	{#if story?.quote}<blockquote>
			{story.quote.text}<cite>{sources[story.quote.sourceId].title}</cite>
		</blockquote>{/if}
	{#each story?.paragraphs ?? [] as paragraph}<p>{paragraph}</p>{/each}
	{#if onfocus && entry.temporal.type !== 'undated'}<button
			class="primary"
			onclick={() => onfocus?.(entry.id)}
			>Explore this {entry.kind === 'event' ? 'date' : 'period'}
			<span aria-hidden="true">↗</span></button
		>{/if}
	<section class="sources">
		<h3>Sources</h3>
		{#each entry.sourceIds as id}<a href={sources[id].url} target="_blank" rel="noreferrer"
				>{sources[id].title}<span aria-hidden="true">↗</span></a
			>{#if sources[id].note}<p class="small muted">{sources[id].note}</p>{/if}{/each}
	</section>
	{#if entry.relatedIds?.length}<section class="related">
			<h3>Related</h3>
			{#each entry.relatedIds as id}{#if onselect}<button onclick={() => onselect?.(id)}
						>{byId.get(id)?.title} <span aria-hidden="true">→</span></button
					>{:else}<a href="/entry/{id}/">{byId.get(id)?.title} →</a>{/if}{/each}
		</section>{/if}
	{#if onselect}<a class="permalink" href="/entry/{entry.id}/">Open page ↗</a>{/if}
</div>
