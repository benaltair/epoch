<script>
	import Navigator from '$lib/Timeline/Navigator.svelte';
</script>

<div class="container">
	<header>
		<h1>Epoch: The Bahá'í Timeline</h1>
		<p>Explore the chronology of the Bahá'í Faith, from the Declaration of the Báb to the current plans of the Universal House of Justice.</p>
	</header>

	<main>
		<Navigator firstYear={1844} lastYear={2044} />
	</main>

	<footer>
		<p>Based on the Bahá'í (Badí‘) Calendar. Year 1 BE corresponds to 1844 CE.</p>
	</footer>
</div>

<style>
	footer {
		margin-top: 2rem;
		text-align: center;
		color: var(--text-muted);
		font-size: 0.875rem;
		border-top: 1px solid var(--border);
		padding-top: 1rem;
	}
</style>
