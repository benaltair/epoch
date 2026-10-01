import { extent, type Entry } from './model';
import { toDay, precisionBounds } from './date';
import { position, span, type Viewport } from './viewport';
const MAX_PERIOD_LANES = 8;
export interface Indexed {
	entry: Entry;
	start: number;
	end: number;
	maxEnd: number;
	left?: Indexed;
	right?: Indexed;
}
/** Balanced interval tree: long continuing spans cannot poison a prefix scan. */
export class TimelineIndex {
	private root?: Indexed;
	readonly laneById = new Map<string, number>();
	constructor(entries: Entry[]) {
		const sorted = entries
			.filter((e) => e.temporal.type !== 'undated')
			.map((entry) => ({ entry, start: extent(entry)[0], end: extent(entry)[1] }))
			.sort((a, b) => a.start - b.start || a.entry.id.localeCompare(b.entry.id));
		const build = (lo: number, hi: number): Indexed | undefined => {
			if (lo >= hi) return;
			const mid = (lo + hi) >>> 1,
				n = {
					...sorted[mid],
					maxEnd: sorted[mid].end,
					left: build(lo, mid),
					right: build(mid + 1, hi)
				};
			n.maxEnd = Math.max(n.end, n.left?.maxEnd ?? -Infinity, n.right?.maxEnd ?? -Infinity);
			return n;
		};
		this.root = build(0, sorted.length);
		const ends = new Map<string, number[]>();
		for (const item of sorted) {
			if (item.entry.temporal.type !== 'period') continue;
			const laneEnds = ends.get(item.entry.laneId) ?? [];
			let lane = laneEnds.findIndex((end) => end <= item.start);
			if (lane < 0) lane = Math.min(laneEnds.length, MAX_PERIOD_LANES);
			if (lane < MAX_PERIOD_LANES) laneEnds[lane] = item.end;
			ends.set(item.entry.laneId, laneEnds);
			this.laneById.set(item.entry.id, lane);
		}
	}
	query(start: number, end: number): Entry[] {
		const found: Entry[] = [];
		const visit = (node?: Indexed) => {
			if (!node || node.maxEnd <= start) return;
			visit(node.left);
			if (node.start < end && node.end > start) found.push(node.entry);
			if (node.start < end) visit(node.right);
		};
		visit(this.root);
		return found;
	}
}
import lanes from '../../../content/lanes.json';
export const groups = lanes;
export function groupOf(e: Entry) {
	return e.laneId;
}
export interface Mark {
	key: string;
	entries: Entry[];
	x: number;
	width: number;
	lane: number;
	point: boolean;
	leftClipped: boolean;
	rightClipped: boolean;
	open: boolean;
	uncertain: number;
	uncertainStart: number;
}
export interface Track {
	id: string;
	label: string;
	tone: string;
	marks: Mark[];
	lanes: number;
}
export function layout(
	index: TimelineIndex,
	view: Viewport,
	width: number,
	target = 44,
	selectedId?: string | null
): Track[] {
	const candidates = index.query(view.start, view.end);

	return groups
		.filter((g) => !g.maxSpanYears || span(view) <= g.maxSpanYears * 365.2425)
		.map((g) => {
			const items = candidates.filter((e) => groupOf(e) === g.id && e.display !== 'navigation');
			const marks: Mark[] = [],
				small: Entry[] = [];
			let laneCount = 0;
			for (const e of items) {
				const [start, end] = extent(e),
					t = e.temporal;
				// A continuing mark reaches the viewport edge; that edge is always an arrow, not a date.
				const left = Math.max(0, position(start, view, width)),
					right = Math.min(width, position(end, view, width));
				const isPoint = t.type === 'point',
					size = right - left;
				if (isPoint || size < target || (index.laneById.get(e.id) ?? 0) >= MAX_PERIOD_LANES) {
					small.push(e);
					continue;
				}
				const lane = index.laneById.get(e.id) ?? 0;
				laneCount = Math.max(laneCount, lane + 1);
				const earliest = t.type === 'period' && t.end ? position(toDay(t.end), view, width) : right;
				marks.push({
					key: e.id,
					entries: [e],
					x: left,
					width: Math.max(1, size),
					lane,
					point: false,
					leftClipped: start < view.start,
					rightClipped: end > view.end,
					open: !Number.isFinite(end),
					uncertain: Math.max(0, right - Math.max(left, earliest)),
					uncertainStart:
						t.type === 'period' && t.start.precision !== 'day'
							? Math.max(
									0,
									Math.min(right, position(precisionBounds(t.start)[1], view, width)) - left
								)
							: 0
				});
			}
			// Screen-space bins bound DOM size even when thousands of events share one date.
			const buckets = new Map<number, Entry[]>();
			for (const e of small) {
				const x = Math.max(0, Math.min(width, position(extent(e)[0], view, width)));
				const bucket = Math.floor(x / target);
				const list = buckets.get(bucket) ?? [];
				list.push(e);
				buckets.set(bucket, list);
			}
			// Merge neighbouring buckets whenever their actual hit rectangles would overlap.
			// Keep the selected/highest-priority date as the group's visible anchor.
			const packed: { key: number; list: Entry[]; x: number }[] = [];
			const anchor = (list: Entry[]) => {
				const e =
					list.find((e) => e.id === selectedId) ??
					[...list].sort((a, b) => b.importance - a.importance || a.id.localeCompare(b.id))[0];
				return Math.max(
					target / 2,
					Math.min(width - target / 2, position(extent(e)[0], view, width))
				);
			};
			for (const [key, list] of buckets) {
				let group = { key, list: [...list], x: anchor(list) };
				while (packed.length && group.x - packed[packed.length - 1].x < target) {
					const previous = packed.pop()!;
					group = { key: previous.key, list: [...previous.list, ...group.list], x: 0 };
					group.x = anchor(group.list);
				}
				packed.push(group);
			}
			for (const { key: bucket, list, x } of packed) {
				list.sort((a, b) => b.importance - a.importance || a.id.localeCompare(b.id));
				marks.push({
					key: `cluster-${g.id}-${bucket}`,
					entries: list,
					x: x - target / 2,
					width: target,
					lane: laneCount,
					point: true,
					leftClipped: false,
					rightClipped: false,
					open: false,
					uncertain: 0,
					uncertainStart: 0
				});
			}
			return { ...g, marks, lanes: Math.max(1, laneCount + (small.length ? 1 : 0)) };
		})
		.filter((g) => g.marks.length > 0);
}
export function eventPrecision(entry: Entry): string {
	if (entry.temporal.type !== 'point') return '';
	const [a, b] = precisionBounds(entry.temporal.date);
	return b - a > 1 ? `Known to the ${entry.temporal.date.precision}` : 'Historical date';
}
