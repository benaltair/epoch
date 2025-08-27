<script lang="ts">
	import EventComponent from '$lib/Timeline/Event.svelte';
	import type { Event as EventData } from '$lib/types';
	import { tick } from 'svelte';

	export let events: EventData[] = [];

	function getYear(iso: string): number {
		return new Date(iso).getUTCFullYear();
	}

	interface FlatEvent extends EventData {
		depth: number;
	}
	type PlacedEvent = FlatEvent & { row: number };

	function flatten(list: EventData[], depth = 0, acc: FlatEvent[] = []): FlatEvent[] {
		for (const event of list) {
			acc.push({ ...event, depth });
			if (event.children) flatten(event.children, depth + 1, acc);
		}
		return acc;
	}

	function computeBounds(list: FlatEvent[]): { first: number; last: number } {
		const years = list.flatMap((e) => [getYear(e.startDate), getYear(e.endDate)]);
		return { first: Math.min(...years), last: Math.max(...years) };
	}

	const flat: FlatEvent[] = flatten(events);
	let { first: firstYear, last: lastYear } = computeBounds(flat);
	$: totalYears = lastYear - firstYear + 1;

	function placeEvents(list: FlatEvent[]): PlacedEvent[] {
		const rowsByDepth: Map<number, number[]> = new Map();
		const placed: PlacedEvent[] = [];
		const sorted = [...list].sort((a, b) => getYear(a.startDate) - getYear(b.startDate));
		for (const ev of sorted) {
			const start = getYear(ev.startDate);
			const end = getYear(ev.endDate);
			const rows = rowsByDepth.get(ev.depth) ?? [];
			let rowIndex = rows.findIndex((rEnd) => start > rEnd);
			if (rowIndex === -1) {
				rowIndex = rows.length;
				rows.push(end);
			} else {
				rows[rowIndex] = end;
			}
			rowsByDepth.set(ev.depth, rows);
			const base = ev.depth * 3;
			placed.push({ ...ev, row: base + rowIndex + 1 });
		}
		return placed;
	}

	let placed: PlacedEvent[] = placeEvents(flat);
	$: maxRow = placed.reduce((m, e) => Math.max(m, e.row), 1);

	function getDecades(first: number, last: number): number[] {
		const decades: number[] = [];
		let current = Math.floor(first / 10) * 10;
		while (current <= Math.floor(last / 10) * 10 + 10) {
			decades.push(current);
			current += 10;
		}
		return decades;
	}
	$: decadesArray = getDecades(firstYear, lastYear);

	let container: HTMLElement;
	let zoom = 1;
	const minZoom = 0.2;
	const maxZoom = 10;

	function handleWheel(e: WheelEvent) {
		if (!e.ctrlKey) return;
		e.preventDefault();
		const rect = container.getBoundingClientRect();
		const offsetX = e.clientX - rect.left + container.scrollLeft;
		const factor = Math.exp(-e.deltaY * 0.001);
		const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom * factor));
		const scale = newZoom / zoom;
		zoom = newZoom;
		tick().then(() => {
			container.scrollTo({ left: offsetX * scale - (e.clientX - rect.left), behavior: 'auto' });
		});
	}

	function focusEvent({ detail }: CustomEvent<{ startDate: string; endDate: string }>) {
		const start = getYear(detail.startDate);
		const end = getYear(detail.endDate);
		const eventYears = end - start + 1;
		zoom = Math.min(maxZoom, totalYears / eventYears);
		tick().then(() => {
			const center = (start + end) / 2;
			const target =
				((center - firstYear + 0.5) / totalYears) * container.scrollWidth -
				container.clientWidth / 2;
			container.scrollTo({ left: target, behavior: 'smooth' });
		});
	}
</script>

<main
	bind:this={container}
	on:wheel={handleWheel}
	style="--first-year:{firstYear}; --last-year:{lastYear}; --zoom:{zoom}"
>
	{#each placed as { startDate, endDate, label, row, type }}
		<EventComponent {startDate} {endDate} {label} {row} {type} on:focus={focusEvent} />
	{/each}
	<nav style="grid-row:{maxRow + 1}">
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
		--row-height: 2rem;
		--number-of-years: calc(var(--last-year) - var(--first-year) + 1);
		--initial-year-width: calc(100vw / var(--number-of-years));
		--year-width: calc(var(--initial-year-width) * var(--zoom));
		display: grid;
		grid-template-columns: repeat(var(--number-of-years), var(--year-width));
		grid-auto-rows: var(--row-height);
		row-gap: var(--spacing);
		align-content: start;
		position: relative;
		width: calc(var(--number-of-years) * var(--year-width));
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
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: repeat(var(--number-of-years), var(--year-width));
		height: var(--row-height);
		margin-top: var(--spacing);
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
