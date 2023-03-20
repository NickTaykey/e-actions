<script lang="ts">
 import { nItemsPublished, itemsPerPage } from '../helpers/items.store';

 export let hanldeNextPageClick = () => {};
 export let hanldePrevPageClick = () => {};
 export let currentPageNumber = 1;
</script>

<div class="page-controller">
 {#if currentPageNumber > 1}
  <button on:click={hanldePrevPageClick}>
   {'<'}
  </button>
 {/if}
 {#each Array(Math.ceil($nItemsPublished / itemsPerPage)) as _, i}
  <div class={currentPageNumber === i + 1 ? 'current-page' : ''}>{i + 1}</div>
 {/each}
 {#if currentPageNumber < Math.ceil($nItemsPublished / itemsPerPage)}
  <button on:click={hanldeNextPageClick}>
   {'>'}
  </button>
 {/if}
</div>

<style>
 .page-controller {
  display: flex;
 }
 .current-page {
  color: red;
 }
</style>
