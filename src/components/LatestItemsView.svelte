<script lang="ts">
 import {
  handleItemsLoading,
  latestItemsIds,
  itemsPerPage,
  setItems,
  items,
 } from '../helpers/items.store';
 import { ChangePageBehaviour } from '../helpers/types';
 import PagesController from './PagesController.svelte';

 let currentPageItemsIds: string[] = [];
 let showErrorAlert = false;
 let currentPageNumber = 1;

 const hanldeNextPageClick = async () => {
  currentPageNumber = currentPageNumber + 1;
  const snapshot = await handleItemsLoading(
   ChangePageBehaviour.NEXT,
   'createdAt'
  );
  setItems(null, snapshot);
 };
 const hanldePrevPageClick = () => {
  currentPageNumber = currentPageNumber - 1;
 };

 $: {
  const startIndex = itemsPerPage * (currentPageNumber - 1);
  currentPageItemsIds = $latestItemsIds.slice(
   startIndex,
   startIndex + itemsPerPage
  );
 }
</script>

<div>
 <h2>Latest items for sale!</h2>
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

<PagesController
 {currentPageNumber}
 {hanldeNextPageClick}
 {hanldePrevPageClick}
/>
