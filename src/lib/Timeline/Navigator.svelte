<script lang="ts">
	import EventComponent from '$lib/Timeline/Event.svelte';
	import type { Event as EventData } from '$lib/types';

	export let firstYear: number;
	export let lastYear: number;
	export let events: EventData[] = [];

	function getDecadeMarks(first: number, last: number): number[] {
		const marks: number[] = [];
		for (let year = Math.floor(first / 10) * 10; year <= last; year += 10) {
			marks.push(year);
		}
		return marks;
	}

	let decadeMarks: number[] = [];
	$: decadeMarks = getDecadeMarks(firstYear, lastYear);
</script>

<div class="timeline" style="--first-year:{firstYear}; --last-year:{lastYear};">
	<section class="events">
		{#each events as { startDate, endDate, label }}
			<EventComponent {startDate} {endDate} {label} />
		{/each}
	</section>

	<nav class="years">
		{#each decadeMarks as year}
			<time datetime={year} style="--col:{year - firstYear + 1}">{year}</time>
		{/each}
	</nav>
</div>

<style>
	.timeline {
		--spacing: 2.5em;
		--year-width: 6rem;
		--year-count: calc(var(--last-year) - var(--first-year) + 1);

		display: grid;
		grid-template-rows: 1fr auto;
		width: max(100vw, calc(var(--year-count) * var(--year-width)));
		overflow-x: auto;
		background: var(--bg);
	}

	.events {
		display: grid;
		grid-template-columns: repeat(var(--year-count), var(--year-width));
		grid-auto-rows: minmax(2.5rem, auto);
		grid-auto-flow: row dense;
		row-gap: calc(var(--spacing) / 4);
		padding: var(--spacing);
		padding-bottom: 0;
		background-image: repeating-linear-gradient(
			to right,
			var(--accent-bg) 0,
			var(--accent-bg) 1px,
			transparent 1px,
			transparent calc(var(--year-width))
		);
		position: relative;
	}

	.years {
		display: grid;
		grid-template-columns: repeat(var(--year-count), var(--year-width));
		padding: 0 var(--spacing) var(--spacing);
	}

	time {
		grid-column: var(--col);
		text-align: center;
		font-size: 0.8rem;
		color: var(--text-light);
	}

	@media (max-width: 600px) {
		.timeline {
			--year-width: 4rem;
		}
	}
</style>
