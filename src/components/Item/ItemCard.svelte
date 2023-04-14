<script lang="ts">
 import type { Item } from '../../helpers/types';

 export let item: Item;
</script>

<article class="d-flex mb-2">
 {#if item.image}
  <img alt={`${item.name} image`} src={item.image.url} style="width: 200px" />
 {/if}
 <section style="margin-left: 1rem;">
  <h3>{item.name}</h3>
  <p>{item.description}</p>
  <div>{item.views}</div>
  <div>{item.categories.join(', ')}</div>
  <a href={`/items/${item.id}`}>Learn More</a>
 </section>
</article>
