<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { TimelineEvent } from '$lib/data/events';
	import { extractYear } from '$lib/utils/date';
	const dispatch = createEventDispatcher();

	export let event: TimelineEvent;
	export let row: number = 1;
	export let startYear: number;
	export let pixelsPerYear: number;

	$: start = extractYear(event.startDate);
	$: end = extractYear(event.endDate);

	$: left = (start - startYear) * pixelsPerYear;
	$: rawWidth = (end - start) * pixelsPerYear;
	$: width = (rawWidth < 2 && event.level === 'event') ? 10 : Math.max(2, rawWidth);

	function handleClick() {
		dispatch('select', event);
	}
</script>

<div
	role="button"
	tabindex="0"
	class="event-bar level-{event.level}"
	style="
		--left: {left}px;
		--width: {width}px;
		--top: {(row - 1) * 45}px;
		--bg-color: {event.color || 'var(--primary-light)'};
	"
	title="{event.label} ({new Date(event.startDate).getUTCFullYear()} - {new Date(event.endDate).getUTCFullYear()})"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
	<span class="label-wrapper">
		<span class="label">{event.label}</span>
	</span>
</div>

<style>
	.event-bar {
		position: absolute;
		left: var(--left);
		width: var(--width);
		min-width: 4px;
		top: var(--top);
		background-color: var(--bg-color);
		color: white;
		border-radius: 6px;
		cursor: pointer;
		transition: transform 0.1s, filter 0.1s;
		white-space: nowrap;
		overflow: hidden;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
		border: 1px solid rgba(255, 255, 255, 0.2);
		z-index: 10;
		display: flex;
		align-items: center;
	}

	.label-wrapper {
		position: sticky;
		left: 0;
		padding: 0 12px;
		max-width: 100%;
		overflow: hidden;
		display: flex;
		align-items: center;
	}

	.event-bar:hover {
		filter: brightness(1.1);
		transform: translateY(-1px);
		z-index: 20;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	}

	.level-cycle { height: 40px; font-weight: 700; font-size: 1.1rem; opacity: 0.9; }
	.level-era { height: 36px; font-weight: 600; font-size: 1rem; opacity: 0.85; }
	.level-age { height: 32px; font-weight: 500; font-size: 0.9rem; opacity: 0.8; }
	.level-epoch { height: 28px; font-size: 0.8rem; opacity: 0.75; }
	.level-plan { height: 24px; font-size: 0.75rem; opacity: 0.7; }

	.label {
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>
