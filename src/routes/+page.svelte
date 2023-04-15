<script>
 import { goto } from '$app/navigation';
 import { onMount } from 'svelte';

 onMount(() => {
  if (location.pathname === '/') {
   goto('/items', { replaceState: true });
  }
 });
</script>
