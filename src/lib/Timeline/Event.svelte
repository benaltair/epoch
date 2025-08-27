<script lang="ts">
	export let startDate: string;
	export let endDate: string;
	import { createEventDispatcher } from 'svelte';
	export let label: string;
	export let row: number = 1;
	export let type: string = 'event';

	const dispatch = createEventDispatcher();

	function extractYearFromDate(isoDateString: string): number {
		const date = new Date(isoDateString);
		return date.getUTCFullYear();
	}
</script>

<div
	role="button"
	tabindex="0"
	on:click={() => dispatch('focus', { startDate, endDate })}
	on:keydown={(e) =>
		(e.key === 'Enter' || e.key === ' ') && dispatch('focus', { startDate, endDate })}
	style="--event-start-year:{extractYearFromDate(startDate)}; --event-end-year:{extractYearFromDate(
		endDate
	)}; --event-row:{row}; --event-color:var(--color-{type});"
>
	{label}
</div>

<style>
	div {
		grid-column-start: calc((var(--event-start-year) - var(--first-year)) + 1);
		grid-column-end: calc((var(--event-end-year) - var(--first-year)) + 1);
		grid-row: var(--event-row);
		background-color: color-mix(in srgb, var(--event-color) 30%, transparent);
		padding: 0.2em 0.5em;
		border-radius: 0.2em;
		width: 100%;
		z-index: 3;
		opacity: 0.75;
		text-align: center;
		border: 1px solid var(--event-color);
	}
	div:hover {
		opacity: 1;
	}
</style>
