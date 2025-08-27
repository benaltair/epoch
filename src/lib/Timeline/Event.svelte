<script lang="ts">
	export let startDate: string;
	export let endDate: string;
	export let label: string;
	export let row: number = 1;

	function extractYearFromDate(isoDateString: string): number {
		const date = new Date(isoDateString);
		return date.getUTCFullYear();
	}
</script>

<div
	style="--event-start-year:{extractYearFromDate(startDate)}; --event-end-year:{extractYearFromDate(
		endDate
	)}; --event-row:{row};"
>
	{label}
</div>

<style>
	div {
		grid-column-start: calc((var(--event-start-year) - var(--first-year)) + 1);
		grid-column-end: calc((var(--event-end-year) - var(--first-year)) + 1);
		grid-row: var(--event-row);
		background-color: var(--accent-bg);
		padding: 0.2em 0.5em;
		border-radius: 0.2em;
		width: 100%;
		z-index: 3;
		opacity: 0.75;
		text-align: center;
		border: 1px solid var(--accent);
	}
	div:hover {
		opacity: 1;
	}
</style>
