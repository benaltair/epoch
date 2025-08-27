<script lang="ts">
	import EventComponent from '$lib/Timeline/Event.svelte';
	import type { Event as EventData } from '$lib/types';

	export let firstYear: number;
	export let lastYear: number;
	export let events: EventData[] = [];

	// Determine the decade labels to render along the timeline
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

	// Helper to extract the UTC year from an ISO date string
	function yearFrom(date: string): number {
		return new Date(date).getUTCFullYear();
	}

	// Place events onto lanes so overlapping events are stacked
	interface PositionedEvent {
		label: string;
		startYear: number;
		endYear: number;
		lane: number;
	}

	function position(events: EventData[]): PositionedEvent[] {
		const sorted = events
			.map((e) => ({
				label: e.label,
				startYear: Math.max(yearFrom(e.startDate), firstYear),
				endYear: Math.min(yearFrom(e.endDate), lastYear)
			}))
			.filter((e) => e.endYear >= e.startYear)
			.sort((a, b) => a.startYear - b.startYear);

		const lanes: number[] = [];
		return sorted.map((e) => {
			let lane = 0;
			while (lane < lanes.length && e.startYear <= lanes[lane]) {
				lane += 1;
			}
			lanes[lane] = e.endYear;
			return { ...e, lane };
		});
	}

	let decadesArray: number[] = [];
	let positionedEvents: PositionedEvent[] = [];
	let laneCount = 0;

	$: decadesArray = getDecades(firstYear, lastYear);
	$: positionedEvents = position(events);
	$: laneCount = positionedEvents.reduce((max, e) => Math.max(max, e.lane), -1) + 1;
</script>

<main style="--first-year:{firstYear}; --last-year:{lastYear}; --lane-count:{laneCount};">
	{#each positionedEvents as { startYear, endYear, lane, label }}
		<EventComponent {startYear} {endYear} {lane} {label} {firstYear} />
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
		--row-height: 2.5em;
		--row-gap: 1em;
		--number-of-years: calc(var(--last-year) - var(--first-year) + 1);
		display: grid;
		grid-template-columns: repeat(var(--number-of-years), var(--year-width));
		grid-auto-rows: var(--row-height);
		row-gap: var(--row-gap);
		align-content: start;
		position: relative;
		width: max(100vw, calc(var(--number-of-years) * var(--year-width)));
		height: max(
			100vh,
			calc(
				var(--lane-count) * var(--row-height) + (var(--lane-count) - 1) * var(--row-gap) +
					var(--spacing) * 2
			)
		);
		background-color: var(--bg);
		padding: var(--spacing);
		overflow-x: auto;
		overflow-y: auto;
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
