<script lang="ts">
	export let startDate: string;
	export let endDate: string;
	export let label: string;

	interface ToLocaleStringOptions {
		localeMatcher?: 'best fit' | 'lookup';
		style?: 'decimal' | 'currency' | 'percent' | 'unit';
		currency?: string;
		currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
		useGrouping?: boolean;
		minimumIntegerDigits?: number;
		minimumFractionDigits?: number;
		maximumFractionDigits?: number;
		minimumSignificantDigits?: number;
		maximumSignificantDigits?: number;
		notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
		compactDisplay?: 'short' | 'long';
		timeZone?: string;
		hour12?: boolean;
		hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
		formatMatcher?: 'basic' | 'best fit';
		weekday?: 'narrow' | 'short' | 'long';
		era?: 'narrow' | 'short' | 'long';
		year?: 'numeric' | '2-digit';
		month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
		day?: 'numeric' | '2-digit';
		hour?: 'numeric' | '2-digit';
		minute?: 'numeric' | '2-digit';
		second?: 'numeric' | '2-digit';
		fractionalSecondDigits?: 2 | 1 | 3 | undefined;
		weekdayFallback?: boolean;
		numberingSystem?: string;
		calendar?: string;
		timeZoneName?: 'short' | 'long';
	}

	function extractYearFromDate(isoDateString: string): number {
		// Create a Date object from the ISO date string
		const date = new Date(isoDateString);

		// Use the getUTCFullYear method to get the year
		const year = date.getUTCFullYear();

		return year;
	}

	function formatDateLocaleFriendly(isoDateString: string): string {
		const options: ToLocaleStringOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC'
		};
		const date = new Date(isoDateString);
		return date.toLocaleDateString(undefined, options);
	}
</script>

<div
	style="--event-start-year:{extractYearFromDate(startDate)};
    --event-end-year:{extractYearFromDate(endDate)};"
>
	{label}
	<!-- Event from {formatDateLocaleFriendly(startDate)} to {formatDateLocaleFriendly(endDate)}. -->
</div>

<style>
	div {
		grid-column-start: calc((var(--event-start-year) - var(--first-decade)) + 1);
		grid-column-end: calc((var(--event-end-year) - var(--first-decade)) + 1);
		background-color: var(--accent-bg);
		padding: 0.2em 0.5em;
		border-radius: 0.2em;
		width: 100%;
		z-index: 3;
		opacity: 0.75;
		text-align: center;
		border: 1px solid var(--accent);
	}
	div:hover {
		opacity: 1;
	}
</style>
