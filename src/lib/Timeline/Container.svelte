<script lang="ts">
</script>

<!-- @component
Wraps the entire timeline layout, establishes styling.
 -->

<main>
	<slot />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
	main {
		display: grid;
        align-content: baseline;
		position: relative;
		width: 100vw;
		height: 100vh;
		background-color: rgb(238, 238, 238);
	}
</style>
