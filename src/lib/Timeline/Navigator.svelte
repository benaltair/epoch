<script lang="ts">
	import EventComponent from '$lib/Timeline/Event.svelte';
	import type { Event as EventData } from '$lib/types';

	export let firstYear: number;
	export let lastYear: number;
	export let events: EventData[] = [];

	type PlacedEvent = EventData & { row: number };

	function getYear(iso: string): number {
		return new Date(iso).getUTCFullYear();
	}

	function placeEvents(list: EventData[]): PlacedEvent[] {
		const rows: number[] = [];
		return [...list]
			.sort((a, b) => getYear(a.startDate) - getYear(b.startDate))
			.map((event) => {
				const start = getYear(event.startDate);
				const end = getYear(event.endDate);
				let rowIndex = rows.findIndex((rEnd) => start > rEnd);
				if (rowIndex === -1) {
					rowIndex = rows.length;
					rows.push(end);
				} else {
					rows[rowIndex] = end;
				}
				return { ...event, row: rowIndex + 1 };
			});
	}

	let placed: PlacedEvent[] = [];
	$: placed = placeEvents(events);

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
	{#each placed as { startDate, endDate, label, row }}
		<EventComponent {startDate} {endDate} {label} {row} />
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
		--spacing: 1rem;
		--year-width: clamp(3rem, 4vw, 5rem);
		--row-height: 2rem;
		--number-of-years: calc(var(--last-year) - var(--first-year) + 1);
		display: grid;
		grid-template-columns: repeat(var(--number-of-years), var(--year-width));
		grid-auto-rows: var(--row-height);
		row-gap: var(--spacing);
		align-content: start;
		position: relative;
		width: max(100vw, calc(var(--number-of-years) * var(--year-width)));
		min-height: 100vh;
		background-color: var(--bg);
		background-image: repeating-linear-gradient(
				to right,
				var(--grid-decade),
				var(--grid-decade) 2px,
				transparent 2px,
				transparent calc(var(--year-width) * 10)
			),
			repeating-linear-gradient(
				to right,
				var(--grid-year),
				var(--grid-year) 1px,
				transparent 1px,
				transparent var(--year-width)
			);
		padding: var(--spacing);
		overflow: auto;
		z-index: 1;
	}

	nav {
		position: absolute;
		display: grid;
		grid-template-columns: repeat(var(--number-of-years), var(--year-width));
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

	@media (max-width: 600px) {
		main {
			--row-height: 1.5rem;
		}
	}
</style>
