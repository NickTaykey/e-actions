<script lang="ts">
 import LoadingScreen from '../LoadingScreen.svelte';
 import { items } from '../../helpers/items.store';
 import ItemCard from './ItemCard.svelte';
 import { Container } from 'sveltestrap';
 import { beforeUpdate } from 'svelte';

 import type { Item } from '../../helpers/types';

 export let currentPageItemsIds: string[] = [];

 let currentPageItems: Item[] = [];

 $: {
  console.log(currentPageItems);
 }

 beforeUpdate(() => {
  const tmpCurrentPageItems: Item[] = [];
  for (let id of currentPageItemsIds) {
   let item = $items.get(id);
   if (item) tmpCurrentPageItems.push(item);
  }
  currentPageItems = tmpCurrentPageItems;
 });
</script>

<Container class="my-5">
 <div class="row mx-auto">
  {#if currentPageItems.length}
   {#each currentPageItems as item}
    <div class="col-12 col-md-6 col-lg-4 mb-3">
     <ItemCard {item} />
    </div>
   {/each}
  {:else}
   <LoadingScreen height={'25vh'} />
  {/if}
 </div>
</Container>
