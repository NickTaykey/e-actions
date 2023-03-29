<script lang="ts">
 import type { Item } from '../helpers/types';

 export let item: Item;
</script>

<div>
 <h3>{item.name}</h3>
 <p>{item.description}</p>
 <div>{item.views}</div>
 <div>{item.categories.join(', ')}</div>
 <a href={`/items/${item.id}`}>Learn More</a>
</div>
