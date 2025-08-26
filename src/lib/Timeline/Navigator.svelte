<script lang="ts">
	import EventComponent from '$lib/Timeline/Event.svelte';
	import type { Event as EventData } from '$lib/types';

	export let firstYear: number;
	export let lastYear: number;
	export let events: EventData[] = [];

	function getDecades(firstYear: number, lastYear: number): number[] {
		if (firstYear > lastYear) {
			return [];
		}
		const decades: number[] = [];
		let currentDecade: number = Math.floor(firstYear / 10) * 10;
		while (currentDecade <= Math.floor(lastYear / 10) * 10 + 10) {
			decades.push(currentDecade);
			currentDecade += 10;
		}
		return decades;
	}

	let decadesArray: number[] = [];
	$: decadesArray = getDecades(firstYear, lastYear);
</script>

<main style="--first-year:{firstYear}; --last-year:{lastYear};">
	{#each events as { startDate, endDate, label }}
		<EventComponent {startDate} {endDate} {label} />
	{/each}
	<nav>
		{#each decadesArray as year}
			<time
				datetime={new Date('1 January ' + year).toISOString()}
				style="--decade-year:{year};--content:'{year}';">&nbsp;</time
			>
		{/each}
	</nav>
</main>

<style>
	main {
		--spacing: 2.5em;
		--year-width: 6rem;
		--number-of-years: calc(var(--last-year) - var(--first-year) + 1);
		display: grid;
		grid-template-columns: repeat(var(--number-of-years), var(--year-width));
		grid-template-rows: auto;
		row-gap: calc(var(--spacing) / 4);
		align-content: baseline;
		position: relative;
		width: max(100vw, calc(var(--number-of-years) * var(--year-width)));
		height: 100vh;
		background-color: var(--bg);
		padding: var(--spacing);
		overflow-x: auto;
		overflow-y: hidden;
		z-index: 1;
	}

	nav {
		position: absolute;
		display: grid;
		grid-template-columns: repeat(var(--number-of-years), var(--year-width));
		grid-template-rows: 1fr;
		min-width: calc(var(--number-of-years) * var(--year-width));
		width: max(100%, calc(var(--number-of-years) * var(--year-width)));
		height: var(--spacing);
		left: 0;
		bottom: 0;
		margin: var(--spacing) 0;
	}

	time {
		position: relative;
		width: max-content;
		height: 1em;
		text-align: left;
		align-self: center;
		justify-self: center;
		color: var(--text-light);
		--year-offset: calc(var(--decade-year) - var(--first-year) + 1);
		grid-column-start: var(--year-offset);
		grid-column-end: calc(var(--year-offset) + 10);
		grid-row: 1 / 1;
	}

	time::before {
		content: var(--content);
		--padding: 0.35em;
		border-radius: calc(var(--padding));
		display: inline;
		position: absolute;
		left: calc(var(--padding) * -1 - 1em);
		color: var(--text);
		background-color: var(--accent-bg);
		padding: calc(var(--padding) * 0.6) var(--padding);
		box-sizing: unset;
		z-index: 3;
	}

	time::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: calc(-1 * var(--spacing) * 1.5);
		height: 100vh;
		width: 1px;
		z-index: 1;
		border-left: 1px solid var(--accent);
		opacity: 0.15;
		pointer-events: none;
	}

	@media (max-width: 600px) {
		main {
			--year-width: 4rem;
		}
	}
</style>
