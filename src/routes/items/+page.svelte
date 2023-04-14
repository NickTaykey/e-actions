<script lang="ts">
 import {
  showSearchResults,
  loadItems,
  items,
 } from '../../helpers/items.store';
 import HottestItemsView from '../../components/Item/HottestItemsView.svelte';
 import LatestItemsView from '../../components/Item/LatestItemsView.svelte';
 import SearchView from '../../components/SearchView.svelte';
 import Navbar from '../../components/Navbar.svelte';
 import seedDB from '../../helpers/seeds';
 import { onMount } from 'svelte';

 onMount(() => {
  seedDB();
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
