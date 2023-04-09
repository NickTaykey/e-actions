<script lang="ts">
 import { showSearchResults, loadItems, items } from '../helpers/items.store';
 import HottestItemsView from '../components/HottestItemsView.svelte';
 import LatestItemsView from '../components/LatestItemsView.svelte';
 import Navbar from '../components/Navbar.svelte';
 import { onMount } from 'svelte';
 import SearchView from '../components/SearchView.svelte';

 onMount(() => {
  $showSearchResults = false;
  if ($items.size === 0) loadItems();
 });
</script>

<Navbar />
<SearchView />

{#if !$showSearchResults}
 <HottestItemsView />
 <LatestItemsView />
{/if}
