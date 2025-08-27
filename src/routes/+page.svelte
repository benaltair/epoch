<script lang="ts">
	import Navigator from '$lib/Timeline/Navigator.svelte';
	import type { Event } from '$lib/types';
	export let data: { events: Event[] };
</script>

<Navigator events={data.events} />
