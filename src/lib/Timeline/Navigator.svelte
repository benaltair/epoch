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
		{
			startDate: '1844-01-01T08:00:00.000Z',
			endDate: '2044-01-01T08:00:00.000Z',
			label: 'Bahai Cycle'
		},
		{
			startDate: '1844-01-01T08:00:00.000Z',
			endDate: '2044-01-01T08:00:00.000Z',
			label: 'Bahai Era'
		},
		{
			startDate: '1853-01-01T08:00:00.000Z',
			endDate: '2044-01-01T08:00:00.000Z',
			label: 'Dispensation of Bahaullah'
		},
		{
			startDate: '1844-01-01T08:00:00.000Z',
			endDate: '1921-01-01T08:00:00.000Z',
			label: 'Heroic Age'
		},
		{
			startDate: '1921-01-01T08:00:00.000Z',
			endDate: '2044-01-01T08:00:00.000Z',
			label: 'Formative Age'
		},
		{
			startDate: '1844-01-01T08:00:00.000Z',
			endDate: '1853-01-01T08:00:00.000Z',
			label: 'Ministry of the Báb'
		},
		{
			startDate: '1853-01-01T08:00:00.000Z',
			endDate: '1892-01-01T08:00:00.000Z',
			label: 'Ministry of Bahaullah'
		},
		{
			startDate: '1892-01-01T08:00:00.000Z',
			endDate: '1921-01-01T08:00:00.000Z',
			label: 'Ministry of Abdul-Baha'
		},
		{
			startDate: '1921-01-01T08:00:00.000Z',
			endDate: '1946-01-01T08:00:00.000Z',
			label: '1st Epoch'
		},
		{
			startDate: '1946-01-01T08:00:00.000Z',
			endDate: '1963-01-01T08:00:00.000Z',
			label: '2nd Epoch'
		},
		{
			startDate: '1963-01-01T08:00:00.000Z',
			endDate: '1986-01-01T08:00:00.000Z',
			label: '3rd Epoch'
		},
		{
			startDate: '1986-01-01T08:00:00.000Z',
			endDate: '2023-01-01T08:00:00.000Z',
			label: '5th Epoch'
		},
		{
			startDate: '1937-01-01T08:00:00.000Z',
			endDate: '2044-01-01T08:00:00.000Z',
			label: 'Tablets of the Divine Plan'
		},
		{
			startDate: '1937-01-01T08:00:00.000Z',
			endDate: '1963-01-01T08:00:00.000Z',
			label: '1st Epoch'
		},
		{
			startDate: '1963-01-01T08:00:00.000Z',
			endDate: '2021-01-01T08:00:00.000Z',
			label: '2nd Epoch'
		},
		{
			startDate: '2021-01-01T08:00:00.000Z',
			endDate: '2044-01-01T08:00:00.000Z',
			label: '3rd Epoch'
		},
		{
			startDate: '1937-01-01T08:00:00.000Z',
			endDate: '1946-01-01T08:00:00.000Z',
			label: '7YP'
		},
		{
			startDate: '1946-01-01T08:00:00.000Z',
			endDate: '1953-01-01T08:00:00.000Z',
			label: '7YP'
		},
		{
			startDate: '1953-01-01T08:00:00.000Z',
			endDate: '1963-01-01T08:00:00.000Z',
			label: '10YC'
		},
		{
			startDate: '1964-01-01T08:00:00.000Z',
			endDate: '1973-01-01T08:00:00.000Z',
			label: '9YP'
		},
		{
			startDate: '1974-01-01T08:00:00.000Z',
			endDate: '1979-01-01T08:00:00.000Z',
			label: '5YP'
		},
		{
			startDate: '1979-01-01T08:00:00.000Z',
			endDate: '1986-01-01T08:00:00.000Z',
			label: '7YP'
		},
		{
			startDate: '1986-01-01T08:00:00.000Z',
			endDate: '1992-01-01T08:00:00.000Z',
			label: '6YP'
		},
		{
			startDate: '1993-01-01T08:00:00.000Z',
			endDate: '1996-01-01T08:00:00.000Z',
			label: '3YP'
		},
		{
			startDate: '1996-01-01T08:00:00.000Z',
			endDate: '2000-01-01T08:00:00.000Z',
			label: '4YP'
		},
		{
			startDate: '2000-01-01T08:00:00.000Z',
			endDate: '2001-01-01T08:00:00.000Z',
			label: '12MP'
		},
		{
			startDate: '2001-01-01T08:00:00.000Z',
			endDate: '2006-01-01T08:00:00.000Z',
			label: '5YP'
		},
		{
			startDate: '2006-01-01T08:00:00.000Z',
			endDate: '2011-01-01T08:00:00.000Z',
			label: '5YP'
		},
		{
			startDate: '2011-01-01T08:00:00.000Z',
			endDate: '2016-01-01T08:00:00.000Z',
			label: '5YP'
		},
		{
			startDate: '2016-01-01T08:00:00.000Z',
			endDate: '2021-01-01T08:00:00.000Z',
			label: '5YP'
		},
		{
			startDate: '2021-01-01T08:00:00.000Z',
			endDate: '2022-01-01T08:00:00.000Z',
			label: '1YP'
		},
		{
			startDate: '2022-01-01T08:00:00.000Z',
			endDate: '2031-01-01T08:00:00.000Z',
			label: '9YP'
		}
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
	<!-- TODO: These events will of course need to be derived from the headless CMS, and will need to be restructured at that point -->
	{#each exampleEvents as { startDate, endDate, label }}
		<Event {startDate} {endDate} {label} />
	{/each}
	<nav>
		<!-- Listing all the decades -->
		<!-- TODO: When zoomed in to only a couple decades, label all individual years -->
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
		grid-template-columns: var(--timeline-grid);
		grid-template-rows: auto;
		row-gap: calc(var(--spacing) / 4);
		display: grid;
		align-content: baseline;
		position: relative;
		width: 100vw;
		height: 100vh;
		background-color: var(--bg);
		padding: var(--spacing);
		z-index: 1;
		overflow: hidden;
	}
	nav {
		position: absolute;
		display: grid;
		/* TODO: In the future when `subgrid` is supported, this can be refactored to avoid multiple grids */
		grid-template-columns: var(--timeline-grid);
		grid-template-rows: 1fr;
		/* width: calc(100vw - var(--spacing) * 2); */
		width: 100vw;
		height: var(--spacing);
		left: 0;
		right: 0;
		bottom: 0;
		margin: var(--spacing) 0;
		/* padding: 0 calc(var(--spacing) / 2); */
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
		/* top: -100vh; */
		left: 0;
		right: 0;
		bottom: calc(-1 * var(--spacing) * 1.5);
		height: 100vh;
		width: 1px;
		z-index: 1; /* Place it behind other content */
		border-left: 1px solid var(--accent); /* Thin line */
		opacity: 0.15;
		pointer-events: none; /* Allow clicks to go through it */
	}
</style>
