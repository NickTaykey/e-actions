<script lang="ts">
 import {
  collection,
  getDocs,
  orderBy,
  limit,
  query,
 } from 'firebase/firestore';
 import { db } from '../helpers/firebase';
 import { onMount } from 'svelte';

 import type { Item } from '../helpers/types';

 let items: Item[] = [];

 onMount(async () => {
  const collectionRef = collection(db, 'items');
  const docsQuery = query(collectionRef, orderBy('createdAt'), limit(9));
  const docs = await getDocs(docsQuery);
  const foundDocs: Item[] = [];
  docs.forEach((item) => {
   const { name, description, categories, userId, price } = item.data();
   foundDocs.push({
    categories: categories as string[],
    userId: userId as string,
    price: price as number,
    id: item.id,
    description,
    name,
   });
  });
  items = foundDocs;
 });
</script>

<div>
 {#each items as item}
  <div>
   <h3>{item.name}</h3>
   <p>{item.description}</p>
   <div>{item.categories.join(', ')}</div>
   <a href={`/items/${item.id}`}>Learn More</a>
  </div>
 {/each}
</div>
