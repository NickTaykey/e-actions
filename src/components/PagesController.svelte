<script lang="ts">
 import { Pagination, PaginationItem, PaginationLink } from 'sveltestrap';
 import { nItemsPublished, itemsPerPage } from '../helpers/items.store';

 export let hanldeNextPageClick = () => {};
 export let hanldePrevPageClick = () => {};
 export let currentPageNumber = 1;
</script>

<Pagination class="d-flex justify-content-center my-3">
 {#if currentPageNumber > 1}
  <PaginationItem>
   <PaginationLink on:click={hanldePrevPageClick} previous href="#" />
  </PaginationItem>
 {/if}
 {#each Array(Math.ceil($nItemsPublished / itemsPerPage)) as _, i}
  <PaginationItem class={currentPageNumber === i + 1 ? 'active' : ''}>
   <PaginationLink>
    {i + 1}
   </PaginationLink>
  </PaginationItem>
 {/each}
 {#if currentPageNumber < Math.ceil($nItemsPublished / itemsPerPage)}
  <PaginationItem>
   <PaginationLink on:click={hanldeNextPageClick} next href="#" />
  </PaginationItem>
 {/if}
</Pagination>
