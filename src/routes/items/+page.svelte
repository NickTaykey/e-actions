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
 import { onMount } from 'svelte';
 import LoadingScreen from '../../components/LoadingScreen.svelte';

 let isLoading = false;

 onMount(async () => {
  $showSearchResults = false;
  if ($items.size === 0) {
   isLoading = true;
   await loadItems();
   isLoading = false;
  }
 });
</script>

{#if isLoading}
 <LoadingScreen />
{:else}
 <Navbar />
 <SearchView />

 {#if !$showSearchResults}
  <HottestItemsView />
  <LatestItemsView />
 {/if}
{/if}
