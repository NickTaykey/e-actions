<script lang="ts">
 import { selectedItem } from '../../../helpers/items.store';
 import ItemView from '../../../components/ItemView.svelte';
 import { doc, getDoc } from 'firebase/firestore';
 import { db } from '../../../helpers/firebase';
 import { onMount } from 'svelte';

 import type { Item } from '../../../helpers/types';
 import type { PageData } from './$types';

 export let data: PageData;

 onMount(async () => {
  if ($selectedItem === null) {
   const docRef = doc(db, 'items', data.props.itemId!);
   const item = await getDoc(docRef);
   $selectedItem = { ...item.data(), id: docRef.id } as Item;
  }
 });
</script>

<ItemView />
