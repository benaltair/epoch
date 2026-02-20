<script lang="ts">
	import Event from '$lib/Timeline/Event.svelte';
	import { events, type TimelineEvent } from '$lib/data/events';

	export let firstYear: number = 1844;
	export let lastYear: number = 2044;

	let pixelsPerYear = 40;
	let selectedEvent: TimelineEvent | null = null;

	const levelOrder = ['cycle', 'era', 'age', 'epoch', 'plan', 'event'];

	function extractYear(isoDate: string): number {
		const date = new Date(isoDate);
		return date.getUTCFullYear() + date.getUTCMonth() / 12 + date.getUTCDate() / 365;
	}

	function packEvents(levelEvents: TimelineEvent[]) {
		const rows: TimelineEvent[][] = [];
		const sorted = [...levelEvents].sort((a, b) => extractYear(a.startDate) - extractYear(b.startDate));

		sorted.forEach(event => {
			let placed = false;
			for (let i = 0; i < rows.length; i++) {
				const lastEvent = rows[i][rows[i].length - 1];
				if (extractYear(event.startDate) >= extractYear(lastEvent.endDate)) {
					rows[i].push(event);
					placed = true;
					break;
				}
			}
			if (!placed) {
				rows.push([event]);
			}
		});
		return rows;
	}

	$: groupedEvents = levelOrder.map(level => {
		const levelEvents = events.filter(e => e.level === level);
		return packEvents(levelEvents);
	});

	$: levelGroupOffsets = (() => {
		let currentTop = 0;
		return groupedEvents.map(rows => {
			const top = currentTop;
			if (rows.length > 0) {
				currentTop += rows.length * 40 + 20;
			}
			return top;
		});
	})();

	function handleSelect(event: CustomEvent<TimelineEvent>) {
		selectedEvent = event.detail;
	}

	function zoom(delta: number) {
		pixelsPerYear = Math.max(10, Math.min(500, pixelsPerYear + delta));
	}

	function jumpTo(year: number) {
		const container = document.querySelector('.timeline-scroll');
		if (container) {
			container.scrollLeft = (year - firstYear) * pixelsPerYear;
		}
	}

	function getBeYear(gregorianYear: number): number {
		return gregorianYear - 1844 + 1;
	}

	$: years = (() => {
		const result = [];
		let interval = 10;
		if (pixelsPerYear < 20) interval = 20;
		if (pixelsPerYear < 10) interval = 50;
		if (pixelsPerYear < 5) interval = 100;

		const start = Math.floor(firstYear / interval) * interval;
		for (let y = start; y <= lastYear; y += interval) {
			if (y >= firstYear) result.push(y);
		}
		return result;
	})();
</script>

