<script lang="ts">
 import {
  handleItemsLoading,
  latestItemsIds,
  itemsPerPage,
  setItems,
 } from '../helpers/items.store';
 import ItemsListErrorAlert from './ItemsListErrorAlert.svelte';
 import { ChangePageBehaviour } from '../helpers/types';
 import PagesController from './PagesController.svelte';
 import ItemListsView from './ItemListsView.svelte';

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
  <ItemsListErrorAlert />
 {:else}
  <ItemListsView {currentPageItemsIds} />
 {/if}
</div>

<PagesController
 {currentPageNumber}
 {hanldeNextPageClick}
 {hanldePrevPageClick}
/>
