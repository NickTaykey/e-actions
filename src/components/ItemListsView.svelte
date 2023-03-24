<script lang="ts">
 import { items } from '../helpers/items.store';

 export let currentPageItemsIds: string[] = [];
</script>

{#each currentPageItemsIds as itemId}
 <div>
  <h3>{$items.get(itemId)?.name}</h3>
  <p>{$items.get(itemId)?.description}</p>
  <div>{$items.get(itemId)?.views}</div>
  <div>{$items.get(itemId)?.categories.join(', ')}</div>
  <a href={`/items/${$items.get(itemId)?.id}`}>Learn More</a>
 </div>
{/each}
