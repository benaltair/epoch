<script lang="ts">
	let significantDates = [1844, 1853, 1892, 1921, 2016, 2021, 2044];
	export let firstYear: number;
	export let lastYear: number;
	let navWidth: number;

	function getDecades(firstYear: number, lastYear: number): number[] {
		if (firstYear > lastYear) {
			// Ensure start year is before or equal to end year.
			return [];
		}

		const decades: number[] = [];
		let currentDecade: number = Math.floor(firstYear / 10) * 10; // Find the first decade.

		while (currentDecade <= Math.floor(lastYear / 10) * 10 + 10) {
			decades.push(currentDecade);
			currentDecade += 10; // Move to the next decade.
		}

		return decades;
	}

	let decadesArray: number[] = [];
	$: {
		decadesArray = getDecades(firstYear, lastYear);
	}
</script>

<!-- @component
Provides a navigation bar at the bottom of the page with the timeline.
 -->

<nav
	bind:clientWidth={navWidth}
	style="--first-year:{firstYear};--last-year:{lastYear};--number-of-decades:{decadesArray.length};"
>
	<!-- Listing all the significant dates -->
	{#each decadesArray as year}
		<time datetime={new Date(year).toDateString()}>
			{year}
		</time>
	{/each}
</nav>

<style>
	nav {
		position: absolute;
		display: grid;
		/* Create one column for each decade */
		grid-template-columns: repeat(var(--number-of-decades), calc(100% / var(--number-of-decades)));
		--side-margin: 2.5em;
		width: calc(100vw - var(--side-margin) * 2);
		height: var(--side-margin);
		left: 0;
		right: 0;
		bottom: 0;
		margin: var(--side-margin);
		padding: 0.2em 0.9em;
		background: var(--bg);
		border-radius: calc(var(--side-margin) / 2);
	}
	time {
		width: max-content;
		height: 1em;
		text-align: center;
		align-self: center;
		justify-self: center;
		margin-top: -0.5ch;
		color: var(--text-light);
	}
	time::before {
		content: '';
		display: block;
		width: 0.2ch;
		height: calc(var(--side-margin) / 6);
		background-color: rgb(138, 138, 138); /* Adjust the color of the dash as needed */
		margin: 0 auto 0.2ch auto; /* Center the dash horizontally, adding a small margin below it */
	}
</style>
