<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { entries, byId, site, sources } from '$lib/data/catalog';
	import {
		ancestors,
		dateLabel,
		entryRange,
		extent,
		type Entry,
		type Story
	} from '$lib/core/model';
	import { ticks, rangeLabel, toDay } from '$lib/core/date';
	import { TimelineIndex, layout, type Mark } from '$lib/core/layout';
	import {
		HISTORY,
		CYCLE,
		WORLD,
		span,
		zoomAt,
		pan,
		pinch,
		fit,
		constrain,
		decodeNavigation,
		encodeNavigation,
		type Viewport
	} from '$lib/core/viewport';
	import { focusView, interpolateView } from '$lib/core/focus';
	import { readStory } from '$lib/data/story-response';
	import Hierarchy from './Hierarchy.svelte';
	import Overview from './Overview.svelte';
	import EntryContent from './EntryContent.svelte';
	const index = new TimelineIndex(entries);
	let view = $state<Viewport>({ ...HISTORY }),
		focus = $state<string | null>(null),
		selected = $state<string | null>(null);
	let mode = $state<'timeline' | 'list'>('timeline'),
		navOpen = $state(false),
		theme = $state('light'),
		uiScale = $state(1);
	let plot: HTMLDivElement, dialog: HTMLDialogElement, closeButton: HTMLButtonElement;
	let width = $state(900),
		ready = $state(false),
		coarse = $state(false),
		help = $state(false),
		overviewOpen = $state(false);
	let navigationDialog: HTMLDialogElement, settingsDialog: HTMLDialogElement;
	let cluster = $state<Entry[]>([]),
		clusterLimit = $state(30),
		listLimit = $state(40);
	let story = $state<Story | null>(null),
		loading = $state(false),
		storyError = $state(false),
		retry = $state(0);
	let announcement = $state(''),
		copied = $state(false);
	const cache = new Map<string, Story>();
	let priorFocus: HTMLElement | null = null;
	let animationFrame = 0;
	let animationTarget = $state<Viewport | null>(null);
	function stopMotion() {
		cancelAnimationFrame(animationFrame);
		animationFrame = 0;
		animationTarget = null;
	}
	function moveTo(target: Viewport) {
		stopMotion();
		const from = { ...view };
		const duration =
			Number.parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue('--view-transition-ms')
			) || 180;
		if (
			matchMedia('(prefers-reduced-motion: reduce)').matches ||
			(from.start === target.start && from.end === target.end)
		) {
			view = target;
			return;
		}
		animationTarget = target;
		const started = performance.now();
		const step = (now: number) => {
			const progress = Math.min(1, (now - started) / duration);
			view = interpolateView(from, target, progress);
			if (progress < 1) animationFrame = requestAnimationFrame(step);
			else {
				animationFrame = 0;
				animationTarget = null;
			}
		};
		animationFrame = requestAnimationFrame(step);
	}
	let pending: Viewport | null = null,
		frame = 0,
		wheelTimer: ReturnType<typeof setTimeout> | undefined;
	let dragState: null | { view: Viewport; points: { x: number; y: number }[]; scroll: number } =
		null;
	const pointers = new Map<number, { x: number; y: number }>();
	let dragged = false,
		startPosition = { x: 0, y: 0 };
	const current = $derived(focus ? byId.get(focus) : undefined);
	const chosen = $derived(selected ? byId.get(selected) : undefined);
	const path = $derived(current ? [...ancestors(current, byId), current] : []);
	const tracks = $derived(layout(index, view, width, coarse ? 48 : 36, selected));
	const axis = $derived(ticks(view.start, view.end, width));
	const fullScale = $derived(span(view) > 365.2425 * 5000);
	const visibleEntries = $derived(
		index
			.query(view.start, view.end)
			.sort((a, b) => extent(a)[0] - extent(b)[0] || b.importance - a.importance)
	);
	const overviewDomain = $derived.by(() => {
		const base = current ? entryRange(current) : span(view) > span(HISTORY) * 3 ? CYCLE : HISTORY;
		return { start: Math.min(base.start, view.start), end: Math.max(base.end, view.end) };
	});
	const dateRange = $derived(rangeLabel(view.start, view.end));
	const focusedOutside = $derived(
		current ? extent(current)[0] > view.end || extent(current)[1] < view.start : false
	);
	const zoomValue = $derived(Math.log2(span(WORLD) / span(view)));
	const maxZoom = Math.log2(span(WORLD));
	function persist(push = true) {
		if (!ready) return;
		const url = encodeNavigation({ view: animationTarget ?? view, focus, selected });
		if (url === window.location.search) return;
		window.history[push ? 'pushState' : 'replaceState'](window.history.state, '', url);
		announcement = `Showing ${rangeLabel(view.start, view.end)}`;
	}
	function flush() {
		stopMotion();
		if (frame) cancelAnimationFrame(frame);
		frame = 0;
		if (pending) {
			view = pending;
			pending = null;
		}
	}
	function schedule(v: Viewport) {
		pending = constrain(v);
		if (!frame)
			frame = requestAnimationFrame(() => {
				frame = 0;
				if (pending) {
					view = pending;
					pending = null;
				}
			});
	}
	function navigate(v: Viewport, f: string | null = focus, s: string | null = selected) {
		flush();
		moveTo(constrain(v));
		focus = f;
		selected = s;
		cluster = [];
		persist();
	}
	function home() {
		navigate({ ...HISTORY }, null, null);
	}
	function wholeCycle() {
		navigate({ ...CYCLE }, site.cycleEntryId, null);
	}
	function focusEntry(id: string) {
		const entry = byId.get(id);
		if (!entry) return;
		if (entry.temporal.type === 'undated') {
			selectEntry(id);
			navOpen = false;
			return;
		}
		navigate(
			focusView(entry, index, width),
			entry.kind === 'event' ? (entry.parentId ?? null) : id,
			entry.kind === 'event' ? id : null
		);
		navOpen = false;
	}
	function selectEntry(id: string) {
		if (!selected && !cluster.length)
			priorFocus = navOpen
				? document.querySelector<HTMLElement>('.nav-trigger')
				: (document.activeElement as HTMLElement);
		navOpen = false;
		cluster = [];
		selected = id;
		persist();
	}
	function closeDetails() {
		selected = null;
		cluster = [];
		persist();
		tick().then(() => {
			if (priorFocus?.isConnected) priorFocus.focus();
			else plot?.focus({ preventScroll: true });
		});
	}
	function clickMark(mark: Mark) {
		if (dragged) return;
		if (mark.entries.length > 1) {
			priorFocus = document.activeElement as HTMLElement;
			clusterLimit = 30;
			cluster = mark.entries;
		} else {
			const entry = mark.entries[0];
			entry.kind === 'event' ? selectEntry(entry.id) : focusEntry(entry.id);
		}
	}
	function handleZoom(factor: number) {
		navigate(zoomAt(animationTarget ?? view, factor, 0.5));
	}
	function goParent() {
		if (current?.parentId) focusEntry(current.parentId);
		else wholeCycle();
	}
	function gestureSnapshot() {
		dragState = {
			view: { ...view },
			points: [...pointers.values()].map((p) => ({ ...p })),
			scroll: plot.scrollTop
		};
	}
	function pointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		clearTimeout(wheelTimer);
		flush();
		const rect = plot.getBoundingClientRect();
		pointers.set(e.pointerId, { x: e.clientX - rect.left, y: e.clientY });
		if (pointers.size === 1) {
			dragged = false;
			startPosition = { x: e.clientX, y: e.clientY };
		} else dragged = true;
		gestureSnapshot();
		if (pointers.size > 1) for (const id of pointers.keys()) plot.setPointerCapture(id);
	}
	function pointerMove(e: PointerEvent) {
		if (!pointers.has(e.pointerId) || !dragState) return;
		const rect = plot.getBoundingClientRect();
		pointers.set(e.pointerId, { x: e.clientX - rect.left, y: e.clientY });
		const points = [...pointers.values()];
		if (Math.hypot(e.clientX - startPosition.x, e.clientY - startPosition.y) > 5) {
			dragged = true;
			if (!plot.hasPointerCapture(e.pointerId)) plot.setPointerCapture(e.pointerId);
		}
		if (points.length >= 2 && dragState.points.length >= 2) {
			const [a, b] = dragState.points,
				[c, d] = points;
			schedule(
				pinch(
					dragState.view,
					(a.x + b.x) / 2,
					(c.x + d.x) / 2,
					Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
					Math.hypot(d.x - c.x, d.y - c.y),
					width
				)
			);
		} else if (points.length === 1) {
			schedule(pan(dragState.view, (dragState.points[0].x - points[0].x) / width));
			plot.scrollTop = dragState.scroll + dragState.points[0].y - points[0].y;
		}
	}
	function pointerUp(e: PointerEvent) {
		if (!pointers.has(e.pointerId)) return;
		flush();
		pointers.delete(e.pointerId);
		if (pointers.size) gestureSnapshot();
		else {
			dragState = null;
			if (dragged) persist();
			setTimeout(() => (dragged = false), 0);
		}
	}
	function pointerCancel(e: PointerEvent) {
		pointers.delete(e.pointerId);
		flush();
		if (pointers.size) gestureSnapshot();
		else {
			dragState = null;
			persist();
			dragged = false;
		}
	}
	function wheel(e: WheelEvent) {
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			const rect = plot.getBoundingClientRect();
			schedule(
				zoomAt(
					pending ?? view,
					Math.exp(-Math.max(-100, Math.min(100, e.deltaY)) * 0.01),
					(e.clientX - rect.left) / width
				)
			);
		} else if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
			e.preventDefault();
			schedule(pan(pending ?? view, (e.deltaX || e.deltaY) / width));
		} else return;
		clearTimeout(wheelTimer);
		wheelTimer = setTimeout(() => {
			flush();
			persist();
		}, 180);
	}
	function keyboard(e: KeyboardEvent) {
		if (e.target !== plot) return;
		if (['ArrowLeft', 'ArrowRight', '+', '=', '-', 'Home', 'Escape'].includes(e.key))
			e.preventDefault();
		if (e.key === 'ArrowLeft') navigate(pan(view, -0.15));
		if (e.key === 'ArrowRight') navigate(pan(view, 0.15));
		if (e.key === '+' || e.key === '=') handleZoom(2);
		if (e.key === '-') handleZoom(0.5);
		if (e.key === 'Home') home();
		if (e.key === 'Escape') goParent();
	}
	function updateOverview(v: Viewport, commit: boolean) {
		flush();
		view = constrain(v);
		if (commit) persist();
	}

	function setTheme(value: string) {
		theme = value;
		try {
			localStorage.setItem('epoch-theme', value);
		} catch {
			/* Storage is optional. */
		}
	}
	async function copyLink() {
		try {
			await navigator.clipboard.writeText(location.href);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			copied = false;
			announcement = 'The address bar contains a link to this view.';
		}
	}
	$effect(() => {
		if (!ready) return;
		document.documentElement.style.setProperty('--reading-scale', String(uiScale));
		document.documentElement.dataset.theme = theme;
	});

	onMount(() => {
		const n = decodeNavigation(window.location.search, new Set(byId.keys()));
		view = n.view;
		focus = n.focus;
		selected = n.selected;
		ready = true;
		try {
			theme =
				localStorage.getItem('epoch-theme') ??
				(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		} catch {
			/* optional */
		}
		coarse = matchMedia('(pointer: coarse)').matches;
		const pop = () => {
			flush();
			const state = decodeNavigation(location.search, new Set(byId.keys()));
			moveTo(state.view);
			focus = state.focus;
			selected = state.selected;
			cluster = [];
		};
		window.addEventListener('popstate', pop);
		plot.addEventListener('wheel', wheel, { passive: false });
		return () => {
			window.removeEventListener('popstate', pop);
			plot.removeEventListener('wheel', wheel);
			stopMotion();
			clearTimeout(wheelTimer);
			cancelAnimationFrame(frame);
		};
	});
	$effect(() => {
		if (navigationDialog) navOpen ? navigationDialog.showModal() : navigationDialog.close();
	});
	$effect(() => {
		if (settingsDialog) help ? settingsDialog.showModal() : settingsDialog.close();
	});
	$effect(() => {
		if (dialog) {
			if (chosen || cluster.length) {
				if (!dialog.open) dialog.showModal();
			} else if (dialog.open) dialog.close();
		}
	});
	$effect(() => {
		const id = selected;
		void retry;
		if (!id) {
			story = null;
			loading = false;
			return;
		}
		const cached = cache.get(id);
		story = cached ?? null;
		storyError = false;
		if (cached) {
			loading = false;
			return;
		}
		const controller = new AbortController();
		loading = true;
		fetch(`/data/${id}.json`, { signal: controller.signal })
			.then((r) => {
				if (!r.ok) throw new Error();
				return r.json();
			})
			.then((value: unknown) => {
				const data = readStory(value, new Set(Object.keys(sources)));
				cache.set(id, data);
				story = data;
				loading = false;
			})
			.catch((e) => {
				if (e.name !== 'AbortError') {
					storyError = true;
					loading = false;
				}
			});
		return () => controller.abort();
	});
</script>

<div
	class="app"
	data-ready={ready}
	data-navigating={animationTarget !== null}
	data-theme={theme}
	style="--ui-scale:{uiScale}"
>
	<a class="skip-link" href="#explorer">Skip to timeline</a>
	<header class="app-header">
		<a
			class="brand"
			href="/"
			onclick={(e) => {
				e.preventDefault();
				home();
			}}>epoch</a
		>
		<button
			class="nav-trigger"
			aria-label="Browse periods"
			aria-haspopup="dialog"
			onclick={() => (navOpen = true)}>Browse</button
		>
		<h1 class="view-title">{current ? current.title : 'Bahá’í timeline'}</h1>
		<div class="header-actions">
			<button
				class="settings-trigger"
				aria-label="How to explore"
				aria-haspopup="dialog"
				onclick={() => (help = true)}>Settings</button
			>
			<button
				class="theme-toggle"
				aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
				onclick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
				>{theme === 'light' ? '◐' : '◑'}</button
			>
		</div>
	</header>
	<dialog
		class="navigation-dialog"
		bind:this={navigationDialog}
		onclose={() => {
			navOpen = false;
			tick().then(() => {
				if (!selected && !cluster.length)
					document.querySelector<HTMLElement>('.nav-trigger')?.focus();
			});
		}}
		aria-label="Browse periods"
	>
		<div class="detail-top">
			<h2>Browse</h2>
			<button class="close-button" aria-label="Close browse" onclick={() => (navOpen = false)}
				>×</button
			>
		</div>
		<Hierarchy {focus} onfocus={focusEntry} onselect={selectEntry} />
		<p class="small muted">
			<a href="/read/">Reading index</a> ·
			<a href="https://www.bahai.org/library/">Reference Library ↗</a>
		</p>
	</dialog>
	<dialog
		class="settings-dialog"
		bind:this={settingsDialog}
		onclose={() => {
			help = false;
			tick().then(() => document.querySelector<HTMLElement>('.settings-trigger')?.focus());
		}}
		aria-label="Timeline settings"
	>
		<div class="detail-top">
			<h2>Settings</h2>
			<button class="close-button" aria-label="Close settings" onclick={() => (help = false)}
				>×</button
			>
		</div>
		<p>Drag to pan. Pinch or use + / − to zoom.</p>
		<p class="small muted">
			Hatching: uncertain dates. Arrows: continuing periods. Gregorian dates.
		</p>
		<p class="small muted">
			Keyboard: ← / → to pan, + / − to zoom, Home to reset, Escape for the parent period.
		</p>
		<label
			>Reading size <input
				aria-label="Reading size"
				type="range"
				min="1"
				max="1.4"
				step="0.1"
				bind:value={uiScale}
			/></label
		>
		<label
			>Time magnification <input
				type="range"
				min="0"
				max={maxZoom}
				step="any"
				value={zoomValue}
				aria-label="Time magnification"
				aria-valuetext={`${Math.round(span(view)).toLocaleString()} days visible`}
				oninput={(e) => {
					flush();
					view = zoomAt(view, 2 ** (+e.currentTarget.value - zoomValue), 0.5);
				}}
				onchange={() => persist()}
			/></label
		>
		<button onclick={copyLink}>{copied ? 'Link copied' : 'Share this view'}</button>
		<button onclick={() => (help = false)}>Got it</button>
	</dialog>
	<main id="explorer" class="explorer-main">
		<div class="toolbar">
			<div class="presets">
				<button onclick={wholeCycle} class:active={fullScale}>Whole cycle</button><button
					onclick={home}>Recorded history</button
				>
			</div>
			<span class="date-range" data-testid="date-range">{dateRange}</span>
			<div class="zoom-controls">
				<button
					aria-label="Zoom out"
					onclick={() => handleZoom(0.5)}
					disabled={span(view) >= span(WORLD)}>−</button
				><button aria-label="Zoom in" onclick={() => handleZoom(2)} disabled={span(view) <= 1.00001}
					>+</button
				>
			</div>
		</div>
		<section class="timeline-surface" aria-label="Interactive chronology">
			{#if focusedOutside}<div class="context-notice">
					Outside selected period. <button onclick={() => focus && focusEntry(focus)}>Return</button
					><button onclick={home}>Show recorded history</button>
				</div>{/if}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (Composite timeline provides documented keyboard navigation plus native control alternatives.) -->
			<div
				class="plot"
				class:list-hidden={mode === 'list'}
				bind:this={plot}
				bind:clientWidth={width}
				tabindex="0"
				role="application"
				aria-label="Zoomable timeline. Arrow keys pan; plus and minus zoom."
				onkeydown={keyboard}
				onpointerdown={pointerDown}
				onpointermove={pointerMove}
				onpointerup={pointerUp}
				onpointercancel={pointerCancel}
				data-testid="timeline-plot"
				data-start={view.start}
				data-end={view.end}
			>
				<div class="axis" aria-hidden="true">
					{#each axis as t}<span style="left:{((t.day - view.start) / span(view)) * 100}%"
							>{t.label}</span
						>{/each}
				</div>
				<div class="track-area">
					<div class="grid-lines" aria-hidden="true">
						{#each axis as t}<i style="left:{((t.day - view.start) / span(view)) * 100}%"
							></i>{/each}
					</div>
					{#each tracks as track}
						<div
							class="track tone-{track.tone}"
							data-track={track.id}
							style="--lanes:{track.lanes};--track-color:var(--color-{track.tone},var(--color-context))"
						>
							<div class="track-label">{track.label}</div>
							<div class="marks">
								{#each track.marks as mark (mark.key)}
									{@const entry = mark.entries[0]}
									<div
										class="mark-position"
										class:point={mark.point}
										style="left:{mark.x}px;width:{mark.width}px;top:calc({mark.lane} * var(--lane-height))"
									>
										<button
											class="mark"
											class:grouped={mark.entries.length > 1 && !mark.point}
											class:continuing={mark.open}
											class:left-clipped={mark.leftClipped}
											class:right-clipped={mark.rightClipped}
											class:selected={mark.entries.some((e) => e.id === focus || e.id === selected)}
											aria-label={mark.entries.length > 1
												? `${mark.entries.length} entries near ${dateLabel(entry)}`
												: `${entry.title}, ${dateLabel(entry)}. ${entry.kind === 'event' ? 'Read story' : 'Explore period'}`}
											onclick={() => clickMark(mark)}
											title={mark.entries.length === 1 ? entry.title : undefined}
										>
											{#if mark.segments}{#each mark.segments as segment}<span
														class="bar-segment"
														style="left:{segment.x}px;width:{segment.width}px"
														aria-hidden="true"
													>
														{#if segment.uncertainStart > 0}<span
																class="uncertainty"
																style="left:0;right:auto;width:{segment.uncertainStart}px"
															></span>{/if}
														{#if segment.uncertain > 0}<span
																class="uncertainty"
																style="width:{segment.uncertain}px"
															></span>{/if}
													</span>{/each}{/if}
											{#if mark.point}<span class="point-glyph" aria-hidden="true"
													>{mark.entries.length > 1 ? mark.entries.length : '◆'}</span
												>{:else}<span class="bar-label"
													>{mark.entries.length > 1
														? mark.width < 80
															? `${mark.entries.length}`
															: `${mark.entries.length} periods`
														: mark.width > 180
															? entry.title
															: (entry.shortTitle ?? entry.title)}</span
												>{#if mark.open || mark.rightClipped}<span
														class="continues"
														aria-hidden="true">›</span
													>{/if}{/if}
											{#if mark.uncertainStart > 0}<span
													class="uncertainty"
													style="left:0;right:auto;width:{mark.uncertainStart}px"
													aria-hidden="true"
												></span>{/if}
											{#if mark.uncertain > 0}<span
													class="uncertainty"
													style="width:{mark.uncertain}px"
													aria-hidden="true"
												></span>{/if}
										</button>
										{#if !mark.point && mark.entries.length === 1 && mark.width > 190}<button
												class="mark-info"
												aria-label="Read about {entry.title}"
												onclick={(e) => {
													e.stopPropagation();
													if (!dragged) selectEntry(entry.id);
												}}>i</button
											>{/if}
									</div>
								{/each}
							</div>
						</div>
					{/each}
					{#if !tracks.length}<div class="empty-state">
							<p>No entries.</p>
							<button onclick={home}>Recorded history</button>
						</div>{/if}
					{#if fullScale}<div class="history-inset">
							<button onclick={home}>Explore 1844 onward ↗</button>
						</div>{/if}
				</div>
			</div>
			{#if mode === 'list'}<div class="chronological-list">
					<p class="small muted">
						{visibleEntries.length} entries
					</p>
					{#each visibleEntries.slice(0, listLimit) as entry}<button
							onclick={() => selectEntry(entry.id)}
							><time>{dateLabel(entry)}</time><span
								><strong>{entry.title}</strong><small>{entry.summary}</small></span
							><span aria-hidden="true">↗</span></button
						>{/each}{#if visibleEntries.length > listLimit}<button onclick={() => (listLimit += 40)}
							>Show more entries</button
						>{/if}
				</div>{/if}
		</section>
		{#if overviewOpen}<div class="overview-section">
				<Overview {view} domain={overviewDomain} onchange={updateOverview} />
			</div>{/if}
		<footer class="plot-footer">
			<div class="view-switch" role="group" aria-label="Presentation">
				<button aria-pressed={mode === 'timeline'} onclick={() => (mode = 'timeline')}
					>Timeline</button
				><button aria-pressed={mode === 'list'} onclick={() => (mode = 'list')}>Reading list</button
				>
			</div>
			<nav class="breadcrumbs" aria-label="Timeline context">
				<button aria-label="Wider context" onclick={goParent}>↑</button>{#each path as item}<button
						aria-current={item.id === focus ? 'location' : undefined}
						onclick={() => focusEntry(item.id)}>{item.shortTitle ?? item.title}</button
					>{/each}
			</nav>
			{#if current}<button aria-label="About this period" onclick={() => selectEntry(current.id)}
					>Info</button
				>{/if}
			<button aria-expanded={overviewOpen} onclick={() => (overviewOpen = !overviewOpen)}
				>Overview</button
			>
		</footer>
	</main>
	<dialog
		class="detail-dialog"
		bind:this={dialog}
		oncancel={(e) => {
			e.preventDefault();
			closeDetails();
		}}
		aria-label={chosen?.title ?? 'Events in this group'}
	>
		<div class="detail-top">
			<span></span><button
				bind:this={closeButton}
				class="close-button"
				aria-label="Close details"
				onclick={closeDetails}>×</button
			>
		</div>
		{#if chosen}<EntryContent
				entry={chosen}
				{story}
				onselect={selectEntry}
				onfocus={(id) => {
					focusEntry(id);
					selected = null;
					persist(false);
				}}
			/>{#if loading}<p class="small muted" role="status">Loading…</p>{/if}{#if storyError}<p
					role="status"
				>
					Could not load additional details.
				</p>
				<button onclick={() => retry++}>Retry</button>{/if}
		{:else if cluster.length}<h2>{cluster.length} entries</h2>

			<button
				class="primary"
				onclick={() => {
					const start = Math.min(...cluster.map((e) => extent(e)[0])),
						end = Math.max(
							...cluster.map((e) =>
								Number.isFinite(extent(e)[1]) ? extent(e)[1] : extent(e)[0] + 365
							)
						);
					cluster = [];
					navigate(fit(start, end, 0.3));
				}}>Zoom to group</button
			>
			<div class="cluster-list">
				{#each cluster.slice(0, clusterLimit) as entry}<button onclick={() => selectEntry(entry.id)}
						><small>{dateLabel(entry)}</small><strong>{entry.title}</strong><span
							class="small muted">{entry.kind}</span
						></button
					>{/each}{#if cluster.length > clusterLimit}<button onclick={() => (clusterLimit += 30)}
						>Show more</button
					>{/if}
			</div>{/if}
	</dialog>
	<p class="sr-only" aria-live="polite">{announcement}</p>
</div>
