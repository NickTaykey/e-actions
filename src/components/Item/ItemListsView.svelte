<script lang="ts">
 import { items } from '../../helpers/items.store';
 import ItemCard from './ItemCard.svelte';
 import { Container } from 'sveltestrap';
 import { beforeUpdate } from 'svelte';

 import type { Item } from '../../helpers/types';

 export let currentPageItemsIds: string[] = [];

 let currentPageItems: Item[] = [];

 beforeUpdate(() => {
  currentPageItems = [];
  for (let id of currentPageItemsIds) {
   let item = $items.get(id);
   if (item) currentPageItems = [...currentPageItems, item];
  }
 });
</script>

<Container class="my-5">
 <div class="row mx-auto">
  {#each currentPageItems as item}
   <div class="col-12 col-md-6 col-lg-4">
    <ItemCard {item} />
   </div>
  {/each}
 </div>
</Container>
