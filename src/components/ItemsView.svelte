<script lang="ts">
 import {
  currentPageNumber,
  itemsPerPage,
  items,
 } from '../helpers/items.store';
 let currentPageItemsIds: string[] = [];
 let showErrorAlert = false;

 $: {
  const startIndex = itemsPerPage * ($currentPageNumber - 1);
  currentPageItemsIds = Array.from($items.keys()).slice(
   startIndex,
   startIndex + itemsPerPage + 1
  );
 }
</script>

<div>
 {#if showErrorAlert}
  <h1>HTTP 500 Error</h1>
  <p>
   Unexpected server side error, we are unable to retreive the last items
   published on auctions.
  </p>
 {:else}
  {#each currentPageItemsIds as itemId}
   <div>
    <h3>{$items.get(itemId)?.name}</h3>
    <p>{$items.get(itemId)?.description}</p>
    <div>{$items.get(itemId)?.views}</div>
    <div>{$items.get(itemId)?.categories.join(', ')}</div>
    <a href={`/items/${$items.get(itemId)?.id}`}>Learn More</a>
   </div>
  {/each}
 {/if}
</div>
