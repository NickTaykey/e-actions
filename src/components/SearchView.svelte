<script lang="ts">
 import { searchItem, showSearchResults } from '../helpers/items.store';
 import ItemCard from './ItemCard.svelte';

 import type { Item } from '../helpers/types';

 let results: Item[] = [];

 const handleFormSubmit = async () => {
  results = await searchItem(name || null, category || null);
  $showSearchResults = !!results.length;
 };

 const handleSearchReset = () => {
  category = name = '';
  $showSearchResults = false;
 };

 let category = '';
 let name = '';
</script>

<form action="#" on:submit|preventDefault={handleFormSubmit}>
 <div>
  <label>
   Name
   <input type="text" placeholder="Search by name" bind:value={name} />
  </label>
 </div>
 <div>
  <label>
   Category
   <input type="text" placeholder="Search By Tag" bind:value={category} />
  </label>
 </div>
 <button type="submit">Search</button>
 <button type="reset" on:click={handleSearchReset}>Reset</button>
</form>

{#if $showSearchResults}
 {#each results as r}
  <ItemCard item={r} />
 {/each}
{/if}
