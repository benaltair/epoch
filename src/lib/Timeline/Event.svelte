<script lang="ts">
	export let startDate: string;
	export let endDate: string;
	export let label: string;

	function extractYearFromDate(isoDateString: string): number {
		const date = new Date(isoDateString);
		return date.getUTCFullYear();
	}
</script>

<div
	style="--event-start-year:{extractYearFromDate(startDate)}; --event-end-year:{extractYearFromDate(
		endDate
	)};"
>
	{label}
</div>

<style>
	div {
		grid-column-start: calc((var(--event-start-year) - var(--first-year)) + 1);
		grid-column-end: calc((var(--event-end-year) - var(--first-year)) + 2);
		background-color: var(--accent-bg);
		padding: 0.2em 0.5em;
		border-radius: 0.2em;
		border: 1px solid var(--accent);
		z-index: 2;
		opacity: 0.75;
		text-align: center;
	}
	div:hover {
		opacity: 1;
	}
</style>
