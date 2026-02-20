<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { TimelineEvent } from '$lib/data/events';
	const dispatch = createEventDispatcher();

	export let event: TimelineEvent;
	export let row: number = 1;
	export let startYear: number;
	export let pixelsPerYear: number;

	const { startDate, endDate, label, level, color } = event;

	function extractYear(isoDate: string): number {
		const date = new Date(isoDate);
		return date.getUTCFullYear() + date.getUTCMonth() / 12 + date.getUTCDate() / 365;
	}

	const start = extractYear(startDate);
	const end = extractYear(endDate);

	const left = (start - startYear) * pixelsPerYear;
	let width = (end - start) * pixelsPerYear;
	if (width < 2 && level === 'event') width = 10; // Minimum width for single day events
	if (width < 2) width = 2;

	function handleClick() {
		dispatch('select', event);
	}

	const levelStyles = {
		cycle: 'h-10 font-bold text-lg',
		era: 'h-8 font-semibold text-md',
		age: 'h-7 text-sm',
		epoch: 'h-6 text-xs',
		plan: 'h-5 text-[10px]',
		event: 'h-4 text-[10px]'
	};
</script>

<div
	role="button"
	tabindex="0"
	class="event-bar level-{level}"
	style="
		--left: {left}px;
		--width: {width}px;
		--top: {(row - 1) * 45}px;
		--bg-color: {color || 'var(--primary-light)'};
	"
	title="{label} ({new Date(startDate).getUTCFullYear()} - {new Date(endDate).getUTCFullYear()})"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
	<span class="label">{label}</span>
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
		padding: 0 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: transform 0.1s, filter 0.1s;
		white-space: nowrap;
		overflow: hidden;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
		border: 1px solid rgba(255, 255, 255, 0.2);
		z-index: 10;
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
