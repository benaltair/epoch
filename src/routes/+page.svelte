<script lang="ts">
	import Explorer from '$lib/components/Explorer.svelte';
</script>

<svelte:head
	><title>Epoch · A Bahá’í chronology</title><meta
		name="description"
		content="Explore the relationships between cycles, dispensations, ages, epochs, and events in Bahá’í history. An interactive, sourced chronology."
	/></svelte:head
>
<noscript
	><aside class="no-script">
		<p>
			For the interactive timeline, enable JavaScript. You can also <a href="/read/"
				>browse the reading index</a
			> with JavaScript disabled.
		</p>
	</aside></noscript
>
<Explorer />
