<script lang="ts">
	export let startYear: number;
	export let endYear: number;
	export let lane: number;
	export let firstYear: number;
	export let label: string;

	$: startCol = startYear - firstYear + 1;
	$: endCol = endYear - firstYear + 1;
</script>

<div style="grid-column:{startCol} / {endCol}; grid-row:{lane + 1};">{label}</div>

<style>
	div {
		width: 100%;
		background-color: var(--accent-bg);
		padding: 0.2em 0.5em;
		border-radius: 0.2em;
		z-index: 3;
		opacity: 0.75;
		text-align: center;
		border: 1px solid var(--accent);
	}
	div:hover {
		opacity: 1;
	}
</style>
