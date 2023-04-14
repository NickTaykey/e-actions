<script lang="ts">
 import { PUBLIC_DEFAULT_ITEM_IMG } from '$env/static/public';
 import { Card, CardFooter, CardImg, CardBody, Button } from 'sveltestrap';

 import type { Item } from '../../helpers/types';

 export let item: Item;
</script>

<Card>
 <CardImg
  src={item.image?.url || PUBLIC_DEFAULT_ITEM_IMG}
  alt={`${item.name} image`}
  class="mt-2"
 />
 <CardBody>
  <h3>{item.name}</h3>
  <div>{item.description}</div>
 </CardBody>
 <CardFooter>
  <div class="fw-bold mt-3">{item.views} views</div>
  <div class="my-3">
   {#each item.categories as category}
    <span
     class="badge text-bg-secondary d-inline-block"
     style="margin-right: 2px;"
    >
     {category}
    </span>
   {/each}
  </div>
  <Button color="info" block href={`/items/${item.id}`}>Learn More</Button>
 </CardFooter>
</Card>
