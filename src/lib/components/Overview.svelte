<script lang="ts">
	import { position, at, constrain, span, type Viewport } from '$lib/core/viewport';
	import { rangeLabel } from '$lib/core/date';
	let {
		view,
		domain,
		onchange
	}: { view: Viewport; domain: Viewport; onchange: (v: Viewport, commit: boolean) => void } =
		$props();
	let element: HTMLDivElement;
	let width = $state(800);
	let drag: null | { kind: string; startX: number; view: Viewport; domain: Viewport } = null;
	let selection = $derived({
		left: Math.max(0, position(view.start, domain, width)),
		width: Math.min(width, (span(view) / span(domain)) * width)
	});
	function down(e: PointerEvent) {
		if (e.button !== 0) return;
		const x = e.clientX - element.getBoundingClientRect().left;
		drag = {
			kind:
				(e.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action ?? 'create',
			startX: x,
			view: { ...view },
			domain: { ...domain }
		};
		element.setPointerCapture(e.pointerId);
	}
	function move(e: PointerEvent) {
		if (!drag) return;
		const x = Math.max(0, Math.min(width, e.clientX - element.getBoundingClientRect().left)),
			delta = ((x - drag.startX) / width) * span(drag.domain);
		let next = { ...drag.view };
		if (drag.kind === 'pan') {
			next = { start: next.start + delta, end: next.end + delta };
			const size = span(next);
			if (next.start < drag.domain.start)
				next = { start: drag.domain.start, end: drag.domain.start + size };
			if (next.end > drag.domain.end)
				next = { start: drag.domain.end - size, end: drag.domain.end };
		} else if (drag.kind === 'start')
			next.start = Math.min(next.end - 1, Math.max(drag.domain.start, next.start + delta));
		else if (drag.kind === 'end')
			next.end = Math.max(next.start + 1, Math.min(drag.domain.end, next.end + delta));
		else {
			const a = at(drag.startX, drag.domain, width),
				b = at(x, drag.domain, width);
			next = { start: Math.min(a, b), end: Math.max(a, b) };
		}
		onchange(constrain(next), false);
	}
	function up(e: PointerEvent) {
		if (!drag) return;
		if (
			Math.abs(e.clientX - element.getBoundingClientRect().left - drag.startX) < 4 &&
			drag.kind === 'create'
		) {
			const center = at(drag.startX, drag.domain, width),
				size = span(drag.view);
			onchange(constrain({ start: center - size / 2, end: center + size / 2 }), true);
		} else onchange(view, true);
		drag = null;
	}
	function cancel() {
		if (drag) onchange(drag.view, false);
		drag = null;
	}
</script>

<div class="overview-heading">
	<span class="eyebrow">Overview</span><span class="small muted"
		>{rangeLabel(domain.start, domain.end)}</span
	>
</div>
<div
	class="overview"
	bind:this={element}
	bind:clientWidth={width}
	role="group"
	aria-label="Timeline overview"
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={cancel}
>
	<div class="overview-track" aria-hidden="true"></div>
	{#if selection.width > 96}
		<div
			class="overview-window"
			data-action="pan"
			style="left:{selection.left}px;width:{selection.width}px"
		>
			<span class="overview-handle" data-action="start" aria-hidden="true">Ⅱ</span><span
				class="overview-drag"
				aria-hidden="true">···</span
			><span class="overview-handle" data-action="end" aria-hidden="true">Ⅱ</span>
		</div>
	{:else}<span
			class="overview-locator"
			style="left:{Math.min(width - 6, selection.left)}px"
			aria-hidden="true"
		></span>{/if}
</div>
<details class="range-options">
	<summary>Date range</summary>
	<div class="range-inputs">
		<label
			>Start<input
				aria-label="Start of visible window"
				type="range"
				min={domain.start}
				max={view.end - 1}
				step="1"
				value={view.start}
				aria-valuetext={rangeLabel(view.start, view.start + 1)}
				oninput={(e) =>
					onchange(constrain({ start: +e.currentTarget.value, end: view.end }), false)}
				onchange={() => onchange(view, true)}
			/></label
		>
		<label
			>End<input
				aria-label="End of visible window"
				type="range"
				min={view.start + 1}
				max={domain.end}
				step="1"
				value={view.end}
				aria-valuetext={rangeLabel(view.end - 1, view.end)}
				oninput={(e) =>
					onchange(constrain({ start: view.start, end: +e.currentTarget.value }), false)}
				onchange={() => onchange(view, true)}
			/></label
		>
	</div>
</details>
