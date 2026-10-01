/** Proleptic Gregorian day coordinates. Astronomical year 0 = 1 BCE.
 * No Date objects: a cycle can extend beyond Date's ±100 million day limit.
 * Calendar arithmetic follows the 400-year Gregorian cycle.
 */
export interface CivilDate {
	year: number;
	month?: number;
	day?: number;
}
export type Precision = 'day' | 'month' | 'year';
export interface HistoricalDate extends CivilDate {
	precision: Precision;
	approximate?: boolean;
}
export const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];
export function leap(year: number) {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
export function daysInMonth(year: number, month: number) {
	return [31, leap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
export function validDate(d: CivilDate) {
	const m = d.month ?? 1,
		day = d.day ?? 1;
	return (
		Number.isInteger(d.year) &&
		Math.abs(d.year) <= 1_000_000 &&
		Number.isInteger(m) &&
		m >= 1 &&
		m <= 12 &&
		Number.isInteger(day) &&
		day >= 1 &&
		day <= daysInMonth(d.year, m)
	);
}
export function toDay(d: CivilDate): number {
	if (!validDate(d)) throw new RangeError('Invalid Gregorian date');
	const month = d.month ?? 1,
		day = d.day ?? 1;
	const year = d.year - (month <= 2 ? 1 : 0),
		era = Math.floor(year / 400),
		yoe = year - era * 400;
	const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
	return era * 146097 + yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy - 719468;
}
export function fromDay(day: number): Required<CivilDate> {
	if (!Number.isFinite(day)) throw new RangeError('Invalid day coordinate');
	const z = Math.floor(day) + 719468,
		era = Math.floor(z / 146097),
		doe = z - era * 146097;
	const yoe = Math.floor(
		(doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365
	);
	let year = yoe + era * 400;
	const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100)),
		mp = Math.floor((5 * doy + 2) / 153);
	const resultDay = doy - Math.floor((153 * mp + 2) / 5) + 1,
		month = mp + (mp < 10 ? 3 : -9);
	year += month <= 2 ? 1 : 0;
	return { year, month, day: resultDay };
}
export function yearLabel(year: number): string {
	return year <= 0
		? `${(1 - year).toLocaleString('en-US')} BCE`
		: year.toLocaleString('en-US', { useGrouping: year >= 10000 });
}
export function formatDate(d: HistoricalDate): string {
	const prefix = d.approximate ? 'c. ' : '';
	const year = yearLabel(d.year);
	return (
		prefix +
		(d.precision === 'year'
			? year
			: d.precision === 'month'
				? `${MONTHS[(d.month ?? 1) - 1]} ${year}`
				: `${d.day ?? 1} ${MONTHS[(d.month ?? 1) - 1]} ${year}`)
	);
}
export function precisionBounds(d: HistoricalDate): [number, number] {
	const start = toDay(d);
	return [
		start,
		d.precision === 'day'
			? start + 1
			: d.precision === 'year'
				? toDay({ year: d.year + 1 })
				: toDay({
						year: d.year + (d.month === 12 ? 1 : 0),
						month: d.month === 12 ? 1 : (d.month ?? 1) + 1
					})
	];
}
export function rangeLabel(start: number, end: number) {
	const a = fromDay(start),
		b = fromDay(end - 0.000001),
		span = end - start;
	if (span > 365 * 4) return `${yearLabel(a.year)} — ${yearLabel(b.year)}`;
	return `${formatDate({ ...a, precision: span > 90 ? 'month' : 'day' })} — ${formatDate({ ...b, precision: span > 90 ? 'month' : 'day' })}`;
}
export interface Tick {
	day: number;
	label: string;
	major: boolean;
}
export function ticks(start: number, end: number, width: number): Tick[] {
	const span = end - start,
		count = Math.max(2, Math.floor(width / 100)),
		target = span / count;
	const result: Tick[] = [];
	if (target >= 365) {
		const wanted = target / 365.2425,
			power = 10 ** Math.floor(Math.log10(wanted));
		const step = [1, 2, 5, 10].map((n) => n * power).find((n) => n >= wanted) ?? power * 10;
		let year = Math.ceil(fromDay(start).year / step) * step;
		for (let i = 0; i < 100 && year <= 1_000_000; i++, year += step) {
			const day = toDay({ year });
			if (day > end) break;
			if (day >= start) result.push({ day, label: yearLabel(year), major: true });
		}
	} else if (target >= 28) {
		const step = target > 180 ? 12 : target > 70 ? 3 : 1,
			date = fromDay(start);
		let monthIndex = date.year * 12 + date.month - 1;
		monthIndex = Math.ceil(monthIndex / step) * step;
		for (let i = 0; i < 100; i++, monthIndex += step) {
			const year = Math.floor(monthIndex / 12),
				month = monthIndex - year * 12 + 1,
				day = toDay({ year, month });
			if (day > end) break;
			if (day >= start)
				result.push({
					day,
					label:
						month === 1 ? yearLabel(year) : `${MONTHS[month - 1].slice(0, 3)} ${yearLabel(year)}`,
					major: month === 1
				});
		}
	} else {
		const step = target > 10 ? 14 : target > 4 ? 7 : target > 1 ? 2 : 1;
		for (let day = Math.ceil(start / step) * step, i = 0; day <= end && i < 100; day += step, i++) {
			const d = fromDay(day);
			result.push({
				day,
				label: `${d.day} ${MONTHS[d.month - 1].slice(0, 3)}`,
				major: d.day === 1
			});
		}
	}
	return result;
}

/** Civil-year viewing hints preserve the month and clamp leap days. */
export function afterYears(date: CivilDate, years: number) {
	const year = date.year + years,
		month = date.month ?? 1;
	return toDay({ year, month, day: Math.min(date.day ?? 1, daysInMonth(year, month)) });
}
