<script lang="ts">
 import { items } from '../helpers/items.store';
 let showErrorAlert = false;
</script>

<div>
 {#if showErrorAlert}
  <h1>HTTP 500 Error</h1>
  <p>
   Unexpected server side error, we are unable to retreive the last items
   published on auctions.
  </p>
 {:else}
  {#each Array.from($items.values()) as item}
   <div>
    <h3>{item.name}</h3>
    <p>{item.description}</p>
    <div>{item.categories.join(', ')}</div>
    <a href={`/items/${item.id}`}>Learn More</a>
   </div>
  {/each}
 {/if}
</div>
