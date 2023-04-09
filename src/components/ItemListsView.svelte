<script lang="ts">
 import { items } from '../helpers/items.store';
 import { Container, Image } from 'sveltestrap';
 import { beforeUpdate, onMount } from 'svelte';

 import type { Item } from '../helpers/types';

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

<Container>
 <div class="row mx-auto">
  {#each currentPageItems as item}
   <div class="col-12 col-lg-4">
    <div class="d-flex align-items-center">
     <Image
      thumbnail
      alt={`${item.name} image`}
      src={item.image?.url || 'https://picsum.photos/100/100?random=1'}
     />
     <h4 class="mx-1">{item?.name}</h4>
    </div>
    <div>{item?.description}</div>
    <strong class="d-block my-2">{item?.views} views</strong>
    <div class="mb-2">Categories {item?.categories.join(', ')}</div>
    <a href={`/items/${item?.id}`}>Learn More</a>
   </div>
  {/each}
 </div>
</Container>