<div class="navigator">
	<div class="toolbar">
		<div class="zoom-controls">
			<button on:click={() => zoom(-10)}>Zoom Out</button>
			<span class="zoom-label">{pixelsPerYear} px/yr</span>
			<button on:click={() => zoom(10)}>Zoom In</button>
		</div>
		<div class="jump-controls">
			<button class="secondary" on:click={() => jumpTo(1844)}>1844</button>
			<button class="secondary" on:click={() => jumpTo(1921)}>1921</button>
			<button class="secondary" on:click={() => jumpTo(1963)}>1963</button>
			<button class="secondary" on:click={() => jumpTo(2021)}>2021</button>
		</div>
		{#if selectedEvent}
			<div class="selection-info">
				<strong>{selectedEvent.label}</strong>: {new Date(selectedEvent.startDate).getUTCFullYear()} - {new Date(selectedEvent.endDate).getUTCFullYear()}
				<button class="close-btn" on:click={() => selectedEvent = null}>&times;</button>
			</div>
		{/if}
	</div>

	<div class="timeline-container">
		<div class="timeline-scroll" style="--total-width: {(lastYear - firstYear + 1) * pixelsPerYear}px">
			<div class="grid-overlay">
				{#each years as year}
					<div class="grid-line" style="left: {(year - firstYear) * pixelsPerYear}px">
						<span class="year-label">{year} <br/> <small>{getBeYear(year)} BE</small></span>
					</div>
				{/each}
			</div>

			<div class="events-layer">
				{#each groupedEvents as rows, i}
					{#if rows.length > 0}
						<div class="level-group" style="top: {levelGroupOffsets[i]}px">
							<div class="tier-label">{levelOrder[i].toUpperCase()}S</div>
							{#each rows as rowEvents, rowIndex}
								<div class="tier" style="top: {rowIndex * 40}px">
									{#each rowEvents as event}
										<Event {event} row={1} startYear={firstYear} {pixelsPerYear} on:select={handleSelect} />
									{/each}
								</div>
							{/each}
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>

	{#if selectedEvent}
		<div class="details-pane">
			<h3>{selectedEvent.label}</h3>
			<p class="dates">
				{new Date(selectedEvent.startDate).toLocaleDateString()} –
				{new Date(selectedEvent.endDate).toLocaleDateString()}
			</p>
			<p class="be-dates">
				{getBeYear(new Date(selectedEvent.startDate).getUTCFullYear())} BE –
				{getBeYear(new Date(selectedEvent.endDate).getUTCFullYear())} BE
			</p>
			{#if selectedEvent.description}
				<p class="description">{selectedEvent.description}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.navigator {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 150px);
		gap: 1rem;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid var(--border);
	}

	.zoom-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.zoom-label {
		font-size: 0.875rem;
		color: var(--text-muted);
		min-width: 80px;
		text-align: center;
	}

	button {
		padding: 0.4rem 0.8rem;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}

	button:hover {
		background: var(--primary-light);
	}

	button.secondary {
		background: var(--bg-main);
		color: var(--primary);
		border: 1px solid var(--primary);
	}

	button.secondary:hover {
		background: var(--primary-light);
		color: white;
	}

	.jump-controls {
		display: flex;
		gap: 0.25rem;
	}

	.selection-info {
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.close-btn {
		background: none;
		color: var(--text-muted);
		font-size: 1.2rem;
		padding: 0;
	}

	.timeline-container {
		flex: 1;
		overflow: hidden;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid var(--border);
		position: relative;
	}

	.timeline-scroll {
		height: 100%;
		overflow-x: auto;
		overflow-y: auto;
		width: 100%;
		position: relative;
	}

	.grid-overlay {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: var(--total-width);
		pointer-events: none;
	}

	.grid-line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		background: var(--border);
		opacity: 0.8;
	}

	.year-label {
		position: absolute;
		top: 5px;
		left: 5px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
		white-space: nowrap;
		background: rgba(255, 255, 255, 0.8);
		padding: 2px 4px;
		border-radius: 4px;
	}

	.events-layer {
		position: relative;
		padding-top: 60px;
		width: var(--total-width);
		height: 600px;
	}

	.level-group {
		position: absolute;
		left: 0;
		width: 100%;
		border-bottom: 1px dashed var(--border);
	}

	.tier-label {
		position: sticky;
		left: 0;
		font-size: 0.65rem;
		font-weight: 800;
		color: var(--text-muted);
		padding: 2px 8px;
		background: var(--bg-main);
		z-index: 30;
		width: fit-content;
		border-radius: 0 4px 4px 0;
	}

	.tier {
		position: relative;
		height: 100%;
	}

	.details-pane {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid var(--border);
		box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.05);
	}

	.details-pane h3 {
		color: var(--primary);
		margin-bottom: 0.5rem;
	}

	.dates, .be-dates {
		font-weight: 600;
		font-size: 0.9rem;
		margin: 0;
	}

	.be-dates {
		color: var(--secondary);
		margin-bottom: 1rem;
	}

	.description {
		font-size: 1rem;
		color: var(--text-main);
	}
</style>
