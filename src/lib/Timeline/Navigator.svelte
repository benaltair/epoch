<script lang="ts">
	import Event from '$lib/Timeline/Event.svelte';

	import { events, type TimelineEvent } from '$lib/data/events';

	export let firstYear: number;
	export let lastYear: number;

	let currentFirstYear = firstYear;
	let currentLastYear = lastYear;
	let pixelsPerYear = 20;

	// Update current range if props change
	$: {
		currentFirstYear = firstYear;
		currentLastYear = lastYear;
	}

	function getDecades(start: number, end: number): number[] {
		if (start > end) {
			return [];
		}

		const decades: number[] = [];
		let currentDecade: number = Math.floor(start / 10) * 10;

		while (currentDecade <= Math.floor(end / 10) * 10 + 10) {
			decades.push(currentDecade);
			currentDecade += 10;
		}

		return decades;
	}

	let decadesArray: number[] = [];
	$: {
		decadesArray = getDecades(currentFirstYear, currentLastYear);
	}

	const levels = [0, 1, 2, 3, 4, 5];
	$: groupedEvents = levels.map((level) => events.filter((e) => e.level === level));

	function zoomIn() {
		pixelsPerYear = Math.min(pixelsPerYear * 1.5, 500);
	}

	function zoomOut() {
		pixelsPerYear = Math.max(pixelsPerYear / 1.5, 1);
	}

	let selectedEvent: TimelineEvent | null = null;

	function handleSelect(event: CustomEvent<TimelineEvent>) {
		selectedEvent = event.detail;
	}
</script>

<!-- @component
Provides a navigation bar at the bottom of the page with the timeline.
 -->
<main
	style="--first-year:{currentFirstYear};
	--last-year:{currentLastYear};
	--first-decade:{decadesArray[0]};
	--last-decade:{decadesArray[decadesArray.length - 1]};
	--number-of-decades:{decadesArray.length};
	--pixels-per-year:{pixelsPerYear};"
>
	<div class="controls">
		<button on:click={zoomOut} title="Zoom Out">Zoom Out</button>
		<span>{pixelsPerYear.toFixed(1)} px/year</span>
		<button on:click={zoomIn} title="Zoom In">Zoom In</button>
	</div>

	<div class="timeline-scroll">
		<div class="timeline-grid">
			{#each groupedEvents as levelEvents, i}
				<div class="tier tier-{i}">
					{#each levelEvents as event}
						<Event {event} row={i + 1} on:select={handleSelect} />
					{/each}
				</div>
			{/each}
		</div>
	</div>
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

	{#if selectedEvent}
		<aside class="detail-panel">
			<header>
				<h3>{selectedEvent.label}</h3>
				<button on:click={() => (selectedEvent = null)}>×</button>
			</header>
			<div class="detail-content">
				<p>
					<strong>From:</strong>
					{new Date(selectedEvent.startDate).toLocaleDateString()}
				</p>
				<p>
					<strong>To:</strong>
					{new Date(selectedEvent.endDate).toLocaleDateString()}
				</p>
				<p>
					Hierarchical event from the history of the Baha'i Faith.
				</p>
			</div>
		</aside>
	{/if}
</main>

<style>
	.detail-panel {
		position: fixed;
		top: 5rem;
		right: 2rem;
		width: 300px;
		background: var(--bg);
		border: 1px solid var(--accent);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 100;
		display: flex;
		flex-direction: column;
		padding: 0;
		margin: 0;
	}

	.detail-panel header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: var(--accent-bg);
		border-bottom: 1px solid var(--accent);
		border-radius: 8px 8px 0 0;
	}

	.detail-panel header h3 {
		margin: 0;
		font-size: 1.1rem;
	}

	.detail-panel header button {
		background: none;
		border: none;
		color: var(--text);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		margin: 0;
		line-height: 1;
	}

	.detail-content {
		padding: 1rem;
	}

	.detail-content p {
		margin: 0.5rem 0;
		font-size: 0.9rem;
	}

	.controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		padding-bottom: 1rem;
		position: sticky;
		left: 0;
		z-index: 20;
		background: var(--bg);
	}

	.controls button {
		padding: 0.3rem 0.6rem;
		margin: 0;
	}

	main {
		--spacing: 2.5em;
		--number-of-years: calc(var(--last-decade) - var(--first-decade));
		--timeline-grid: repeat(var(--number-of-years), calc(var(--pixels-per-year) * 1px));

		display: flex;
		flex-direction: column;
		position: relative;
		width: 100vw;
		height: 100vh;
		background-color: var(--bg);
		padding: var(--spacing);
		z-index: 1;
		overflow: hidden;
	}

	.timeline-scroll {
		overflow-x: auto;
		overflow-y: auto;
		flex: 1;
		padding-bottom: var(--spacing);
	}

	.timeline-grid {
		display: grid;
		grid-template-columns: var(--timeline-grid);
		grid-template-rows: auto;
		row-gap: calc(var(--spacing) / 4);
		align-content: baseline;
		width: max-content;
		min-width: 100%;
		position: relative;
	}

	.tier {
		display: contents;
	}

	nav {
		position: sticky;
		bottom: 0;
		display: grid;
		grid-template-columns: var(--timeline-grid);
		grid-template-rows: 1fr;
		width: max-content;
		min-width: 100%;
		height: var(--spacing);
		margin-top: auto;
		background: var(--bg);
		z-index: 10;
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
