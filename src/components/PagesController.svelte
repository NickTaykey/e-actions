<script lang="ts">
 import {
  nItemsPublished,
  itemsPerPage,
  loadPage,
  currentPageNumber,
 } from '../helpers/items.store';
 import { ChangePageBehaviour } from '../helpers/types';

 const handleChangePageClick = (behaviour: ChangePageBehaviour) => {
  return () => loadPage(behaviour);
 };
</script>

<div class="page-controller">
 {#if $currentPageNumber > 1}
  <button on:click={handleChangePageClick(ChangePageBehaviour.PREV)}>
   {'<'}
  </button>
 {/if}
 {#each Array(Math.ceil($nItemsPublished / itemsPerPage)) as _, i}
  <div>{i + 1}</div>
 {/each}
 {#if $currentPageNumber < Math.ceil($nItemsPublished / itemsPerPage)}
  <button on:click={handleChangePageClick(ChangePageBehaviour.NEXT)}>
   {'>'}
  </button>
 {/if}
</div>

<style>
 .page-controller {
  display: flex;
 }
</style>
