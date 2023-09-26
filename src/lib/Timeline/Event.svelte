<script lang="ts">
	export let startDate: string;
	export let endDate: string;

	function extractYearFromDate(isoDateString: string): number {
		// Create a Date object from the ISO date string
		const date = new Date(isoDateString);

		// Use the getFullYear method to get the year
		const year = date.getFullYear();

		return year;
	}

	function formatDateLocaleFriendly(isoDateString: string): string {
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		const date = new Date(isoDateString);
		return date.toLocaleDateString(undefined, options);
	}
</script>

<div
	style="--event-start-year:{extractYearFromDate(startDate)};
    --event-end-year:{extractYearFromDate(endDate)};"
>
	Event from {formatDateLocaleFriendly(startDate)} to {formatDateLocaleFriendly(endDate)}.
</div>

<style>
	div {
		grid-column-start: calc((var(--event-start-year) - var(--first-year)));
		grid-column-end: calc((var(--event-end-year) - var(--first-year)));
	}
</style>
