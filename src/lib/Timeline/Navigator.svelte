<script lang="ts">
	let significantDates = [1844, 1853, 1892, 1921, 2016, 2021, 2044];
	export let firstYear: number;
	export let lastYear: number;

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
<main
	style="--first-year:{firstYear};--last-year:{lastYear};--number-of-decades:{decadesArray.length};"
>
	<nav>
		<!-- Listing all the significant dates -->
		{#each decadesArray as year}
			<time datetime={new Date('1 January ' + year).toISOString()}>
				{year}
			</time>
		{/each}
	</nav>
</main>

<style>
	main {
		--spacing: 2.5em;
		--inner-height: calc(100vh - var(--spacing) * 2);
		--inner-width: calc(100vw - var(--spacing) * 2);
		--timeline-grid: repeat(
			var(--number-of-decades),
			calc(var(--inner-width) / var(--number-of-decades))
		);
		display: grid;
		align-content: baseline;
		position: relative;
		width: 100vw;
		height: 100vh;
		background-color: var(--bg);
		display: grid;
		padding: var(--spacing);
		/* Create one column for each decade */
		grid-template-columns: var(--timeline-grid);
	}
	nav {
		position: absolute;
		display: grid;
		/* Create one column for each decade */
		grid-template-columns: var(--timeline-grid);
		width: calc(100vw - var(--spacing) * 2);
		height: var(--spacing);
		left: 0;
		right: 0;
		bottom: 0;
		margin: var(--spacing);
		padding: 0.2em 0;
		background: var(--accent-bg);
		border-radius: calc(var(--spacing) / 8);
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
		height: calc(var(--spacing) / 6);
		background-color: rgb(138, 138, 138); /* Adjust the color of the dash as needed */
		margin: 0 auto 0.2ch auto; /* Center the dash horizontally, adding a small margin below it */
	}
</style>
