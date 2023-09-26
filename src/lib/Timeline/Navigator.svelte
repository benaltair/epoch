<script lang="ts">
	import Event from '$lib/Timeline/Event.svelte';

	let significantDates = [1844, 1853, 1892, 1921, 2016, 2021, 2044];

	export let firstYear: number;
	export let lastYear: number;

	function getDecades(firstYear: number, lastYear: number): number[] {
		if (firstYear > lastYear) {
			// Ensure start year is before or equal to end year.
			return [];
		}

		const decades: number[] = [];
		let currentDecade: number = Math.floor(firstYear / 10) * 10; // Find the first decade.

		while (currentDecade <= Math.floor(lastYear / 10) * 10 + 10) {
			decades.push(currentDecade);
			currentDecade += 10; // Move to the next decade.
		}

		return decades;
	}

	let decadesArray: number[] = [];
	$: {
		decadesArray = getDecades(firstYear, lastYear);
	}

	let exampleEvents = [
		{ startDate: '1890-02-01T08:00:00.000Z', endDate: '1895-07-01T08:00:00.000Z' },
		{ startDate: '1996-08-01T08:00:00.000Z', endDate: '2012-12-01T08:00:00.000Z' }
	];
</script>

<!-- @component
Provides a navigation bar at the bottom of the page with the timeline.
 -->
<main
	style="--first-year:{firstYear};
	--last-year:{lastYear};
	--first-decade:{decadesArray[0]};
	--last-decade:{decadesArray[-1]};
	--number-of-decades:{decadesArray.length};"
>
	{#each exampleEvents as { startDate, endDate }}
		<Event {startDate} {endDate} />
	{/each}
	<nav>
		<!-- Listing all the significant dates -->
		{#each decadesArray as year}
			<time
				datetime={new Date('1 January ' + year).toISOString()}
				style="--decade-year:{year};--content:'{year}';"
			>
				&nbsp;
			</time>
		{/each}
	</nav>
</main>

<style>
	main {
		--spacing: 2.5em;
		--inner-height: calc(100vh - var(--spacing) * 2);
		--inner-width: calc(100vw - var(--spacing) * 2);
		--number-of-years: calc(var(--last-decade) - var(--first-decade));
		/* Create one column for each year */
		--timeline-grid: repeat(
			var(--number-of-years),
			calc(var(--inner-width) / var(--number-of-years))
		);
		display: grid;
		align-content: baseline;
		position: relative;
		width: 100vw;
		height: 100vh;
		background-color: var(--bg);
		display: grid;
		padding: var(--spacing);
		grid-template-columns: var(--timeline-grid);
		z-index: 1;
		overflow: hidden;
	}
	nav {
		position: absolute;
		display: grid;
		/* TODO: In the future when `subgrid` is supported, this can be refactored to avoid multiple grids */
		grid-template-columns: var(--timeline-grid);
		grid-template-rows: 1fr;
		width: calc(100vw - var(--spacing) * 2);
		height: var(--spacing);
		left: 0;
		right: 0;
		bottom: 0;
		margin: var(--spacing);
	}
	time {
		position: relative;
		width: max-content;
		height: 1em;
		text-align: left;
		align-self: center;
		justify-self: center;
		color: var(--text-light);
		--year-offset: calc(var(--decade-year) - var(--first-decade) + 1);
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
		top: -100vh;
		left: 0;
		right: 0;
		bottom: 0;
		height: 200vh;
		width: 1px;
		z-index: 1; /* Place it behind other content */
		border-left: 1px solid #959595; /* Thin line */
		opacity: 0.25;
		pointer-events: none; /* Allow clicks to go through it */
	}
</style>
